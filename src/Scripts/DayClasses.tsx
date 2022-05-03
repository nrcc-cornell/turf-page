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
    if (data.length === 12) {
      // ["date"                      ,"flags",   "temp","rhum","dwpt","lwet","wspd","wdir","srad","tsky","pop12","qpf"],
      // ["2022-04-01T15:00:00-04:00","   C  C   ","38.9","67", "29.0","60",  "15",  "290",  "26", "85",  "64",   "0.010"],

      if (data[11] === 'M') {
        data.splice(2, 0, parseInt(data[10]) > 60 ? '1' : '0');
      } else {
        data.splice(2, 0, data[11]);
      }
    }

    this.date = new Date(data[0]);

    this.precip = parseFloat(data[2]);
    this.dewpoint = FToC(parseFloat(data[5]));
    
    this.temp = FToC(parseFloat(data[3]));
    this.rhum = parseFloat(data[4]);
    this.rained = parseFloat(data[2]) > 0;
    this.hadDew = isDew(this.temp, FToC(parseFloat(data[5])));
    this.wet = wetOverride || this.rained || this.hadDew;
  }
}


export default class DayHourly {
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
    return this.data.reduce((sum,d) => {
      return sum += d.temp;
    }, 0) / this.data.length;
  }

  numGTRHum(threshold: number): number {
    return this.data.reduce((count, d) => {
      if (d.rhum > threshold) count++;
      return count;
    }, 0);
  }

  numGTRHumAndT(rHumThreshold: number, tThreshold: number): number {
    return this.data.reduce((count, d) => {
      if (d.rhum > rHumThreshold && d.temp > tThreshold) count++;
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
      if (d.temp > CToF(69) && d.temp + d.rhum > 150) count++;
      return count;
    }, 0);
  }
}