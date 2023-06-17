/* eslint-disable no-constant-condition */
import {
  format,
  subDays,
  parseISO,
  isSameDay,
  isYesterday,
} from 'date-fns';

import ArrSummer from './ArrSummerClass';
import roundXDigits from './Rounding';
import { GraphData } from '../Components/Graph';
import { TableData } from '../Components/Pages/TablePage/TablePage';
import { DayHourly } from './dayHourlyClass';

type GridDatum = [string, number, number, number, number];

type SumObj = { sum: number; count: number };

type DSC = {
  date: string;
  gdd32: SumObj;
  gdd50: SumObj;
  precip: SumObj;
  temp: SumObj;
};

export type GraphDataResults = {
  gdd32: GraphData;
  gdd50: GraphData;
  gdd50DiffGdds: TableData;
  gdd50DiffDays: TableData;
  precip: GraphData;
  temp: TableData;
  todayFromAcis: boolean;
};

const emptyOtherToolData = {
  table: [],
  current: [],
  last: [],
  normal: [],
};

export const emptyGraphData = {
  gdd32: emptyOtherToolData as GraphData,
  gdd50: emptyOtherToolData as GraphData,
  gdd50DiffGdds: { table: [] } as TableData,
  gdd50DiffDays: { table: [] } as TableData,
  precip: emptyOtherToolData as GraphData,
  temp: emptyOtherToolData as TableData,
  todayFromAcis: false
};

