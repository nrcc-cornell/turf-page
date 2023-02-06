import roundXDigits from './Rounding';
import { parse, getDayOfYear } from 'date-fns';

const calcGPEquation = (val: number, optimum: number, k: number) => {
  return Math.exp(-0.5 * ((val - optimum) / k) ** 2);
};

const soilSatToGP = (soilSat: number, optimum: number, k: number) => {
  const ssPercent = soilSat * 100;
  if (ssPercent <= 20) {
    return 0;
  } else if (ssPercent <= 50) {
    return 0.02333 * ssPercent - 0.46667;
  } else {
    return calcGPEquation(ssPercent, optimum, k);
  }
};

const tempToGP = (avgTemp: number, optimum: number, k: number) => {
  return calcGPEquation(avgTemp, optimum, k);
};

const calcSunRevolutionAngleRadians = (dayOfYear: number) => {
  return (
    0.2163108 + 2 * Math.atan(0.9671396 * Math.tan(0.0086 * (dayOfYear - 186)))
  );
};

const calcSunDeclinationAngleRadians = (sunRevAngRads: number) => {
  return Math.asin(0.39795 * Math.cos(sunRevAngRads));
};

const calcDaylength = (dayOfYear: number, p: number, latitude: number) => {
  const sunRevAngRads = calcSunRevolutionAngleRadians(dayOfYear);
  const sunDecAngRads = calcSunDeclinationAngleRadians(sunRevAngRads);

  const pp180 = (p * Math.PI) / 180;
  const lp180 = (latitude * Math.PI) / 180;
  return (
    24 -
    (24 / Math.PI) *
      Math.acos(
        (Math.sin(pp180) + Math.sin(lp180) * Math.sin(sunDecAngRads)) /
          (Math.cos(lp180) * Math.cos(sunDecAngRads))
      )
  );
};

const lightToGP = (dateStr: string, latitude: number) => {
  const date = parse(dateStr, 'yyyyMMdd', new Date());
  const dayOfYear = getDayOfYear(date);
  const currDaylength = calcDaylength(dayOfYear, 6.0, latitude);

  // Day of year for June 21st, the longest day of the year
  const longestDay = getDayOfYear(new Date(date.getFullYear(), 5, 21));
  const maxDaylength = calcDaylength(longestDay, 6.0, latitude);

  return currDaylength / maxDaylength;
};

const constants = {
  ssOptimum: 75,
  atOptimum: 67.5,
  ssK: 30,
  atK: 10,
};

export default function growthPotentialModel(
  latitude: number,
  date: string,
  ssValue: number,
  atValue: number
): number {
  const tempGP = tempToGP(atValue, constants.atOptimum, constants.atK);
  const soilSatGP = soilSatToGP(ssValue, constants.ssOptimum, constants.ssK);
  const lightGP = lightToGP(date, latitude);

  return Math.max(0, roundXDigits(tempGP * soilSatGP * lightGP * 100, 0));
}
