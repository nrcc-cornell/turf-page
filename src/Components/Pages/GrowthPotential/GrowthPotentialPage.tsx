import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { isBefore, isAfter, addDays } from 'date-fns';

import { Box, Typography } from '@mui/material';

import { growthPotentialModel } from '../../../Scripts/GrowthPotentialModel';

import StyledCard from '../../StyledCard';
import GrowthPotentialGraph from './GrowthPotentialGraph';
import Loading from '../../Loading';
import IrrigationSwitch from '../../IrrigationSwitch';
import StyledDivider from '../../StyledDivider';
import InvalidText from '../../InvalidText';
import MapWithOptions from '../../OverlayMap/MapWithOptions';

import { gpVariableOptions } from '../../OverlayMap/Options';
import { addObservedData } from '../../../Scripts/calcPastSoilSaturation';
import convertCoordsToIdxs from '../../../Scripts/convertCoordsToIdxs';
import roundXDigits from '../../../Scripts/Rounding';
import { getFromProxy } from '../../../Scripts/proxy';

type RunoffCoords = {
  lats: number[];
  lons: number[];
};

type GrowthPotentialPageProps = DisplayProps & { sx: { [key: string]: string }; };

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


export type ModelOutput = {
  dates: string[];
  values: number[];
};

const calcModelResults = (data: GPModelData | null, isIrrigation: boolean, loc: UserLocation) => {
  if (data && data.dates.length === 15) {
    const dates = data.dates;
    const soilSats = data.soilSats;
    const avgTemps = data.avgt;
    
    const modelOutput: ModelOutput = {
      dates: [],
      values: [],
    };

    const tempValues: number[] = [];
    for (let i = 0; i < 15; i++) {
      const date = dates[i];
      const ssValue = isIrrigation ? 0.75 : soilSats[i];
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
  } else if (data) {
    return {
      dates: [],
      values: [],
    } as ModelOutput;
  } else {
    return null;
  }
};

const generateRecommendation = (
  modelResults: ModelOutput | null,
  thresholds: number[]
) => {
  let text = '';
  if (!modelResults) {
    const thisMonth = new Date().getMonth() + 1;
    if (thisMonth > 10 || thisMonth < 3) {
      text =
        'Data for this model is unavailable after November. Please check back in March.';
    } else {
      text =
        'There was a problem getting data for this model. Please refresh to try again.';
    }
  } else {
    const today = format(new Date(), 'yyyyMMdd');
    const iOfToday = modelResults.dates.findIndex((date) => date === today);
    const value = modelResults.values[iOfToday];

    if (value < thresholds[1]) {
      text = 'Low growth is expected today, fertilization is unnecessary.';
    } else if (value < thresholds[2]) {
      text = 'Moderate growth is expected today, refrain from fertilizing.';
    } else {
      text = 'High growth is expected today, fertilization is recommended';
    }
  }

  return text;
};

const renderTools = (modelResults: ModelOutput | null, isIrrigation: boolean, setIsIrrigation: React.Dispatch<React.SetStateAction<boolean>>, isLoading: boolean, isNY: boolean) => {
  if (!isNY) {
    return <InvalidText type='notNY' />;
  } else if (isLoading) {
    return <Loading />;
  } else if (!modelResults) {
    return <InvalidText type='outOfSeason' />;
  } else if (modelResults && modelResults.dates.length === 0) {
    return <InvalidText type='noSoilData' />;
  } else {
    const THRESHOLDS = [0, 25, 66];

    return (<>
      <Box sx={{ maxWidth: '700px', margin: '40px auto 0px' }}>
        <Typography variant='h5'>Growth Potential Estimates</Typography>
      </Box>

      <IrrigationSwitch
        checked={isIrrigation}
        setFunction={setIsIrrigation}
      />

      <GrowthPotentialGraph
        modelResults={modelResults}
        thresholds={THRESHOLDS}
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
          >{generateRecommendation(modelResults, THRESHOLDS)}</Typography>
        </Box>
      </Box>
    </>);
  }
};


export default function GrowthPotentialPage(props: GrowthPotentialPageProps) {
  const today = new Date();
  const overlayDates = Array.from({length: 5}, (v, i) => format(addDays(today, i), 'yyyyMMdd'));
  const [coordArrs, setCoordArrs] = useState<RunoffCoords | null>(null);
  const [modelData, setModelData] = useState<GPModelData | null>(null);
  const [modelResults, setModelResults] = useState<ModelOutput | null>(null);
  const [isIrrigation, setIsIrrigation] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const results = await getFromProxy<RunoffCoords>(
        { dateStr: overlayDates[0] },
        'coordinates'
      );
      setCoordArrs(results);
    })();
  }, []);

  

  useEffect(() => {
    (async () => {
      if (coordArrs) {
        let newData: GPModelData | null = null;
        if (isAfter(today, new Date(today.getFullYear(), 2, 9)) && isBefore(today, new Date(today.getFullYear(), 10, 1))) {
          setLoading(true);
          const { idxLat, idxLng }: { idxLat: number; idxLng: number } =
            convertCoordsToIdxs(props.currentLocation.lngLat, coordArrs);
    
          const forecastSoilSats = await getFromProxy<ForecastSS>(
            { dateStr: overlayDates[0], idxLat, idxLng },
            'soil-saturation'
          );
    
          if (forecastSoilSats) {
            newData = await addObservedData(
              forecastSoilSats,
              today,
              props.currentLocation.lngLat
            );
            if (!newData) newData = { soilSats: [], avgt: [], dates: []} as GPModelData;
          }
        }

        setModelResults(calcModelResults(newData, isIrrigation, props.currentLocation));
        setModelData(newData);
        setLoading(false);
      }
    })();
  }, [props.currentLocation, coordArrs]);

  useEffect(() => {
    setModelResults(calcModelResults(modelData, isIrrigation, props.currentLocation));
  }, [isIrrigation]);

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

        {renderTools(modelResults, isIrrigation, setIsIrrigation, loading, props.currentLocation.address.includes('New York'))}
        
        <StyledDivider />

        <MapWithOptions
          {...props}
          dropdownOptions={gpVariableOptions}
          proxyEndpointName='soil-saturation'
          modelData={{ dates: overlayDates }}
        />
      </Box>
    </StyledCard>
  );
}
