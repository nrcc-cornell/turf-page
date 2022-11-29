/* eslint-disable no-constant-condition */
import {
  format,
  subDays,
  addDays,
  isWithinInterval,
  parseISO,
  isSameDay,
  isAfter,
  isYesterday,
} from 'date-fns';

import roundXDigits from './Rounding';
import DayHourly from './DayClasses';
import ArrSummer from './ArrSummerClass';

const emptyIndices = {
  anthracnose: {
    Daily: [],
    '7 Day Avg': [],
    season: [],
  },
  brownPatch: {
    Daily: [],
    '7 Day Avg': [],
    season: [],
  },
  dollarspot: {
    Daily: [],
    '7 Day Avg': [],
    season: [],
  },
  pythiumBlight: {
    Daily: [],
    '7 Day Avg': [],
    season: [],
  },
  heatStress: {
    Daily: [],
    season: [],
  },
};

const emptyOtherToolData = {
  table: [],
  current: [],
  last: [],
  normal: [],
};

// Loop through through each full set of 24 'hours' instantiating a DayHourly object
// Passes the index for the beginning of the unused data back, it is used to combine the observed and forecast hours later
function createDays(arr: string[][]) {
  let i = 0;
  const days = [];
  for (let j = 24; j < arr.length; i += 24, j += 24) {
    days.push(new DayHourly(arr.slice(i, j)));
  }

  return { firstUnused: i, days };
}

// Explanation for '08':
// // '08' starts the data return at 8am
// // This tool uses weather data such that a given day's observed weather is from 8am the prior day to 7am the current day.
// // I.E. 5/4/2022 uses observed values from 8am 5/3/2022 - 7am 5/4/2022 (inclusive).
// // The result is that the risk values displayed are for the current day.
// //
// // Example for Pythium Blight which uses daily max temp, daily min temp, and daily count of RH hours > 89:
// // 5/4 risk value = Average of 5/4, 5/3, 5/2 indices
// //
// // 5/4 index = weather from date 5/4
// // 5/4 = observed weather from 8am 5/3 - 7am 5/4
// //
// // 5/3 index = weather from date 5/3
// // 5/3 = observed weather from 8am 5/2 - 7am 5/3
// //
// // 5/2 index = weather from date 5/2
// // 5/2 = observed weather from 8am 5/1 - 7am 5/2
// //
// // Therefore, the risk value for 5/4 is based on observed weather from 8am 5/1 - 7:59am 5/4.

