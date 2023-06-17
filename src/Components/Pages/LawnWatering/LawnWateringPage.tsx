import React from 'react';
import { Box, Typography } from '@mui/material';

import StyledCard from '../../StyledCard';
import StyledDivider from '../../StyledDivider';
import InvalidText from '../../InvalidText';
import Loading from '../../Loading';
import DailyChart, { NumberRow, StringRow } from '../../DailyChart';
import { TablePageInfo } from '../TablePage/TablePage';

import roundXDigits from '../../../Scripts/Rounding';
import LawnWateringConditionalText from './LawnWateringConditionalText';
import SoilCapacitySelector, { SoilCapacitySelectorProps } from '../../SoilCapacitySelector';
import LastIrrigationSelector, { LastIrrigationSelectorProps } from '../../LastIrrigationSelector';

type LawnWateringPageProps = {
  currentLocation: UserLocation;
  pageInfo: TablePageInfo;
  todayFromAcis: boolean;
  soilSaturation:  number[];
  soilSaturationDates: string[];
  isLoading: boolean;
} & LastIrrigationSelectorProps & SoilCapacitySelectorProps

const renderTools = (toolProps: LawnWateringPageProps) => {
  if (!toolProps.currentLocation.address.includes('New York')) {
    return <InvalidText type='notNY' />;
  } else if (toolProps.isLoading) {
    return <Loading />;
  } else if (!toolProps.soilSaturation) {
    return <InvalidText type='outOfSeason' />;
  } else {
    const data = [{
      rowName: 'As of 8am On',
      type: 'dates',
      data: toolProps.soilSaturationDates.slice(-6)
    },{
      rowName: toolProps.pageInfo.chart.rowNames[0],
      type: 'numbers',
      data: toolProps.soilSaturation.slice(-6).map(val => roundXDigits(val, 2))
    }] as (StringRow | NumberRow)[];

    const todaysValue = toolProps.soilSaturation[toolProps.soilSaturation.length - (toolProps.todayFromAcis ? 3 : 4)];

    return (<>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
        <SoilCapacitySelector recommendedSoilCap={toolProps.recommendedSoilCap} soilCap={toolProps.soilCap} setSoilCap={toolProps.setSoilCap} />
        <LastIrrigationSelector today={toolProps.today} lastIrrigation={toolProps.lastIrrigation} setLastIrrigation={toolProps.setLastIrrigation} />
      </Box>

      <DailyChart
        {...toolProps.pageInfo.chart}
        data={data}
        todayFromAcis={toolProps.todayFromAcis}
        numRows={3}
      />
      
      <StyledDivider />
      
      <LawnWateringConditionalText soilcap={toolProps.soilCap} today={todaysValue} />

      <StyledDivider />

      {/* <WastedWater /> */}
    </>);
  }
};



export default function LawnWateringPage(props: LawnWateringPageProps) {
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
      <Typography variant='h5' sx={{ marginLeft: '6px' }}>Lawn Watering Forecast for New York State</Typography>
      <Typography variant='subtitle1' sx={{ fontSize: '16px', marginLeft: '6px', marginBottom: '20px' }}>Decision support tool for reducing water usage when watering lawns</Typography>

      {renderTools(props)}
    </StyledCard>
  );
}