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
    data: number,
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
  data: [string, number][]
};



export default function ToolPage(props: PageProps) {
  return (
    <Card variant='outlined' sx={{
      padding: '10px',
      boxSizing: 'border-box',
      width: '90%',
      maxWidth: 900,
      margin: '0 auto',
      '@media (min-width: 1465px)': {
        maxWidth: 'none'
      }
    }}>
      <DailyChart {...props.chart} data={props.data} />

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