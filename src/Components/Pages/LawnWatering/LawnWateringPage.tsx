import React, { useState, useEffect } from 'react';
import { Box, TextField, Typography, MenuItem } from '@mui/material';
import { format, isBefore, isAfter } from 'date-fns';

import StyledCard from '../../StyledCard';
import StyledDivider from '../../StyledDivider';
import InvalidText from '../../InvalidText';
import Loading from '../../Loading';
import DailyChart, { NumberRow, StringRow } from '../../DailyChart';

import { getFromProxy } from '../../../Scripts/proxy';
import convertCoordsToIdxs from '../../../Scripts/convertCoordsToIdxs';
import { fetchETData } from '../../../Scripts/calcPastSoilSaturation';
import { runWaterDeficitModel, SoilMoistureOptionLevel } from '../../../Scripts/waterDeficitModel';
import { getDateAdjustment, EtReturn } from '../../../Scripts/calcPastSoilSaturation';
import roundXDigits from '../../../Scripts/Rounding';
import LawnWateringConditionalText from './LawnWateringConditionalText';

type LawnWateringPageProps = {
  currentLocation: UserLocation;
  pageInfo: TablePageInfo;
  todayFromAcis: boolean;
}

type ForecastData = {
  dates: number[];
  riskWinter: number[];
  riskWinter72hr: number[];
  past24Pcpn: number,
  next24Pcpn: number,
  tempChart: {
    mint: number[];
    maxt: number[];
    soil: number[];
  },
  precipChart: {
    swe: number[]
    raim: number[]
  }
}

type RunoffCoords = {
  lats: number[];
  lons: number[];
};

type ModelOutput = {
  dates: string[];
  values: number[];
};

type LWModelData = {
  precip: number[];
  et: number[];
  dates: string[];
};

