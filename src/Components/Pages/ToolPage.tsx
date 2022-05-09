import React, { Fragment } from 'react';

import { Card, Box } from '@mui/material';

import TextContent from './TextContent';
import DailyChart from './DailyChart';
import WeekMaps from './WeekMaps';
import StyledDivider from './StyledDivider';

type Row = {
  thresholds: {
    low: number,
    medium: number,
    high: number
  },
  name: string
}

type ThresholdObj = {
  low: number,
  medium: number,
  high: number
};

type DateValue = [ string, number ];

type HSTool = {
  Daily: DateValue[]
};

type Tool = HSTool & {
  '7 Day Avg': DateValue[]
};

type PageProps = {
  text: {
    description: string[],
    titlePart: string,
    references?: string[],
  }
  chart: {
    rows: Row[],
    ranges: string[][],
    title: string,
    data: 'gdd32' | 'gdd50' | 'anthracnose' | 'brownPatch' | 'dollarspot' | 'pythiumBlight' | 'heatStress',
    colorizer: (val: number, thresholds: ThresholdObj) => string
  },
  maps: {
    title: string,
    thumbs: {
      fullSizeUrl: string,
      thumbUrl: string,
      alt: string,
      date: string
    }[]
  }[],
  data: [string, number][] | Tool | HSTool | null,
  todayFromAcis: boolean
};



export default function ToolPage(props: PageProps) {
  const isDoubleMap = props.data instanceof Array;
  
  return (
    <Card variant='outlined' sx={{
      padding: '10px',
      boxSizing: 'border-box',
      width: '90%',
      maxWidth: 800,
      margin: '0 auto',
      '@media (min-width: 1465px)': {
        maxWidth: isDoubleMap ? 1475 : 800
      },
      '@media (max-width: 430px)': {
        width: '100%',
        padding: '10px 0px',
        border: 'none'
      }
    }}>
      <DailyChart {...props.chart} data={props.data} todayFromAcis={props.todayFromAcis} />
      
      <StyledDivider />

      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        marginTop: '10px',
        '@media (min-width: 1465px)': {
          flexDirection: 'row',
          gap: '15px'
        }
      }}>
        {props.maps.map((thumbGroup, i) => {
          return (
            <Fragment key={thumbGroup.title}>
              <WeekMaps {...thumbGroup} />

              { i !== props.maps.length - 1 && <StyledDivider sx={{ '@media (min-width: 1465px)': { display: 'none' } }} />}
            </Fragment>
          );
        })}
      </Box>

      <StyledDivider />

      <TextContent {...props.text} />
    </Card>
  );
}