function getPast(
  sDate: string,
  eDate: string,
  loc: string,
  normals?: boolean
): Promise<GridDatum[]> {
  const gddElem = {
    name: 'gdd',
    interval: [0, 0, 1],
    duration: 'std',
    season_start: [3, 1],
    reduce: 'sum',
  };

  const elems = normals
    ? [
        { ...gddElem, base: 32, season_start: [2, 1] },
        { ...gddElem, base: 50 },
        {
          name: 'pcpn',
          interval: [0, 0, 1],
          duration: 'std',
          season_start: [3, 1],
          reduce: 'sum',
          maxmissing: 5,
        },
        { name: 'avgt', interval: [0, 0, 1], duration: 7, reduce: 'mean' },
      ]
    : [
        { ...gddElem, base: 32, season_start: [2, 1] },
        { ...gddElem, base: 50 },
        { name: 'pcpn', interval: [0, 0, 1] },
        { name: 'avgt', interval: [0, 0, 1] },
      ];

  console.log('fetching past grid data');
  return fetch('https://grid2.rcc-acis.org/GridData', {
    method: 'POST',
    body: JSON.stringify({
      loc: loc,
      grid: 'nrcc-model',
      sDate,
      eDate,
      elems,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }

      return response.json();
    })
    .then((data) => {
      return data.data;
    });
}

const getTableData = async (
  sDate: string,
  eDate: string,
  lngLat: string,
  today: Date,
  forecastData: DayHourly[]
) => {
  const res = await getPast(sDate, eDate, lngLat);

  // Amount to shift by when approaching the end of the season, 11/30
  const shift =
    today.getMonth() === 10 && today.getDate() > 25 ? today.getDate() - 25 : 0;

  // Handles if today's value should be observed or forecast
  const hasToday = res[res.length - 1][1] !== -999;

  // Convert observed values and add to return arrays
  const gdd32: [string, number][] = [],
    gdd50: [string, number][] = [],
    precip: [string, number][] = [],
    temp: [string, number][] = [];

  let sevenDay = ['', 0];
  const precipArr = new ArrSummer(),
    tempArr = new ArrSummer();
  const end = hasToday ? 16 : 15;
  for (let i = 5 - shift; i < end; i++) {
    const dayArr = res[i];
    const dateObj = parseISO(dayArr[0]);
    const date = format(dateObj, 'MM-dd-yyyy');

    const precipTotal = precipArr.unshiftPop(dayArr[3]);
    if (
      ((!hasToday && isYesterday(dateObj)) ||
        (hasToday && isSameDay(dateObj, today))) &&
      typeof precipTotal === 'number'
    ) {
      sevenDay = [
        format(subDays(dateObj, 1), 'MM-dd-yyyy'),
        roundXDigits(precipTotal, 2),
      ];
    }

    const tempTotal = tempArr.unshiftPop(dayArr[4]);
    if (typeof tempTotal === 'number') {
      temp.push([date, roundXDigits(tempTotal / 7, 0)]);
    }

    if (i > 11 - shift) {
      gdd32.push([date, roundXDigits(dayArr[1], 0)]);
      gdd50.push([date, roundXDigits(dayArr[2], 0)]);
      precip.push([date, dayArr[3] === -999 ? 0 : roundXDigits(dayArr[3], 2)]);
    }
  }

  // Convert forecast values and add to return arrays
  let sum32 = gdd32[gdd32.length - 1][1];
  let sum50 = gdd50[gdd50.length - 1][1];
  for (let i = hasToday ? 2 : 1; i < forecastData.length - shift; i++) {
    const dayInst = forecastData[i];
    const date = format(dayInst.date, 'MM-dd-yyyy');
    const avgT = (dayInst.maxTemp(true) + dayInst.minTemp(true)) / 2;

    sum32 += Math.max(0, avgT - 32);
    gdd32.push([date, roundXDigits(sum32, 0)]);

    sum50 += Math.max(0, avgT - 50);
    gdd50.push([date, roundXDigits(sum50, 0)]);

    // Do not add in final two days of precip data because there will never be valid precip data from locHrly
    if (i < forecastData.length - shift - 2) {
      precip.push([date, roundXDigits(dayInst.precip(), 2)]);
    }

    const tempTotal = tempArr.unshiftPop(avgT);
    if (typeof tempTotal === 'number') {
      temp.push([date, roundXDigits(tempTotal / 7, 0)]);
    }
  }

  precip.push(sevenDay as [string, number]);

  return {
    table32: gdd32,
    table50: gdd50,
    tablePrecip: precip,
    tableTemp: temp,
    hasToday,
  };
};

const calcNormals = (normalYears: GridDatum[], beginLastSeason: string) => {
  let iOfSeasonStart;
  let counter = 0;
  const sums = normalYears.reduce(
    (acc, arr, i) => {
      if (arr[0] === beginLastSeason) iOfSeasonStart = i;

      const dateParts = arr[0].split('-');

      if (
        dateParts[1] !== '12' &&
        dateParts[1] !== '01' &&
        dateParts[1] !== '02'
      ) {
        if (!acc[counter].date) acc[counter].date = arr[0].slice(-5);

        acc[counter].gdd32.sum += arr[1];
        acc[counter].gdd32.count++;

        acc[counter].gdd50.sum += arr[2];
        acc[counter].gdd50.count++;

        if (arr[3] !== -999) {
          acc[counter].precip.sum += arr[3];
          acc[counter].precip.count++;
        }

        acc[counter].temp.sum += arr[4];
        acc[counter].temp.count++;

        counter++;
      } else {
        counter = 0;
      }

      return acc;
    },
    Array.from({ length: 275 }, (): DSC => {
      return {
        date: '',
        gdd32: {
          sum: 0,
          count: 0,
        },
        gdd50: {
          sum: 0,
          count: 0,
        },
        precip: {
          sum: 0,
          count: 0,
        },
        temp: {
          sum: 0,
          count: 0,
        },
      };
    })
  );

  const normal32: [string, number][] = [],
    normal50: [string, number][] = [],
    normalPrecip: [string, number][] = [],
    normalTemp: [string, number][] = [];
  sums.forEach((day) => {
    normal32.push([day.date, roundXDigits(day.gdd32.sum / day.gdd32.count, 0)]);
    normal50.push([day.date, roundXDigits(day.gdd50.sum / day.gdd50.count, 0)]);
    normalPrecip.push([
      day.date,
      roundXDigits(day.precip.sum / day.precip.count, 2),
    ]);
    normalTemp.push([day.date, roundXDigits(day.temp.sum / day.temp.count, 0)]);
  });

  return {
    normal32,
    normal50,
    normalPrecip,
    normalTemp,
    iOfSeasonStart,
  };
};

const getCurrentSeason = async (today: Date, lngLat: string) => {
  const sDate = `${today.getFullYear()}-03-01`;
  const eDate = format(today, 'yyyy-MM-dd');

  const res = await getPast(sDate, eDate, lngLat, true);

  const current32: [string, number][] = [],
    current50: [string, number][] = [],
    currentPrecip: [string, number][] = [];
  res.forEach((day) => {
    const date = format(parseISO(day[0]), 'MM-dd-yyyy');
    current32.push([date, roundXDigits(day[1], 0)]);
    current50.push([date, roundXDigits(day[2], 0)]);
    currentPrecip.push([date, roundXDigits(day[3], 2)]);
  });

  return {
    current32,
    current50,
    currentPrecip,
  };
};

const sliceLastSeason = (lastSeasonData: GridDatum[]) => {
  const last32: [string, number][] = [],
    last50: [string, number][] = [],
    lastPrecip: [string, number][] = [];
  lastSeasonData.forEach((day) => {
    const date = format(parseISO(day[0]), 'MM-dd-yyyy');
    last32.push([date, roundXDigits(day[1], 0)]);
    last50.push([date, roundXDigits(day[2], 0)]);
    lastPrecip.push([date, roundXDigits(day[3], 2)]);
  });

  return {
    last32,
    last50,
    lastPrecip,
  };
};

const findMatch = (arr1: [string, number][], arr2: [string, number][]) => {
  let start = -1;
  let index = -1;
  while (start === -1) {
    index++;
    if (index < arr1.length) {
      const dayMonth = arr1[index][0].slice(0, 5);
      start = arr2.findIndex((arr) => arr[0].slice(0, 5) === dayMonth);
    } else {
      break;
    }
  }

  return { idxArr1: start === -1 ? -1 : index, idxArr2: start };
};

const calcDeparture = (
  current: [string, number][],
  normal: [string, number][]
): [string, number][] => {
  const { idxArr1, idxArr2 } = findMatch(current, normal);
  if (idxArr2 === -1) return [];

  const relevantDays = normal.slice(idxArr2, idxArr2 + (9 - idxArr1));

  return current.slice(idxArr1).map((day, i) => {
    return [day[0], day[1] - relevantDays[i][1]];
  });
};

const calcGddDiffs = (current: [string, number][], past: [string, number][]) => {
  const seasonStartIdx = past.findIndex((arr) => arr[0].slice(0, 5) === '03-15');
  const from315 = past.slice(seasonStartIdx);
  
  const { idxArr1, idxArr2 } = findMatch(current, from315);
  const relevantDays = from315.slice(idxArr2, idxArr2 + (9 - idxArr1));

  const tableDiffGdds: [string, number][] = [];
  const tableDiffDays: [string, number][] = [];

  if (idxArr2 === -1)
    return {
      tableDiffGdds,
      tableDiffDays,
    };

  current.slice(idxArr1).forEach((day, i) => {
    let nDay = relevantDays[i][1];
    const cDay = day[1];

    tableDiffGdds.push([day[0], cDay - nDay]);

    let counter = 0;
    while (true) {
      if (nDay > cDay && counter <= 0) {
        counter--;
      } else if (nDay < cDay && counter >= 0) {
        counter++;
      } else {
        break;
      }

      const dayIdx = idxArr2 + i + counter;
      if (dayIdx < 0) {
        counter++;
        break;
      } else if (dayIdx >= from315.length) {
        break;
      }
      nDay = from315[dayIdx][1];
    }

    tableDiffDays.push([day[0], counter]);
  });

  return {
    tableDiffGdds,
    tableDiffDays,
  };
};

export const getGraphPagesData = async (
  sDate: string,
  eDate: string,
  lngLat: string,
  today: Date,
  data: DayHourly[]
): Promise<GraphDataResults> => {
  const numNormalYrs = 15;
  const pastStart = `${today.getFullYear() - numNormalYrs}-03-01`;
  const pastEnd = `${today.getFullYear() - 1}-11-30`;
  const beginLastSeason = `${today.getFullYear() - 1}-03-01`;

  const [
    { table32, table50, tablePrecip, tableTemp, hasToday },
    { current32, current50, currentPrecip },
    pastSeasonsData,
  ] = await Promise.all([
    getTableData(sDate, eDate, lngLat, today, data),
    getCurrentSeason(today, lngLat),
    getPast(pastStart, pastEnd, lngLat, true),
  ]);

  const { normal32, normal50, normalPrecip, normalTemp, iOfSeasonStart } =
  calcNormals(pastSeasonsData, beginLastSeason);
  
  const { last32, last50, lastPrecip } = sliceLastSeason(
    pastSeasonsData.slice(iOfSeasonStart)
  );

  const departureTemp = calcDeparture(tableTemp, normalTemp);

  const { tableDiffGdds: normalDiffsGdds, tableDiffDays: normalDiffsDays } =
    calcGddDiffs(table50, normal50);

  const { tableDiffGdds: lastDiffsGdds, tableDiffDays: lastDiffsDays } =
    calcGddDiffs(table50, last50);

  return {
    gdd32: {
      table: [table32],
      current: current32,
      last: last32,
      normal: normal32,
    },
    gdd50: {
      table: [table50],
      current: current50,
      last: last50,
      normal: normal50,
    },
    gdd50DiffGdds: { table: [lastDiffsGdds, normalDiffsGdds] },
    gdd50DiffDays: { table: [lastDiffsDays, normalDiffsDays] },
    precip: {
      table: [tablePrecip],
      current: currentPrecip,
      last: lastPrecip,
      normal: normalPrecip,
    },
    temp: {
      table: [
        tableTemp.slice(tableTemp.length - departureTemp.length),
        departureTemp,
      ],
    },
    todayFromAcis: hasToday,
  };
};