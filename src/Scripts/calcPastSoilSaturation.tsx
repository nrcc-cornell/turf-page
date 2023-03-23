import { differenceInCalendarDays, format } from 'date-fns';
import {
  ForecastSS,
  GPModelData,
} from '../Components/Pages/GrowthPotential/GrowthPotentialPage';

const constants = {
  bucketDepth: 36,
  // topBucket: 2,
  topBucket: 6,
  bottomBucket: function () {
    return this.bucketDepth - this.topBucket;
  },

  intercept: 0.1,
  p: 0.3,
  TAW: 2 * (2 / 3),
  Kc: 1.0,
};

type AsyncReturnType<T extends (...args: any) => Promise<any>> = T extends (
  ...args: any
) => Promise<infer R>
  ? R
  : any;

const convertTableToBuckets = (dataList: (string | null)[][]) => {
  const most = Math.max(
    ...dataList.map((arr) => (arr[5] ? parseFloat(arr[5]) : -999))
  );
  const filteredData: string[][] = dataList.filter(
    (arr): arr is string[] => arr[5] === String(most) && !arr.includes(null)
  );

  const results = filteredData.reduce(
    (buckets, horizon, i) => {
      const topInches = parseFloat(horizon[3]) / 2.54;
      let bottomInches = parseFloat(horizon[4]) / 2.54;
      if (topInches < constants.bucketDepth) {
        // Handle ending before entire bucketDepth is accounted for or if horizons have more depth than bucketDepth
        if (
          (i === dataList.length - 1 && bottomInches < constants.bucketDepth) ||
          bottomInches > constants.bucketDepth
        ) {
          bottomInches = constants.bucketDepth;
        }

        // Calculate distance from bucket divider
        const hTop = constants.topBucket - topInches;
        const hBottom = constants.topBucket - bottomInches;
        // console.log(hTop, hBottom);

        // Calculate amount of horizon in each bucket
        let topPart = 0,
          bottomPart = 0;
        if (hTop > 0 && hBottom < 0) {
          // part in each bucket
          topPart = hTop;
          bottomPart = Math.abs(hBottom);
        } else if (hTop >= 0 && hBottom >= 0) {
          // all in topBucket
          topPart = hTop - hBottom;
        } else {
          // all in bottomBucket
          bottomPart = Math.abs(hTop - hBottom);
        }

        // console.log('---------------------------------------------');
        // console.log(topInches, bottomInches);
        // Add weighted portion of variables to summing obj for each bucket
        if (topPart) {
          topPart = topPart / constants.topBucket;
          buckets.top.clayProportion +=
            (parseFloat(horizon[0]) / 100) * topPart;
          buckets.top.bulkDensity += parseFloat(horizon[1]) * topPart;
          // console.log(
          //   'Old Top Max, New WV portion: ',
          //   buckets.top.wvMax,
          //   horizon[2]
          // );
          buckets.top.wvMax += (parseFloat(horizon[2]) / 100) * topPart;
          // console.log('New Top Max: ', buckets.top.wvMax);
        }

        if (bottomPart) {
          bottomPart = bottomPart / constants.bottomBucket();
          buckets.bottom.clayProportion +=
            (parseFloat(horizon[0]) / 100) * bottomPart;
          buckets.bottom.bulkDensity += parseFloat(horizon[1]) * bottomPart;
          // console.log(
          //   'Old Bottom Max, New WV portion: ',
          //   buckets.bottom.wvMax,
          //   horizon[2]
          // );
          buckets.bottom.wvMax += (parseFloat(horizon[2]) / 100) * bottomPart;
          // console.log('New Bottom Max: ', buckets.bottom.wvMax);
        }
      }

      return buckets;
    },
    {
      top: {
        clayProportion: 0,
        bulkDensity: 0,
        wvMax: 0,
      },
      bottom: {
        clayProportion: 0,
        bulkDensity: 0,
        wvMax: 0,
      },
    }
  );
  return results;
};

