import React from 'react';
import { Box, Typography } from '@mui/material';
import { VariableOption } from './rrOptions';

type RRLegend = VariableOption & {
  label: string
};

const mapLegend = {
  borderRadius: '10px',
  border: '2px solid #0000aa',
  lineHeight: '24px',
  color: '#555',
  background: '#f5f5dc',
  width: 'fit-content',
  textAlign: 'left',
  zIndex: 5,
  position: 'absolute',
  bottom: '4px',
  left: '23px',
  padding: '10px',
  '@media (max-width: 820px)': {
    width: '118px',
  },
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

export default function RunoffRiskLegend(props: RRLegend) {
  return (
    <Box sx={mapLegend}>
      <Box sx={mapLegendTitle}>{props.label}</Box>
      
      {props.legend.map(({ color, label }, i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ ...colorBox, background: color, opacity: 0.7 }}></Box>
          <Typography sx={mapLegendLabel}>{label}</Typography>
        </Box>
      ))}
    </Box>
  );
}
