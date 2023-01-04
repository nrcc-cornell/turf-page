import React from 'react';
import { Box, Typography } from '@mui/material';

type GPLegend = {
  title: string;
};

const mapLegend = {
  borderRadius: '10px',
  border: '2px solid #0000aa',
  lineHeight: '24px',
  color: '#555',
  background: '#f5f5dc',
  width: '151px',
  textAlign: 'left',
  zIndex: 5,
  position: 'absolute',
  bottom: '4px',
  left: '23px',
  padding: '10px',
};

const font = {
  // eslint-disable-next-line quotes
  fontFamily: "'Lato', 'Helvetica Neue', Helvetica, Arial, sans-serif",
  fontSize: '14px',
};

const mapLegendLabel = {
  ...font,
  textAlign: 'left',
  margin: '0px 4px 0px 0px',
};

const mapLegendTitle = {
  ...font,
  fontWeight: 'bold',
  margin: '2px',
};

const colorBox = {
  width: '14px',
  height: '10px',
  margin: '5px',
  border: '2px solid rgba(0, 0, 0, 0.5)',
};

const colors = {
  c1: '#f8fdc7',
  c2: '#9be1b6',
  c3: '#51bac7',
  c4: '#3d89ba',
  c5: '#344792',
};

export default function GrowthPotentialLegend(props: GPLegend) {
  return (
    <Box sx={mapLegend}>
      <Box sx={mapLegendTitle}>{props.title.replace(' inches', '"')}</Box>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ ...colorBox, background: colors.c1, opacity: 0.7 }}></Box>
        <Typography sx={mapLegendLabel}>0-20</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ ...colorBox, background: colors.c2, opacity: 0.7 }}></Box>
        <Typography sx={mapLegendLabel}>20-40</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ ...colorBox, background: colors.c3, opacity: 0.7 }}></Box>
        <Typography sx={mapLegendLabel}>40-60</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ ...colorBox, background: colors.c4, opacity: 0.7 }}></Box>
        <Typography sx={mapLegendLabel}>60-80</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ ...colorBox, background: colors.c5, opacity: 0.7 }}></Box>
        <Typography sx={mapLegendLabel}>80-100</Typography>
      </Box>
    </Box>
  );
}
