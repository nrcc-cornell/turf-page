import React, { Fragment } from 'react';

import { Card, Box } from '@mui/material';

import TextContent from './TextContent';
import DailyChart from './DailyChart';
import WeekMaps from './WeekMaps';
import StyledDivider from './StyledDivider';
import SeasonChart from './SeasonChart';



export default function ToolPage(props: PageProps) {
  const isDoubleMap = props.data instanceof Array;
  
  return (
    <Card variant='outlined' sx={{
      padding: '10px',
      boxSizing: 'border-box',
      width: '90%',
      maxWidth: 800,
      margin: '0 auto',
      '@media (min-width: 1465px)': {
        maxWidth: isDoubleMap ? 1475 : 800
      },
      '@media (max-width: 430px)': {
        width: '100%',
        padding: '10px 0px',
        border: 'none'
      }
    }}>
      <DailyChart {...props.chart} data={props.data} todayFromAcis={props.todayFromAcis} />
      
      <StyledDivider />

      {props.seasonData &&
        <>
          <SeasonChart data={props.seasonData} colorizer={props.chart.colorizer} thresholds={props.chart.rows[0].thresholds} />
          <StyledDivider />
        </>
      }

      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        marginTop: '10px',
        '@media (min-width: 1465px)': {
          flexDirection: 'row'
        }
      }}>
        {props.maps.map((thumbGroup, i) => {
          return (
            <Fragment key={thumbGroup.title}>
              <Box sx={{
                flexGrow: 1,
                margin: '5px 0px',
                '@media (min-width: 1465px)': {
                  margin: '0px 8px'
                }
              }}>
                <WeekMaps {...thumbGroup} />
              </Box>

              { i !== props.maps.length - 1 && <StyledDivider sx={{ '@media (min-width: 1465px)': { display: 'none' } }} />}
            </Fragment>
          );
        })}
      </Box>

      <StyledDivider />

      <TextContent {...props.text} />
    </Card>
  );
}