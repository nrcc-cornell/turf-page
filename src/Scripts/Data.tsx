import { format, subDays, addDays, isWithinInterval, parseISO, isSameDay, isAfter } from 'date-fns';

import roundXDigits from './Rounding';
import DayHourly from './DayClasses';


const emptyIndices = {
  anthracnose: {
    Daily: [],
    '7 Day Avg': [],
    season: []
  },
  brownPatch: {
    Daily: [],
    '7 Day Avg': [],
    season: []
  },
  dollarspot: {
    Daily: [],
    '7 Day Avg': [],
    season: []
  },
  pythiumBlight: {
    Daily: [],
    '7 Day Avg': [],
    season: []
  },
  heatStress: {
    Daily: [],
    season: []
  }
};

const emptyGDDObj = {
  hasToday: false,
  current: [],
  last: [],
  normal: []
};


// Loop through through each full set of 24 'hours' instantiating a DayHourly object
// Passes the index for the beginning of the unused data back, it is used to combine the observed and forecast hours later
function createDays(arr: string[][]) {
  let i = 0;
  const days = [];
  for (let j = 24; j < arr.length; i+=24, j+=24) {
    days.push(new DayHourly(arr.slice(i,j)));
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
// // Therefore, the risk value for 5/4 is based on observed weather from 8am 5/1 - 7am 5/4.




// Gets hourly data from API and converts it into an array of DayHourly objects for calculating risks later
function getToolRawData(lng: number, lat: number, seasonStart: Date, seasonEnd: string ): Promise<DayHourly[] | null> {
  return fetch('https://hrly.nrcc.cornell.edu/locHrly', {
    method: 'POST',
    body: JSON.stringify({
      'lat': lat,
      'lon': lng,
      'tzo': -5,
      'sdate': format(subDays(seasonStart, 9), 'yyyyMMdd08'),   // Explanation for '08' above
      'edate': seasonEnd
    })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }

      return response.json();
    })
    .then(data => {
      const pastDaysObj = createDays(data.hrlyData);

      let futureDays = data.hrlyData.slice(pastDaysObj.firstUnused);
      if (futureDays[futureDays.length - 1][2] === 'M') futureDays[futureDays.length - 1][2] = '0.00';
      futureDays = futureDays.concat(data.fcstData);

      const futureDaysObj = createDays(futureDays);
      
      return pastDaysObj.days.concat(futureDaysObj.days);
    })
    .catch(() => null);
}


// Gets past GDDs
function getGDDPast(sDate: string, eDate: string, loc: string, base: number ): Promise<StrDateValue[]> {
  return fetch('https://grid2.rcc-acis.org/GridData', {
    method: 'POST',
    body: JSON.stringify({
      'loc': loc,
      'sdate': sDate,
      'edate': eDate,
      'grid': 'nrcc-model',
      'elems': [{
        'name': 'gdd',
        'base': base,
        'interval': [0,0,1],
        'duration': 'std',
        'season_start': [3,1],
        'reduce': 'sum'
      }]})
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }

      return response.json();
    })
    .then(data => data.data);
}


// Takes observed and forecast GDD arrays and converts to a single array with calculated values for forecasts
const calcGDDs = async (today: Date, hasToday: boolean, past: DateValue[], todayOn: DayHourly[], base: number): Promise<StrDateValue[]> => {
  // Handles edge case of approaching the end of the season, 11/30
  let shift = 0;
  if (today.getMonth() === 10 && today.getDate() > 25) shift = today.getDate() - 25;

  // Handles if today's value should be observed or forecast
  if (hasToday) {
    past = past.slice(5 - shift,9);
    todayOn = todayOn.slice(1, todayOn.length - shift);
  } else {
    past = past.slice(5 - shift,8);
    todayOn = todayOn.slice(0, todayOn.length - shift);
  }

  // Uses the last observed GDD value to calculate the forecast totals
  let gdds = past[past.length - 1][1];
  const forecasts: DateValue[] = todayOn.map(d => {
    const thisGDD = ((d.maxTemp(true) + d.minTemp(true)) / 2) - base;
    gdds += Math.max(0, thisGDD);
    return [d.date, gdds];
  });

  const results: DateValue[] = past.concat(forecasts);
  return results.map(arr => [format(arr[0], 'MM-dd-yyyy'), roundXDigits(arr[1], 0)]);
};


