import { format, subDays, addDays } from 'date-fns';

import roundXDigits from './Rounding';
import DayHourly from './DayClasses';

type ToolData = {
  gdd32: [string, number][],
  gdd50: [string, number][]
};

type ToolRawData = {
  forecast: number[],
  days: DayHourly[]
};


function getToolRawData(lng: number, lat: number, gdd32: number, gdd50: number ): Promise<DayHourly[] | null> {
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
      const hourly = data.hrlyData.concat(data.fcstData);

      const days = [];

      console.log(data);
      console.log(hourly);

      console.log('start: ', gdd32);
      for (let i = 0, j = 24, k = 0; j < hourly.length; i+=24, j+=24, k++) {
        const newDay = new DayHourly(data.hrlyData.slice(i,j));
        const avg = newDay.maxtMintAvg();
        
        gdd32 += Math.max(0, avg - 32);
        gdd50 += Math.max(0, avg - 50);

        console.log(newDay.date, newDay.avgTemp(), avg, gdd32);

        newDay.gdd32 = gdd32;
        newDay.gdd50 = gdd50;
        days.push(newDay);
      }

      return days;
    })
    .catch(() => null);
}


function getGDDPast(date: string, loc: string, base: number ): Promise<number> {
  return fetch('https://grid2.rcc-acis.org/GridData', {
    method: 'POST',
    body: JSON.stringify({
      'loc': loc,
      'date': date,
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
    .then(data => data.data[0][1]);
}


const getToolData = async (lngLat: number[]): Promise<ToolData | null> => {
  const today = new Date();
  const date = format(subDays(today, 19), 'yyyy-MM-dd');
  console.log(date, lngLat);
  const earliestGDD32: number = await getGDDPast(date, lngLat.join(','), 32);
  const earliestGDD50: number = await getGDDPast(date, lngLat.join(','), 50);
  const data: DayHourly[] | null = await getToolRawData(lngLat[0], lngLat[1], earliestGDD32, earliestGDD50);
  
  if (data) {
    const thirty = data.map(d => [d.gdd32, d.date]);
    // const fifty = data.map(d => d.gdd50);

    console.log(thirty);
    // console.log(fifty);

    // const past32: number[] = await getGDDPast(sDate, eDate, lngLat.join(','), 32);
    // const past50: number[] = await getGDDPast(sDate, eDate, lngLat.join(','), 50);
    
    // const gdd32: [string, number][] = calcGDDs(pastDate, past32, data.forecast, 32);
    // const gdd50: [string, number][] = calcGDDs(pastDate, past50, data.forecast, 50);
  
    return {
      gdd32: [],
      gdd50: []
    };
  } else {
    return null;
  }
};



const states = [
  'Maine',
  'New Hampshire',
  'Vermont',
  'Rhode Island',
  'Massachusetts',
  'Connecticut',
  'New York',
  'New Jersey',
  'Pennsylvania',
  'Delaware',
  'Maryland',
  'West Virginia'
];

type UserLocation = {
  address: string,
  lngLat: number[]
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
    .then(res => {
      const region = res.features[0].context.find((c: ContextType) => c.id.split('.')[0] === 'region');
      if (!states.includes(region.text)) throw 'Out of Bounds';

      const address = res.features[0].place_name.replaceAll(', United States', '').replaceAll(/\s\d{5}/g, '');

      return {
        address,
        lngLat: [lng, lat]
      };
    })
    .catch(() => false);
}


export { getToolData, getLocation };