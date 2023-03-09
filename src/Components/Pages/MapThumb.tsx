import React, { useState } from 'react';

import { Card, CardContent, CardMedia, Typography, Box } from '@mui/material';

export default function MapThumb(props: MapThumbProps) {
  const [error, setError] = useState(false);

  return (
    <Card
      variant='outlined'
      onClick={props.changeMap}
      sx={{
        border: props.border,
        width: '100%',
        '&:hover': {
          cursor: 'pointer',
          backgroundColor: 'rgba(0,0,0,0.1)',
        },
      }}
    >
      {props.alt.includes('Seedhead') || props.alt.includes('Dandelion') ? (
        <CardMedia
          component={Box}
          sx={{
            backgroundColor: 'rgb(240,240,240)',
            fontSize: '10px',
            fontStyle: 'italic',
            height: 'calc(100% - 26px)',
            minHeight: 70,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <span>Temporarily Unavailable</span>
        </CardMedia>
      ) : error ? (
        <CardMedia
          component={Box}
          sx={{
            backgroundColor: 'rgb(240,240,240)',
            fontSize: '10px',
            fontStyle: 'italic',
            height: 'calc(100% - 26px)',
            minHeight: 70,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <span>Img Failed to Load</span>
        </CardMedia>
      ) : (
        <CardMedia
          component='img'
          image={props.thumbUrl}
          alt={props.alt}
          onError={() => setError(true)}
        />
      )}

      <CardContent
        sx={{
          padding: '6px !important',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Typography variant='dayMapDate'>{props.date}</Typography>
      </CardContent>
    </Card>
  );
}
