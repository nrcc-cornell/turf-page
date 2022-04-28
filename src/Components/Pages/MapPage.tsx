import React, { useState } from 'react';

import {
  Card,
  CardMedia,
  CircularProgress
} from '@mui/material';

import TextContent from './TextContent';

type MapPageProps = {
  url: string,
  alt: string,
  description: string[]
};



export default function MapPage(props: MapPageProps) {
  const [loading, setLoading] = useState(true);

  const loaded = () => setLoading(!loading);

  return (
    <Card variant='outlined' sx={{
      padding: '10px',
      boxSizing: 'border-box',
      width: '90%',
      maxWidth: 720,
      margin: '0 auto'
    }}>
      <CardMedia sx={{
        height: 300,
        color: 'rgb(187,187,187)',
        display: loading ? 'flex' : 'none',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <CircularProgress color='inherit' />
      </CardMedia>


      <CardMedia
        component='img'
        onLoad={loaded}
        image={props.url}
        alt={props.alt}
        sx={{ display: loading ? 'none' : 'block' }}
      />

      {props.description && props.description.length > 0 && <TextContent description={props.description} titlePart='This Map' />}
    </Card>
  );
}