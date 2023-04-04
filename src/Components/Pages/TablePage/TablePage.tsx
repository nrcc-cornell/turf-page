import React from 'react';

import StyledCard from '../../StyledCard';
import StyledDivider from '../../StyledDivider';
import MultiMapPage from '../../MultiMapPage';
import DailyChart, { StringRow, NumberRow } from '../../DailyChart';

type TablePageProps = {
  todayFromAcis: boolean;
  sx: {
    [key:string]: string
  };
  data: {
    table: [string, number][][];
  };
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

      <MultiMapPage maps={props.pageInfo.maps as MapPageProps[]} />
    </StyledCard>
  );
}