// Gets hourly data from API and converts it into an array of DayHourly objects for calculating risks later
function getToolRawData(
  lng: number,
  lat: number,
  seasonStart: Date,
  seasonEnd: string
): Promise<DayHourly[] | null> {
  return fetch('https://hrly.nrcc.cornell.edu/locHrly', {
    method: 'POST',
    body: JSON.stringify({
      lat: lat,
      lon: lng,
      tzo: -5,
      sdate: format(subDays(seasonStart, 9), 'yyyyMMdd08'), // Explanation for '08' above
      edate: seasonEnd,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }

      return response.json();
    })
    .then((data) => {
      const pastDaysObj = createDays(data.hrlyData);

      let futureDays = data.hrlyData.slice(pastDaysObj.firstUnused);
      if (futureDays[futureDays.length - 1][2] === 'M')
        futureDays[futureDays.length - 1][2] = '0.00';
      futureDays = futureDays.concat(data.fcstData);

      const futureDaysObj = createDays(futureDays);

      return pastDaysObj.days.concat(futureDaysObj.days);
    })
    .catch(() => null);
}

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

// Averages X number of days of index values
const xDayAverage = (
  numDays: number,
  indices: StrDateValue[]
): StrDateValue[] => {
  const past: StrDateValue[] = [];
  return indices.reduce((acc: StrDateValue[], d) => {
    past.push(d);

    // If 'past' is 'numDays' long, push [date, average] to 'acc' then remove the oldest day from the list
    if (past.length === numDays) {
      const avg = past.reduce((sum, d) => (sum += d[1]), 0) / numDays;
      acc.push([d[0], avg]);

      past.shift();
    }

    return acc;
  }, []);
};

// Converts array of DayHourly objects to an object containing an array of indices per risk
const calcIndices = (days: DayHourly[]): Indices => {
  const dayValues: DayValues = {
    anthracnose: [],
    brownPatch: [],
    dollarspot: [],
    pythiumBlight: [],
    heatStress: [],
  };

  // Loop starts where it does to ensure that you can look back several days where necessary and find data
  for (let i = 6; i < days.length; i++) {
    const day = days[i];
    if (isAfter(day.date, new Date(day.date.getFullYear(), 11, 1))) break;

    const currDay = format(day.date, 'MM-dd-yyyy');

    // Calculate and add index for each risk to object
    dayValues['anthracnose'].push([
      currDay,
      calcAnthracnoseIndex(days.slice(i - 2, i + 1)),
    ]); // 3 days, including today
    dayValues['brownPatch'].push([currDay, calcBrownPatchIndex(day)]); // Just current day
    dayValues['dollarspot'].push([
      currDay,
      calcDollarspotIndex(days.slice(i - 6, i + 1)),
    ]); // 7 days, including today
    dayValues['pythiumBlight'].push([currDay, calcPythiumBlightIndex(day)]); // Just current day
    dayValues['heatStress'].push([currDay, calcHeatStressIndex(day)]); // Just current day
  }

  // From the arrays of indices calculate the average indices
  const indices = JSON.parse(JSON.stringify(emptyIndices));
  Object.keys(dayValues).forEach((risk) => {
    if (risk === 'anthracnose') {
      indices[risk] = {
        // Daily for anthracnose is the days' index, not an average.
        // Daily: dayValues[risk].slice(-10),
        // '7 Day Avg': xDayAverage(7, dayValues[risk].slice(-16)),
        '7 Day Avg': xDayAverage(7, dayValues[risk]),
        season: dayValues[risk].slice(6),
      };
    } else if (risk === 'heatStress') {
      const season = xDayAverage(3, dayValues[risk].slice(4));
      indices[risk] = {
        // Daily: season.slice(-10),
        season,
      };
    } else if (
      risk === 'brownPatch' ||
      risk === 'dollarspot' ||
      risk === 'pythiumBlight'
    ) {
      const season = xDayAverage(3, dayValues[risk].slice(4));
      indices[risk] = {
        // Daily: season.slice(-10),
        // '7 Day Avg': xDayAverage(7, dayValues[risk].slice(-16)),
        '7 Day Avg': xDayAverage(7, dayValues[risk]),
        season,
      };
    }
  });

  return indices;
};

const calcAnthracnoseIndex = (pastThree: DayHourly[]): number => {
  // avgT = average temperature over three days
  // avgLw = average leaf wetness over three days

  const { avgT, avgLw } = pastThree.reduce(
    (acc, d, j) => {
      acc.avgT += d.avgTemp();
      acc.avgLw += d.numWetHours();

      if (j === 2) {
        acc.avgT = acc.avgT / 3;
        acc.avgLw = acc.avgLw / 3;
      }

      return acc;
    },
    { avgT: 0, avgLw: 0 }
  );

  let val =
    4.0233 -
    0.2283 * avgLw -
    0.5303 * avgT -
    0.0013 * avgLw ** 2 +
    0.0197 * avgT ** 2 +
    0.0155 * avgT * avgLw;

  // Adjustments
  if (avgT < 4) val = -1; // Prevents low temperature from having high risk
  if (avgLw < 8) val -= 3; // Prevents dry days from having high risk

  return val;
};

const calcBrownPatchIndex = (day: DayHourly): number => {
  // rh80 = determined by days' avg RH
  // gt95 = determined by days' count of hours with RH > 85
  // lw = determined by count of leaf wetness hours in day
  // minT = determined by current date OR if days' min temp > 16C

  const rh80 = day.avgRH() >= 80 ? 1 : 0;

  let rh95 = 0;
  const gt95 = day.numGTRHum(95);
  if (gt95 >= 8) {
    rh95 = 2;
  } else if (gt95 > 4) {
    rh95 = 1;
  }

  const lw = day.numWetHours() > 10 ? 1 : 0;

  let minT = isWithinInterval(day.date, {
    start: new Date(day.date.getFullYear(), 6, 1),
    end: new Date(day.date.getFullYear(), 8, 30),
  })
    ? -2
    : -4;
  if (day.minTemp() >= 16) minT = 1;

  return rh80 + rh95 + lw + minT;
};

const calcDollarspotIndex = (pastSeven: DayHourly[]): number => {
  // avgT = days' avg temp
  // avgLw = average of past 3 days of leaf wetness
  // rhum90 = number of hours in last 7 days with RH > 90 && avgT > 25
  // consecRain = number of consecutive days into the past that it has rained
  // crAvgT = average temperature of the days of consecRain

  const avgT = pastSeven[6].avgTemp();
  const avgLw = pastSeven.slice(4).reduce((acc, d, i) => {
    acc += d.numWetHours();
    return i === 2 ? acc / 3 : acc;
  }, 0);

  let consecRain = 0;
  for (let i = 6; i > 0; i--) {
    if (pastSeven[i].didRain()) {
      consecRain++;
    } else {
      break;
    }
  }

  let crAvgT = 0;
  if (consecRain >= 2) {
    crAvgT = pastSeven.slice(7 - consecRain).reduce((acc, d, i) => {
      acc += d.avgTemp();
      return i === consecRain - 1 ? acc / i : acc;
    }, 0);
  }

  const rhum90 = pastSeven.reduce((acc, d) => {
    acc += d.numGTRHum(90);
    return acc;
  }, 0);
  const dRh = rhum90 >= 3 && avgT > 25 ? 1 : 0;
  const dLw = avgLw > 8 && avgT > 15 ? 1 : 0;

  const dRain =
    (consecRain >= 3 && crAvgT > 15) || (consecRain >= 2 && crAvgT > 20)
      ? 1
      : 0;

  return dRh + dLw + dRain;
};

const calcPythiumBlightIndex = (day: DayHourly): number => {
  const maxT = day.maxTemp(true);
  const minT = day.minTemp(true);
  const rh89 = day.numGTRHum(89); // number of hours with RH > 89

  return maxT - 86 + (minT - 68) + 0.5 * (rh89 - 6);
};

const calcHeatStressIndex = (day: DayHourly): number => {
  return day.hsiHours(); // number of hours with heat stress
};

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
  const gdd32: StrDateValue[] = [],
    gdd50: StrDateValue[] = [],
    precip: StrDateValue[] = [],
    temp: StrDateValue[] = [];

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
    )
      sevenDay = [
        format(subDays(dateObj, 1), 'MM-dd-yyyy'),
        roundXDigits(precipTotal, 2),
      ];

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

  precip.push(sevenDay as StrDateValue);

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

  const normal32: StrDateValue[] = [],
    normal50: StrDateValue[] = [],
    normalPrecip: StrDateValue[] = [],
    normalTemp: StrDateValue[] = [];
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

  const current32: StrDateValue[] = [],
    current50: StrDateValue[] = [],
    currentPrecip: StrDateValue[] = [];
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
  const last32: StrDateValue[] = [],
    last50: StrDateValue[] = [],
    lastPrecip: StrDateValue[] = [];
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

