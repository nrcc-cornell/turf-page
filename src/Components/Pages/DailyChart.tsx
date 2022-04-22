import React from 'react';

import {
  Typography,
  Box
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

type ChartProps = {
  rows: Row[],
  ranges: string[][],
  title: string,
  data: [string, number][],
  colorizer: (val: number, thresholds: ThresholdObj) => string
};

const DateSX = {
  height: '100%',
  width: '100%',
  textAlign: 'center',
  boxSizing: 'border-box',
  padding: '3px 2px',
  fontSize: '14px'
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



export default function DailyChart(props: ChartProps) {
  const dates = props.data.map((arr, i) => <Box key={arr[0]} sx={{ ...DateSX, backgroundColor: i > 2 ? 'rgb(204,238,255)' : 'rgb(204,255,204)' }}>{arr[0]}</Box>);
  
  const cells = props.rows.map(rowInfo => {
    const row = [<Box key={rowInfo.name} sx={HeaderSX}>{rowInfo.name}</Box>];
    
    props.data.forEach((arr, i) => {
      const backgroundColor = props.colorizer(arr[1], rowInfo.thresholds);
      row.push(<Box key={rowInfo.name + i} sx={{ backgroundColor, height: '100%', width: '100%' }} />);
    });

    return row;
  });

  
  return (
    <Box sx={{ maxWidth: 730, margin: '0 auto' }}>
      <Typography variant='h5' sx={{ marginLeft: '16px' }}>{props.title}</Typography>

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

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: '80px repeat(9, auto)',
        gridTemplateRows: `repeat(${cells.length + 1}, 20px)`,
        '@media (max-width: 550px)': {
          gridTemplateRows: `repeat(${cells.length}, 20px) 38px`
        },
        justifyItems: 'center',
        alignItems: 'center',
        gap: '1px',
        backgroundColor: 'black',
        boxSizing: 'border-box',
        border: '1px solid black',
        position: 'relative',
        margin: '8px auto'
      }}>
        {cells}

        <Box sx={HeaderSX}>Dates</Box>
        {dates}

        <Box sx={{
          backgroundColor: 'blue',
          width: '3px',
          height: `${(cells.length + 1) * 20 + (cells.length)}px`,
          '@media (max-width: 550px)': {
            height: `${(cells.length) * 20 + 38 + (cells.length)}px`
          },
          position: 'absolute',
          left: 'calc(80px + ((100% - 89px) * (1/3)))'
        }}></Box>
      </Box>
    </Box>
  );
}