import React, { useEffect, useState } from 'react';

import {
  Box,
  IconButton,
  Typography
} from '@mui/material';
import { Close, ArrowBackIos } from '@mui/icons-material';


export default function ShortCuttAd() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 2000);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <Box sx={{
      position: 'fixed',
      bottom: 120,
      right: 0,
      zIndex: 3
    }}>
      <Box
        onClick={() => setShow(true)}
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          padding: '20px 0px 20px 5px',
          backgroundColor: 'rgb(242,249,188)',
          border: '1px solid rgb(210,210,210)',
          borderRight: 'none',
          borderRadius: '5px 0px 0px 5px',
          '&:hover': {
            cursor: 'pointer'
          }
        }}
      >
        <ArrowBackIos sx={{ fontSize: '12px' }} />
      </Box>

      <Box
        onMouseLeave={() => setShow(false)}
        sx={{
          position: 'absolute',
          bottom: -60,
          right: 0,
          transform: show ? 'translateX(0px)' : 'translateX(300px)',
          transitionDuration: '500ms',
          width: 242,
          padding: '40px 20px 20px 20px',
          backgroundColor: 'rgb(240,240,240)',
          border: '1px solid rgb(210,210,210)',
          borderRight: 'none',
          borderRadius: '5px 0px 0px 5px'
        }}>
        <IconButton
          onClick={() => setShow(false)}
          size='small'
          sx={{
            position: 'absolute',
            top: 3,
            right: 3,
            color: 'black'
          }}
        >
          <Close />
        </IconButton>
      
        <Box sx={{
          display: 'flex',
          flexDirection: 'column'
        }}>
          <a href='https://turf.cals.cornell.edu/news/shortcutt-newsletter/' target='_blank' rel='noreferrer'>
            <Box
              component='img'
              src={process.env.PUBLIC_URL + '/Assets/shortcutt.png'}
              alt='Link to the Short Cutt Newsletter'
              sx={{
                boxSizing: 'border-box',
                width: 242,
                padding: '6px',
                borderRadius: '6px',
                backgroundColor: 'white'
              }}
            />
          </a>
          <Typography align='center' sx={{ margin: '12px 0px', fontStyle: 'italic', lineHeight: '20px' }}>An In-Season Weekly Management Tool For All Turfgrass Managers</Typography>
          <a href='https://turf.cals.cornell.edu/news/shortcutt-newsletter/' target='_blank' rel='noreferrer' style={{ textDecoration: 'none' }}><Typography align='center' sx={{ color: 'rgb(0,170,0)', '&:hover': { color: 'rgb(0,130,0)' } }}>Click to learn more!</Typography></a>
        </Box>
      </Box>
    </Box>
  );
}