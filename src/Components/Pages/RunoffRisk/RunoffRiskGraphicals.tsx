import React, { useState } from 'react';
import { parse, format } from 'date-fns';
import { Box, Typography } from '@mui/material';

import { RRData } from './RunoffRiskPage';
import StyledButton from '../StyledBtn';
import RunoffRiskDailyChart from './RunoffRiskDailyChart';
import RunoffRiskColumnChart from './RunoffRiskColumnChart';
import RunoffRiskTempChart from './RunoffRiskTempChart';
import RunoffRiskPrecipChart from './RunoffRiskPrecipChart';

type RRGraphicals = {
  data: RRData
};


export default function RunoffRiskGraphicals(props: RRGraphicals) {
  const [showDetails, setShowDetails] = useState(false);

  return <Box sx={{ width: '90%', minWidth: '300px', textAlign: 'center', margin: '0px auto 12px' }}>
    <Typography variant='h5' sx={{ textAlign: 'center' }}>Runoff Risk Forecast issued {props.data.dates.length ? format(parse(props.data.dates[0], 'yyyyMMdd', new Date()), 'MM-dd-yyyy') : ''}</Typography>
    <RunoffRiskColumnChart dates={props.data.dates} percentages={props.data.riskWinter} />
    <StyledButton onClick={() => setShowDetails(!showDetails)} sx={{ margin: '20px 0px 8px' }}>{showDetails ? 'Hide Details' : 'Show Details'}</StyledButton>
    {showDetails && 
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <RunoffRiskDailyChart dates={props.data.dates} oneDayPercentages={props.data.riskWinter} threeDayPercentages={props.data.riskWinter72hr} />
        <RunoffRiskTempChart dates={props.data.dates} {...props.data.tempChart} />
        <RunoffRiskPrecipChart dates={props.data.dates} {...props.data.precipChart} />
      </Box>
    }
  </Box>;
}