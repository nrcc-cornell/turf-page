import React, { useState, useEffect } from 'react';
import { Typography } from '@mui/material';
import { format } from 'date-fns';

import { rrVariableOptions } from '../../OverlayMap/Options';

import MapWithOptions from '../../OverlayMap/MapWithOptions';
import RunoffRiskSummary from './RunoffRiskSummary';
import RunoffRiskGraphicals from './RunoffRiskGraphicals';
import RunoffRiskMoreInfo from './RunoffRiskMoreInfo';
import StyledCard from '../../StyledCard';
import StyledDivider from '../../StyledDivider';
import InvalidText from '../../InvalidText';
import { CoordsIdxObj } from '../../../Hooks/useRunoffApi';
import { updateStateFromProxy } from '../../../Scripts/proxy';

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


const renderTools = (modelData: RRData) => {
  return (<>
      <RunoffRiskSummary data={modelData} />
      
      <StyledDivider />
      
      <RunoffRiskGraphicals data={modelData} />
  </>);
};

export default function RunoffRiskPage(props: DisplayProps & { today:Date, coordsIdxs: CoordsIdxObj | null }) {
  const [modelData, setModelData] = useState(emptyData);

  useEffect(() => {
    if (props.coordsIdxs) {
      updateStateFromProxy(
        { dateStr: format(props.today, 'yyyyMMdd'), ...props.coordsIdxs },
        'runoff-risk',
        setModelData
      );
    }
  }, [props.coordsIdxs]);

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
      <Typography variant='subtitle1' sx={{ fontSize: '16px', marginLeft: '6px', marginBottom: '20px' }}>This tool predicts the risk of runoff several days in advance. Plan chemical applications during low-risk periods to ensure protection of water bodies and maximize product efficacy.</Typography>
      
      {props.currentLocation.address.includes('New York') ? renderTools(modelData) : <InvalidText type='notNY' />}
      
      
      <StyledDivider />
      
      <MapWithOptions
        {...props}
        dropdownOptions={rrVariableOptions}
        dates={modelData.dates}
      />
      <RunoffRiskMoreInfo />
    </StyledCard>
  );
}
