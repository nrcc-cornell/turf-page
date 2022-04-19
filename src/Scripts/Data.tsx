import { format, subDays, addDays } from 'date-fns';

type GDDs = {
  gdd32: [string, number][],
  gdd50: [string, number][]
};


function getGDDForecast(today: string, lng: number, lat: number ): Promise<number[]> {
  return fetch('https://hrly.nrcc.cornell.edu/locHrly', {
    method: 'POST',
    body: JSON.stringify({
      'lat': lat,
      'lon': lng,
      'tzo': -5,
      'sdate': today,
      'edate': 'now'
    })
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(response.statusText);
      }

      return response.json();
    })
    .then(forecastData => {
      console.log(forecastData);
      return forecastData.dlyFcstData.map((vals: string[]) => (parseFloat(vals[1]) + parseFloat(vals[2])) / 2);
    });
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
      console.log(data);
      return data.data.map((arr: [string, number][]) => arr[1]);
    });
}


const calcGDDs = (pastDate: Date, past: number[], forecast: number[], base: number): [string, number][] => {
  let total = past[past.length - 1];
  const data = past.concat(forecast.map(num => {
    total += Math.max(0, num - base);
    return total;
  }));

  return data.map((val, i) => [format(addDays(pastDate, i), 'MM-dd'), val]);
};


const getGDDs = async (lngLat: number[]): Promise<GDDs> => {
  const today = format(new Date(), 'yyyyMMdd00');
  const pastDate = subDays(new Date(), 3);
  const sDate = format(pastDate, 'yyyy-MM-dd');

  const forecast: number[] = await getGDDForecast(today, lngLat[0], lngLat[1]);
  console.log(forecast);
  
  const past32: number[] = await getGDDPast(sDate, format(new Date(), 'yyyy-MM-dd'), lngLat.join(','), 32);
  const past50: number[] = await getGDDPast(sDate, format(new Date(), 'yyyy-MM-dd'), lngLat.join(','), 50);
  console.log(past32);
  console.log(past50);
  
  const gdd32: [string, number][] = calcGDDs(pastDate, past32, forecast, 32);
  const gdd50: [string, number][] = calcGDDs(pastDate, past50, forecast, 50);

  return {
    gdd32,
    gdd50
  };
};

export { getGDDs };