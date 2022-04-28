import roundXDigits from './Rounding';
import { addDays } from 'date-fns';

const FToC = (f: number) => (f - 32) * (5/9);
const CToF = (c: number) => (c * (9/5)) + 32;
const isDew = (temp: number, dewpoint: number) => FToC(temp) - FToC(dewpoint) < 3;

class Hour {
  temp: number;
  rhum: number;
  rained: boolean;
  hadDew: boolean;
  wet: boolean;

  constructor(data: string[], wetOverride: boolean) {
    this.temp = parseFloat(data[3]);
    this.rhum = parseFloat(data[4]);
    this.rained = parseFloat(data[2]) > 0;
    this.hadDew = isDew(this.temp, parseFloat(data[5]));
    this.wet = wetOverride || this.rained || this.hadDew;
  }
}


export default class DayHourly {
  date: Date;
  data: Hour[];
  gdd32 = 0;
  gdd50 = 0;

  constructor(data: string[][]) {
    this.date = addDays(new Date(data[0][0]), 1);
  
    let wasWet = false;
    this.data = data.map(d => {
      const newHour = new Hour(d, wasWet);
      wasWet = newHour.rained || newHour.hadDew;
      return newHour;
    });
  }

  didRain(): boolean {
    return !!this.data.find(d => d.rained);
  }

  numWetHours(): number {
    return this.data.filter(d => d.wet).length;
  }

  maxTemp(): number {
    return Math.max(...this.data.map(d => d.temp));
  }

  minTemp(): number {
    return Math.min(...this.data.map(d => d.temp));
  }

  avgTemp(): number {
    return roundXDigits(this.data.reduce((sum,d) => {
      return sum += d.temp;
    }, 0) / this.data.length, 1);
  }

  numGTRHum(threshold: number): number {
    return this.data.reduce((count, d) => {
      if (d.rhum > threshold) count++;
      return count;
    }, 0);
  }

  numGTRHumAndT(rHumThreshold: number, tThreshold: number): number {
    return this.data.reduce((count, d) => {
      if (d.rhum > rHumThreshold && d.temp > CToF(tThreshold)) count++;
      return count;
    }, 0);
  }

  avgRH(): number {
    return roundXDigits(this.data.reduce((sum,d) => {
      return sum += d.rhum;
    }, 0) / this.data.length, 1);
  }

  hsiHours(): number {
    return this.data.slice(12).reduce((count, d) => {
      if (d.temp > 69 && d.temp + d.rhum > 150) count++;
      return count;
    }, 0);
  }

  maxtMintAvg(): number {
    console.log(this.maxTemp(), this.minTemp(), this.maxTemp() + this.minTemp(), this.date);
    return (this.maxTemp() + this.minTemp()) / 2;
  }
}