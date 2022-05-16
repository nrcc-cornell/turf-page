import React, { useState } from 'react';

import {
  Box,
  Card,
  CardMedia,
  CircularProgress,
  Typography
} from '@mui/material';

import TextContent from './TextContent';
import StyledDivider from './StyledDivider';
import { Description } from '@mui/icons-material';



export default function MapPage(props: MapPageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loaded = () => setLoading(false);

  let mainSX;
  if (props?.title && props.description.length === 0) {
    mainSX = {
      padding: '10px',
      boxSizing: 'border-box',
      width: '100%',
      maxWidth: 720,
      margin: '0 auto',
      border: 'none',
      borderRadius: 0
    };
  } else if (props?.title) {
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
      maxWidth: 720,
      margin: '0 auto',
      '@media (max-width: 430px)': {
        width: '100%',
        padding: '10px 0px',
        border: 'none'
      }
    };
  }


  return (
    <Card variant='outlined' sx={mainSX}>
      <CardMedia
        onError={() => setError(true)} 
        sx={{
          height: 300,
          color: 'rgb(187,187,187)',
          display: loading ? 'flex' : 'none',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <CircularProgress color='inherit' />
      </CardMedia>

      {error ?
        <CardMedia
          component={Box}
          sx={{
            height: 300,
            backgroundColor: 'rgb(240,240,240)',
            fontSize: '10px',
            fontStyle: 'italic',
            minHeight: 70,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center'
          }}
        ><span>Img Failed to Load</span></CardMedia>
        :
        <CardMedia
          component='img'
          onLoad={loaded}
          image={props.url}
          alt={props.alt}
          sx={{
            display: loading ? 'none' : 'block',
            '&:hover': {
              cursor: props.description.length === 0 ? 'pointer' : 'default'
            }
          }}
        />
      }

      {props.description.length === 0 && 
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          <StyledDivider sx={{ margin: '15px auto 8px auto' }}/>
          <Typography variant='homeMap'>{props.title}</Typography>
        </Box>
      }
      {props.description && props.description.length > 0 && <TextContent description={props.description} titlePart={props?.title ? String(props.title) : 'About This Map'} />}
    </Card>
  );
}