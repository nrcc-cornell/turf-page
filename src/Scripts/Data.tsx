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


function getToolRawData(lng: number, lat: number ): Promise<ToolRawData | null> {
  return fetch('https://hrly.nrcc.cornell.edu/locHrly', {
    method: 'POST',
    body: JSON.stringify({
      'lat': lat,
      'lon': lng,
      'tzo': -5,
      'sdate': format(subDays(new Date(), 11), 'yyyyMMdd08'),
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
      console.log(data);

      const days = [];
      for (let i = 0, j = 24; j < data.hrlyData.length; i+=24, j+=24) {
        console.log(data.hrlyData.slice(i,j));

        days.push(new DayHourly(data.hrlyData.slice(i,j)));
      }

      return {
        forecast: data.dlyFcstData.map((vals: string[]) => (parseFloat(vals[1]) + parseFloat(vals[2])) / 2),
        days
      };
    })
    .catch(() => null);
}



function getGDDPast(sDate: string, eDate: string, loc: string, base: number ): Promise<number[]> {
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
    .then(data => {
      return data.data.map((arr: [string, number][]) => arr[1]);
    });
}


const calcGDDs = (pastDate: Date, past: number[], forecast: number[], base: number): [string, number][] => {
  let total = past[past.length - 1];
  const data = past.concat(forecast.map(num => {
    total += Math.max(0, num - base);
    return total;
  }));

  return data.map((val, i) => [format(addDays(pastDate, i), 'MM-dd'), roundXDigits(val, 0)]);
};


const getToolData = async (lngLat: number[]): Promise<ToolData | null> => {
  const pastDate = subDays(new Date(), 3);
  const sDate = format(pastDate, 'yyyy-MM-dd');

  const data: ToolRawData | null = await getToolRawData(lngLat[0], lngLat[1]);
  
  if (data) {
    const eDate = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    const past32: number[] = await getGDDPast(sDate, eDate, lngLat.join(','), 32);
    const past50: number[] = await getGDDPast(sDate, eDate, lngLat.join(','), 50);
    
    const gdd32: [string, number][] = calcGDDs(pastDate, past32, data.forecast, 32);
    const gdd50: [string, number][] = calcGDDs(pastDate, past50, data.forecast, 50);
  
    return {
      gdd32,
      gdd50
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