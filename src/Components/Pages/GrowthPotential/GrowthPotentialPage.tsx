import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { isBefore } from 'date-fns';

import { Box, Typography } from '@mui/material';

import { growthPotentialModel } from '../../../Scripts/GrowthPotentialModel';

import StyledCard from '../../StyledCard';
// import GrowthPotentialLegend from './GrowthPotentialLegend';
// import GrowthPotentialSlider from './GrowthPotentialSlider';
// import GrowthPotentialMap from './GrowthPotentialMap';
import GrowthPotentialGraph from './GrowthPotentialGraph';
import Loading from '../../Loading';
import IrrigationSwitch from './IrrigationSwitch';
import StyledDivider from '../../StyledDivider';
import InvalidText from '../../InvalidText';

import { addObservedData } from '../../../Scripts/calcPastSoilSaturation';
import convertCoordsToIdxs from '../../../Scripts/convertCoordsToIdxs';
import roundXDigits from '../../../Scripts/Rounding';
import { getFromProxy } from '../../../Scripts/proxy';

type RunoffCoords = {
  lats: number[];
  lons: number[];
};

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

const renderTools = (modelResults: ModelOutput | null, isIrrigation: boolean, setIsIrrigation: React.Dispatch<React.SetStateAction<boolean>>) => {
  if (modelResults && modelResults.dates.length === 0) {
    return <InvalidText type='noSoilData' />;
  } else {
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
        thresholds={thresholds}
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
          >{generateRecommendation(modelResults, thresholds)}</Typography>
        </Box>
      </Box>
    </>);
  }
};

const thresholds = [0, 25, 66];

export default function GrowthPotentialPage(props: GrowthPotentialPageProps) {
  const today = new Date();
  const todayStr = format(today, 'yyyyMMdd');
  const [coordArrs, setCoordArrs] = useState<RunoffCoords | null>(null);
  const [modelData, setModelData] = useState<GPModelData | null>(null);
  const [modelResults, setModelResults] = useState<ModelOutput | null>(null);
  const [isIrrigation, setIsIrrigation] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const results = await getFromProxy<RunoffCoords>(
        { dateStr: todayStr },
        'coordinates'
      );
      setCoordArrs(results);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (isBefore(today, new Date(today.getFullYear(), 2, 9))) {
        setModelData(null);
        setLoading(false);
      } else if (coordArrs) {
        setLoading(true);
        const { idxLat, idxLng }: { idxLat: number; idxLng: number } =
          convertCoordsToIdxs(props.currentLocation.lngLat, coordArrs);

        const forecastSoilSats = await getFromProxy<ForecastSS>(
          { dateStr: todayStr, idxLat, idxLng },
          'soil-saturation'
        );

        if (forecastSoilSats) {
          const newModelData = await addObservedData(
            forecastSoilSats,
            today,
            props.currentLocation.lngLat
          );
          console.log(newModelData);
          if (newModelData) {
            setModelData(newModelData);
          } else {
            setModelData({ soilSats: [], avgt: [], dates: []} as GPModelData);
          }
        } else {
          setModelData(null);
          setLoading(false);
        }
      }
    })();
  }, [props.currentLocation, coordArrs]);

  useEffect(() => {
    if (modelData && modelData.dates.length === 15) {
      setLoading(true);
      const dates = modelData.dates;
      const soilSats = modelData.soilSats;
      const avgTemps = modelData.avgt;
      
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
          props.currentLocation.lngLat[1],
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
      setModelResults(modelOutput);
      setLoading(false);
    } else if (modelData) {
      setModelResults({
        dates: [],
        values: [],
      } as ModelOutput);
      setLoading(false);
    } else {
      setModelResults(null);
      setLoading(false);
    }
  }, [modelData, isIrrigation]);

  if (loading) {
    return <Loading />;
  } else if (!modelResults) {
    return (
      <StyledCard
        variant='outlined'
        sx={{
          ...props.sx,
          padding: '10px',
          boxSizing: 'border-box',
          border: 'none',
          textAlign: 'center',
          '@media (max-width: 448px)': {
            width: '100%',
            padding: '10px 0px',
            border: 'none',
          },
        }}
      >
        <InvalidText type='outOfSeason' />
      </StyledCard>
    );
  } else {
    console.log(props.currentLocation.address.split(', ').slice(-1)[0] === 'New York');
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

          {props.currentLocation.address.split(', ').slice(-1)[0] === 'New York' ? renderTools(modelResults, isIrrigation, setIsIrrigation) : <InvalidText type='notNY' />}
          
          <StyledDivider />

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 573,
              position: 'relative',
              margin: '0 auto',
            }}
          >
            <Box
              sx={{
                width: '100%',
                height: '500px',
                backgroundColor: 'rgb(225,225,225)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontStyle: 'italic',
                color: 'rgb(150,150,150)',
              }}
            >
              <div>Placeholder for map</div>
            </Box>
          </Box>

          {/* <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minWidth: '500px',
            position: 'relative',
            padding: '0px 20px',
            '@media (max-width: 1100px)': {
              minWidth: '260px',
            },
          }}
        >
          <GrowthPotentialSlider
            idx={forecastDateIdx}
            marks={modelData.dates.slice(0, 6).map((date, i) => ({
              value: i,
              label: date.slice(4, 6) + '/' + date.slice(6),
            }))}
            setFunction={setForecastDateIdx}
          />
          <GrowthPotentialMap {...props} imgsrc={overlay} />
          <GrowthPotentialLegend
            title={`Soil Saturation (${depthOptions[depth]}, %)`}
          />
        </Box> */}
        </Box>
      </StyledCard>
    );
  }
}
