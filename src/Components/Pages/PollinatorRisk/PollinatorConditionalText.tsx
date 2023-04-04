import React from 'react';
import { Box, Typography } from '@mui/material';

type PCTProps = {
  text: {
    name: string;
    color: string;
  }[];
}

const colorToText = (type: string, color: string) => {
  const textType = type.slice(0,1).toUpperCase() + type.slice(1).toLocaleLowerCase();
  if (color === 'rgb(0,170,0)') {
    return `${textType} not yet flowering`;
  } else if (color === 'rgb(255,215,0)' && textType === 'Dandelion') {
    return 'Dandelion is beginning to flower. Pollinators will be attracted to dandelion flowers early in the Spring due to the scarcity of other flowering plants. Avoid insecticide applications at this time to reduce risk to pollinators.';
  } else if (color === 'rgb(255,215,0)' && textType === 'White clover') {
    return 'White clover is beginning to flower. If insecticide applications are required, mow off clover flowers prior to application, water-in insecticides as label requires, and apply when pollinators are inactive at night, the early morning, or evening.';
  } else if (color === 'rgb(255,0,0)') {
    return `${textType} is flowering. If insecticide applications are required, mow off ${textType.toLowerCase()} flowers prior to application, water-in insecticides as label requires, and apply when pollinators are inactive at night, the early morning or evening.`;
  } else if (color === 'rgb(170,170,170)') {
    return `${textType} no longer flowering`;
  }
};

export default function PollinatorConditionalText(props: PCTProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', margin: '0 auto', maxWidth: '86%', gap:'10%' }}>
      {props.text.map(({name, color}, i) => (
        <Box key={name + i}>
          <Typography variant='h5'>{name} Recommendation</Typography>
          <Box sx={{ paddingLeft: '20px' }}>
            <Typography variant='mapPage' sx={{ lineHeight: '1.2' }}>{colorToText(name, color)}</Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
}