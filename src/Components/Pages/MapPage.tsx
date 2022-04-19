import React from 'react';

import {
  Card,
  CardMedia
} from '@mui/material';

import TextContent from './TextContent';

type MapPageProps = {
  url: string,
  alt: string,
  description: string[]
};



export default function MapPage(props: MapPageProps) {
  return (
    <Card variant='outlined' sx={{
      padding: '10px',
      boxSizing: 'border-box',
      width: '90%',
      maxWidth: 720,
      margin: '0 auto'
    }}>
      <CardMedia
        component='img'
        image={props.url}
        alt={props.alt}
      />

      {props.description && props.description.length > 0 && <TextContent description={props.description} titlePart='This Map' />}
    </Card>
  );
}