import React from 'react';

import { Typography, Box }from '@mui/material';
import { styled } from '@mui/material/styles';

const InnerBox = styled(Box)({
  display: 'flex',
  flexDirection: 'column'
});



export default function Header() {
  return (
    <Box component='header' sx={{
      boxSizing: 'border-box',
      width: '100%',
      height: 80,
      padding: '10px',
      backgroundColor: 'black'
    }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        textAlign: 'center',
        width: '100%',
        '@media (min-width: 800px)': {
          width: '90%',
          margin: '0 auto'
        }
      }}>
        <InnerBox sx={{ gap: '2px' }}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', alignItems: 'center' }}>
            <Box sx={{ position: 'relative' }}>
              <img src={`${process.env.PUBLIC_URL}/Assets/smallGolfBall.png`} alt='Cornell logo on a golf ball' />
              <Box sx={{ width: 38, height: 38, borderRadius: '50%', border: '2px solid black', position: 'absolute', top: -1, left: -2 }} />
            </Box>
            <Typography variant='headerMain'>Fore Cast</Typography>
          </Box>
          <Typography variant='headerSub'>Weather for the Turf Industry</Typography>
        </InnerBox>
        <InnerBox sx={{
          '@media (max-width: 450px)': {
            width: 175
          }
        }}>
          <Typography variant='headerSecondary'>Cornell University</Typography>
          <Box sx={{ backgroundColor: 'rgb(179,27,27)', height: '1px', width: '80%', margin: '3px auto' }}></Box>
          <Typography variant='headerSecondary'>Atmospheric Sciences and Turf Team</Typography>
        </InnerBox>
      </Box>
    </Box>
  );
}