const calcDeparture = (
  current: StrDateValue[],
  normal: StrDateValue[]
): StrDateValue[] => {
  const dayMonth = current[0][0].slice(0, 5);
  const start = normal.findIndex((arr) => arr[0] === dayMonth);
  const relevantDays = normal.slice(start, start + 9);

  return current.map((day, i) => {
    return [day[0], day[1] - relevantDays[i][1]];
  });
};

const calcGddDiffs = (current: StrDateValue[], past: StrDateValue[]) => {
  const dayMonth = current[0][0].slice(0, 5);
  const start = past.findIndex((arr) => arr[0].slice(0, 5) === dayMonth);
  const relevantDays = past.slice(start, start + 9);

  const tableDiffGdds: StrDateValue[] = [],
    tableDiffDays: StrDateValue[] = [];

  current.forEach((day, i) => {
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

      const dayIdx = start + i + counter;
      if (dayIdx < 0 || dayIdx >= past.length) {
        break;
      }
      nDay = past[dayIdx][1];
    }

    tableDiffDays.push([day[0], counter]);
  });

  return {
    tableDiffGdds,
    tableDiffDays,
  };
};

const getGraphPagesData = async (
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
      table: [tableTemp, departureTemp],
    },
    todayFromAcis: hasToday,
  };
};

