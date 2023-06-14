import React, { useState, useEffect } from 'react';
import { Box, TextField, Typography, MenuItem } from '@mui/material';
import { format } from 'date-fns';

import StyledCard from '../../StyledCard';
import StyledDivider from '../../StyledDivider';
import InvalidText from '../../InvalidText';
import Loading from '../../Loading';
import DailyChart, { NumberRow, StringRow } from '../../DailyChart';
import { TablePageInfo } from '../TablePage/TablePage';

import { getFromProxy, RunoffCoords } from '../../../Scripts/proxy';
import { runWaterDeficitModel, SoilMoistureOptionLevel } from '../../../Scripts/waterDeficitModel';
import roundXDigits from '../../../Scripts/Rounding';
import LawnWateringConditionalText from './LawnWateringConditionalText';
import { getWaterDeficitData, WaterDeficitModelData } from '../../../Scripts/getWaterDefData';

type LawnWateringPageProps = {
  currentLocation: UserLocation;
  pageInfo: TablePageInfo;
  todayFromAcis: boolean;
}

type ModelOutput = {
  dates: string[];
  values: number[];
};

const renderTools = (
  modelResults: ModelOutput | null,
  pageInfo: TablePageInfo,
  todayFromAcis: boolean,
  isLoading: boolean,
  isNY: boolean,
  lastWater: string,
  setLastWater: React.Dispatch<React.SetStateAction<string>>,
  soilCap: SoilMoistureOptionLevel,
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
          select
          label='Soil Water Capacity'
          value={soilCap}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSoilCap(e.target.value as SoilMoistureOptionLevel)}
        >
          <MenuItem value={SoilMoistureOptionLevel.HIGH}>High (Clay, fine texture)</MenuItem>
          <MenuItem value={SoilMoistureOptionLevel.MEDIUM}>Medium (Loam, med texture)</MenuItem>
          <MenuItem value={SoilMoistureOptionLevel.LOW}>Low (Sand, coarse texture)</MenuItem>
        </TextField>
        
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
      </Box>

      <DailyChart
        {...pageInfo.chart}
        data={data}
        todayFromAcis={todayFromAcis}
        numRows={3}
      />
      
      <StyledDivider />
      
      <LawnWateringConditionalText soilcap={soilCap} today={modelResults.values[todayIdx]} />

      <StyledDivider />

      {/* <WastedWater /> */}
    </>);
  }
};



export default function LawnWateringPage(props: LawnWateringPageProps) {
  const today = new Date();
  const todayStr = format(today, 'yyyyMMdd');
  const [coordArrs, setCoordArrs] = useState<RunoffCoords | null>(null);
  const [modelData, setModelData] = useState<WaterDeficitModelData | null>(null);
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
      if (coordArrs) {
        setLoading(true);

        const newModelData = await getWaterDeficitData(today, todayStr, props.currentLocation.lngLat, coordArrs);

        if (newModelData !== null) {
          const waterDeficitDaily = runWaterDeficitModel(newModelData.precip, newModelData.et, soilCap, newModelData.dates.findIndex(date => date === lastWater.slice(5)), 0, 'lawn');
          const newModelResults = waterDeficitDaily.reduce((acc, val, i) => {
            acc.dates.push(newModelData.dates[i]);
            acc.values.push(roundXDigits(val, 2));
            return acc;
          }, { dates: [], values: [] } as ModelOutput);
  
          setModelData(newModelData);
          setModelResults(newModelResults);
        }

        setLoading(false);
      }
    })();
  }, [props.currentLocation, coordArrs]);

  useEffect(() => {
    if (modelData) {
      setLoading(true);
      const waterDeficitDaily = runWaterDeficitModel(modelData.precip, modelData.et, soilCap, modelData.dates.findIndex(date => date === lastWater.slice(5)), 0, 'lawn');
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
        props.currentLocation.address.includes('New York'),
        lastWater,
        setLastWater,
        soilCap,
        setSoilCap
      )}
    </StyledCard>
  );
}