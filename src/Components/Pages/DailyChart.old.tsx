import React from 'react';

import {
  Typography,
  Box,
  CircularProgress
} from '@mui/material';

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

type ChartProps = {
  rows: Row[],
  ranges: string[][],
  title: string,
  data: [string, number][] | Tool | HSTool | null,
  colorizer: (val: number, thresholds: ThresholdObj) => string,
  todayFromAcis: boolean
};

const DateSX = {
  height: '100%',
  width: '100%',
  boxSizing: 'border-box',
  fontSize: '14px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center'
};

const HeaderSX = {
  backgroundColor: 'white',
  height: '100%',
  width: '100%',
  padding: '3px 2px',
  textAlign: 'right',
  boxSizing: 'border-box',
  fontSize: '14px'
};


const constructCells = (data: [string, number][] | Tool | HSTool, rows: Row[], colorizer: (val: number, thresholds: ThresholdObj) => string): JSX.Element[][] => {
  return rows.map(rowInfo => {
    const row = [<Box key={rowInfo.name} sx={HeaderSX}>{rowInfo.name}</Box>];
    
    // @ts-expect-error  'rows' should be composed of 'Daily' | '7 Day Avg' and should be in line with HSTool | Tool for whichever risk is being processed
    const d = data instanceof Array ? data : data[rowInfo.name as 'Daily' | '7 Day Avg'];

    d.forEach((arr: number[], i: number) => {
      const backgroundColor = colorizer(arr[1], rowInfo.thresholds);
      row.push(<Box key={rowInfo.name + i} sx={{ backgroundColor, height: '100%', width: '100%' }} />);
    });

    return row;
  });
};


const constructDates = (data: [string, number][], todayIsObserved: boolean) => {
  let todayIdx = 0;
  if (data.length === 9) {
    todayIdx = todayIsObserved ? 3 : 2;
  } else {
    todayIdx = todayIsObserved ? 4 : 3;
  }

  return data.map((arr, i) => <Box key={arr[0]} sx={{
    ...DateSX,
    backgroundColor: i > todayIdx ? 'rgb(204,238,255)' : 'rgb(204,255,204)'
  }}>
    <Box sx={{
      width: 'fit-content',
      '@media (max-width: 510px)': {
        width: '20px'
      }
    }}>{arr[0]}</Box>
  </Box>);
};


const renderChart = (data: [string, number][] | Tool | HSTool, rows: Row[], colorizer: (val: number, thresholds: ThresholdObj) => string, todayFromAcis: boolean) => {
  const sample = data instanceof Array ? data : data['Daily'];
  const dates = constructDates(sample, todayFromAcis );
  const cells = constructCells(data, rows, colorizer);

  const lineSX = { width: '40px', height: '2px', backgroundColor: 'rgb(120,120,120)', position: 'relative' };
  
  const arrowSX = {
    content: '""',
    height: 6,
    width: 6,
    position: 'absolute',
    top: -3,
    transform: 'rotate(45deg)'
  };

  const beforeSX = {
    '&::before': {
      ...arrowSX,
      borderLeft: '2px solid rgb(120,120,120)',
      borderBottom: '2px solid rgb(120,120,120)',
      left: 0
    }
  };

  const afterSX = {
    '&::after': {
      ...arrowSX,
      borderRight: '2px solid rgb(120,120,120)',
      borderTop: '2px solid rgb(120,120,120)',
      right: 0
    }
  };

  let pLeft;
  if (sample.length === 9) {
    pLeft = `calc((100% - 89px) * ${todayFromAcis ? 4/9 : 3/9} - 32px)`;
  } else {
    // Might always be 4/10
    pLeft = `calc((100% - 89px) * ${todayFromAcis ? 5/10 : 4/10} - 32px)`;
  }

  return (
    <>
      <Box sx={{
        display: 'flex',
        position: 'relative',
        gap: '15px',
        alignItems: 'center',
        paddingLeft: pLeft,
        paddingBottom: '5px',
        marginTop: '8px',
        width: 'fit-content'
      }}>
        <Box sx={{ ...lineSX, ...beforeSX }}></Box>
        <Typography variant='underChart'>Observed</Typography>
        <Box sx={{
          backgroundColor: 'blue',
          width: '3px',
          height: `${(cells.length) * 20 + 60 + (cells.length)}px`,
          position: 'absolute',
          top: -3,
          right: '107.22px',
          zIndex: 1
        }}></Box>
        <Typography variant='underChart'>Forecast</Typography>
        <Box sx={{ ...lineSX, ...afterSX }}></Box>
      </Box>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: `80px repeat(${sample.length}, auto)`,
        gridTemplateRows: `38px repeat(${cells.length}, 20px)`,
        justifyItems: 'center',
        alignItems: 'center',
        gap: '1px',
        backgroundColor: 'black',
        boxSizing: 'border-box',
        border: '1px solid black',
        position: 'relative',
        margin: '0px auto 8px auto'
      }}>
        <Box sx={{ ...HeaderSX, padding: '3px 2px 3px 28px' }}>As of 8am on</Box>
        {dates}

        {cells}
      </Box>
      
      
    </>
  );
};

const renderLoading = (numRows: number) => {
  return (
    <Box sx={{
      margin: '8px auto',
      height: 2 + numRows + ((numRows + 1) * 20),
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-end',
      color: 'rgb(187,187,187)'
    }}><CircularProgress color='inherit' /></Box>
  );
};

const renderNoData = (numRows: number) => {
  return (
    <Box sx={{
      margin: '8px auto',
      height: 2 + numRows + ((numRows + 1) * 20),
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-end',
      color: 'rgb(187,187,187)',
      fontStyle: 'italic'
    }}>No Data to Display</Box>
  );
};



export default function DailyChart(props: ChartProps) {
  return (
    <Box sx={{ maxWidth: 730, margin: '0 auto' }}>
      <Typography variant='h5' sx={{ marginLeft: '16px' }}>{props.title}</Typography>

      

      {!props.data ? renderLoading(props.rows.length) :
        (props.data instanceof Array ?
          props.data.length === 0 ? renderNoData(props.rows.length) : renderChart(props.data, props.rows, props.colorizer, props.todayFromAcis)
          :
          props.data['Daily'].length === 0 ? renderNoData(props.rows.length) : renderChart(props.data, props.rows, props.colorizer, props.todayFromAcis))}

      <Box sx={{
        display: 'flex',
        width: '100%',
        gap: '8px',
        justifyContent: 'center',
        marginTop: '12px'
      }}>
        {props.ranges.map(arr => {
          return (
            <Box key={arr[0]} sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '3px'
            }}>
              <Box sx={{ backgroundColor: arr[1], height: 15, width: 15, borderRadius: 8 }}></Box>
              <Box>{arr[0]}</Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}