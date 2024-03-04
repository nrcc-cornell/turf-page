import React from 'react';
import { TextField, MenuItem } from '@mui/material';

import { SoilMoistureOptionLevel } from '../../Scripts/waterDeficitModel';

export type SoilCapacitySelectorProps = {
  soilCap: SoilMoistureOptionLevel;
  recommendedSoilCap: SoilMoistureOptionLevel;
  setSoilCap: (a: SoilMoistureOptionLevel) => void;
};

const SOIL_CLASSES = [{
  value: SoilMoistureOptionLevel.HIGH,
  name: 'Clay',
  texture: 'fine'
},{
  value: SoilMoistureOptionLevel.MEDIUM,
  name: 'Loam',
  texture: 'medium'
},{
  value: SoilMoistureOptionLevel.LOW,
  name: 'Sand',
  texture: 'coarse'
}];

export default function SoilCapacitySelector(props: SoilCapacitySelectorProps) {
  const recommendation = SOIL_CLASSES.find(obj => obj.value === props.recommendedSoilCap) || { name: 'Unknown' };
  
  return (
    <TextField
      select
      label='Soil Type'
      value={props.soilCap}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => props.setSoilCap(e.target.value as SoilMoistureOptionLevel)}
      helperText={`${recommendation.name} is recommended for your location`}
    >
      {SOIL_CLASSES.map(obj => <MenuItem key={obj.name} value={obj.value}>{obj.name}, {obj.texture} texture</MenuItem>)}
    </TextField>
  );
}