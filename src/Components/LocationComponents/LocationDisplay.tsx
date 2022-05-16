import React from 'react';

import { Box, Typography } from '@mui/material';

import StyledTooltip from './StyledTooltip';
import LocationModal from './LocationModal';



export default function LocationDisplay(props: DisplayProps) {
  return (
    <Box sx={{
      width: '100%',
      backgroundColor: 'rgb(189,187,187)',
      padding: '6px',
      boxSizing: 'border-box',
      display: 'flex',
      justifyContent: 'flex-end'
    }}>
      <Box sx={{
        width: '55%',
        maxWidth: 'fit-content'
      }}>
        <StyledTooltip
          title={props.currentLocation.address}
          placement='top'
        >
          <Typography
            sx={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >{props.currentLocation.address}</Typography>
        </StyledTooltip>
      
        <LocationModal {...props} />
      </Box>
    </Box>
  );
}