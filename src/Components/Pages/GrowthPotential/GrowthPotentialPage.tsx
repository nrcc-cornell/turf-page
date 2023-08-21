import React from 'react';
import { format } from 'date-fns';
import { addDays } from 'date-fns';

import { Box, Typography } from '@mui/material';

import { growthPotentialModel } from '../../../Scripts/GrowthPotentialModel';

import StyledCard from '../../StyledCard';
import GrowthPotentialGraph from './GrowthPotentialGraph';
import Loading from '../../Loading';
import StyledDivider from '../../StyledDivider';
import InvalidText from '../../InvalidText';
import MapWithOptions from '../../OverlayMap/MapWithOptions';
import SoilMoistureOptions, { SoilMoistureOptionsProps } from '../../SoilMoistureOptions/SoilMoistureOptions';

import { gpVariableOptions } from '../../OverlayMap/Options';
import roundXDigits from '../../../Scripts/Rounding';

type GrowthPotentialPageProps = DisplayProps& {
  sx: { [key: string]: string };
  soilSaturation:  number[];
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

const generateRecommendation = (
  modelResults: GrowthPotentialModelOutput | null,
  today: Date,
  thresholds: number[]
) => {
  let text = '';
  if (!modelResults) {
    const thisMonth = today.getMonth() + 1;
    if (thisMonth > 10 || thisMonth < 3) {
      text =
        'Data for this model is unavailable after November. Please check back in March.';
    } else {
      text =
        'There was a problem getting data for this model. Please refresh to try again.';
    }
  } else {
    const todayStr = format(today, 'yyyyMMdd');
    const iOfToday = modelResults.dates.findIndex((date) => date === todayStr);
    const value = modelResults.values[iOfToday];

    console.log(todayStr, modelResults.dates, iOfToday, value);

    if (value < thresholds[1]) {
      text = 'Mowing frequency can be reduced while still following the one third rule.';
    } else if (value < thresholds[2]) {
      text = 'Maintain standard mowing frequency.';
    } else {
      text = 'Mowing frequency can be increased.';
    }

    console.log(text);
  }

  return text;
};

const renderTools = (toolProps: GrowthPotentialPageProps, numDaysToProcess: number) => {
  if (!toolProps.currentLocation.address.includes('New York')) {
    return <InvalidText type='notNY' />;
  } else if (toolProps.isLoading) {
    return <Loading />;
  } else if (!toolProps.soilSaturation) {
    return <InvalidText type='outOfSeason' />;
  } else if (toolProps.soilSaturation.length === 0) {
    return <InvalidText type='badData' />;
  } else {
    const THRESHOLDS = [0, 25, 66];

    console.log(toolProps.irrigationTiming);
    console.log(toolProps.soilSaturation);
    const growthPotentialOutput = calcGrowthPotential(toolProps.soilSaturation, toolProps.avgts, toolProps.soilSaturationDates, toolProps.currentLocation, toolProps.today, numDaysToProcess);

    const today = format(toolProps.today, 'MM-dd');
    const todayIdx = toolProps.soilSaturationDates.findIndex(d => d === today) - 4;  // -4 to adjust for 5-day average

    return (<>
      <Box sx={{ maxWidth: '700px', margin: '40px auto 0px' }}>
        <Typography variant='h5'>Growth Potential Estimates</Typography>
      </Box>

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

      <GrowthPotentialGraph
        modelResults={growthPotentialOutput}
        thresholds={THRESHOLDS}
        todayIdx={todayIdx}
      />

      <StyledDivider />

      <Box sx={{ maxWidth: '700px', margin: '0 auto' }}>
        <Typography variant='h5'>Growth Potential Recommendation</Typography>
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant='mapPage'
            sx={{
              lineHeight: '1.2',
            }}
          >{generateRecommendation(growthPotentialOutput, toolProps.today, THRESHOLDS)}</Typography>
        </Box>
      </Box>
    </>);
  }
};


export default function GrowthPotentialPage(props: GrowthPotentialPageProps) {
  const numDaysToProcess = 11;
  const overlayDates = Array.from({length: 5}, (v, i) => format(addDays(props.today, i), 'yyyyMMdd'));

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
        <Typography variant='subtitle1' sx={{ fontSize: '16px', marginLeft: '6px', marginBottom: '20px' }}>Decision support tool for managing turfgrass</Typography>

        {renderTools(props, numDaysToProcess)}
        
        <StyledDivider />

        <MapWithOptions
          {...props}
          dropdownOptions={gpVariableOptions}
          proxyEndpointName='soil-saturation'
          dates={overlayDates}
        />
      </Box>
    </StyledCard>
  );
}
