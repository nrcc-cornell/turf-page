import { addDays, format, subDays } from 'date-fns';

const FToC = (f: number) => (f - 32) * (5/9);
const CToF = (c: number) => (c * (9/5)) + 32;
const isDew = (temp: number, dewpoint: number) => temp - dewpoint < 3;

class Hour {
  date: Date;
  temp: number;
  rhum: number;
  rained: boolean;
  hadDew: boolean;
  wet: boolean;

  precip: number;
  dewpoint: number;

  constructor(data: string[], wetOverride: boolean) {
    // Hour data returned from API sometimes has different lengths and therefore needs to be adjust to a standard format for use. This conditional handles that case.
    if (data.length === 12) {
      if (data[11] === 'M') {
        data.splice(2, 0, parseInt(data[10]) > 60 ? '1' : '0');
      } else {
        data.splice(2, 0, data[11]);
      }
    }

    this.date = new Date(data[0]);

    this.precip = parseFloat(data[2]);
    this.dewpoint = FToC(parseFloat(data[5]));
    
    // Temp is converted from F to C because most of the index formulas using temp require C. The min and max getter functions in the DayHourly class have the ability to convert back to F if necessary
    this.temp = FToC(parseFloat(data[3]));
    this.rhum = parseFloat(data[4]);
    this.rained = parseFloat(data[2]) > 0;
    this.hadDew = isDew(this.temp, FToC(parseFloat(data[5])));
    this.wet = wetOverride || this.rained || this.hadDew;
  }
}


export class DayHourly {
  date: Date;
  data: Hour[];

  constructor(data: string[][]) {
    this.date = addDays(new Date(data[0][0]), 1);
  
    let wasWet = false;
    this.data = data.map(d => {
      const newHour = new Hour(d, wasWet);
      wasWet = newHour.rained || newHour.hadDew;
      return newHour;
    });
  }

  precip(): number {
    return this.data.reduce((acc, d) => acc += d.precip, 0);
  }
  
  didRain(): boolean {
    return !!this.data.find(d => d.rained);
  }

  numWetHours(): number {
    return this.data.filter(d => d.wet).length;
  }

  maxTemp(inF?: boolean): number {
    const temp = Math.max(...this.data.map(d => d.temp));
    return inF ? CToF(temp) : temp;
  }

  minTemp(inF?: boolean): number {
    const temp = Math.min(...this.data.map(d => d.temp));
    return inF ? CToF(temp) : temp;
  }

  avgTemp(inF?: boolean): number {
    const avgTemp = this.data.reduce((sum,d) => {
      return sum += d.temp;
    }, 0) / this.data.length;

    return inF ? CToF(avgTemp) : avgTemp;
  }

  numGTRHum(threshold: number): number {
    return this.data.reduce((count, d) => {
      if (d.rhum > threshold) count++;
      return count;
    }, 0);
  }

  avgRH(): number {
    return this.data.reduce((sum,d) => {
      return sum += d.rhum;
    }, 0) / this.data.length;
  }

  hsiHours(): number {
    return this.data.slice(12).reduce((count, d) => {
      const fTemp = CToF(d.temp);
      if (fTemp > 69 && fTemp + d.rhum > 150) count++;
      return count;
    }, 0);
  }
}

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