import React from 'react';
import { Box } from '@mui/material';

import SoilCapacitySelector, { SoilCapacitySelectorProps } from './SoilCapacitySelector';
import IrrigationSelector, { IrrigationSelectorProps } from './IrrigationSelector';
import IrrigationTimingSelector, { IrrigationTimingSelectorProps } from './IrrigationTimingSelector';

export type SoilMoistureOptionsProps = SoilCapacitySelectorProps & IrrigationSelectorProps & IrrigationTimingSelectorProps;


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
        disabled={props.irrigationTiming !== 'default'}
      />

      <IrrigationTimingSelector
        customDates={props.irrigationDates.length > 0}
        irrigationTiming={props.irrigationTiming}
        setIrrigationTiming={props.setIrrigationTiming}
      />
    </Box>
  );
}