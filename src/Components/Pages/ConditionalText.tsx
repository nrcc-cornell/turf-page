import React from 'react';

import {
  Box, Typography
} from '@mui/material';

const getText = (value: number) => {
  if (Math.abs(value) < 7) {
    return 'within one week of';
  } else {
    return `${value} days ${value > 0 ? 'ahead' : 'behind'} of`;
  }
};



export default function ConditionalText(props: ConditionTextProps) {
  return (
    <Box>  
      <Typography variant='h5' sx={{ marginLeft: '16px', marginBottom: '20px' }}>50°F GDD Differences (Days)</Typography>
      <Box sx={{ textAlign: 'center' }}>The current growing season is {getText(props.fromLast)} last year, and {getText(props.fromNormal)} normal.</Box>
    </Box>
  );
}