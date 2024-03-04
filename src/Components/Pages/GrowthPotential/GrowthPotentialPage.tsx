import React from 'react';
import { format, addDays, isBefore, isAfter } from 'date-fns';
import { Box, Typography } from '@mui/material';

import { growthPotentialModel } from '../../../Scripts/GrowthPotentialModel';
import roundXDigits from '../../../Scripts/Rounding';

import StyledCard from '../../StyledCard';
import GrowthPotentialGraph from './GrowthPotentialGraph';
import Loading from '../../Loading';
import StyledDivider from '../../StyledDivider';
import InvalidText from '../../InvalidText';
import MapWithOptions from '../../OverlayMap/MapWithOptions';
import SoilMoistureOptions, { SoilMoistureOptionsProps } from '../../SoilMoistureOptions/SoilMoistureOptions';
import GrowthPotentialConditionalText from './GrowthPotentialConditionalText';

import { gpVariableOptions } from '../../OverlayMap/Options';

type GrowthPotentialPageProps = DisplayProps& {
  sx: { [key: string]: string };
  soilSaturation:  number[] | null;
  soilSaturationDates: string[];
  isLoading: boolean;
  avgts: number[];
} & SoilMoistureOptionsProps;

export type ForecastSS = {
  two: number[];
  six: number[];
  ten: number[];
  avgt: number[];
  dates: string[];
};

export type GPModelData = {
  soilSats: number[];
  avgt: number[];
  dates: string[];
};


export type GrowthPotentialModelOutput = {
  dates: string[];
  values: number[];
};

const calcGrowthPotential = (soilSats: number[], avgTemps: number[], dates: string[], loc: UserLocation, today: Date, numDaysToProcess: number) => {
  if (
    soilSats && soilSats.length >= numDaysToProcess &&
    avgTemps && avgTemps.length >= numDaysToProcess &&
    dates && dates.length >= numDaysToProcess
  ) {
    const modelOutput: GrowthPotentialModelOutput = {
      dates: [],
      values: [],
    };

    // adjust today if out of season
    if (isBefore(today, new Date(today.getFullYear(), 2, 10))) {
      today = new Date(today.getFullYear() - 1, 10, 1);
    } else if (isAfter(today, new Date(today.getFullYear(), 9, 31))) {
      today = new Date(today.getFullYear(), 10, 1);
    }

    const thisYear = today.getFullYear();

    const tempValues: number[] = [];
    for (let i = 0; i < soilSats.length; i++) {
      const date = thisYear + dates[i].split('-').join('');
      const ssValue = soilSats[i];
      const atValue = avgTemps[i];

      const gp = growthPotentialModel(
        loc.lngLat[1],
        date,
        ssValue,
        atValue
      );
        
      tempValues.push(gp);
      
      if (tempValues.length === 5) {
        modelOutput.dates.push(date);
        modelOutput.values.push(
          roundXDigits(tempValues.reduce((sum, val) => sum + val, 0) / 5, 0)
        );
        tempValues.shift();
      }
    }
    return modelOutput;
  } else if (soilSats && avgTemps && dates) {
    return {
      dates: [],
      values: [],
    } as GrowthPotentialModelOutput;
  } else {
    return null;
  }
};



const renderTools = (toolProps: GrowthPotentialPageProps, numDaysToProcess: number) => {
  if (!toolProps.currentLocation.address.includes('New York')) {
    return <InvalidText type='notNY' />;
  } else if (toolProps.isLoading) {
    return <Loading />;
  } else if (!toolProps.soilSaturation || isBefore(toolProps.today, new Date(toolProps.today.getFullYear(), 2, 10))) {
    return <InvalidText type='outOfSeason' />;
  } else if (toolProps.soilSaturation.length === 0) {
    return <InvalidText type='badData' />;
  } else {
    const THRESHOLDS = [0, 25, 66];
    const growthPotentialOutput = calcGrowthPotential(toolProps.soilSaturation, toolProps.avgts, toolProps.soilSaturationDates, toolProps.currentLocation, toolProps.today, numDaysToProcess);
    const today = format(toolProps.today, 'MM-dd');
    let todayIdx = toolProps.soilSaturationDates.findIndex(d => d === today) - 4;  // -4 to adjust for 5-day average
    if (todayIdx < 0) todayIdx = toolProps.soilSaturationDates.length - 5;

    const overlayDates = Array.from({length: 5}, (v, i) => format(addDays(toolProps.today, i), 'yyyyMMdd'));

    return (<>
      <GrowthPotentialConditionalText
        today={toolProps.today}
        gpOutput={growthPotentialOutput}
        thresholds={THRESHOLDS}
      />

      <StyledDivider />

      <GrowthPotentialGraph
        modelResults={growthPotentialOutput}
        thresholds={THRESHOLDS}
        todayIdx={todayIdx}
        today={toolProps.today}
      />

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
      
      <StyledDivider />

      <MapWithOptions
        {...toolProps}
        dropdownOptions={gpVariableOptions}
        dates={overlayDates}
        isGrowthPotential={true}
      />
    </>);
  }
};


export default function GrowthPotentialPage(props: GrowthPotentialPageProps) {
  const numDaysToProcess = 11;

  return (
    <StyledCard
      variant='outlined'
      sx={{
        ...props.sx,
        padding: '10px',
        boxSizing: 'border-box',
        '@media (max-width: 448px)': {
          width: '100%',
          padding: '10px 0px',
          border: 'none',
        },
      }}
    >
      <Box>
        <Typography variant='h5'>Growth Potential Forecast for New York State</Typography>
        <Typography variant='subtitle1' sx={{ fontSize: '16px', marginLeft: '6px', marginBottom: '20px' }}>This tool estimates the growth rate of turfgrass based on weather and soil type to allow planning of mowing frequencies and fertilizer applications.</Typography>

        {renderTools(props, numDaysToProcess)}
      </Box>
    </StyledCard>
  );
}
