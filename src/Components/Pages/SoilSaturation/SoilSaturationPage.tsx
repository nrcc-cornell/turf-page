import React from 'react';
import { Typography, Box } from '@mui/material';
import { format, addDays } from 'date-fns';

import StyledCard from '../../StyledCard';
import StyledDivider from '../../StyledDivider';
import MapWithOptions from '../../OverlayMap/MapWithOptions';
import SoilCapacitySelector, { SoilCapacitySelectorProps } from '../../SoilCapacitySelector';
import LastIrrigationSelector, { LastIrrigationSelectorProps } from '../../LastIrrigationSelector';
import DailyChart, { NumberRow, StringRow } from '../../DailyChart';

import { TablePageInfo } from '../TablePage/TablePage';
import roundXDigits from '../../../Scripts/Rounding';
import { ssVariableOptions } from '../../OverlayMap/Options';


type SoilSaturationPageProps = {
  currentLocation: UserLocation;
  pageInfo: TablePageInfo;
  todayFromAcis: boolean;
  soilSaturation:  number[];
  soilSaturationDates: string[];
  isLoading: boolean;
} & LastIrrigationSelectorProps & SoilCapacitySelectorProps & DisplayProps


export default function SoilSaturationPage(props: SoilSaturationPageProps) {
  const overlayDates = Array.from({length: 5}, (v, i) => format(addDays(props.today, i), 'yyyyMMdd'));

  const data = [{
    rowName: 'As of 8am On',
    type: 'dates',
    data: props.soilSaturationDates.slice(-6)
  },{
    rowName: props.pageInfo.chart.rowNames[0],
    type: 'numbers',
    data: props.soilSaturation.slice(-6).map(val => roundXDigits(val * 100, 0))
  }] as (StringRow | NumberRow)[];



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

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '20px' }}>
        <SoilCapacitySelector recommendedSoilCap={props.recommendedSoilCap} soilCap={props.soilCap} setSoilCap={props.setSoilCap} />
        <LastIrrigationSelector today={props.today} lastIrrigation={props.lastIrrigation} setLastIrrigation={props.setLastIrrigation} />
      </Box>

      <DailyChart
        {...props.pageInfo.chart}
        data={data}
        todayFromAcis={props.todayFromAcis}
        numRows={3}
      />

      <StyledDivider />

      <MapWithOptions
        {...props}
        dropdownOptions={ssVariableOptions}
        proxyEndpointName='soil-saturation'
        dates={overlayDates}
      />
    </StyledCard>
  );
}
