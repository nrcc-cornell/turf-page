import React, { Dispatch, SetStateAction } from 'react';
import { Box, Typography } from '@mui/material';

import GrowthPotentialSelector from './GrowthPotentialSelector';

type GPToggler = {
  ssK: number;
  setSSK: Dispatch<SetStateAction<number>>;
  ssOptimum: number;
  setSSOptimum: Dispatch<SetStateAction<number>>;
  atK: number;
  setATK: Dispatch<SetStateAction<number>>;
  atOptimum: number;
  setATOptimum: Dispatch<SetStateAction<number>>;
};

export default function GrowthPotentialSelectors(props: GPToggler) {
  return (
    <Box>
      <Typography
        variant='h5'
        sx={{
          marginBottom: '12px',
          textAlign: 'center',
          '@media (max-width:525px)': {
            fontSize: '1.2rem',
          },
        }}
      >
        Model Parameters
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          '@media (max-width: 400px)': {
            gap: '4px',
          },
        }}
      >
        <GrowthPotentialSelector
          label='Optimum Soil Saturation (%)'
          value={props.ssOptimum}
          setFunction={props.setSSOptimum}
        />
        <GrowthPotentialSelector
          label='Soil Saturation K'
          value={props.ssK}
          setFunction={props.setSSK}
        />
        <GrowthPotentialSelector
          label='Optimum Temperature (°F)'
          value={props.atOptimum}
          setFunction={props.setATOptimum}
        />
        <GrowthPotentialSelector
          label='Temperature K'
          value={props.atK}
          setFunction={props.setATK}
        />
      </Box>
    </Box>
  );
}
