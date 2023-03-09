import React, { useState, useEffect } from 'react';
import { parse, format, addDays } from 'date-fns';

import { Box, TextField, MenuItem } from '@mui/material';

import MapSlider from '../../MapSlider';
import OverlayMap from '../../OverlayMap';
import Legend from './rrLegend';

import updateStateFromProxy from '../../../Scripts/proxy';
import { VariableOptions } from './rrOptions';

type RRMap<T> = DisplayProps & {
  dropdownOptions: VariableOptions;
  proxyEndpointName: string;
  modelData: T;
  setModelData: (a: T) => void
};

type RunoffCoords = {
  lats: number[];
  lons: number[];
};

type Data = { dates: string[] };

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

export default function RunoffRiskMap<T extends Data>(
  props: RRMap<T>
) {
  const today = new Date();
  const todayStr = format(today, 'yyyyMMdd');
  const [coordArrs, setCoordArrs] = useState<RunoffCoords>({
    lats: [],
    lons: [],
  });
  const initKey = Object.keys(props.dropdownOptions)[0];
  const [option, setOption] = useState(initKey);
  const [legendInfo, setLegendInfo] = useState({ label: initKey, ...props.dropdownOptions[initKey]});
  const [forecastDateIdx, setForecastDateIdx] = useState(0);
  const [overlay, setOverlay] = useState('');

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

      updateStateFromProxy<T>(
        { dateStr: todayStr, idxLat, idxLng },
        props.proxyEndpointName,
        props.setModelData
      );
    }
  }, [props.currentLocation, coordArrs]);

  useEffect(() => {
    let forecastDateStr = props.modelData.dates[forecastDateIdx] || format(new Date(), 'yyyyMMdd');
    forecastDateStr = forecastDateStr.slice(4) + forecastDateStr.slice(0, 4);
    
    updateStateFromProxy<string>(
      {
        dateStr: todayStr,
        option: legendInfo.overlay,
        forecastDateStr,
      },
      'rr-overlay',
      setOverlay
    );
  }, [option, forecastDateIdx]);

  const handleOptionChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setOption(e.target.value);
    setLegendInfo({
      label: e.target.value,
      ...props.dropdownOptions[e.target.value]
    });
  };

  return (
    <>
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
          value={option}
          onChange={handleOptionChange}
          sx={{ minWidth: '275px', textAlign: 'center' }}
          label='Variable'
        >
          {Object.keys(props.dropdownOptions).map((name, i) => (
            <MenuItem key={i} value={name}>
              {name}
            </MenuItem>
          ))}
        </TextField>
      </Box>


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
          label={`Forecast Date`}
          idx={forecastDateIdx}
          marks={props.modelData.dates.slice(0, 5).map((date, i) => {
            const d = parse(date, 'yyyyMMdd', new Date());
            let label = format(d, 'MM/dd');
            if (option.includes('72-hour')) {
              label += ` - ${format(addDays(d, 2), 'MM/dd')}`;
            }
            return {
              value: i,
              label: <div style={{ lineHeight: '14px', width: '49px', whiteSpace: 'break-spaces' }}>{label}</div>,
            };
          })}
          setFunction={setForecastDateIdx}
        />
        <OverlayMap {...props} src={overlay} useCanvas={legendInfo.useCanvas} />
        <Legend {...legendInfo} />
      </Box>
    </>
  );
}
