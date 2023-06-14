import { isAfter, isBefore, format, parse, addDays } from 'date-fns';

import { getFromProxy, RunoffCoords } from './proxy';
import { fetchETData } from './calcPastSoilSaturation';
import { getDateAdjustment, EtReturn } from './calcPastSoilSaturation';
import convertCoordsToIdxs from './convertCoordsToIdxs';
import roundXDigits from './Rounding';

export type WaterDeficitModelData = {
  precip: number[];
  et: number[];
  avgt: number[];
  dates: string[];
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

const alignAndExtract = (rawEtData: EtReturn, prcpAndTempData: [string, number, number][], year: number) => {
  let etData, etDates;
  const DA = getDateAdjustment(rawEtData, prcpAndTempData, year);
  if (DA > 0) {
    const currentDateIdx = prcpAndTempData.findIndex(
      (arr: [string, number, number]) => arr[1] === -999
    );
    prcpAndTempData = prcpAndTempData.slice(
      DA,
      currentDateIdx >= 0 ? currentDateIdx : prcpAndTempData.length
    );
    etData = rawEtData.pet;
    etDates = rawEtData.dates_pet;
  } else if (DA < 0) {
    etData = rawEtData.pet.slice(Math.abs(DA));
    etDates = rawEtData.dates_pet.slice(Math.abs(DA));
  } else {
    etData = rawEtData.pet;
    etDates = rawEtData.dates_pet;
  }

  const startIdx = 0;
  const endIdx = Math.min(etData.length, prcpAndTempData.length);

  return { et: etData.slice(startIdx,endIdx), etDates: etDates.slice(startIdx,endIdx), precip: prcpAndTempData.slice(startIdx,endIdx).map(arr => arr[1]), precipDates: prcpAndTempData.slice(startIdx,endIdx).map(arr => arr[0]), avgt: prcpAndTempData.slice(startIdx,endIdx).map(arr => arr[2]) };
};

const fetchPrecip = async (loc: [number, number], eDate: string) => {
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

async function getWaterDeficitData(today: Date, todayStr: string, lngLat: [number, number], coordArrs: RunoffCoords) {
  let newModelData: WaterDeficitModelData | null = null;
  if (isAfter(today, new Date(today.getFullYear(), 2, 9)) && isBefore(today, new Date(today.getFullYear(), 10, 1))) {
    const { idxLat, idxLng }: { idxLat: number; idxLng: number } =
      convertCoordsToIdxs(lngLat, coordArrs);

    const [ forecast, rawEtData, pastPrecipAndTemp ] = await Promise.all([
      getFromProxy<ForecastData>(
        { dateStr: todayStr, idxLat, idxLng },
        'runoff-risk'
      ),
      fetchETData(lngLat, today.getFullYear()),
      fetchPrecip(lngLat, format(today, 'yyyy-MM-dd'))
    ]);

    if (forecast && rawEtData) {
      const aligned = alignAndExtract(rawEtData, pastPrecipAndTemp, today.getFullYear());

      const numFcstDays = rawEtData.dates_pet_fcst.length;
      aligned.et = aligned.et.concat(rawEtData.pet_fcst);
      aligned.etDates = aligned.etDates.concat(rawEtData.dates_pet_fcst);

      const nextDate = format(addDays(parse(aligned.precipDates[aligned.precipDates.length - 1], 'yyyy-MM-dd', new Date()), 1), 'yyyyMMdd');
      const nextDateIdx = forecast.dates.findIndex(dateStr => String(dateStr) === nextDate);
      aligned.precip = aligned.precip.concat(forecast.precipChart.raim.slice(nextDateIdx, nextDateIdx + numFcstDays));
      aligned.precipDates = aligned.precipDates.concat(forecast.dates.slice(nextDateIdx, nextDateIdx + numFcstDays).map(val => `${String(val).slice(0,4)}-${String(val).slice(4,6)}-${String(val).slice(6)}`));
      aligned.precipDates = aligned.precipDates.map(date => date.slice(5));

      for (let i = nextDateIdx; i < nextDateIdx + numFcstDays; i++) {
        aligned.avgt.push(roundXDigits((forecast.tempChart.mint[i] + forecast.tempChart.maxt[i]) / 2, 1));
      }

      newModelData = {
        dates: aligned.precipDates,
        precip: aligned.precip,
        et: aligned.et,
        avgt: aligned.avgt
      };
    }
  }
  return newModelData;
}

export { getWaterDeficitData };