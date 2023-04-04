import React, { useState } from 'react';
import { Box } from '@mui/material';
import { subDays, parse, format } from 'date-fns';

import StyledCard from '../../StyledCard';
import StyledButton from '../../StyledBtn';
import StyledDivider from '../../StyledDivider';
import Graph from '../../Graph';
import MultiMapPage from '../../MultiMapPage';
import DailyChart, {StringRow, NumberRow} from '../../DailyChart';

type GraphPageProps = {
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
  pageInfo: GraphPageInfo
};

export default function GraphPage(props: GraphPageProps) {
  const [showGraphs, setShowGraphs] = useState(false);

  const precipSum: [string, number] | undefined = props.data.table[0][props.data.table[0].length - 1];
  let sDate, eDate, sum;
  if (precipSum !== undefined) {
    sum = precipSum[1];
    eDate = precipSum[0].slice(0,5);
    sDate = format(subDays(parse(precipSum[0], 'MM-dd-yyyy', new Date()), 6), 'MM-dd');
  }

  const chartData = props.pageInfo.chart.rowNames.reduce((acc, rowName, i) => {
    acc.push({
      rowName,
      type: 'numbers',
      data: props.data.table[i].slice(0, -1).map(arr => arr[1])
    });
    return acc;
  }, [{
    rowName: 'As of 8am On',
    type: 'dates',
    data: props.data.table[0].slice(0, -1).map(arr => arr[0].slice(0,5))
  }] as (StringRow | NumberRow)[]);
  
  return (
    <StyledCard
      variant='outlined'
      sx={props.sx}
    >
      <DailyChart
        {...props.pageInfo.chart}
        data={chartData}
        todayFromAcis={props.todayFromAcis}
        numRows={props.pageInfo.chart.rowNames.length + 1}
      />

      {props.pageInfo.chart.data === 'precip' && precipSum !== undefined && (
        <Box
          sx={{
            boxSizing: 'border-box',
            margin: '10px auto 0px auto',
            position: 'relative',
            top: '13px',
            border: '2px solid rgb(220,220,220)',
            borderRadius: '4px',
            padding: '10px',
            width: 'fit-content',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
            alignItems: 'center',
          }}
        >
          <Box sx={{ fontSize: '18px' }}>Total Precipitation</Box>
          <Box sx={{ marginBottom: '10px' }}>
            {sDate} <span style={{ fontSize: '12px' }}>to</span>{' '}
            {eDate}
          </Box>
          <Box sx={{ fontWeight: 'bold', fontSize: '24px' }}>
            {sum}in
          </Box>
          <Box
            sx={{
              color: 'rgb(80,80,80)',
              fontSize: '12px',
              fontStyle: 'italic',
              position: 'relative',
              top: '9px',
            }}
          >
            *as shown in map below
          </Box>
        </Box>
      )}

      <StyledDivider />
      
      <Box sx={{ width: '100%', textAlign: 'center' }}>
        <StyledButton onClick={() => setShowGraphs(!showGraphs)}>
          {showGraphs ? 'Show Current Maps' : 'Show Season Graphs'}
        </StyledButton>
      </Box>

      {showGraphs ? (
        <Graph
          {...props.data}
          units={props.pageInfo.chart.data === 'precip' ? 'inches' : 'GDDs'}
        />
      ) : <MultiMapPage maps={props.pageInfo.maps as MapPageProps[]} />}
    </StyledCard>
  );
}