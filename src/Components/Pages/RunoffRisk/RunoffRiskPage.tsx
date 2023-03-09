import React, { useState } from 'react';
import { Typography } from '@mui/material';

import { variableOptions } from './rrOptions';

import RunoffRiskMap from './RunoffRiskMap';
import RunoffRiskSummary from './RunoffRiskSummary';
import RunoffRiskGraphicals from './RunoffRiskGraphicals';
import RunoffRiskMoreInfo from './RunoffRiskMoreInfo';
import PageDivider from '../../PageDivider';
import StyledCard from '../StyledCard';

export type RRProxyBody = {
  option: string;
  dateStr: string;
  forecastDateStr: string;
};

export type RRData = {
  dates: string[];
  riskWinter: number[];
  riskWinter72hr: number[];
  past24Pcpn: number,
  next24Pcpn: number,
  tempChart: {
    mint: number[],
    maxt: number[],
    soil: number[]
  },
  precipChart: {
    swe: number[],
    raim: number[]
  }
};

const emptyData = {
  dates: [],
  riskWinter: [],
  riskWinter72hr: [],
  past24Pcpn: 0,
  next24Pcpn: 0,
  tempChart: {
    mint: [],
    maxt: [],
    soil: [],
  },
  precipChart: {
    swe: [],
    raim: []
  }
};


export default function RunoffRiskPage(props: DisplayProps) {
  const [modelData, setModelData] = useState(emptyData);
  
  return (
    <StyledCard
      variant='outlined'
      sx={{
        padding: '10px',
        boxSizing: 'border-box',
        maxWidth: '1100px',
        '@media (max-width: 448px)': {
          width: '100%',
          padding: '10px 0px',
          border: 'none',
        },
      }}
    >
      <Typography variant='h5' sx={{ marginLeft: '6px' }}>Runoff Risk Forecast for New York State</Typography>
      <Typography variant='subtitle1' sx={{ fontSize: '16px', marginLeft: '6px', marginBottom: '20px' }}>Decision support tool for managing runoff risk of chemical applications to turfgrass</Typography>
      <RunoffRiskSummary data={modelData} />
      <PageDivider type={1} sx={{ marginTop: '10px', marginBottom: '20px' }} />
      <RunoffRiskGraphicals data={modelData} />
      <PageDivider type={1} sx={{ marginTop: '20px', marginBottom: '30px' }} />
      <RunoffRiskMap
        {...props}
        dropdownOptions={variableOptions}
        proxyEndpointName='runoff-risk'
        modelData={modelData}
        setModelData={setModelData}
      />
      <RunoffRiskMoreInfo />
    </StyledCard>
  );
}
