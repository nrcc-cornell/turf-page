import { format, subDays, addDays, isWithinInterval, parseISO, isSameDay } from 'date-fns';

import roundXDigits from './Rounding';
import DayHourly from './DayClasses';

type StrDateValue = [ string, number ];
type DateValue = [ Date, number ];


type Tool = {
  Daily: StrDateValue[],
  '7 Day Avg': StrDateValue[]
};

type ToolData = {
  gdd32: StrDateValue[],
  gdd50: StrDateValue[],
  anthracnose: Tool,
  brownPatch: Tool,
  dollarspot: Tool,
  pythiumBlight: Tool,
  heatStressIndex: Tool,
  todayFromAcis: boolean
};


function createDays(arr: string[][]) {
  let i = 0;
  const days = [];
  for (let j = 24; j < arr.length; i+=24, j+=24) {
    days.push(new DayHourly(arr.slice(i,j)));
  }

  return { firstUnused: i, days };
}


function getToolRawData(lng: number, lat: number ): Promise<DayHourly[] | null> {
  return fetch('https://hrly.nrcc.cornell.edu/locHrly', {
    method: 'POST',
    body: JSON.stringify({
      'lat': lat,
      'lon': lng,
      'tzo': -5,
      'sdate': format(subDays(new Date(), 19), 'yyyyMMdd08'),
      'edate': 'now'
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



function getGDDPast(sDate: string, eDate: string, loc: string, base: number ): Promise<DateValue[]> {
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
        'season_start': [2,1],
        'reduce': 'sum'
      }]})
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }

      return response.json();
    })
    .then(data => data.data.map((arr: [string, number]) => [parseISO(arr[0]), arr[1]]));
}


const calcGDDs = async (hasToday: boolean, past: DateValue[], todayOn: DayHourly[]): Promise<StrDateValue[]> => {
  if (hasToday) {
    past = past.slice(0,4);
    todayOn = todayOn.slice(1);
  } else {
    past = past.slice(0,3);
  }

  let gdds = past[past.length - 1][1];
  const forecasts: DateValue[] = todayOn.map(d => {
    const thisGDD = (d.maxTemp() + d.minTemp()) / 2;
    gdds += thisGDD;
    return [d.date, gdds];
  });

  const results: DateValue[] = past.concat(forecasts);
  return results.map(arr => [format(arr[0], 'MM-dd'), roundXDigits(arr[1], 0)]);
};


const xDayAverage = (numDays: number, indices: StrDateValue[]): StrDateValue[] => {
  const past: StrDateValue[] = [];
  return indices.reduce((acc: StrDateValue[], d, i) => {
    if (i > numDays - 1) {
      const avg = past.reduce((sum, d) => sum += d[1], 0) / numDays;
      acc.push([d[0], avg]);
     
      past.shift();
    }

    past.push(d);

    return acc;
  }, []);
};


const calcIndices = (days: DayHourly[], type: string, dayShift: number): Tool => {
  const indices: StrDateValue[] = [];

  for (let i = days.length - dayShift; i < days.length; i++) {
    const currDay = format(days[i].date, 'MM-dd');
    const day = days[i - 1];

    // console.log('*****************************');
    // console.log(currDay);
    
    let val = 0;

    if (type === 'anthracnose') {
      val = calcAnthracnoseIndex(days.slice(i - 3, i));
    } else if (type === 'brownPatch') {
      val = calcBrownPatchIndex(day);
    } else if (type === 'dollarspot') {
      val = calcDollarspotIndex(days.slice(i - 7, i));
    } else if (type === 'pythiumBlight') {
      // val = 0;
    } else if (type === 'heatStress') {
      // val = 0;
    }

    indices.push([currDay, val]);
  }

  if (type === 'anthracnose') {
    return {
      Daily: indices.slice(7),
      '7 Day Avg': xDayAverage(7, indices)
    };
  } else {
    return {
      Daily: xDayAverage(3, indices.slice(4)),
      '7 Day Avg': xDayAverage(7, indices)
    };
  }
};


