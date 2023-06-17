import { format, subDays } from 'date-fns';
import { DayHourly } from './dayHourlyClass';

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
export function getToolRawData(
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