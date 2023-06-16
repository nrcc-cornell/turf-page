import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { addDays } from 'date-fns';

import { Box, Typography, MenuItem, TextField } from '@mui/material';

import { growthPotentialModel } from '../../../Scripts/GrowthPotentialModel';

import StyledCard from '../../StyledCard';
import GrowthPotentialGraph from './GrowthPotentialGraph';
import Loading from '../../Loading';
import IrrigationSwitch from '../../IrrigationSwitch';
import StyledDivider from '../../StyledDivider';
import InvalidText from '../../InvalidText';
import MapWithOptions from '../../OverlayMap/MapWithOptions';

import { gpVariableOptions } from '../../OverlayMap/Options';
import { runWaterDeficitModel, SoilMoistureOptionLevel } from '../../../Scripts/waterDeficitModel';
import roundXDigits from '../../../Scripts/Rounding';
import { getFromProxy, RunoffCoords } from '../../../Scripts/proxy';
import { getWaterDeficitData, WaterDeficitModelData } from '../../../Scripts/getWaterDefData';
import { fetchSoilCapacity } from '../../../Scripts/soilCharacteristics';

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


export type GrowthPotentialModelOutput = {
  dates: string[];
  values: number[];
};

const calcGrowthPotential = (soilSats: number[], avgTemps: number[], dates: string[], isIrrigation: boolean, loc: UserLocation, numDaysToProcess: number) => {
  if (
    soilSats && soilSats.length === numDaysToProcess &&
    avgTemps && avgTemps.length === numDaysToProcess &&
    dates && dates.length === numDaysToProcess
  ) {
    const modelOutput: GrowthPotentialModelOutput = {
      dates: [],
      values: [],
    };

    const thisYear = new Date().getFullYear();
    const tempValues: number[] = [];
    for (let i = 0; i < numDaysToProcess; i++) {
      const date = thisYear + dates[i].split('-').join('');
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
      text = 'Mowing frequency can be reduced while still following the one third rule.';
    } else if (value < thresholds[2]) {
      text = 'Maintain standard mowing frequency.';
    } else {
      text = 'Mowing frequency can be increased.';
    }
  }

  return text;
};

const renderTools = (
  modelResults: GrowthPotentialModelOutput | null,
  isIrrigation: boolean,
  setIsIrrigation: React.Dispatch<React.SetStateAction<boolean>>,
  isLoading: boolean,
  isNY: boolean,
  soilCap: SoilMoistureOptionLevel,
  setSoilCap: React.Dispatch<React.SetStateAction<SoilMoistureOptionLevel>>,
  numDays: number,
  calcedSoilCap: string
) => {
  console.log(modelResults);
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

    console.log(modelResults);

    return (<>
      <Box sx={{ maxWidth: '700px', margin: '40px auto 0px' }}>
        <Typography variant='h5'>Growth Potential Estimates</Typography>
      </Box>

      <Box sx={{
        display: 'flex',
        gap: '20px',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: '10px'
      }}>
        <TextField
          select
          label='Soil Water Capacity'
          value={soilCap}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSoilCap(e.target.value as SoilMoistureOptionLevel)}
          helperText={`'${calcedSoilCap.slice(0,1).toUpperCase() + calcedSoilCap.slice(1)}' is recommended for your location`}
        >
          <MenuItem value={SoilMoistureOptionLevel.HIGH}>High (Clay, fine texture)</MenuItem>
          <MenuItem value={SoilMoistureOptionLevel.MEDIUM}>Medium (Loam, med texture)</MenuItem>
          <MenuItem value={SoilMoistureOptionLevel.LOW}>Low (Sand, coarse texture)</MenuItem>
        </TextField>
        <IrrigationSwitch
          checked={isIrrigation}
          setFunction={setIsIrrigation}
        />
      </Box>

      <GrowthPotentialGraph
        modelResults={modelResults}
        thresholds={THRESHOLDS}
        numDays={numDays}
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
  const numDaysToProcess = 11;
  const overlayDates = Array.from({length: 5}, (v, i) => format(addDays(today, i), 'yyyyMMdd'));
  const [coordArrs, setCoordArrs] = useState<RunoffCoords | null>(null);
  const [waterDeficitModelData, setWaterDeficitModelData] = useState<WaterDeficitModelData | null>(null);
  const [growthPotentialModelResults, setGrowthPotentialModelResults] = useState<GrowthPotentialModelOutput | null>(null);
  const [isIrrigation, setIsIrrigation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [soilMoistureCapacity, setSoilMoistureCapacity] = useState(SoilMoistureOptionLevel.MEDIUM);
  const [calculatedSoilMoistureCapacity, setCalculatedSoilMoistureCapacity] = useState(SoilMoistureOptionLevel.MEDIUM);

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
      const newSC = await fetchSoilCapacity(props.currentLocation.lngLat[1], props.currentLocation.lngLat[0]);
      setCalculatedSoilMoistureCapacity(SoilMoistureOptionLevel[newSC]);
      setSoilMoistureCapacity(SoilMoistureOptionLevel[newSC]);
    })();
  }, [props.currentLocation]);

  useEffect(() => {
    (async () => {
      if (coordArrs) {
        setLoading(true);
        
        const wdmData = await getWaterDeficitData(today, format(today, 'yyyyMMdd'), props.currentLocation.lngLat, coordArrs);

        if (wdmData !== null) {
          const soilSaturations = runWaterDeficitModel(wdmData.precip, wdmData.et, soilMoistureCapacity, -1, 0, 'gp');

          const sliceIdx = wdmData.dates.length - numDaysToProcess;
          const slicedSats = soilSaturations.slice(sliceIdx);
          const slicedAvgts = wdmData.avgt.slice(sliceIdx);
          const slicedDates = wdmData.dates.slice(sliceIdx);

          setGrowthPotentialModelResults(calcGrowthPotential(slicedSats, slicedAvgts, slicedDates, isIrrigation, props.currentLocation, numDaysToProcess));
        }

        setWaterDeficitModelData(wdmData);

        setLoading(false);
      }
    })();
  }, [props.currentLocation, coordArrs]);

  useEffect(() => {
    if (waterDeficitModelData) {
      setLoading(true);

      const soilSaturations = runWaterDeficitModel(waterDeficitModelData.precip, waterDeficitModelData.et, soilMoistureCapacity, -1, 0, 'gp');

      const sliceIdx = waterDeficitModelData.dates.length - numDaysToProcess;
      const slicedSats = soilSaturations.slice(sliceIdx);
      const slicedAvgts = waterDeficitModelData.avgt.slice(sliceIdx);
      const slicedDates = waterDeficitModelData.dates.slice(sliceIdx);

      setGrowthPotentialModelResults(calcGrowthPotential(slicedSats, slicedAvgts, slicedDates, isIrrigation, props.currentLocation, numDaysToProcess));
      setLoading(false);
    }
  }, [soilMoistureCapacity, isIrrigation]);

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

        {renderTools(
          growthPotentialModelResults,
          isIrrigation,
          setIsIrrigation,
          loading,
          props.currentLocation.address.includes('New York'),
          soilMoistureCapacity,
          setSoilMoistureCapacity,
          numDaysToProcess,
          calculatedSoilMoistureCapacity
        )}
        
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
