import React from 'react';

import {
  Card,
  CardContent,
  CardMedia,
  Typography
} from '@mui/material';

type MapThumbProps = {
  date: string,
  thumbUrl: string,
  fullSizeUrl: string,
  alt: string,
  border: string,
  changeMap: () => void
};



export default function MapThumb(props: MapThumbProps) {
  return (
    <Card
      variant='outlined'
      onClick={props.changeMap}
      sx={{
        border: props.border,
        width: 65,
        '@media (max-width: 720px)': {
          width: 'calc(16% - 7px)',
        },
        '@media (max-width: 550px)': {
          width: 65
        },
        '&:hover': {
          cursor: 'pointer',
          backgroundColor: 'rgba(0,0,0,0.1)'
        }
      }}
    >
      <CardMedia
        component='img'
        image={props.thumbUrl}
        alt={props.alt}
      />
    
      <CardContent sx={{
        padding: '6px !important',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <Typography variant='dayMapDate'>{props.date}</Typography>
      </CardContent>
    </Card>
  );
}