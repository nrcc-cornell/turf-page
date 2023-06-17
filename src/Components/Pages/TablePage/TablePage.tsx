import React from 'react';

import StyledCard from '../../StyledCard';
import StyledDivider from '../../StyledDivider';
import MultiMapPage, { MultiMapPageMaps } from '../../MultiMapPage';
import DailyChart, { StringRow, NumberRow } from '../../DailyChart';

export type TablePageInfo = {
  maps: {
    url: string;
    alt: string;
    description: string[];
    title?: string;
    mainSX?: {
      [key: string]: string | number;
    };
  }[];
  pageType: 'table' | 'lawn-watering' | 'soilSat';
  chart: {
    data: 'gdd50DiffGdds' | 'temp';
    title: string;
    rowNames: string[];
  };
};

export type TableData = {
  table: [string, number][][];
};

type TablePageProps = {
  todayFromAcis: boolean;
  sx: {
    [key:string]: string
  };
  data: TableData;
  pageInfo: TablePageInfo
};

export default function TablePage(props: TablePageProps) {
  const data = props.pageInfo.chart.rowNames.reduce((acc, rowName, i) => {
    acc.push({
      rowName,
      type: 'numbers',
      data: props.data.table[i].map(arr => arr[1])
    });
    return acc;
  }, [{
    rowName: 'As of 8am On',
    type: 'dates',
    data: props.data.table[0].map(arr => arr[0].slice(0,5))
  }] as (StringRow | NumberRow)[]);
  
  return (
    <StyledCard
      variant='outlined'
      sx={props.sx}
    >
      <DailyChart
        {...props.pageInfo.chart}
        data={data}
        todayFromAcis={props.todayFromAcis}
        numRows={props.pageInfo.chart.rowNames.length + 1}
      />

      <StyledDivider />

      <MultiMapPage maps={props.pageInfo.maps as MultiMapPageMaps} />
    </StyledCard>
  );
}