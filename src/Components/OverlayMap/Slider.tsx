import React, { ReactElement, Dispatch, SetStateAction } from 'react';
import { Box, Slider, Typography } from '@mui/material';

type Mark = {
  value: number;
  label: ReactElement<any,any>;
};

type MapSlider = {
  label: string;
  idx: number;
  marks: Mark[];
  setFunction: Dispatch<SetStateAction<number>>;
  max: number
};

export default function MapSlider(props: MapSlider) {
  return (
    <Box
      sx={{
        height: '100px',
        width: '95%',
        maxWidth: '600px',
        boxSizing: 'border-box',
        paddingTop: '10px',
        marginBottom: '10px',
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
        max={props.max}
        marks={props.marks}
        aria-labelledby='date-slider'
      />
    </Box>
  );
}
