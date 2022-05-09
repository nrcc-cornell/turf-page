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
      display: 'flex',
      alignItems: 'center',
      width: '100%',
      height: 80,
      padding: '0px 10px',
      backgroundColor: 'black',
      '&:hover': {
        cursor: 'default'
      },
      '@media (max-width: 350px)': {
        padding: '0px 2px'
      },
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
        <InnerBox>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '2px' }}>
            <Box
              component='img'
              sx={{
                height: 32,
                width: 32,
                backgroundColor: 'white',
                borderRadius: '50%',
                padding: '1px',
                marginRight: '8px',
                boxSizing: 'border-box',
                '@media (max-width: 400px)': {
                  height: 24,
                  width: 24
                }
              }}
              src={`${process.env.PUBLIC_URL}/Assets/cornell_seal.svg`} alt='Cornell seal'
            />
            <Typography variant='headerMain'>Fore Cast</Typography>
          </Box>
          <Typography variant='headerSub'>Weather for the Turf Industry</Typography>
        </InnerBox>
        <InnerBox sx={{
          '@media (max-width: 875px)': {
            width: 230
          },
          '@media (max-width: 510px)': {
            width: 175
          },
          // '@media (max-width: 350px)': {
          //   width: 150
          // }
        }}>
          <Typography variant='headerSecondary'>Cornell University</Typography>
          <Box sx={{ backgroundColor: 'rgb(179,27,27)', height: '1px', width: '80%', margin: '3px auto' }}></Box>
          <Typography variant='headerSecondary'>Atmospheric Sciences and School of Integrative Plant Science</Typography>
        </InnerBox>
      </Box>
    </Box>
  );
}