const fetchPrecip = async (loc: [number, number], eDate: string) => {
  const response = await fetch('https://grid2.rcc-acis.org/GridData', {
    method: 'POST',
    body: JSON.stringify({
      loc: loc.join(','),
      grid: 'nrcc-model',
      sDate: `${eDate.slice(0,4)}-03-01`,
      eDate,
      elems: [{ name: 'pcpn' }]
    }),
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  const results = await response.json();
  return results.data;
};

const renderTools = (
  modelResults: ModelOutput | null,
  pageInfo: TablePageInfo,
  todayFromAcis: boolean,
  isLoading: boolean,
  isNY: boolean,
  lastWater: string,
  setLastWater: React.Dispatch<React.SetStateAction<string>>,
  soilCap: string,
  setSoilCap: React.Dispatch<React.SetStateAction<SoilMoistureOptionLevel>>
) => {
  if (!isNY) {
    return <InvalidText type='notNY' />;
  } else if (isLoading) {
    return <Loading />;
  } else if (!modelResults) {
    return <InvalidText type='outOfSeason' />;
  } else {
    const data = [{
      rowName: 'As of 8am On',
      type: 'dates',
      data: modelResults.dates.slice(-6)
    },{
      rowName: pageInfo.chart.rowNames[0],
      type: 'numbers',
      data: modelResults.values.slice(-6)
    }] as (StringRow | NumberRow)[];

    const year = String(new Date().getFullYear());
    const march1 = year + '-' + modelResults.dates[0];
    const todayIdx = modelResults.values.length - (todayFromAcis ? 3 : 4);
    const today = year + '-' + modelResults.dates[todayIdx];

    return (<>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
        <TextField
          type='date'
          label='Last Water Date'
          value={lastWater}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastWater(e.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{
            min: march1,
            max: today,
            style: {
              textAlign: 'center'
            }
          }}
        />

        <TextField
          select
          label='Soil Water Capacity'
          value={soilCap}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSoilCap(e.target.value as SoilMoistureOptionLevel)}
        >
          <MenuItem value={SoilMoistureOptionLevel.HIGH}>High (Clay, fine texture)</MenuItem>
          <MenuItem value={SoilMoistureOptionLevel.MEDIUM}>Medium (Loam, med texture)</MenuItem>
          <MenuItem value={SoilMoistureOptionLevel.LOW}>Low (Sand, coarse texture)</MenuItem>
        </TextField>
      </Box>

      <DailyChart
        {...pageInfo.chart}
        data={data}
        todayFromAcis={todayFromAcis}
        numRows={3}
      />
      
      <StyledDivider />
      
      <LawnWateringConditionalText today={modelResults.values[todayIdx]} />

      <StyledDivider />

      {/* <WastedWater /> */}
    </>);
  }
};

const alignAndExtract = (rawEtData: EtReturn, prcpData: [string, number][], year: number) => {
  let etData, etDates;
  const DA = getDateAdjustment(rawEtData, prcpData, year);
  if (DA > 0) {
    const currentDateIdx = prcpData.findIndex(
      (arr: [string, number]) => arr[1] === -999
    );
    prcpData = prcpData.slice(
      DA,
      currentDateIdx >= 0 ? currentDateIdx : prcpData.length
    );
    etData = rawEtData.pet;
    etDates = rawEtData.dates_pet;
  } else if (DA < 0) {
    etData = rawEtData.pet.slice(Math.abs(DA));
    etDates = rawEtData.dates_pet.slice(Math.abs(DA));
  } else {
    etData = rawEtData.pet;
    etDates = rawEtData.dates_pet;
  }

  const startIdx = 0;
  const endIdx = Math.min(etData.length, prcpData.length);

  return { et: etData.slice(startIdx,endIdx), etDates: etDates.slice(startIdx,endIdx), precip: prcpData.slice(startIdx,endIdx).map(arr => arr[1]), precipDates: prcpData.slice(startIdx,endIdx).map(arr => arr[0]) };
};

export default function LawnWateringPage(props: LawnWateringPageProps) {
  const today = new Date();
  const todayStr = format(today, 'yyyyMMdd');
  const [coordArrs, setCoordArrs] = useState<RunoffCoords | null>(null);
  const [modelData, setModelData] = useState<LWModelData | null>(null);
  const [modelResults, setModelResults] = useState<ModelOutput | null>(null);
  const [lastWater, setLastWater] = useState('');
  const [soilCap, setSoilCap] = useState(SoilMoistureOptionLevel.MEDIUM);
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
      if (coordArrs){
        let newModelResults = null;
        let newModelData: LWModelData | null = null;
        if (isAfter(today, new Date(today.getFullYear(), 2, 9)) && isBefore(today, new Date(today.getFullYear(), 10, 1))) {
          setLoading(true);
          const { idxLat, idxLng }: { idxLat: number; idxLng: number } =
            convertCoordsToIdxs(props.currentLocation.lngLat, coordArrs);

          const [ forecast, rawEtData, pastPrecip ] = await Promise.all([
            getFromProxy<ForecastData>(
              { dateStr: todayStr, idxLat, idxLng },
              'runoff-risk'
            ),
            fetchETData(props.currentLocation.lngLat, today.getFullYear()),
            fetchPrecip(props.currentLocation.lngLat, format(today, 'yyyy-MM-dd'))
          ]);

          if (forecast && rawEtData) {
            const aligned = alignAndExtract(rawEtData, pastPrecip, today.getFullYear());
            
            const numFcstDays = rawEtData.dates_pet_fcst.length;
            aligned.et = aligned.et.concat(rawEtData.pet_fcst);
            aligned.etDates = aligned.etDates.concat(rawEtData.dates_pet_fcst);
            
            const nextDate = String(parseInt(aligned.precipDates[aligned.precipDates.length - 1].slice(-2)) + 1);
            const nextDateIdx = forecast.dates.findIndex(dateStr => String(dateStr).slice(-2) === nextDate);
            aligned.precip = aligned.precip.concat(forecast.precipChart.raim.slice(nextDateIdx, nextDateIdx + numFcstDays));
            aligned.precipDates = aligned.precipDates.concat(forecast.dates.slice(nextDateIdx, nextDateIdx + numFcstDays).map(val => `${String(val).slice(0,4)}-${String(val).slice(4,6)}-${String(val).slice(6)}`));
            aligned.precipDates = aligned.precipDates.map(date => date.slice(5));

            newModelData = {
              dates: aligned.precipDates,
              precip: aligned.precip,
              et: aligned.et
            };

            const waterDeficitDaily = runWaterDeficitModel(aligned.precip, aligned.et, soilCap, newModelData.dates.findIndex(date => date === lastWater.slice(5)));
            newModelResults = waterDeficitDaily.reduce((acc, val, i) => {
              acc.dates.push(aligned.precipDates[i]);
              acc.values.push(roundXDigits(val, 2));
              return acc;
            }, { dates: [], values: [] } as ModelOutput);
          }
        }

        setModelData(newModelData);
        setModelResults(newModelResults);
        setLoading(false);
      }
    })();
  }, [props.currentLocation, coordArrs]);

  useEffect(() => {
    if (modelData) {
      setLoading(true);
      console.log(modelData.dates.findIndex(date => date === lastWater.slice(5)), lastWater.slice(5));
      const waterDeficitDaily = runWaterDeficitModel(modelData.precip, modelData.et, soilCap, modelData.dates.findIndex(date => date === lastWater.slice(5)));
      const newModelResults = waterDeficitDaily.reduce((acc, val, i) => {
        acc.dates.push(modelData.dates[i]);
        acc.values.push(roundXDigits(val, 2));
        return acc;
      }, { dates: [], values: [] } as ModelOutput);
  
      setModelResults(newModelResults);
      setLoading(false);
    }
  }, [lastWater, soilCap]);
  
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
      <Typography variant='h5' sx={{ marginLeft: '6px' }}>Lawn Watering Forecast for New York State</Typography>
      <Typography variant='subtitle1' sx={{ fontSize: '16px', marginLeft: '6px', marginBottom: '20px' }}>Decision support tool for reducing water usage when watering lawns</Typography>

      {renderTools(
        modelResults,
        props.pageInfo,
        props.todayFromAcis,
        loading,
        props.currentLocation.address.split(', ').slice(-1)[0] === 'New York',
        lastWater,
        setLastWater,
        soilCap,
        setSoilCap
      )}
    </StyledCard>
  );
}