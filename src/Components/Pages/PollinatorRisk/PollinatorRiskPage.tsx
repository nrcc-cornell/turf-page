import React from 'react';
import { getDayOfYear, addDays, format, parse } from 'date-fns';
import { Typography } from '@mui/material';

import StyledCard from '../../StyledCard';
import StyledDivider from '../../StyledDivider';
import RSWMaps from '../../RSWMaps';
import DailyChart, { StringRow } from '../../DailyChart';
import PollinatorConditionalText from './PollinatorConditionalText';

import { calcDaylength } from '../../../Scripts/GrowthPotentialModel';

import { ThumbUrls } from '../../WeekMaps';

export type PollinatorPageInfo = {
  maps: {
    title: string;
    thumbs: ThumbUrls[];
  }[];
  pageType: 'pollinator';
  chart: {
    rows: {
      data: string;
      rowName: string;
      colorizer: ColorizerFunc;
    }[];
    legend: string[][];
    title: string
  };
};

type PollinatorProps = {
  latitude: number;
  gddData: [string, number][];
  pageInfo: PollinatorPageInfo;
  todayFromAcis: boolean;
  today: Date;
};

export default function PollinatorRiskPage(props: PollinatorProps) {
  const sDate = parse(props.gddData[0][0], 'MM-dd-yyyy', new Date());
  const dandelionCats: [string, number][] = [];
  const cloverCats: [string, number][] = [];
  for (let i = 0; i < props.gddData.length; i++) {
    const currDay = addDays(sDate, i);
    const currDayStr = format(currDay, 'MM-dd-yyyy');
    const dayOfYear = getDayOfYear(currDay);
    const yesterdayDayLength = calcDaylength(dayOfYear - 1, props.latitude);
    const todayDayLength = calcDaylength(dayOfYear, props.latitude);
    const gdds = props.gddData[i][1];

    let dCat, cCat;
    if (gdds < 350 && todayDayLength > 14.25) {
      dCat = 349;
      cCat = 2;
    } else {
      if (todayDayLength < 14.25) {
        dCat = 0;
      } else {
        dCat = gdds;
      }

      if (yesterdayDayLength < todayDayLength) {
        if (todayDayLength < 14.25) {
          cCat = 0;
        } else if (14.25 <= todayDayLength && todayDayLength < 14.75) {
          cCat = 1;
        } else {
          cCat = 2;
        }
      } else {
        if (13.5 < todayDayLength) {
          cCat = 2;
        } else {
          cCat = 3;
        }
      }
    }

    dandelionCats.push([currDayStr, dCat]);
    cloverCats.push([currDayStr, cCat]);
  }

  const data = props.pageInfo.chart.rows.reduce((acc, row) => {
    acc.push({
      rowName: row.rowName,
      type: 'dots',
      data: (row.rowName === 'Dandelion' ? dandelionCats : cloverCats).map(arr => row.colorizer(arr[1]))
    });
    return acc;
  }, [{
    rowName: 'As of 8am On',
    type: 'dates',
    data: props.gddData.map(arr => arr[0].slice(0,5))
  }] as StringRow[]);

  const todayIdx = data[0].data.findIndex(date => date === format(props.today, 'MM-dd'));
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
      <Typography variant='h5'>Pollinator Plants in the Lawn</Typography>
      <Typography variant='subtitle1' sx={{ fontSize: '16px', marginLeft: '6px', marginBottom: '20px' }}>This tool predicts when clover and dandelion, two significant weeds in turfgrass that attract pollinators, are flowering. When these plants are in flower, take precautions when applying pesticides or consider avoiding pesticide applications all together.</Typography>

      <DailyChart
        {...props.pageInfo.chart}
        data={data}
        todayFromAcis={props.todayFromAcis}
        numRows={3}
        today={props.today}
      />

      {(todayDandelionRisk && todayCloverRisk) &&
        <>
          <StyledDivider />

          <PollinatorConditionalText text={[{ name: 'Dandelion', color: todayDandelionRisk}, { name: 'White Clover', color: todayCloverRisk }]} />
        </>
      }

      <StyledDivider />

      <RSWMaps maps={props.pageInfo.maps} />
    </StyledCard>
  );
}
