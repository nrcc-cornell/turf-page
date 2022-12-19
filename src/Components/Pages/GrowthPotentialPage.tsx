import React, { useState, useEffect } from 'react';

import { Box, Typography } from '@mui/material';

import GrowthPotentialMap from './GrowthPotentialMap';
import StyledCard from './StyledCard';

export default function GrowthPotentialPage(props: DisplayProps) {
  const [ll, setLL] = useState(null);
  const [soilSaturation, setSoilSaturation] = useState(null);

  useEffect(() => {
    // Get ll lists and store in ll
    // https://runoff-risk.nrcc.cornell.edu/ny/data/ll_jsons/ll_grid.json?20221216=
    // Replace date with current date
  }, []);

  useEffect(() => {
    // convert lat and lon coords to ids from ll lists
    // Get data and store in soilSaturation
    // https://runoff-risk.nrcc.cornell.edu/ny/data/pixel_data_jsons/283_data.json?20221216=
    // replace date with today
    // replace 283 with lat
    // use lon to get from return
    // check the values I get against runoff risk site...I might have the coords backwards
  }, [props.currentLocation]);

  // Set up page styling as far as spacing and format go... map size, data location, etc.
  // Create a selector for the depth of soil saturation
  // Get map overlay based on selected soil depth
  // Add overlay to map

  // Once all of the above is working make sure that changing locations and soil depth change everything properly, including the
  //   final saturation value being used (making sure this changes will allow it to be used as a recalculation trigger for the model)

  // Code up the model and display on page
  // Email Carl et al

  return (
    <StyledCard
      variant='outlined'
      sx={{
        padding: '10px',
        boxSizing: 'border-box',
      }}
    >
      <Typography variant='h5' sx={{ marginLeft: '6px' }}>
        Growth Potential Page
      </Typography>
      <Box>{JSON.stringify(props.currentLocation)}</Box>
      <Box
        sx={{
          height: '500px',
          width: '100%',
          maxWidth: '600px',
          border: '1px solid black',
          margin: '0 auto',
          '@media (max-width: 430px)': {
            maxWidth: '90%',
            height: '300px',
          },
        }}
      >
        <GrowthPotentialMap {...props} />
      </Box>
    </StyledCard>
  );
}
