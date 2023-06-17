import React, { useState, useEffect } from 'react';
import { parse, format, addDays } from 'date-fns';

import { Box, TextField, MenuItem } from '@mui/material';

import MapSlider from './Slider';
import OverlayMap from './Map';
import Legend from './Legend';

import { updateStateFromProxy } from '../../Scripts/proxy';
import { VariableOptions } from './Options';

type RRMap = DisplayProps & {
  dropdownOptions: VariableOptions;
  proxyEndpointName: string;
  dates: string[];
};

export default function MapWithOptions(
  props: RRMap
) {
  const today = new Date();
  const todayStr = format(today, 'yyyyMMdd');
  const initKey = Object.keys(props.dropdownOptions)[0];
  const [option, setOption] = useState(initKey);
  const [legendInfo, setLegendInfo] = useState({ label: initKey, ...props.dropdownOptions[initKey]});
  const [forecastDateIdx, setForecastDateIdx] = useState(0);
  const [overlay, setOverlay] = useState('');

  useEffect(() => {
    let forecastDateStr = props.dates[forecastDateIdx] || format(new Date(), 'yyyyMMdd');
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
      {Object.keys(props.dropdownOptions).length > 1 && <Box
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
      </Box>}


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
          marks={props.dates.slice(0, 5).map((date, i) => {
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
        <OverlayMap {...props} src={overlay} />
        <Legend {...legendInfo} />
      </Box>
    </>
  );
}
