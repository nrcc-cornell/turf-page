import {
  format,
  subDays,
  addDays,
  isSameDay,
} from 'date-fns';

import { getToolRawData } from './getRaw';
import { calcRiskIndices, RiskDataResults, emptyRiskIndices } from './getRiskIndices';
import { getGraphPagesData, emptyGraphData, GraphDataResults } from './getGraphData';

type ContextType = {
  id: string;
  wikidata?: string;
  text: string;
  short_code?: string;
};

export type ToolData = RiskDataResults & GraphDataResults;

// Overarching function to coordinate gathering and calculating data used in the ToolPage components
const getData = async (lngLat: number[], targetDate: Date): Promise<ToolData> => {
  let today = targetDate;
  const month = today.getMonth();

  let seasonEnd, eDate;
  if (month < 2 || month === 11) {
    today = new Date(today.getFullYear() - 1, 10, 30);
    seasonEnd = format(new Date(today.getFullYear(), 10, 30), 'yyyyMMdd08');
    eDate = format(addDays(today, 6), 'yyyy-MM-dd');
  } else {
    seasonEnd = 'now';
    eDate = format(addDays(today, 1), 'yyyy-MM-dd');
  }

  const sDate = format(subDays(today, 15), 'yyyy-MM-dd');
  const seasonStart = subDays(new Date(today.getFullYear(), 2, 1), 4);

  const data = await getToolRawData(
    lngLat[0],
    lngLat[1],
    seasonStart,
    seasonEnd
  );

  let riskIndices = emptyRiskIndices;
  let graphData = emptyGraphData;
  if (data) {
    riskIndices = calcRiskIndices(data);

    const iOfToday = data.findIndex((obj) => isSameDay(obj.date, today));
    const coords = lngLat.join(',');
    const forecast = data.slice(iOfToday - 1);

    graphData = await getGraphPagesData(
      sDate,
      eDate,
      coords,
      today,
      forecast
    );
  }

  return {
    ...graphData,
    ...riskIndices,
  };
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
