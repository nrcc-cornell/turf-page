import React, { Dispatch, SetStateAction } from 'react';
import { Box, Slider, Typography } from '@mui/material';

type Mark = {
  value: number;
  label: string;
};

type MapSlider = {
  label: string;
  idx: number;
  marks: Mark[];
  setFunction: Dispatch<SetStateAction<number>>;
};

export default function MapSlider(props: MapSlider) {
  return (
    <Box
      sx={{
        height: '100px',
        width: '100%',
        boxSizing: 'border-box',
        paddingTop: '10px',
      }}
    >
      <Typography
        id='date-slider'
        variant='h5'
        sx={{
          textAlign: 'center',
          '@media (max-width:525px)': {
            fontSize: '1.2rem',
          },
        }}
      >
        {props.label}
      </Typography>
      <Slider
        track={false}
        value={props.idx}
        onChange={(e, v) => props.setFunction(v as number)}
        valueLabelDisplay='off'
        min={0}
        max={4}
        marks={props.marks}
        aria-labelledby='date-slider'
      />
    </Box>
  );
}
