import React, { Fragment } from 'react';

import { Box } from '@mui/material';

import StyledDivider from './StyledDivider';
import MapPage from './MapPage';



export default function MultiMapPage(props: MultiMapPage) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mainSX: any;
  if (props.maps.length > 1) {
    mainSX = {
      padding: '10px',
      boxSizing: 'border-box',
      width: '100%',
      border: 'none',
      maxWidth: 720,
      margin: '0 auto',
      '@media (max-width: 430px)': {
        width: '100%',
        padding: '10px 0px',
        border: 'none'
      },
      '@media (min-width: 750px)': {
        width: '50%',
        margin: 0
      }
    };
  } else {
    mainSX = {
      padding: '10px',
      boxSizing: 'border-box',
      width: '90%',
      border: 'none',
      maxWidth: 720,
      margin: '0 auto',
      '@media (max-width: 430px)': {
        width: '100%',
        padding: '10px 0px',
      }
    };
  }
  
  return (
    <Box sx={{
      display: 'flex',
      flexWrap: 'wrap',
      flexGrow: 1
    }}>
      {props.maps.map((m, i) => {
        return (
          <Fragment key={i}>
            <MapPage {...m} mainSX={mainSX} />
            { i !== props.maps.length - 1 && <StyledDivider sx={{ marginTop: '10px', '@media (min-width: 750px)': { display: 'none' } }} />}
          </Fragment>
        );
      })}
    </Box>
  );
}