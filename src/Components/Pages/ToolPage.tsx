import React from 'react';

import { Card } from '@mui/material';

import TextContent from './TextContent';
import DailyChart from './DailyChart';

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
  maps: string[],
  data: [string, number][]
};



export default function ToolPage(props: PageProps) {
  return (
    <Card variant='outlined' sx={{
      padding: '10px',
      boxSizing: 'border-box',
      width: '90%',
      maxWidth: 720,
      margin: '0 auto'
    }}>
      <DailyChart {...props.chart} data={props.data} />

      {/* <WeekMaps />

      <WeekMaps /> */}

      <TextContent {...props.text} />
    </Card>
  );
}