import React, { Fragment } from 'react';

import { Box } from '@mui/material';

import TextContent from './TextContent';
import WeekMaps from './WeekMaps';
import StyledDivider from './StyledDivider';



export default function RSWMaps(props: RiskMapsProps) {
  return (
    <>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        marginTop: '10px',
        '@media (min-width: 1000px)': {
          flexDirection: 'row'
        }
      }}>
        {props.maps.map((thumbGroup, i) => {
          return (
            <Fragment key={thumbGroup.title}>
              <Box sx={{
                flexGrow: 1,
                margin: '5px 0px',
                '@media (min-width: 1000px)': {
                  margin: '0px 8px'
                }
              }}>
                <WeekMaps {...thumbGroup} />
              </Box>

              { i !== props.maps.length - 1 && <StyledDivider sx={{ '@media (min-width: 1000px)': { display: 'none' } }} />}
            </Fragment>
          );
        })}
      </Box>

      {props.text && <>
        <StyledDivider />

        <TextContent {...props.text} />
      </>}
    </>
  );
}