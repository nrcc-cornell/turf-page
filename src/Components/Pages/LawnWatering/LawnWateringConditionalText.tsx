import React from 'react';
import { Box, Typography } from '@mui/material';

type LWCTProps = {
  today: number;
}

const valueToText = (value: number) => {
  const THRESHOLDS = [{
    threshold: -1.0,
    text: 'Very dry, water'
  },{
    threshold: -0.75,
    text: 'Pretty dry, water'
  },{
    threshold: -0.5,
    text: 'Dry, water'
  },{
    threshold: -0.25,
    text: 'A little dry, could water'
  },{
    threshold: 0,
    text: 'Close to saturation, do not water'
  },{
    threshold: 0.25,
    text: 'Pretty wet, definitely do not water'
  },{
    threshold: 0.5,
    text: 'Very wet, absolutely do not water'
  },{
    threshold: 100,
    text: 'Currently flooding...why do you want to water?'
  }];
  const thresholdIdx = THRESHOLDS.findIndex(({threshold}) => value <= threshold);
  return THRESHOLDS[thresholdIdx].text;
};

export default function LawnWateringConditionalText(props: LWCTProps) {
  console.log(props.today);
  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'space-evenly',
      margin: '0 auto',
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
          >{valueToText(props.today)}</Typography>
        </Box>
      </Box>
    </Box>
  );
}