import React, { useState } from 'react';

import {
  Box,
  Typography,
  CircularProgress,
  CardMedia
} from '@mui/material';
import MapThumb from './MapThumb';


const BoxSX = {
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  '@media (max-width: 720px)': {
    width: '98%',
    justifyContent: 'space-around',
    flexDirection: 'row'
  },
  '@media (max-width: 550px)': {
    flexWrap: 'wrap',
    width: 225
  }
};



export default function WeekMaps(props: WeekMapsProps) {
  const [bigMap, setBigMap] = useState(0);
  const [loading, setLoading] = useState(false);
  // const [loading, setLoading] = useState(true);

  const loaded = () => setLoading(false);

  const handleChangeMap = (i: number) => {
    setBigMap(i);
    setLoading(true);
  };

  // Handles edge case of approaching the end of the season, 11/30
  let shift = 0;
  const month = new Date().getMonth();
  if (month === 10 && new Date().getDate() > 25) shift = new Date().getDate() - 25;
  
  if (shift > 5 || month === 11 || month < 2) {
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
          

          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            color: 'rgb(187,187,187)',
            fontStyle: 'italic'
          }}>
            <Typography>No Maps to Display</Typography>
            <Typography>Check back March 1st</Typography>
          </Box>
        </Box>
      </Box>
    );
  }

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
          {props.thumbs.slice(0,props.thumbs.length - shift).map((thumb, i) =>
            <Box key={i} sx={{
              margin: '3px',
              width: 65,
              '@media (max-width: 550px)': {
                margin: '5px'
              }
            }}>
              <MapThumb {...thumb} border={i === bigMap ? '2px solid rgb(150,150,250)' : '1px solid rgba(0,0,0,0.12)'} changeMap={() => handleChangeMap(i)} />
            </Box>
          )}
        </Box>

        <Box sx={{
          display: loading ? 'flex' : 'none',
          justifyContent: 'center',
          alignItems: 'center',
          width: 'calc(100% - 65px)',
          maxWidth: 557.34,
          color: 'rgb(187,187,187)',
          objectFit: 'contain',
          '@media (max-width: 720px)': {
            width: '100%'
          }
        }}>
          <CircularProgress color='inherit' />
        </Box>

        {/* <Box
          component='img'
          onLoad={loaded}
          src={props.thumbs[bigMap].fullSizeUrl}
          alt={props.thumbs[bigMap].alt}
          sx={{
            display: loading ? 'none' : 'block',
            width: 'calc(100% - 65px)',
            maxWidth: 557.34,
            objectFit: 'contain',
            '@media (max-width: 720px)': {
              width: '100%'
            }
          }}
        /> */}
        <Box
          sx={{
            display: loading ? 'none' : 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: 'calc(100% - 65px)',
            maxWidth: 557.34,
            '@media (max-width: 720px)': {
              width: '100%'
            }
          }}
        >
          <CardMedia
            component={Box}
            sx={{
              backgroundColor: 'rgb(240,240,240)',
              border: '1px solid rgb(200,200,200)',
              fontSize: '10px',
              fontStyle: 'italic',
              height: '80%',
              minHeight: '100px',
              width: '80%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              textAlign: 'center'
            }}
          ><span>Temporarily Unavailable</span></CardMedia>
        </Box>
      </Box>
    </Box>
  );
}