const fetchSoilDataViaPostRest = (loc: string) => {
  const query = `SELECT claytotal_r, dbthirdbar_r, wthirdbar_r, hzdept_r, hzdepb_r, comppct_r, compname
    FROM mapunit AS mu
    LEFT OUTER JOIN component AS c ON mu.mukey = c.mukey
    INNER JOIN chorizon AS ch ON c.cokey = ch.cokey
    WHERE mu.mukey IN (SELECT * from SDA_Get_Mukey_from_intersection_with_WktWgs84('point (${loc})'))`;

  const results = fetch(
    'https://sdmdataaccess.sc.egov.usda.gov/tabular/post.rest',
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        format: 'JSON',
        query: query,
      }),
    }
  )
    .then((res) => res.json())
    .then((jData) => jData.Table);

  return results;
};
type BucketsReturn = AsyncReturnType<typeof fetchSoilDataViaPostRest>;

const fetchETData = (coords: number[], year: number) => {
  return fetch(
    `https://0nakxnhta9.execute-api.us-east-1.amazonaws.com/production/irrigation?lat=${coords[1]}&lon=${coords[0]}&year=${year}`
  )
    .then((response) => response.json())
    .catch(() => null);
};
type EtReturn = AsyncReturnType<typeof fetchETData>;

const fetchTempPrcpData = (loc: string, sdate: string, edate: string) => {
  return fetch('https://grid2.rcc-acis.org/GridData', {
    method: 'POST',
    body: JSON.stringify({
      loc,
      sdate,
      edate,
      grid: 'nrcc-model',
      elems: [{ name: 'maxt' }, { name: 'mint' }, { name: 'pcpn' }],
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }

      return response.json();
    })
    .then((data) => data.data);
};
type tempPrcpReturn = AsyncReturnType<typeof fetchTempPrcpData>;

const adjustWVTop = (
  wvTop: number,
  pet: number,
  prcp: number,
  topMax: number
) => {
  const deficitIn = -1 * (wvTop - topMax);
  const Ks =
    deficitIn <= constants.p * constants.TAW
      ? 1
      : Math.max(
          0,
          (constants.TAW - deficitIn) / ((1 - constants.p) * constants.TAW)
        );
  const etIn = pet * constants.Kc;
  const prcpAdj = prcp <= constants.intercept ? 0 : prcp - constants.intercept;
  // console.log(wvTop, etIn, Ks, prcpAdj, wvTop - etIn * Ks + prcpAdj);
  return wvTop - etIn * Ks + prcpAdj;
};

const getDateAdjustment = (
  etData: EtReturn,
  tempPrcpData: tempPrcpReturn,
  year: number
) => {
  const etParts = etData.dates_pet[0].split('/');
  const tempPrcpParts: [number, number, number] = tempPrcpData[0][0]
    .split('-')
    .map((str: string) => parseInt(str));
  tempPrcpParts[1] = tempPrcpParts[1] - 1;
  return differenceInCalendarDays(
    new Date(year, parseInt(etParts[0]) - 1, etParts[1]),
    new Date(...tempPrcpParts)
  );
};

const calcSoilSaturationAtDepth = (
  buckets: BucketsReturn,
  rawEtData: EtReturn,
  tempPrcpData: tempPrcpReturn,
  year: number
) => {
  const wvMax = (buckets.top.wvMax + buckets.bottom.wvMax) / 2;

  // Adjust data arrays to have matching lengths and dates
  let DA;
  let etData = null;
  if (rawEtData !== null) {
    DA = getDateAdjustment(rawEtData, tempPrcpData, year);

    if (DA > 0) {
      const currentDateIdx = tempPrcpData.findIndex(
        (arr: number[]) => arr[1] === -999 || arr[2] === -999 || arr[3] === -999
      );
      tempPrcpData = tempPrcpData.slice(
        DA,
        currentDateIdx >= 0 ? currentDateIdx : tempPrcpData.length
      );
      etData = rawEtData.pet;
    } else if (DA < 0) {
      etData = rawEtData.pet.slice(Math.abs(DA));
    } else {
      etData = rawEtData.pet;
    }
    etData = etData.concat(rawEtData.pet_fcst);
  } else {
    DA = 0;
  }

  // 1 - Calculate decimal percentage of max water volume in top and in bottom
  // 2 - Average the max ??????
  // 3 - Multiply avg max by depth of bucket in inches to get max volume in inches
  // 4 - Set both bucket volumes to full
  // 5 - For each day, adjust volumes based on ET and Precip data, then based on if volume is more than max for less than 0. Use results in next loop

  const topMax = constants.topBucket * wvMax;
  const bottomMax = constants.bottomBucket() * wvMax;

  // console.log('***********************************************************');
  // console.log('topMax: ', topMax, 'bottomMax: ', bottomMax);

  let wvTop = topMax;
  let wvBottom = bottomMax;

  // console.log(`Init wvTop: ${wvTop}, Init wvBottom: ${wvBottom}`);

  const results: number[] = [];
  const percentSats: number[] = [];

  const numDays = tempPrcpData.length;
  for (let i = 0; i < numDays; i++) {
    const tempsAndPrcp = tempPrcpData[i];

    wvTop = adjustWVTop(wvTop, etData[i], tempsAndPrcp[3], topMax);

    wvBottom = wvTop < 0 ? wvBottom + wvTop : wvBottom;
    if (wvTop > topMax) wvBottom = wvBottom + (wvTop - topMax);
    if (wvTop < 0) wvTop = 0;

    if (wvTop > topMax) wvTop = topMax;

    if (wvBottom > bottomMax) wvBottom = bottomMax;
    if (wvBottom < 0) wvBottom = 0.01;
    // console.log(
    //   `Day ${i}: wvTop result - ${wvTop}, wvBottom result - ${wvBottom} (et - ${etData[i]}, prcp - ${tempsAndPrcp[3]})`
    // );

    percentSats.push(Math.round((wvTop / topMax) * 1000) / 10);
    if (numDays - i <= 9) {
      results.push(wvTop / topMax);
    }
  }

  // return percentSats;
  return results;
};

const calcPastSoilSaturations = async (
  lng: number,
  lat: number,
  year: number
) => {
  try {
    // year = 2022;
    const sDate = new Date(year, 1, 27); // Feb 27th
    const today = new Date(year, 9, 31); // Oct 31st

    const [etData, tempPrcpData, soilTable] = await Promise.all([
      fetchETData([lng, lat], year),
      fetchTempPrcpData(
        `${lng},${lat}`,
        format(sDate, 'yyyy-MM-dd'),
        format(today, 'yyyy-MM-dd')
      ),
      fetchSoilDataViaPostRest(`${lng} ${lat}`),
    ]);

    console.log(etData, tempPrcpData, soilTable);

    const buckets = convertTableToBuckets(soilTable);

    const pastSoilSaturations = calcSoilSaturationAtDepth(
      buckets,
      etData,
      tempPrcpData,
      year
    );

    const dates: string[] = [];
    const avgts: number[] = [];
    const precips: number[] = [];
    tempPrcpData.slice(-9).forEach((arr: [string, number, number, number]) => {
      dates.push(arr[0].split('-').join(''));
      avgts.push((arr[1] + arr[2]) / 2);
      precips.push(arr[3]);
    });

    return { pastSoilSaturations, dates, avgts };
  } catch {
    return null;
  }
};
type PastSSReturn = AsyncReturnType<typeof calcPastSoilSaturations>;

const combinePastAndForecastSoilSats = (
  past: PastSSReturn,
  forecast: ForecastSS
): GPModelData | null => {
  if (past) {
    return {
      // soilSats: past.pastSoilSaturations,
      soilSats: past.pastSoilSaturations.concat(forecast.two.slice(0, 6)),
      avgt: past.avgts.concat(forecast.avgt.slice(0, 6)),
      dates: past.dates.concat(forecast.dates.slice(0, 6)),
    };
  } else {
    return null;
  }
};

const addObservedData = async (
  forecastSoilSats: ForecastSS,
  year: number,
  coords: [number, number]
) => {
  console.log(...coords, year);
  const pastSoilSats = await calcPastSoilSaturations(...coords, year);
  console.log(pastSoilSats, forecastSoilSats);
  return combinePastAndForecastSoilSats(pastSoilSats, forecastSoilSats);
};

export default addObservedData;
