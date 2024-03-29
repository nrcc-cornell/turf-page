import React, { Fragment } from 'react';

import { Box } from '@mui/material';

import TextContent, { TextProps } from './TextContent';
import WeekMaps, { ThumbUrls } from './WeekMaps';
import StyledDivider from './StyledDivider';

export type MapThumbs = {
  title: string;
  thumbs: ThumbUrls[];
};

type RSWMapsProps = {
  maps: MapThumbs[];
  text?: TextProps;
};


export default function RSWMaps(props: RSWMapsProps) {
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
                margin: '5px 0px',
                width: '100%',
                '@media (min-width: 1000px)': {
                  margin: '0px 8px',
                  width: props.maps.length === 1 ? '100%' : '50%',
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