const calcAnthracnoseIndex = (pastThree: DayHourly[]): number => {
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

  if (avgT < 4) val = -1;     // Prevents low temperature from having high risk
  if (avgLw < 8) val -= 3;    // Prevents dry days from having high risk

  return val;
};


const calcBrownPatchIndex = (day: DayHourly): number => {
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
  const avgT = pastSeven[6].avgTemp();
  const avgLw = pastSeven.slice(4).reduce((acc, d, i) => {
    acc += d.numWetHours();
    return i === 2 ? acc / 3 : acc;
  }, 0);
  const rhum90 = pastSeven.reduce((acc, d) => {
    acc += d.numGTRHum(90);
    return acc;
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

  // console.log(avgT);
  // console.log(avgLw);
  // console.log(rhum90);
  // console.log(consecRain);
  // console.log(crAvgT);
  
  
  return 0;

  // return dRh + dLw + dRain;
};


const getToolData = async (lngLat: number[]): Promise<ToolData> => {
  const sDate = format(subDays(new Date(), 3), 'yyyy-MM-dd');

  const data: DayHourly[] | null = await getToolRawData(lngLat[0], lngLat[1]);

  if (data) {
    // digest GDD data into GDDs per day of interest
    const eDate = format(addDays(new Date(), 1), 'yyyy-MM-dd');
    const iOfToday = data.findIndex(obj => isSameDay(obj.date, new Date()));
    
    const past32 = await getGDDPast(sDate, eDate, lngLat.join(','), 32);
    const hasToday = past32[past32.length - 1][1] !== -999;
    const gdd32 = await calcGDDs(hasToday, past32, data.slice(iOfToday));
    
    const past50 = await getGDDPast(sDate, eDate, lngLat.join(','), 50);
    const gdd50 = await calcGDDs(hasToday, past50, data.slice(iOfToday));

    // digest DayHourly objects into Anthracnose indices per day of interest
    const anthracnose = calcIndices(data, 'anthracnose', 16);
    
    // digest DayHourly objects into Brown Patch indices per day of interest
    const brownPatch = calcIndices(data, 'brownPatch', 16);

    // digest DayHourly objects into Dollarspot indices per day of interest
    const dollarspot = calcIndices(data, 'dollarspot', 16);

    // digest DayHourly objects into Pythium Blight indices per day of interest
    const pythiumBlight = calcIndices(data, 'pythiumBlight', 16);

    // digest DayHourly objects into Heat Stress indices per day of interest
    const heatStressIndex = calcIndices(data, 'heatStressIndex', 16);

    return {
      gdd32,
      gdd50,
      anthracnose,
      brownPatch,
      dollarspot,
      pythiumBlight,
      heatStressIndex,
      todayFromAcis: hasToday
    };
  } else {
    const empty = {
      Daily: [],
      '7 Day Avg': []
    };
    
    return {
      gdd32: [],
      gdd50: [],
      anthracnose: empty,
      brownPatch: empty,
      dollarspot: empty,
      pythiumBlight: empty,
      heatStressIndex: empty,
      todayFromAcis: false
    };
  }
};



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

type UserLocation = {
  address: string,
  lngLat: [number,number]
};

type ContextType = {
  id: string,
  wikidata?: string,
  text: string,
  short_code?: string
}

function getLocation( lng: number, lat: number, token: string ): Promise<false | UserLocation> {
  return fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?limit=1&access_token=${token}`, { method: 'GET' })
    .then(response => response.json())
    .then((res): UserLocation => {
      const region = res.features[0].context.find((c: ContextType) => c.id.split('.')[0] === 'region');
      if (!Object.keys(states).includes(region.text)) throw 'Out of Bounds';

      const address = res.features[0].place_name.replaceAll(', United States', '').replaceAll(/\s\d{5}/g, '');

      return {
        address,
        lngLat: [lng, lat]
      };
    })
    .catch(() => false);
}


export { getToolData, getLocation, states };