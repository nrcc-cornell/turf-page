import React from 'react';

import StyledCard from '../../StyledCard';
import StyledDivider from '../../StyledDivider';
import RSWMaps from '../../RSWMaps';
import DailyChart, { StringRow } from '../../DailyChart';

export type SeedWeedPageInfo = {
  maps: {
    title: string;
    thumbs: {
      fullSizeUrl: string;
      thumbUrl: string;
      name: string;
      title: string;
      alt?: string;
      date?: string;
    }[];
  }[];
  pageType: 'seedWeed';
  chart: {
    rows: {
      rowName: string;
      data: 'gdd32' | 'gdd50';
      colorizer: ColorizerFunc;
    }[];
    legend: string[][];
    title: string;
  };
  text: {
    titlePart: string;
    description: string[];
    references?: string[];
  };
};

type SeedWeedProps = {
  todayFromAcis: boolean;
  sx: {
    [key:string]: string
  };
  data: {
    current: [string, number][];
    last: [string, number][];
    normal: [string, number][];
    table: [string, number][][];
  };
  pageInfo: SeedWeedPageInfo
  today: Date;
};

export default function SeedWeedPage(props: SeedWeedProps) {
  const data = props.pageInfo.chart.rows.reduce((acc, row) => {
    acc.push({
      rowName: row.rowName,
      type: 'dots',
      data: props.data.table[0].map(arr => row.colorizer(arr[1]))
    });
    return acc;
  }, [{
    rowName: 'As of 8am On',
    type: 'dates',
    data: props.data.table[0].map(arr => arr[0].slice(0,5))
  }] as StringRow[]);
  
  return (
    <StyledCard
      variant='outlined'
      sx={props.sx}
    >
      <DailyChart
        {...props.pageInfo.chart}
        data={data}
        todayFromAcis={props.todayFromAcis}
        numRows={3}
        today={props.today}
      />

      <StyledDivider />

      <RSWMaps maps={props.pageInfo.maps} text={props.pageInfo.text} />
    </StyledCard>
  );
}