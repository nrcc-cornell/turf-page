import React from 'react';
import { Switch, Grid } from '@mui/material';

export type IrrigationDatesToggleProps = {
  useIdeal: boolean;
  setUseIdeal: (a: boolean) => void;
};

type FullIrrigationDatesToggleProps = IrrigationDatesToggleProps & {
  customDates: boolean;
};

const GRID_SX = {
  width: '95px',
  textAlign: 'center',
  fontSize: '12px',
  color: 'rgb(60,60,60)'
};

export default function IrrigationDatesToggle(props: FullIrrigationDatesToggleProps) {
  return (
    <Grid component="div" container alignItems="center" sx={{
      width: 'fit-content',
      height: '55px',
      marginTop: '1px',
      border: '1px solid rgba(0,0,0,0.23)',
      borderRadius: '4px'
    }}>
      <Grid item sx={{...GRID_SX, width: '71px', paddingLeft: '4px'}}>{props.customDates ? 'Use Custom Dates' : 'Unirrigated'}</Grid>
      <Grid item>
        <Switch
          checked={props.useIdeal}
          onChange={(e,c) => props.setUseIdeal(c)}
          sx={{
            '& .MuiSwitch-switchBase': {
              color: 'rgb(120,150,255) !important'
            },
            '& .MuiSwitch-track': {
              backgroundColor: 'rgb(140,170,255) !important'
            }
          }}
        />
      </Grid>
      <Grid item sx={GRID_SX}>Irrigate to Avoid Drought Stress</Grid>
  </Grid>
  );
}