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

export type MapPageProps = {
  url: string;
  alt: string;
  description: string[];
  title?: string;
  mainSX?: {
    [key: string]: string | number;
  };
};


export default function MapPage(props: MapPageProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loaded = () => setLoading(false);

  return (
    <Card variant='outlined' sx={props.mainSX}>
      {!(props.title === 'Moisture Deficit Forecast') && <CardMedia
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
      </CardMedia>}

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