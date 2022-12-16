import React from 'react';

import { Box } from '@mui/material';
import GrowthPotentialMap from './GrowthPotentialMap';

export default function GrowthPotentialPage(props: DisplayProps) {
  return (
    <Box>
      <Box>Growth Potential Page</Box>
      <Box>{JSON.stringify(props.currentLocation)}</Box>
      <Box sx={{ height: '300px', width: '300px' }}>
        <GrowthPotentialMap {...props} />
      </Box>
    </Box>
  );
}
