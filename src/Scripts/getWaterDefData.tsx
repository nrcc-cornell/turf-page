import { isAfter, isBefore, format, parse, addDays } from 'date-fns';

import { getFromProxy } from './proxy';
import roundXDigits from './Rounding';
import { CoordsIdxObj } from '../Hooks/useRunoffApi';

export type WaterDeficitModelData = {
  precip: number[];
  et: number[];
  avgt: number[];
  dates: string[];
  numFcstDays: number;
};

type ForecastData = {
  dates: number[];
  riskWinter: number[];
  riskWinter72hr: number[];
  past24Pcpn: number,
  next24Pcpn: number,
  tempChart: {
    mint: number[];
    maxt: number[];
    soil: number[];
  },
  precipChart: {
    swe: number[]
    raim: number[]
  }
}

type EtReturn = AsyncReturnType<typeof fetchETData>;

const fetchTempPrcpData = async (loc: [number, number], eDate: string) => {
  const response = await fetch('https://grid2.rcc-acis.org/GridData', {
    method: 'POST',
    body: JSON.stringify({
      loc: loc.join(','),
      grid: 'nrcc-model',
      sDate: `${eDate.slice(0,4)}-03-01`,
      eDate,
      elems: [{ name: 'pcpn' },{ name: 'avgt' }]
    }),
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const results = await response.json();
  return results.data;
};

const fetchETData = (coords: number[], year: number) => {
  return fetch(
    `https://x6xfv2cdrl.execute-api.us-east-1.amazonaws.com/production/irrigation?lat=${coords[1]}&lon=${coords[0]}&year=${year}`
  )
    .then((response) => response.json())
    .catch(() => null);
};

const processPrecipTempData = (forecastData: ForecastData, observedData: [string, number, number][], outOfSeason: boolean) => {
  const { precipDates, precipValues, avgts } = observedData.reduce((acc, dayArr) => {
    if (!dayArr.includes(-999)) {
      acc.precipDates.push(dayArr[0]);
      acc.precipValues.push(dayArr[1]);
      acc.avgts.push(dayArr[2]);
    }
    return acc;
  }, { precipDates: [] as string[], precipValues: [] as number[], avgts: [] as number[] });
  const pDates = precipDates.map(date => date.slice(5));

  const nextDate = format(addDays(parse(precipDates[precipDates.length - 1], 'yyyy-MM-dd', new Date()), 1), 'yyyyMMdd');
  const nextDateIdx = forecastData.dates.findIndex((dateStr: number) => String(dateStr) === nextDate);
  
  let numFcstDays = 0;
  if (!outOfSeason) {
    for (let i = nextDateIdx; i < forecastData.tempChart.mint.length; i++) {
      const d = forecastData.dates[i];
      pDates.push(`${String(d).slice(4,6)}-${String(d).slice(6)}`);
      precipValues.push(forecastData.precipChart.raim[i]);
      avgts.push(roundXDigits((forecastData.tempChart.mint[i] + forecastData.tempChart.maxt[i]) / 2, 1));
      numFcstDays++;
    }
  }

  return {
    dates: pDates,
    precips: precipValues,
    avgts,
    numFcstDays
  };
};

const processEtData = (rawEtData: EtReturn, outOfSeason: boolean) => {
  let dates;
  let ets;
  let numFcstDays;
  if (outOfSeason) {
    numFcstDays = 0;
    ets = rawEtData.pet;
    dates = rawEtData.dates_pet;
  } else {
    numFcstDays = rawEtData.dates_pet_fcst.length;
    ets = rawEtData.pet.concat(rawEtData.pet_fcst);
    dates = rawEtData.dates_pet.concat(rawEtData.dates_pet_fcst).map((str: string) => str.replace('/', '-'));
  }
  return {
    dates,
    ets,
    numFcstDays
  };
};

const findMatchingStartAndEndPoints = (arr1: (string | number)[], arr2: (string | number)[]) => {
  const findStartAndEnd = (v1: (string | number), v2: (string | number), arr: (string | number)[]) => {
    const startIdx = arr.findIndex(val => val === v1);
    const endIdx = arr.findIndex(val => val === v2);
    return {
      start: startIdx >= 0 ? startIdx : 0,
      end: endIdx >= 0 ? endIdx : arr.length - 1
    };
  };

  return {
    arr1: findStartAndEnd(arr2[0], arr2[arr2.length - 1], arr1),
    arr2: findStartAndEnd(arr1[0], arr1[arr1.length - 1], arr2)
  };
};

const calcFcstDays = (origFcstDays: number, origArr: number[], newEndIdx: number) => {
  return  origFcstDays - ((origArr.length - 1) - newEndIdx);
};

async function getWaterDeficitData(targetDate: Date, lngLat: [number, number], coordsIdxs: CoordsIdxObj) {
  let newModelData: WaterDeficitModelData | null = null;
  let today = targetDate;
  let outOfSeason = false;

  if (isBefore(today, new Date(today.getFullYear(), 2, 10))) {
    today = new Date(today.getFullYear() - 1, 10, 1);
    outOfSeason = true;
  } else if (isAfter(today, new Date(today.getFullYear(), 9, 31))) {
    today = new Date(today.getFullYear(), 10, 1);
    outOfSeason = true;
  }

  const [ forecast, rawEtData, pastPrecipAndTemp ] = await Promise.all([
    getFromProxy<ForecastData>(
      { dateStr: format(new Date(), 'yyyyMMdd'), ...coordsIdxs },
      'runoff-risk'
    ),
    fetchETData(lngLat, today.getFullYear()),
    fetchTempPrcpData(lngLat, format(today, 'yyyy-MM-dd'))
  ]);

  if (forecast && rawEtData) {
    const precipAndTempObj = processPrecipTempData(forecast, pastPrecipAndTemp, outOfSeason);
    const etObj = processEtData(rawEtData, outOfSeason);

    const startEndObj = findMatchingStartAndEndPoints(precipAndTempObj.dates, etObj.dates);
    
    const numFcstDays = Math.max(
      calcFcstDays(precipAndTempObj.numFcstDays, precipAndTempObj.precips, startEndObj.arr1.end),
      calcFcstDays(etObj.numFcstDays, etObj.ets, startEndObj.arr2.end)
    );

    newModelData = {
      dates: precipAndTempObj.dates.slice(startEndObj.arr1.start, startEndObj.arr1.end + 1),
      precip: precipAndTempObj.precips.slice(startEndObj.arr1.start, startEndObj.arr1.end + 1),
      avgt: precipAndTempObj.avgts.slice(startEndObj.arr1.start, startEndObj.arr1.end + 1),
      et: etObj.ets.slice(startEndObj.arr2.start, startEndObj.arr2.end + 1),
      numFcstDays
    };
  }

  return newModelData;
}

export { getWaterDeficitData };