import React from 'react';
import { TextField, MenuItem } from '@mui/material';

import { SoilMoistureOptionLevel } from '../Scripts/waterDeficitModel';

export type SoilCapacitySelectorProps = {
  soilCap: SoilMoistureOptionLevel;
  recommendedSoilCap: SoilMoistureOptionLevel;
  setSoilCap: (a: SoilMoistureOptionLevel) => void;
};

export default function SoilCapacitySelector(props: SoilCapacitySelectorProps) {
  return (
    <TextField
      select
      label='Soil Water Capacity'
      value={props.soilCap}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => props.setSoilCap(e.target.value as SoilMoistureOptionLevel)}
      helperText={`${props.recommendedSoilCap.slice(0,1).toUpperCase() + props.recommendedSoilCap.slice(1)} is recommended for your location`}
    >
      <MenuItem value={SoilMoistureOptionLevel.HIGH}>High (Clay, fine texture)</MenuItem>
      <MenuItem value={SoilMoistureOptionLevel.MEDIUM}>Medium (Loam, med texture)</MenuItem>
      <MenuItem value={SoilMoistureOptionLevel.LOW}>Low (Sand, coarse texture)</MenuItem>
    </TextField>
  );
}