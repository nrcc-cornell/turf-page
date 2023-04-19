import React, { useState, useEffect } from 'react';
import { Typography } from '@mui/material';
import { format, isBefore } from 'date-fns';

import StyledCard from '../../StyledCard';
import StyledDivider from '../../StyledDivider';
import InvalidText from '../../InvalidText';
import Loading from '../../Loading';

import { getFromProxy } from '../../../Scripts/proxy';
import convertCoordsToIdxs from '../../../Scripts/convertCoordsToIdxs';
import { fetchETData } from '../../../Scripts/calcPastSoilSaturation';
import { runWaterDeficitModel, SoilMoistureOptionLevel } from '../../../Scripts/waterDeficitModel';
import { getDateAdjustment, EtReturn } from '../../../Scripts/calcPastSoilSaturation';

type LawnWateringPageProps = {
  currentLocation: UserLocation;
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

const renderTools = () => {
  return (<>
      {/* <DailyChart
        {...props.pageInfo.chart}
        data={data}
        todayFromAcis={props.todayFromAcis}
        numRows={3}
      /> */}
      
      <StyledDivider />
      
      {/* <PollinatorConditionalText text={[{ name: 'Dandelion', color: todayDandelionRisk}, { name: 'White Clover', color: todayCloverRisk }]} /> */}

      <StyledDivider />

      {/* <WastedWater /> */}
  </>);
};

const alignAndExtract = (rawEtData: EtReturn, tempPrcpData: [string, number][], year: number) => {
  let etData, etDates;
  const DA = getDateAdjustment(rawEtData, tempPrcpData, year);
  if (DA > 0) {
    const currentDateIdx = tempPrcpData.findIndex(
      (arr: [string, number]) => arr[1] === -999
    );
    console.log(currentDateIdx);
    tempPrcpData = tempPrcpData.slice(
      DA,
      currentDateIdx >= 0 ? currentDateIdx : tempPrcpData.length
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

  const endIdx = Math.min(etData.length, tempPrcpData.length);
  const numDays = Math.min(30, endIdx);
  const startIdx = endIdx - numDays;


  return { et: etData.slice(startIdx,endIdx), etDates: etDates.slice(startIdx,endIdx), precip: tempPrcpData.slice(startIdx,endIdx).map(arr => arr[1]), precipDates: tempPrcpData.slice(startIdx,endIdx).map(arr => arr[0]) };
};

export default function LawnWateringPage(props: LawnWateringPageProps) {
  const today = new Date();
  const todayStr = format(today, 'yyyyMMdd');
  const [coordArrs, setCoordArrs] = useState<RunoffCoords | null>(null);
  const [modelResults, setModelResults] = useState<null>(null);
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
      // Fetch coords
    
      // Fetch et
      // Fetch prcp forecast
      // Fetch prcp past
      

      // Run through model
      // Format to use in daily chart
      // Get today for conditional text
      // Calc wasted water for year
      
      
      
      setLoading(true);
      
      if (isBefore(today, new Date(today.getFullYear(), 2, 9)) || coordArrs === null) {
        setModelResults(null);
      } else {
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
          console.clear();
          console.log(forecast);
          console.log(rawEtData);
          console.log(pastPrecip);

          const aligned = alignAndExtract(rawEtData, pastPrecip, today.getFullYear());
          
          const nextDate = String(parseInt(aligned.etDates[aligned.etDates.length - 1].slice(-2)) + 1);
          aligned.et.push(rawEtData.pet_fcst[0]);
          aligned.etDates.push(rawEtData.dates_pet_fcst[0]);

          if (String(forecast.dates[0]).slice(-2) === nextDate) {
            aligned.precip.push(forecast.precipChart.raim[0]);
            aligned.precipDates.push(String(forecast.dates[0]));
          } else {
            aligned.precip.push(forecast.precipChart.raim[1]);
            aligned.precipDates.push(String(forecast.dates[1]));
          }
          console.log(aligned);

          const waterDeficit = runWaterDeficitModel(aligned.precip, aligned.et, 0, SoilMoistureOptionLevel.MEDIUM);
          console.log(waterDeficit.deficitDaily.map((val, i) => [aligned.precipDates[i], val]));
        }


        // if (forecastSoilSats) {
        //   const newModelData = await addObservedData(
        //     forecastSoilSats,
        //     today,
        //     props.currentLocation.lngLat
        //   );
        //   if (newModelData) {
        //     setModelData(newModelData);
        //   } else {
        //     setModelData({ soilSats: [], avgt: [], dates: []} as GPModelData);
        //   }
        // }
      }

      setLoading(false);
    })();
  }, [props.currentLocation, coordArrs]);
  
  if (loading) {
    return <Loading />;
  // } else if (!modelResults) {
  //   return (
  //     <StyledCard
  //       variant='outlined'
  //       sx={{
  //         padding: '10px',
  //         boxSizing: 'border-box',
  //         border: 'none',
  //         textAlign: 'center',
  //         '@media (max-width: 448px)': {
  //           width: '100%',
  //           padding: '10px 0px',
  //           border: 'none',
  //         },
  //       }}
  //     >
  //       <InvalidText type='outOfSeason' />
  //     </StyledCard>
  //   );
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
        <Typography variant='h5' sx={{ marginLeft: '6px' }}>Lawn Watering Forecast for New York State</Typography>
        <Typography variant='subtitle1' sx={{ fontSize: '16px', marginLeft: '6px', marginBottom: '20px' }}>Decision support tool for reducing water usage when watering lawns</Typography>

        {/* {props.currentLocation.address.split(', ').slice(-1)[0] === 'New York' ? renderTools(modelResults) : <InvalidText type='notNY' />} */}
      </StyledCard>
    );
  }
}