import React from 'react';
import { getDayOfYear, addDays, format } from 'date-fns';

import { Typography } from '@mui/material';

import StyledCard from '../../StyledCard';
import DailyChart from '../../DailyChart';

import { calcDaylength } from '../../../Scripts/GrowthPotentialModel';

type PollinatorProps = {
  latitude: number;
  dailyChartProps: {
    rows: {
      data: string;
      rowName: string;
      colorizer: ColorizerFunc;
      type: 'dots';
    }[];
    legend: string[][];
    title: string,
    todayFromAcis: boolean;
  };
};

export default function PollinatorRiskPage(props: PollinatorProps) {
  const categoryByDate = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const currDay = addDays(today, i);
    const dayOfYear = getDayOfYear(currDay);
    const yesterdayDayLength = calcDaylength(dayOfYear - 1, 6, props.latitude);
    const todayDayLength = calcDaylength(dayOfYear, 6, props.latitude);

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

    categoryByDate.push([format(currDay, 'MM-dd'), cat]);
  }

  console.log(props.dailyChartProps);


  // Need to take in gdd50 data
  // Need to place gdd50 and daylength data into rows
  // Need to pass correct structure into DailyChart


  // Use latitude to calculate days lengths for clover (covert logic from python code in turf-map-maker)
  // Get GDD50 values to use for dandelion with thresholds of <40, 40-100, 100-350, >350
  // Pass both into dot chart creator and place on page
  
  // Use today's values to determine the conditional texts to display


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
      <Typography variant='h5' sx={{ marginLeft: '6px' }}>Pollinator Risk Page</Typography>

      {/* <DailyChart {...props.dotChartProps as DailyChartProps} data={} /> */}
    </StyledCard>
  );
}
