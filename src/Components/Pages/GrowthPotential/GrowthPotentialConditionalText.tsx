import React from 'react';
import { Box, Typography } from '@mui/material';
import { format } from 'date-fns';

import { GrowthPotentialModelOutput } from './GrowthPotentialPage';

type GPCTProps = {
  gpOutput: GrowthPotentialModelOutput | null,
  today: Date,
  thresholds: number[]
}


export default function GrowthPotentialConditionalText(props: GPCTProps) {
  console.log(props);
  let text = '';
  if (!props.gpOutput) {
    text = 'There was a problem getting data for this model. Please refresh to try again.';
  } else {
    const todayStr = format(props.today, 'yyyyMMdd');
    const iOfToday = props.gpOutput.dates.findIndex((date) => date === todayStr);
    const value = props.gpOutput.values[iOfToday];
    if (value === undefined) {
      text = 'Out of season.';
    } else if (value < props.thresholds[1]) {
      text = 'Mowing frequency can be reduced while still following the one third rule.';
    } else if (value < props.thresholds[2]) {
      text = 'Maintain standard mowing frequency.';
    } else {
      text = 'Mowing frequency can be increased.';
    }
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