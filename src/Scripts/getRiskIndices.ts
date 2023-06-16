import { isWithinInterval, format, isAfter } from 'date-fns';

import { DayHourly } from './getRaw';

type DayValues = {
  anthracnose: [string, number][];
  brownPatch: [string, number][];
  dollarspot: [string, number][];
  pythiumBlight: [string, number][];
  heatStress: [string, number][];
};

export type RiskDataObj = {
  season: [string, number][];
  '7 Day Avg'?: [string, number][];
};

export type RiskDataResults = {
  anthracnose: RiskDataObj;
  brownPatch: RiskDataObj;
  dollarspot: RiskDataObj;
  pythiumBlight: RiskDataObj;
  heatStress: RiskDataObj;
};

export const emptyRiskIndices = {
  anthracnose: {
    Daily: [],
    '7 Day Avg': [],
    season: [],
  } as RiskDataObj,
  brownPatch: {
    Daily: [],
    '7 Day Avg': [],
    season: [],
  } as RiskDataObj,
  dollarspot: {
    Daily: [],
    '7 Day Avg': [],
    season: [],
  } as RiskDataObj,
  pythiumBlight: {
    Daily: [],
    '7 Day Avg': [],
    season: [],
  } as RiskDataObj,
  heatStress: {
    Daily: [],
    season: [],
  } as RiskDataObj,
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

// Averages X number of days of index values
const xDayAverage = (
  numDays: number,
  indices: [string, number][]
): [string, number][] => {
  const past: [string, number][] = [];
  return indices.reduce((acc: [string, number][], d) => {
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
export const calcRiskIndices = (days: DayHourly[]): RiskDataResults => {
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
  const indices = JSON.parse(JSON.stringify(emptyRiskIndices));
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