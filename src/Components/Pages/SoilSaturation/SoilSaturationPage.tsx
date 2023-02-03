import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

import { Box, Typography, TextField, MenuItem } from '@mui/material';

import StyledCard from '../StyledCard';
import PageDivider from '../../PageDivider';
import MapSlider from '../../MapSlider';
import SoilSaturationLegend from './SoilSaturationLegend';
import OverlayMap from '../../OverlayMap';

type RunoffCoords = {
  lats: number[];
  lons: number[];
};

type GPModelData = {
  two: number[];
  six: number[];
  ten: number[];
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

const NO_SS: GPModelData = {
  two: [],
  six: [],
  ten: [],
  avgt: [],
  dates: [],
};

const convertCoordsToIdxs = (
  lngLatArr: [number, number],
  coordArrs: RunoffCoords
) => {
  const lng = lngLatArr[0];
  const lat = lngLatArr[1];

  // find grid index in lon direction
  const gridLonsLength = coordArrs['lons'].length;
  let idxLng = null;
  for (let idx = 0; idx < gridLonsLength - 1; idx++) {
    if (lng >= coordArrs['lons'][idx] && lng < coordArrs['lons'][idx + 1]) {
      idxLng = idx;
      break;
    }
  }

  // find grid index in lat direction
  const gridLatsLength = coordArrs['lats'].length;
  let idxLat = null;
  for (let idx2 = 0; idx2 < gridLatsLength - 1; idx2++) {
    if (lat <= coordArrs['lats'][idx2] && lat > coordArrs['lats'][idx2 + 1]) {
      idxLat = idx2;
      break;
    }
  }

  if (idxLat === null) throw 'No matching latitude found';
  if (idxLng === null) throw 'No matching longitude found';
  return { idxLat, idxLng };
};

async function updateStateFromProxy<T>(
  body: ProxyBody,
  endpoint: string,
  setFunction: (a: T) => void
) {
  const proxyUrl = 'https://cors-proxy.benlinux915.workers.dev/';

  const response = await fetch(proxyUrl + endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (response.ok) {
    if (endpoint === 'soil-saturation-overlay') {
      const blob = await response.blob();
      setFunction(URL.createObjectURL(blob) as unknown as T);
    } else {
      const results: T = await response.json();
      setFunction(results);
    }
  } else {
    if (endpoint === 'coordinates') {
      alert(
        'A fatal error has occurred on this page. Please refresh to try again.'
      );
    } else {
      alert(
        'An error has occurred on this page. Please make a different location or depth selection to try again.'
      );
    }
  }
}

const depthOptions = {
  two: '2 inches',
  six: '6 inches',
  ten: 'Surface - 10 inches',
};

export default function SoilSaturationPage(props: DisplayProps) {
  const today = new Date();
  const todayStr = format(today, 'yyyyMMdd');
  const [coordArrs, setCoordArrs] = useState<RunoffCoords>({
    lats: [],
    lons: [],
  });
  const [depth, setDepth] = useState<Depths>('two');
  const [modelData, setModelData] = useState<GPModelData>(NO_SS);
  const [overlay, setOverlay] = useState('');
  const [forecastDateIdx, setForecastDateIdx] = useState(0);

  useEffect(() => {
    updateStateFromProxy<RunoffCoords>(
      { dateStr: todayStr },
      'coordinates',
      setCoordArrs
    );
  }, []);

  useEffect(() => {
    if (coordArrs.lats.length && coordArrs.lons.length) {
      const { idxLat, idxLng }: { idxLat: number; idxLng: number } =
        convertCoordsToIdxs(props.currentLocation.lngLat, coordArrs);

      updateStateFromProxy<GPModelData>(
        { dateStr: todayStr, idxLat, idxLng },
        'soil-saturation',
        setModelData
      );
    }
  }, [props.currentLocation, coordArrs]);

  useEffect(() => {
    updateStateFromProxy<string>(
      {
        dateStr: todayStr,
        depth,
        forecastDateStr:
          modelData.dates[forecastDateIdx] || format(new Date(), 'yyyyMMdd'),
      },
      'soil-saturation-overlay',
      setOverlay
    );
  }, [depth, forecastDateIdx]);

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
      <Typography variant='h5' sx={{ marginLeft: '6px' }}>
        Soil Saturation Forecasts
      </Typography>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          margin: '6px',
        }}
      >
        <TextField
          select
          size='small'
          value={depth}
          onChange={(e) => setDepth(e.target.value as Depths)}
          sx={{ width: '200px', textAlign: 'center' }}
          label='Soil Saturation Depth'
        >
          {Object.entries(depthOptions).map(([k, v]) => (
            <MenuItem key={k} value={k}>
              {v}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <PageDivider type={1} />

      <Box
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
        <MapSlider
          label='Soil Saturation Overlay Forecast Date'
          idx={forecastDateIdx}
          marks={modelData.dates.slice(0, 6).map((date, i) => ({
            value: i,
            label: date.slice(4, 6) + '/' + date.slice(6),
          }))}
          setFunction={setForecastDateIdx}
        />
        <OverlayMap {...props} imgsrc={overlay} />
        <SoilSaturationLegend
          title={`Soil Saturation (${depthOptions[depth]}, %)`}
        />
      </Box>
    </StyledCard>
  );
}
