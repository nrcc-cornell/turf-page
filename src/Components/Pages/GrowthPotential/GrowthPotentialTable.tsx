import React from 'react';
import { Box, Typography } from '@mui/material';
import { parse, isSameDay } from 'date-fns';

import { ModelOutput } from './GrowthPotentialPage';

const ValueSX = {
  fontWeight: 'bold',
};

const CellSX = {
  height: '100%',
  width: '100%',
  backgroundColor: 'white',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontSize: '14px',
  // '@media (max-width: 545px)': {
  //   fontSize: '12px'
  // },
  // '@media (max-width: 465px)': {
  //   fontSize: '10px'
  // }
};

export default function GrowthPotentialTable(props: ModelOutput) {
  const dates = props.dates.map((date) => {
    const isToday = isSameDay(parse(date, 'yyyyMMdd', new Date()), new Date());
    const text = isToday ? 'Today' : `${date.slice(4, 6)}/${date.slice(6)}`;
    return (
      <Box sx={CellSX} key={date}>
        {text}
      </Box>
    );
  });
  const values = props.values.map((value, i) => (
    <Box sx={{ ...CellSX, ...ValueSX }} key={i}>
      {value}
    </Box>
  ));

  return (
    <Box sx={{ width: '100%' }}>
      <Typography
        variant='h5'
        sx={{
          textAlign: 'center',
          marginBottom: '6px',
          '@media (max-width:525px)': {
            fontSize: '1.2rem',
          },
        }}
      >
        Growth Potential (% of maximum)
      </Typography>
      <Box
        sx={{
          display: 'grid',
          width: '100%',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gridTemplateRows: `repeat(2, 25px)`,
          rowGap: '1px',
          backgroundColor: 'rgb(240,240,240)',
          justifyItems: 'center',
          alignItems: 'center',
          boxSizing: 'border-box',
        }}
      >
        {dates}
        {values}
      </Box>
    </Box>
  );
}
