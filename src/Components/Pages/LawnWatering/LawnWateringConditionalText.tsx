import React from 'react';
import { Box, Typography } from '@mui/material';
import { SOIL_DATA, SoilMoistureOptionLevel } from '../../../Scripts/waterDeficitModel';

type LWCTProps = {
  soilcap: SoilMoistureOptionLevel;
  today: number;
}

const valueToText = (value: number, thresholds: [number, string][]) => {
  let text = 'There was a problem calculating your recommendation, please try again later.';
  for (const [thresh, txt] of thresholds) {
    if (value > thresh) {
      text = txt;
      break;
    }
  }
  return text;
};


export default function LawnWateringConditionalText(props: LWCTProps) {
  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'space-evenly',
      margin: '0 auto 20px',
      width: '98%',
      gap: '10px',
      '@media (max-width: 558px)': {
        flexDirection: 'column',
        gap: '20px'
      }
    }}>
      <Box sx={{
        width: '50%',
        '@media (max-width: 558px)': {
          width: '100%',
        }
      }}>
        <Typography variant='h5'>Lawn Watering Recommendation</Typography>
        <Box sx={{ paddingLeft: '20px' }}>
          <Typography
            variant='mapPage'
            sx={{
              lineHeight: '1.2'
            }}
          >{valueToText(props.today, SOIL_DATA.soilRecommendations[props.soilcap] as [number, string][])}</Typography>
        </Box>
      </Box>
    </Box>
  );
}