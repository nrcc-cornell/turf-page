import React, { Fragment } from 'react';

import { Box } from '@mui/material';

import StyledDivider from './StyledDivider';
import MapPage from './MapPage';



export default function MultiMapPage(props: MultiMapPage) {
  return (
    <Box sx={{
      display: 'flex',
      flexWrap: 'wrap',
      flexGrow: 1
    }}>
      {props.maps.map((m, i) => {
        return (
          <Fragment key={i}>
            <MapPage {...m} title={m?.title ? m.title : (i === 0 ? 'Accumulation Map' : 'Forecast Map')} />
            { i !== props.maps.length - 1 && <StyledDivider sx={{ marginTop: '10px', '@media (min-width: 750px)': { display: 'none' } }} />}
          </Fragment>
        );
      })}
    </Box>
  );
}