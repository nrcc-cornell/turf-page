import { format, parse } from 'date-fns';

import { runoffRiskLegendInfo } from './rrOptions';

export const convertRiskPercToRiskText = (p: number) => {
  let riskText = '';
  let color = '#fff';
  if (p>=100 && p<117) {
    riskText = 'LITTLE/NO RUNOFF RISK';
    color = runoffRiskLegendInfo[0].color;
  } else if (p>=0 && p<30) {
    riskText = 'LITTLE/NO RUNOFF RISK';
    color = runoffRiskLegendInfo[0].color;
  } else if (p>=30 && p<50) {
    riskText = 'LOW RISK';
    color = runoffRiskLegendInfo[1].color;
  } else if (p>=50 && p<90) {
    riskText = 'MODERATE RISK';
    color = runoffRiskLegendInfo[2].color;
  } else if (p>=90 && p<100) {
    riskText = 'HIGH RISK';
    color = runoffRiskLegendInfo[3].color;
  } else if (p>=117 && p<=125) {
    riskText = 'HIGH RISK';
    color = runoffRiskLegendInfo[3].color;
  }
  return {riskText, color};
};

export const convertRiskPercToColumn = (p: number, x: number) => {
  let labelText = '';
  let color = '#fff';
  let value = 0;
  if (p>=100 && p<117) {
    value = 1;
    labelText = 'NRE';
    color = runoffRiskLegendInfo[0].color;
  } else if (p>=0 && p<30) {
    value = 1;
    labelText = 'NRE';
    color = runoffRiskLegendInfo[0].color;
  } else if (p>=30 && p<50) {
    value = 2;
    labelText = 'Low';
    color = runoffRiskLegendInfo[1].color;
  } else if (p>=50 && p<90) {
    value = 3;
    labelText = 'Mod';
    color = runoffRiskLegendInfo[2].color;
  } else if (p>=90 && p<100) {
    value = 4;
    labelText = 'High';
    color = runoffRiskLegendInfo[3].color;
  } else if (p>=117 && p<=125) {
    value = 4;
    labelText = 'High';
    color = runoffRiskLegendInfo[3].color;
  }
  return {
    color,
    x,
    dataLabels: {
      formatter: () => labelText,
    },
    y: value};
};

export const convertDate = (strDate: string, divider: string) => format(parse(strDate, 'yyyyMMdd', new Date()), `MM${divider}dd`);

export const descriptionFromRiskText = (txt: string) => {
  let desc = 'Little to no runoff risk.';
  let warning = '';
  if (txt === 'LOW RISK') {
    desc = 'The risk of a runoff event is expected to be less intense than at least 50% of the runoff events typically experienced during this time of year.';
    warning = 'Be aware that areas with severe slope, compacted or heavy soils, surface drains, or proximity to water bodies increase the risk of runoff. Consider these factors before determining application.';
  } else if (txt === 'MODERATE RISK') {
    desc = 'The risk of a runoff event is expected to be more intense than at least 50% of the runoff events typically experienced during this time of year.';
    warning = 'Be aware that areas with severe slope, compacted or heavy soils, surface drains, or proximity to water bodies increase the risk of runoff. Consider these factors before determining application.';
  } else if (txt === 'HIGH RISK') {
    desc = 'The risk of a runoff event is expected to be more intense than at least 90% of the runoff events typically experienced during this time of year.';
    warning = 'Use this information along with other factors to determine application.';
  }

  return { desc, warning };
};