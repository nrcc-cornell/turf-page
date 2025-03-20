import React from 'react';
import { Box, Typography } from '@mui/material';

type PCTProps = {
  dandelion: number;
  whiteClover: number;
}

export default function PollinatorConditionalText({ dandelion , whiteClover }: PCTProps) {
  let risk = '';
  let status = '';
  let callToAction = 'If insecticide applications are required, mow off flowers prior to application, water-in inseticides as label requires, and apply when pollinators are inactive at night, early morning, or evening.';
  if ((dandelion === 1 || dandelion === 4) && (whiteClover === 1 || whiteClover === 4)) {
    risk = 'Pollinator risk in the lawn is low.';
    status = 'Dandelion and clover are not flowering at this time.';
    callToAction = '';
  } else if (dandelion === 3 || whiteClover === 3) {
    risk = 'Pollinator risk in the lawn is high.';
    if (dandelion === 3 && whiteClover === 3) {
      status = 'Clover and Dandelion are in flower';
    } else if (dandelion === 3 && whiteClover === 2) {
      status = 'Dandelion is in flower and Clover is beginning to flower.';
    } else if (dandelion === 3 && (whiteClover === 1 || whiteClover === 4)) {
      status = 'Dandelion is flowering.';
    } else if (dandelion === 2 && whiteClover === 3) {
      status = 'Clover is in flower and Dandelion is beginning to flower.';
    } else if ((dandelion === 1 || dandelion === 4) && whiteClover === 3) {
      status = 'Clover is flowering.';
    }
  } else {
    risk = 'Pollinator risk in the lawn is moderate.';
    if (dandelion === 2) {
      status = whiteClover === 2 ? 'Clover and Dandelion are beginning to flower.' : 'Dandelion is beginning to flower.';
    } else {
      status = 'Clover is beginning to flower.';
    }
  }

  return (
    <Box sx={{
      display: 'flex',
      justifyContent: 'center'
    }}>
      <Box sx={{
        width: '50%',
        '@media (max-width: 558px)': {
          width: '100%',
        }
      }}>
        <Typography variant='h5'>Pollinator Protection</Typography>
        <Box sx={{ paddingLeft: '20px' }}>
          <Typography
            variant='mapPage'
            sx={{
              lineHeight: '1.2'
            }}
          >{risk} {status} {callToAction}</Typography>
        </Box>
      </Box>
    </Box>
  );
}