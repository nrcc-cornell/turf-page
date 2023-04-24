import React from 'react';
import { getDayOfYear, addDays, format, parse } from 'date-fns';

import StyledCard from '../../StyledCard';
import StyledDivider from '../../StyledDivider';
import RSWMaps from '../../RSWMaps';
import DailyChart, { StringRow } from '../../DailyChart';
import PollinatorConditionalText from './PollinatorConditionalText';

import { calcDaylength } from '../../../Scripts/GrowthPotentialModel';

type PollinatorProps = {
  latitude: number;
  gddData: [string, number][];
  pageInfo: PollinatorPageInfo;
  todayFromAcis: boolean;
};

export default function PollinatorRiskPage(props: PollinatorProps) {
  const sDate = parse(props.gddData[0][0], 'MM-dd-yyyy', new Date());
  const categoryByDate: [string, number][] = [];
  for (let i = 0; i < props.gddData.length; i++) {
    const currDay = addDays(sDate, i);
    const dayOfYear = getDayOfYear(currDay);
    const yesterdayDayLength = calcDaylength(dayOfYear - 1, props.latitude);
    const todayDayLength = calcDaylength(dayOfYear, props.latitude);

    let cat;
    if (yesterdayDayLength < todayDayLength) {
      if (todayDayLength < 14.25) {
        cat = 0;
      } else if (14.25 <= todayDayLength && todayDayLength < 14.75) {
        cat = 1;
      } else {
        cat = 2;
      }
    } else {
      if (13.5 < todayDayLength) {
        cat = 2;
      } else {
        cat = 3;
      }
    }

    console.log([format(currDay, 'MM-dd-yyyy'), todayDayLength]);
    categoryByDate.push([format(currDay, 'MM-dd-yyyy'), cat]);
  }

  const data = props.pageInfo.chart.rows.reduce((acc, row) => {
    acc.push({
      rowName: row.rowName,
      type: 'dots',
      data: (row.data === 'daylength' ? categoryByDate : props.gddData).map(arr => row.colorizer(arr[1]))
    });
    return acc;
  }, [{
    rowName: 'As of 8am On',
    type: 'dates',
    data: props.gddData.map(arr => arr[0].slice(0,5))
  }] as StringRow[]);

  const todayIdx = data[0].data.findIndex(date => date === format(new Date(), 'MM-dd'));
  const todayDandelionRisk = data[1].data[todayIdx];
  const todayCloverRisk = data[2].data[todayIdx];

  return (
    <StyledCard
      variant='outlined'
      sx={{
        padding: '10px',
        boxSizing: 'border-box',
        maxWidth: '1100px',
        '@media (max-width: 448px)': {
          width: '100%',
          padding: '10px 0px',
          border: 'none',
        },
      }}
    >
      <DailyChart
        {...props.pageInfo.chart}
        data={data}
        todayFromAcis={props.todayFromAcis}
        numRows={3}
      />

      <StyledDivider />

      <PollinatorConditionalText text={[{ name: 'Dandelion', color: todayDandelionRisk}, { name: 'White Clover', color: todayCloverRisk }]} />

      <StyledDivider />

      <RSWMaps maps={props.pageInfo.maps} />
    </StyledCard>
  );
}
