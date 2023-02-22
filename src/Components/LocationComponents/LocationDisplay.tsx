import React from 'react';

import { Box, Typography } from '@mui/material';

import StyledTooltip from './StyledTooltip';
import LocationModal from './LocationModal';

export default function LocationDisplay(props: DisplayProps) {
  return (
    <Box
      sx={{
        width: '100%',
        backgroundColor: 'rgb(242, 240, 240)',
        padding: '6px',
        boxSizing: 'border-box',
        display: 'flex',
        justifyContent: 'flex-end',
        '@media (max-width: 700px)': {
          backgroundColor: 'rgb(179,27,27)',
          color: 'white',
        },
      }}
    >
      <Box
        sx={{
          width: '70%',
          maxWidth: 'fit-content',
        }}
      >
        <StyledTooltip title={props.currentLocation.address} placement='top'>
          <Typography
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {props.currentLocation.address}
          </Typography>
        </StyledTooltip>

        <LocationModal {...props} />
      </Box>
    </Box>
  );
}