// Averages X number of days of index values
const xDayAverage = (numDays: number, indices: StrDateValue[]): StrDateValue[] => {
  const past: StrDateValue[] = [];
  return indices.reduce((acc: StrDateValue[], d) => {
    past.push(d);

    // If 'past' is 'numDays' long, push [date, average] to 'acc' then remove the oldest day from the list
    if (past.length === numDays) {
      const avg = past.reduce((sum, d) => sum += d[1], 0) / numDays;
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
    heatStress: []
  };

  // Loop starts where it does to ensure that you can look back several days where necessary and find data
  for (let i = 6; i < days.length; i++) {
    const day = days[i];
    if (isAfter(day.date, new Date(day.date.getFullYear(), 11, 1))) break;

    const currDay = format(day.date, 'MM-dd-yyyy');

    // Calculate and add index for each risk to object
    dayValues['anthracnose'].push([currDay, calcAnthracnoseIndex(days.slice(i - 2, i + 1))]);       // 3 days, including today
    dayValues['brownPatch'].push([currDay, calcBrownPatchIndex(day)]);                              // Just current day
    dayValues['dollarspot'].push([currDay, calcDollarspotIndex(days.slice(i - 6, i + 1))]);         // 7 days, including today
    dayValues['pythiumBlight'].push([currDay, calcPythiumBlightIndex(day)]);                        // Just current day
    dayValues['heatStress'].push([currDay, calcHeatStressIndex(day)]);                              // Just current day
  }

  // From the arrays of indices calculate the average indices
  const indices = JSON.parse(JSON.stringify(emptyIndices));
  Object.keys(dayValues).forEach(risk => {
    if (risk === 'anthracnose') {
      indices[risk] = {
        // Daily for anthracnose is the days' index, not an average. 
        Daily: dayValues[risk].slice(-10),
        '7 Day Avg': xDayAverage(7, dayValues[risk].slice(-16)),
        season: dayValues[risk].slice(2)
      };
    } else if (risk === 'heatStress') {
      const season = xDayAverage(3, dayValues[risk]);
      indices[risk] = {
        Daily: season.slice(-10),
        season
      };
    } else if (risk === 'brownPatch' || risk === 'dollarspot' || risk === 'pythiumBlight') {
      const season = xDayAverage(3, dayValues[risk]);
      indices[risk] = {
        Daily: season.slice(-10),
        '7 Day Avg': xDayAverage(7, dayValues[risk].slice(-16)),
        season
      };
    }
  });

  return indices;
};

const calcAnthracnoseIndex = (pastThree: DayHourly[]): number => {
  // avgT = average temperature over three days
  // avgLw = average leaf wetness over three days
  
  const { avgT, avgLw } = pastThree.reduce((acc, d, j) => {
    acc.avgT += d.avgTemp();
    acc.avgLw += d.numWetHours();

    if (j === 2) {
      acc.avgT = acc.avgT / 3;
      acc.avgLw = acc.avgLw / 3;
    }

    return acc;
  }, { avgT: 0, avgLw: 0 });

  let val = 4.0233 - (0.2283 * avgLw) - (0.5303 * avgT) - (0.0013 * (avgLw ** 2)) + (0.0197 * (avgT ** 2)) + (0.0155 * avgT * avgLw);

  // Adjustments
  if (avgT < 4) val = -1;     // Prevents low temperature from having high risk
  if (avgLw < 8) val -= 3;    // Prevents dry days from having high risk

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
  
  let minT = isWithinInterval(day.date, { start: new Date(day.date.getFullYear(), 6, 1), end: new Date(day.date.getFullYear(), 8, 30) }) ? -2 : -4;
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

  const dRain = (consecRain >= 3 && crAvgT > 15) || (consecRain >= 2 && crAvgT > 20) ? 1 : 0;
  
  return dRh + dLw + dRain;
};

const calcPythiumBlightIndex = (day: DayHourly): number => {
  const maxT = day.maxTemp(true);
  const minT = day.minTemp(true);
  const rh89 = day.numGTRHum(89);     // number of hours with RH > 89
  
  return (maxT - 86) + (minT - 68) + (0.5 * (rh89 - 6));
};

const calcHeatStressIndex = (day: DayHourly): number => {
  return day.hsiHours();              // number of hours with heat stress
};







const getCurrentGDDs = async (sDate:string, eDate: string, lngLat: string, base: number, today: Date, forecastData: DayHourly[]) => {
  const res = await getGDDPast(sDate, eDate, lngLat, base);
  const past: DateValue[] = res.map((arr: [string, number]) => [parseISO(arr[0]), arr[1]]);
  const hasToday = past[past.length - 1][1] !== -999;
  const thisSeasonGDDs = await calcGDDs(today, hasToday, past, forecastData, base);

  return {
    current: thisSeasonGDDs,
    hasToday
  };
};

type DSC = {
  date: string,
  sum: number,
  count: number
}

const getGDDs = async (sDate: string, eDate: string, lngLat: string, base: number, today: Date, data: DayHourly[]): Promise<GDDObj> => {
  const { current , hasToday } = await getCurrentGDDs(sDate, eDate, lngLat, base, today, data);

  sDate = `${today.getFullYear() - 15}-03-01`;
  eDate = `${today.getFullYear() - 1}-11-30`;
  
  const last15Years = await getGDDPast(sDate, eDate, lngLat, base);

  const beginLastSeason = `${today.getFullYear() - 1}-03-01`;
  let iOfMarchFirst;
  let counter = 0;
  const sums = last15Years.reduce((acc, arr, i) => {
    if (arr[0] === beginLastSeason) iOfMarchFirst = i;

    const dateParts = arr[0].split('-');

    if (dateParts[1] !== '12' && dateParts[1] !== '01' && dateParts[1] !== '02') {
      acc[counter].sum += arr[1];
      acc[counter].count++;
      if (!acc[counter].date) acc[counter].date = arr[0].slice(-5);
      counter++;
    } else {
      counter = 0;
    }

    return acc;
  }, Array.from({length: 275}, (): DSC => { return {date: '', sum: 0, count: 0}; }));

  const normal = sums.map((obj): StrDateValue => [ obj.date, roundXDigits(obj.sum / obj.count, 0)]);

  return {
    hasToday,
    current,
    last: last15Years.slice(iOfMarchFirst),
    normal
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
  
  const sDate = format(subDays(today, 8), 'yyyy-MM-dd');
  const seasonStart = new Date(today.getFullYear(), 2, 1);

  const data: DayHourly[] | null = await getToolRawData(lngLat[0], lngLat[1], seasonStart, seasonEnd);

  if (data) {
    const riskIndices = calcIndices(data);
    
    // digest GDD data into GDDs per day of interest
    const iOfToday = data.findIndex(obj => isSameDay(obj.date, today));
    const coords = lngLat.join(',');
    const forecast = data.slice(iOfToday);

    const gdd32 = await getGDDs(sDate, eDate, coords, 32, today, forecast);
    const gdd50 = await getGDDs(sDate, eDate, coords, 50, today, forecast);

    console.log(gdd32);
    console.log(gdd50);
    
    // const { current: current32 , hasToday } = await getCurrentGDDs(sDate, eDate, lngLat.join(','), 32, today, data.slice(iOfToday));
    // const { current: current50 } = await getCurrentGDDs(sDate, eDate, lngLat.join(','), 50, today, data.slice(iOfToday));

    // console.log(current32);
    // console.log(current50);

    // sDate = `${today.getFullYear() - 15}-03-01`;
    // eDate = format(addDays(subYears(parseISO(eDate), 1), 4), 'yyyy-MM-dd');
    
    // const last15Years32 = await getGDDPast(sDate, eDate, lngLat.join(','), 32);
    // const last15Years50 = await getGDDPast(sDate, eDate, lngLat.join(','), 50);
    
    // console.log(last15Years32);
    // console.log(last15Years50);

    // const last32 = last15Years32.slice(-9);
    // const last50 = last15Years50.slice(-9);

    // console.log(last32);
    // console.log(last50);
    
    



    return {
      gdd32,
      gdd50,
      ...riskIndices,
      todayFromAcis: gdd32.hasToday
    };
  } else {
    return {
      gdd32: emptyGDDObj,
      gdd50: emptyGDDObj,
      ...emptyIndices,
      todayFromAcis: false
    };
  }
};





























// // Overarching function to coordinate gathering and calculating data used in the ToolPage component
// const getData = async (lngLat: number[]): Promise<ToolData> => {
//   let today = new Date();
//   const month = today.getMonth();
  
//   let seasonEnd, eDate;
//   if (month < 2 || month === 11) {
//     today = new Date(today.getFullYear() - (month < 2 ? 1 : 0), 10, 25);
//     seasonEnd = format(new Date(today.getFullYear(), 10, 30), 'yyyyMMdd08');
//     eDate = format(addDays(today, 6), 'yyyy-MM-dd');
//   } else {
//     seasonEnd = 'now';
//     eDate = format(addDays(today, 1), 'yyyy-MM-dd');
//   }
  
//   const sDate = format(subDays(today, 8), 'yyyy-MM-dd');
//   const seasonStart = new Date(today.getFullYear(), 2, 1);

//   const data: DayHourly[] | null = await getToolRawData(lngLat[0], lngLat[1], seasonStart, seasonEnd);

//   if (data) {
//     // digest GDD data into GDDs per day of interest
//     const iOfToday = data.findIndex(obj => isSameDay(obj.date, today));
    
//     const past32 = await getGDDPast(sDate, eDate, lngLat.join(','), 32);
//     const past50 = await getGDDPast(sDate, eDate, lngLat.join(','), 50);
    
//     const hasToday = past32[past32.length - 1][1] !== -999;
    
//     const gdd32 = await calcGDDs(today, hasToday, past32, data.slice(iOfToday), 32);
//     const gdd50 = await calcGDDs(today, hasToday, past50, data.slice(iOfToday), 50);

//     const riskIndices = calcIndices(data);

//     return {
//       gdd32,
//       gdd50,
//       ...riskIndices,
//       todayFromAcis: hasToday
//     };
//   } else {
//     return {
//       gdd32: [],
//       gdd50: [],
//       ...emptyIndices,
//       todayFromAcis: false
//     };
//   }
// };


























// Helpful object for converting states of interest to abbreviations
const states = {
  'Maine': 'ME',
  'New Hampshire': 'NH',
  'Vermont': 'VT',
  'Rhode Island': 'RI',
  'Massachusetts': 'MA',
  'Connecticut': 'CT',
  'New York': 'NY',
  'New Jersey': 'NJ',
  'Pennsylvania': 'PA',
  'Delaware': 'DE',
  'Maryland': 'MD',
  'West Virginia': 'WV',
  'Ohio': 'OH',
  'Virginia': 'VA',
  'Kentucky': 'KY'
};

// Gets the address name for a set of coordinates
function getLocation( lng: number, lat: number, token: string ): Promise<false | UserLocation> {
  return fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?limit=1&access_token=${token}`, { method: 'GET' })
    .then(response => response.json())
    .then((res): UserLocation => {
      // Gets the state name
      const region = res.features[0].context.find((c: ContextType) => c.id.split('.')[0] === 'region');
      
      // If no state name or state is outside scope, reject it
      if (!Object.keys(states).includes(region.text)) throw 'Out of Bounds';

      const address = res.features[0].place_name.replace(', United States', '').replace(/\s\d{5}/g, '');

      return {
        address,
        lngLat: [lng, lat]
      };
    })
    .catch(() => false);
}

const radarStations = [{
  sid: 'KCBW',
  lngLat: [-67.80642, 46.03917]
},{
  sid: 'KGYX',
  lngLat: [-70.25636, 43.89131]
},{
  sid: 'KCXX',
  lngLat: [-73.16639, 44.51111]
},{
  sid: 'KTYX',
  lngLat: [-75.68, 43.75583]
},{
  sid: 'KBUF',
  lngLat: [-78.73694, 42.94861]
},{
  sid: 'KBGM',
  lngLat: [-75.98472, 42.19969]
},{
  sid: 'KENX',
  lngLat: [-74.06408, 42.58656]
},{
  sid: 'KBOX',
  lngLat: [-71.13686, 41.95578]
},{
  sid: 'KOKX',
  lngLat: [-72.86392, 40.86553]
},{
  sid: 'KCLE',
  lngLat: [-81.86, 41.41306]
},{
  sid: 'KPBZ',
  lngLat: [-80.21794, 40.53167]
},{
  sid: 'KCCX',
  lngLat: [-78.00389, 40.92306]
},{
  sid: 'KDIX',
  lngLat: [-74.41072, 39.94694]
},{
  sid: 'KDOX',
  lngLat: [-75.44, 38.82556]
},{
  sid: 'KLWX',
  lngLat: [-77.4875, 38.97611]
},{
  sid: 'KRLX',
  lngLat: [-81.72278, 38.31111]
},{
  sid: 'KILN',
  lngLat: [-83.82167, 39.42028]
},{
  sid: 'KJKL',
  lngLat: [-83.31306, 37.59083]
},{
  sid: 'KFCX',
  lngLat: [-80.27417, 37.02417]
},{
  sid: 'KAKQ',
  lngLat: [-77.0075, 36.98389]
}];



export { getData, getLocation, states, radarStations };