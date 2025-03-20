import React from 'react';
import { Typography } from '@mui/material';
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
  soilSaturation:  number[] | null;
  soilSaturationDates: string[];
  isLoading: boolean;
  today: Date;
} & SoilMoistureOptionsProps & DisplayProps

const renderTools = (toolProps: SoilSaturationPageProps) => {
  if (!toolProps.currentLocation.address.includes('New York')) {
    return <InvalidText type='notNY' />;
  } else if (toolProps.isLoading) {
    return <Loading />;
  } else if (!toolProps.soilSaturation) {
    return <InvalidText type='outOfSeason' />;
  } else {
    const ssDates = toolProps.soilSaturationDates;
    const ssValues = toolProps.soilSaturation.slice(0, ssDates.length);

    const data = ssDates.length > 0 ? [{
      rowName: 'As of 8am On',
      type: 'dates',
      data: ssDates.slice(-6)
    },{
      rowName: toolProps.pageInfo.chart.rowNames[0],
      type: 'numbers',
      data: ssValues.slice(-6).map(val => roundXDigits(val, 2))
    }] as (StringRow | NumberRow)[] : null;

    return data === null ? <InvalidText type='badData' /> :
      <> 
        <SoilMoistureOptions
          recommendedSoilCap={toolProps.recommendedSoilCap}
          soilCap={toolProps.soilCap}
          setSoilCap={toolProps.setSoilCap}
          today={toolProps.today}
          irrigationDates={toolProps.irrigationDates}
          setIrrigationDates={toolProps.setIrrigationDates}
          irrigationTiming={toolProps.irrigationTiming}
          setIrrigationTiming={toolProps.setIrrigationTiming}
        />

        <DailyChart
          {...toolProps.pageInfo.chart}
          data={data}
          todayFromAcis={toolProps.todayFromAcis}
          numRows={3}
          today={toolProps.today}
        />
      </>;
  }
};

export default function SoilSaturationPage(props: SoilSaturationPageProps) {

  const overlayDates = Array.from({length: 5}, (v, i) => format(addDays(props.today, i), 'yyyyMMdd'));

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

      {renderTools(props)}

      <StyledDivider />

      <MapWithOptions
        {...props}
        dropdownOptions={ssVariableOptions}
        dates={overlayDates}
      />
    </StyledCard>
  );
}