// Overarching function to coordinate gathering and calculating data used in the ToolPage component
const getData = async (lngLat: number[]): Promise<ToolData> => {
  let today = new Date();
  const month = today.getMonth();

  let seasonEnd, eDate;
  if (month < 2 || month === 11) {
    today = new Date(today.getFullYear() - (month < 2 ? 1 : 0), 10, 25);
    seasonEnd = format(new Date(today.getFullYear(), 10, 30), 'yyyyMMdd08');
    eDate = format(addDays(today, 6), 'yyyy-MM-dd');
  } else {
    seasonEnd = 'now';
    eDate = format(addDays(today, 1), 'yyyy-MM-dd');
  }

  const sDate = format(subDays(today, 15), 'yyyy-MM-dd');
  // const seasonStart = new Date(today.getFullYear(), 2, 1);
  const seasonStart = subDays(new Date(today.getFullYear(), 2, 1), 4);

  const data: DayHourly[] | null = await getToolRawData(
    lngLat[0],
    lngLat[1],
    seasonStart,
    seasonEnd
  );

  if (data) {
    const riskIndices = calcIndices(data);

    const iOfToday = data.findIndex((obj) => isSameDay(obj.date, today));
    const coords = lngLat.join(',');
    const forecast = data.slice(iOfToday - 1);

    const graphData = await getGraphPagesData(
      sDate,
      eDate,
      coords,
      today,
      forecast
    );

    return {
      ...graphData,
      ...riskIndices,
    };
  } else {
    return {
      gdd32: emptyOtherToolData,
      gdd50: emptyOtherToolData,
      gdd50DiffGdds: { table: [] },
      gdd50DiffDays: { table: [] },
      precip: emptyOtherToolData,
      temp: emptyOtherToolData,
      ...emptyIndices,
      todayFromAcis: false,
    };
  }
};

// Helpful object for converting states of interest to abbreviations
const states = {
  Maine: 'ME',
  'New Hampshire': 'NH',
  Vermont: 'VT',
  'Rhode Island': 'RI',
  Massachusetts: 'MA',
  Connecticut: 'CT',
  'New York': 'NY',
  'New Jersey': 'NJ',
  Pennsylvania: 'PA',
  Delaware: 'DE',
  Maryland: 'MD',
  'West Virginia': 'WV',
  Ohio: 'OH',
  Virginia: 'VA',
  Kentucky: 'KY',
};

// Gets the address name for a set of coordinates
function getLocation(
  lng: number,
  lat: number,
  token: string
): Promise<false | UserLocation> {
  return fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?limit=1&access_token=${token}`,
    { method: 'GET' }
  )
    .then((response) => response.json())
    .then((res): UserLocation => {
      // Gets the state name
      const region = res.features[0].context.find(
        (c: ContextType) => c.id.split('.')[0] === 'region'
      );

      // If no state name or state is outside scope, reject it
      if (!Object.keys(states).includes(region.text)) throw 'Out of Bounds';

      const address = res.features[0].place_name
        .replace(', United States', '')
        .replace(/\s\d{5}/g, '');

      return {
        address,
        lngLat: [lng, lat],
      };
    })
    .catch(() => false);
}

const radarStations = [
  {
    sid: 'KCBW',
    lngLat: [-67.80642, 46.03917],
  },
  {
    sid: 'KGYX',
    lngLat: [-70.25636, 43.89131],
  },
  {
    sid: 'KCXX',
    lngLat: [-73.16639, 44.51111],
  },
  {
    sid: 'KTYX',
    lngLat: [-75.68, 43.75583],
  },
  {
    sid: 'KBUF',
    lngLat: [-78.73694, 42.94861],
  },
  {
    sid: 'KBGM',
    lngLat: [-75.98472, 42.19969],
  },
  {
    sid: 'KENX',
    lngLat: [-74.06408, 42.58656],
  },
  {
    sid: 'KBOX',
    lngLat: [-71.13686, 41.95578],
  },
  {
    sid: 'KOKX',
    lngLat: [-72.86392, 40.86553],
  },
  {
    sid: 'KCLE',
    lngLat: [-81.86, 41.41306],
  },
  {
    sid: 'KPBZ',
    lngLat: [-80.21794, 40.53167],
  },
  {
    sid: 'KCCX',
    lngLat: [-78.00389, 40.92306],
  },
  {
    sid: 'KDIX',
    lngLat: [-74.41072, 39.94694],
  },
  {
    sid: 'KDOX',
    lngLat: [-75.44, 38.82556],
  },
  {
    sid: 'KLWX',
    lngLat: [-77.4875, 38.97611],
  },
  {
    sid: 'KRLX',
    lngLat: [-81.72278, 38.31111],
  },
  {
    sid: 'KILN',
    lngLat: [-83.82167, 39.42028],
  },
  {
    sid: 'KJKL',
    lngLat: [-83.31306, 37.59083],
  },
  {
    sid: 'KFCX',
    lngLat: [-80.27417, 37.02417],
  },
  {
    sid: 'KAKQ',
    lngLat: [-77.0075, 36.98389],
  },
];

export { getData, getLocation, states, radarStations };
