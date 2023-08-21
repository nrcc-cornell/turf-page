import React from 'react';
import { TextField, MenuItem } from '@mui/material';

export type IrrigationTimingSelectorProps = {
  irrigationTiming: string;
  setIrrigationTiming: (a: string) => void;
};

type FullIrrigationTimingSelectorProps = IrrigationTimingSelectorProps & {
  customDates: boolean;
};

export default function IrrigationTimingSelector(props: FullIrrigationTimingSelectorProps) {
  const TIMING_OPTIONS = [{
    name: props.customDates ? 'Custom Dates' : 'No Irrigation',
    value: 'default'
  }, {
    name: 'Avoid Plant Stress',
    value: 'avoidPlantStress'
  }, {
    name: 'Avoid Dormancy',
    value: 'avoidDormancy'
  }];
  
  return (
    <TextField
      select
      label='Irrigation Timing'
      value={props.irrigationTiming}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => props.setIrrigationTiming(e.target.value)}
    >
      {TIMING_OPTIONS.map(({name, value}) => <MenuItem key={value} value={value}>{name}</MenuItem>)}
    </TextField>
  );
}