import React from 'react';
import { Typography, Box } from '@mui/material';
import { format, addDays } from 'date-fns';

import InvalidText from '../../InvalidText';
import Loading from '../../Loading';
import StyledCard from '../../StyledCard';
import StyledDivider from '../../StyledDivider';
import MapWithOptions from '../../OverlayMap/MapWithOptions';
import SoilMoistureOptions, { SoilMoistureOptionsProps } from '../../SoilMoistureOptions/SoilMoistureOptions';
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
} & SoilMoistureOptionsProps & DisplayProps


export default function SoilSaturationPage(props: SoilSaturationPageProps) {
  if (!props.currentLocation.address.includes('New York')) {
    return <InvalidText type='notNY' />;
  } else if (props.isLoading) {
    return <Loading />;
  } else if (!props.soilSaturation) {
    return <InvalidText type='outOfSeason' />;
  } else {
    const overlayDates = Array.from({length: 5}, (v, i) => format(addDays(props.today, i), 'yyyyMMdd'));

    const data = props.soilSaturation.length > 0 ? [{
      rowName: 'As of 8am On',
      type: 'dates',
      data: props.soilSaturationDates.slice(-6)
    },{
      rowName: props.pageInfo.chart.rowNames[0],
      type: 'numbers',
      data: props.soilSaturation.slice(-6).map(val => roundXDigits(val, 2))
    }] as (StringRow | NumberRow)[] : null;



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

        {data === null ? <InvalidText type='badData' /> :
          <> 
            <SoilMoistureOptions
              recommendedSoilCap={props.recommendedSoilCap}
              soilCap={props.soilCap}
              setSoilCap={props.setSoilCap}
              today={props.today}
              irrigationDates={props.irrigationDates}
              setIrrigationDates={props.setIrrigationDates}
              useIdeal={props.useIdeal}
              setUseIdeal={props.setUseIdeal}
            />

            <DailyChart
              {...props.pageInfo.chart}
              data={data}
              todayFromAcis={props.todayFromAcis}
              numRows={3}
            />
          </>
        }

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
}
