import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { isBefore } from 'date-fns';

import { Box, Typography } from '@mui/material';

import { growthPotentialModel } from '../../../Scripts/GrowthPotentialModel';

import StyledCard from '../../StyledCard';
// import GrowthPotentialLegend from './GrowthPotentialLegend';
// import GrowthPotentialSlider from './GrowthPotentialSlider';
// import GrowthPotentialMap from './GrowthPotentialMap';
import PageDivider from '../../PageDivider';
import GrowthPotentialGraph from './GrowthPotentialGraph';
import Loading from '../../Loading';
import IrrigationSwitch from './IrrigationSwitch';

import addObservedData from '../../../Scripts/calcPastSoilSaturation';
import convertCoordsToIdxs from '../../../Scripts/convertCoordsToIdxs';

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

type CoordsBody = {
  dateStr: string;
};

type SoilSaturationBody = CoordsBody & {
  idxLng: number;
  idxLat: number;
};

type Depths = 'two' | 'six' | 'ten';

type DepthsObj = {
  depth: Depths;
};

type OverlayBody = CoordsBody &
  DepthsObj & {
    forecastDateStr: string;
  };

type ProxyBody = CoordsBody | SoilSaturationBody | OverlayBody;

export type ModelOutput = {
  dates: string[];
  values: number[];
};



async function getFromProxy<T>(body: ProxyBody, endpoint: string) {
  const proxyUrl = 'https://cors-proxy.benlinux915.workers.dev/';

  const response = await fetch(proxyUrl + endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });

  let results: T | null = null;
  if (response.ok) {
    results = await response.json();
  }
  return results;
}

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

  return (
    <Box sx={{ textAlign: 'center', width: '50%', margin: '0 auto' }}>
      {text}
    </Box>
  );
};

const thresholds = [0, 25, 66];

export default function GrowthPotentialPage(props: DisplayProps) {
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
          setModelData(newModelData);
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
            tempValues.reduce((sum, val) => sum + val, 0) / 5
          );
          tempValues.shift();
        }
      }
      setModelResults(modelOutput);
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
          padding: '10px',
          boxSizing: 'border-box',
          maxWidth: '1100px',
          border: 'none',
          '@media (max-width: 448px)': {
            width: '100%',
            padding: '10px 0px',
            border: 'none',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            width: '100%',
            justifyContent: 'space-around',
            '@media (max-width: 1100px)': {
              flexDirection: 'column',
            },
          }}
        >
          This tool is not active until March 9th. Please check back then.
        </Box>
      </StyledCard>
    );
  } else {
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
        <Box
          sx={{
            display: 'flex',
            width: '100%',
            justifyContent: 'space-around',
            '@media (max-width: 1100px)': {
              flexDirection: 'column',
            },
          }}
        >
          <Box
            sx={{
              width: 'calc(50% - 11px)',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              margin: '0 auto',
              '@media (max-width: 1100px)': {
                width: '75%',
              },
            }}
          >
            <Typography variant='h5'>Growth Potential Estimates</Typography>

            {generateRecommendation(modelResults, thresholds)}

            <PageDivider type={1} />

            <IrrigationSwitch
              checked={isIrrigation}
              setFunction={setIsIrrigation}
            />

            <GrowthPotentialGraph
              // modelResults={{
              //   dates: [],
              //   values: modelData ? modelData.soilSats : [],
              // }}
              modelResults={modelResults}
              thresholds={thresholds}
            />
          </Box>

          <PageDivider type={3} />

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 'calc(50% - 11px)',
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
