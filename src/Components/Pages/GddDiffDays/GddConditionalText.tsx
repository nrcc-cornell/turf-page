import React from 'react';

import {
  Box, Typography
} from '@mui/material';

const getText = (value: number) => {
  if (Math.abs(value) < 7) {
    return 'within one week of';
  } else {
    return `${value} days ${value > 0 ? 'ahead of' : 'behind'}`;
  }
};



export default function GddConditionalText(props: ConditionTextProps) {
  return (
    <Box>  
      <Typography variant='h5' sx={{ marginLeft: '16px', marginBottom: '20px' }}>50°F GDD Differences (Days)</Typography>
      <Box sx={{ textAlign: 'center' }}>The current growing season is <b>{getText(props.fromLast)}</b> last year, and <b>{getText(props.fromNormal)}</b> normal.</Box>
    </Box>
  );
}