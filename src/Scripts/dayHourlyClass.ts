import { addDays } from 'date-fns';

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