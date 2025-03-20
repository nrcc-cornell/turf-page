import React from 'react';
import { Box, Typography } from '@mui/material';

import { GrowthPotentialModelOutput } from './GrowthPotentialPage';

type GPCTProps = {
  gpOutput: GrowthPotentialModelOutput | null,
  todayIdx: number|null,
  thresholds: number[]
}


export default function GrowthPotentialConditionalText(props: GPCTProps) {
  let text = '';
  if (!props.gpOutput) {
    text = 'There was a problem getting data for this model. Please refresh to try again.';
  } else {
    const idx = props.todayIdx === null ? props.gpOutput.values.length - 1 : props.todayIdx;
    const value = props.gpOutput.values[idx];
    if (value < props.thresholds[1]) {
      text = 'Mowing frequency can be reduced while still following the one third rule.';
    } else if (value < props.thresholds[2]) {
      text = 'Maintain standard mowing frequency.';
    } else {
      text = 'Mowing frequency can be increased.';
    }

    const date = props.gpOutput.dates[idx].slice(4).split('');
    date.splice(2,0,'-');
    text = `For ${date.join('')}: ` + text;
  }
  
  return (
    <Box
      sx={{
        boxSizing: 'border-box',
        margin: '10px auto 0px auto',
        position: 'relative',
        top: '13px',
        border: '2px solid rgb(220,220,220)',
        borderRadius: '4px',
        padding: '30px 12px',
        width: 'fit-content'
      }}
    >
      <Box sx={{ textAlign: 'center', marginBottom: '12px' }}>
        <Typography variant='h5' sx={{ fontSize: '24px' }}>Growth Potential Recommendation</Typography>
      </Box>
      <Box sx={{ textAlign: 'center' }}>
        <Typography
          variant='mapPage'
          sx={{
            lineHeight: '1.2', fontWeight: 'bold'
          }}
        >{text}</Typography>
      </Box>
    </Box>
  );
}