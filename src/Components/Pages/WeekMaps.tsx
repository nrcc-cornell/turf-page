import React, { useState } from 'react';

import {
  Box,
  Typography
} from '@mui/material';
import MapThumb from './MapThumb';

type Thumb = {
  fullSizeUrl: string,
  thumbUrl: string,
  alt: string,
  date: string
};

type WeekMapsProps = {
  title: string,
  thumbs: Thumb[]
};

const BoxSX = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  gap: '5px',
  '@media (max-width: 720px)': {
    // gap: '5px'
    flexDirection: 'row'
  },
  '@media (max-width: 620px)': {
    flexWrap: 'wrap'
  }
};



export default function WeekMaps(props: WeekMapsProps) {
  const [bigMap, setBigMap] = useState(0);
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{
        margin: '10px auto 10px 16px',
        maxWidth: 700,
        '@media (min-width: 892px)': { marginLeft: 'auto' }
      }}>
        <Typography variant='h5'>{props.title}</Typography>
      </Box>
      
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        '@media (max-width: 720px)': {
          flexDirection: 'column',
          alignItems: 'center'
        }
      }}>
        <Box sx={BoxSX}>
          {props.thumbs.map((thumb, i) =>
            <MapThumb key={i} {...thumb} border={i === bigMap ? '2px solid rgb(150,150,250)' : '1px solid rgba(0,0,0,0.12)'} changeMap={() => setBigMap(i)} />
          )}
        </Box>

        <Box
          component='img'
          src={props.thumbs[bigMap].fullSizeUrl}
          alt={props.thumbs[bigMap].alt}
          sx={{
            width: 'calc(100% - 65px)',
            maxWidth: 700,
            objectFit: 'contain',
            '@media (max-width: 720px)': {
              width: '100%'
            },
            '@media (min-width: 1465px)': {
              maxWidth: 'none'
            }
          }}
        />
      </Box>
    </Box>
  );
}