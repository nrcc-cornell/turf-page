import React from 'react';

import { Box, Typography }from '@mui/material';

type ImgOptions = {
  href: string;
  src: string;
  alt: string;
  width: string;
  rounded?: boolean;
}

function ImgBox(obj: ImgOptions) {
  return (
    <Box sx={{
      width: obj.width,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <a href={obj.href} rel='noopener noreferrer' target='_blank'>
        <img
          src={`${process.env.PUBLIC_URL}/Assets/${obj.src}`}
          alt={obj.alt}
          style={{
            backgroundColor: 'white',
            padding: '1px',
            width: '100%',
            objectFit: 'contain',
            borderRadius: obj?.rounded ? '50%' : 0
          }}
        />
      </a>
    </Box>
  );
}

const imgs: ImgOptions[] = [{
  href: 'https://turf.cals.cornell.edu/',
  alt: 'Turfgrass logo',
  src: 'CUTurfLogo.jpg',
  width: '200px'
},{
  href: 'https://www.nrcc.cornell.edu',
  alt: 'NRCC Logo',
  src: 'nrcc-logo-square.png',
  width: '65px'
},{
  href: 'https://www.ncei.noaa.gov/regional/regional-climate-centers',
  alt: 'RCC Logo',
  src: 'noaa-rcc-logo.png',
  width: '65px',
  rounded: true
}];



export default function Footer() {
  return (
    <Box component='footer' sx={{
      boxSizing: 'border-box',
      backgroundColor: 'rgb(242,242,242)',
      width: '100%',
      height: 160,
      gap: '7%',
      display: 'flex',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '20px',
      color: 'rgb(85,86,90)'
    }}>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%'
      }}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}>
          <Typography variant='footerContact' sx={{ color: 'rgb(179,27,27)', fontWeight: 'bold' }}>Contact NRCC</Typography>
          <Typography variant='footerContact'>1123 Bradfield Hall, Cornell University, Ithaca, NY 14853</Typography>
          <Typography variant='footerContact'>Phone: 607-255-1751 | Fax: 607-255-2106</Typography>
          <Typography variant='footerContact'>Email: <a href='mailto:nrcc@cornell.edu?Subject=Forecast%20feedback'>nrcc@cornell.edu</a></Typography>
        </Box>
        <Typography variant='footerCopyright'>©2015-2018 Northeast Regional Climate Center</Typography>
      </Box>
        
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 1
      }}>
        {ImgBox(imgs[0])}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-around',
          width: 200
        }}>
          {ImgBox(imgs[1])}
          {ImgBox(imgs[2])}
        </Box>
      </Box>
    </Box>
  );
}