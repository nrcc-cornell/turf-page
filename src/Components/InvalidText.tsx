import React from 'react';
import { Box, Typography } from '@mui/material';

type InvalidTextProps = {
  type: ('notNY' | 'outOfSeason' | 'noSoilData');
};

const invalidTexts = {
  'notNY': ['This tool is only valid for locations within NY.','Select a location within NY to see more information.'],
  'outOfSeason': ['This tool is not active until March 10th. Please check back then.'],
  'noSoilData': ['No soil data was found at this location.','Please try a nearby location to get valid soil data.']
};

export default function InvalidText(props: InvalidTextProps) {
  const textArr = invalidTexts[props.type];
  const lastIdx = textArr.length - 1;

  return (
    <Box sx={{ textAlign: 'center', margin: '40px 0px' }}>
      {textArr.map((str, i) => {
        return (<React.Fragment key={i}>
          <Typography sx={{ fontStyle: 'italic', color: 'rgb(180,180,180)' }}>{str}</Typography>
          {i !== lastIdx && <><br/><br/></>}
        </React.Fragment>);
      })}
    </Box>
  );
}