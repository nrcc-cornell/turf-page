import React from 'react';
import { Box, Typography } from '@mui/material';
import { SOIL_DATA, SoilMoistureOptionLevel } from '../../../Scripts/waterDeficitModel';

type LWCTProps = {
  soilcap: SoilMoistureOptionLevel;
  today: number;
}

const valueToText = (value: number, thresholds: number[], textOpts: string[]) => {
  for (let i = 0; i < textOpts.length; i++) {
    if (thresholds[i] !== undefined && value >= thresholds[i]) {
      return textOpts[i];
    }
  }
  return textOpts[textOpts.length - 1];
};


export default function LawnWateringConditionalText(props: LWCTProps) {
  return (
    <Box
      sx={{
        boxSizing: 'border-box',
        margin: '10px auto 0px auto',
        position: 'relative',
        top: '13px',
        border: '2px solid rgb(220,220,220)',
        borderRadius: '4px',
        padding: '10px',
        width: 'fit-content',
        display: 'flex',
        flexDirection: 'column',
        gap: '5px',
        alignItems: 'center',
      }}
    >
      <Typography variant='h5' sx={{ fontSize: '18px' }}>Lawn Watering Recommendation</Typography>
      <Box sx={{ paddingLeft: '20px' }}>
        <Typography
          variant='mapPage'
          sx={{
            lineHeight: '1.2', fontWeight: 'bold'
          }}
        >{valueToText(props.today, SOIL_DATA.soilRecommendations[props.soilcap], SOIL_DATA.soilRecommendations.text)}</Typography>
      </Box>
    </Box>
  );
}