import React, { useState } from 'react';
import { Typography } from '@mui/material';

import StyledCard from '../../StyledCard';
import RunoffRiskMap from '../RunoffRisk/RunoffRiskMap';
import { ssVariableOptions } from '../RunoffRisk/rrOptions';

type CoordsBody = {
  dateStr: string;
};

type SoilSaturationBody = {
  dateStr: string;
  idxLng: number;
  idxLat: number;
};

type Depths = 'two' | 'six' | 'ten';

type OverlayBody = {
  option: Depths;
  dateStr: string;
  forecastDateStr: string;
};

export type SSProxyBody = CoordsBody | SoilSaturationBody | OverlayBody;

export type ModelOutput = {
  dates: string[];
  values: number[];
};

export type SSData = {
  two: number[];
  six: number[];
  ten: number[];
  avgt: number[];
  dates: string[];
};

export default function SoilSaturationPage(props: DisplayProps) {
  const [modelData, setModelData] = useState({ two: [], six: [], ten: [], avgt: [], dates: [] });

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
      <Typography variant='h5' sx={{ marginLeft: '6px' }}>Soil Saturation Forecast for New York State</Typography>
      <RunoffRiskMap
        {...props}
        dropdownOptions={ssVariableOptions}
        proxyEndpointName='soil-saturation'
        modelData={modelData}
        setModelData={setModelData}
      />
    </StyledCard>
  );
}
