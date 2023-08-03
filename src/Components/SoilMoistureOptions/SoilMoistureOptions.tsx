import React from 'react';
import { Box } from '@mui/material';

import SoilCapacitySelector, { SoilCapacitySelectorProps } from './SoilCapacitySelector';
import IrrigationSelector, { IrrigationSelectorProps } from './IrrigationSelector';
import IrrigationDatesToggle, { IrrigationDatesToggleProps } from './IrrigationDatesToggle';

export type SoilMoistureOptionsProps = SoilCapacitySelectorProps & IrrigationSelectorProps & IrrigationDatesToggleProps;


export default function SoilMoistureOptions(props: SoilMoistureOptionsProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
      <SoilCapacitySelector
        recommendedSoilCap={props.recommendedSoilCap}
        soilCap={props.soilCap}
        setSoilCap={props.setSoilCap}
      />
      
      <IrrigationSelector
        today={props.today}
        irrigationDates={props.irrigationDates}
        setIrrigationDates={props.setIrrigationDates}
        disabled={props.useIdeal}
      />

      <IrrigationDatesToggle
        customDates={props.irrigationDates.length > 0}
        useIdeal={props.useIdeal}
        setUseIdeal={props.setUseIdeal}
      />
    </Box>
  );
}