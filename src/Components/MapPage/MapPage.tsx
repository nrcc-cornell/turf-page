import React from 'react';

import {
  Card,
  CardMedia,
  CardContent,
  Typography
} from '@mui/material';

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
      
      {props.description && props.description.length > 0 &&
        <CardContent sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '14px'
        }}>
          <Typography variant='h3'>About This Map</Typography>
          {props.description && props.description.map((text, i) => <Typography key={i} variant='body1'>{text}</Typography>)}
        </CardContent>
      }
    </Card>
  );
}