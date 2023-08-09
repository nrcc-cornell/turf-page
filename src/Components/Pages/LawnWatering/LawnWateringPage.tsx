import React, { useEffect, useState } from 'react';
import { Box, Typography, Popper, Fade } from '@mui/material';
import JSZip from 'jszip';

import StyledCard from '../../StyledCard';
import StyledDivider from '../../StyledDivider';
import InvalidText from '../../InvalidText';
import Loading from '../../Loading';
import LawnWateringConditionalText from './LawnWateringConditionalText';
import SoilMoistureOptions, { SoilMoistureOptionsProps } from '../../SoilMoistureOptions/SoilMoistureOptions';
import WaterDeficitGraph from './WaterDeficitGraph';
import WaterSaving from './WaterSaving';
import { SOIL_DATA } from '../../../Scripts/waterDeficitModel';
import { CoordsIdxObj } from '../../../Hooks/useRunoffApi';

type LawnWateringPageProps = {
  currentLocation: UserLocation;
  todayFromAcis: boolean;
  soilSaturation:  number[];
  soilSaturationDates: string[];
  isLoading: boolean;
  optimalWaterTotal: number;
  coordsIdxs: CoordsIdxObj | null;
} & SoilMoistureOptionsProps;



const renderTools = (toolProps: LawnWateringPageProps,  handleOpen: (event: React.MouseEvent<SVGSVGElement>, desc: string) => void, handleClose: () => void, maxEt: number | null) => {
  if (!toolProps.currentLocation.address.includes('New York')) {
    return <InvalidText type='notNY' />;
  } else if (toolProps.isLoading) {
    return <Loading />;
  } else if (!toolProps.soilSaturation) {
    return <InvalidText type='outOfSeason' />;
  } else if (toolProps.soilSaturation.length === 0) {
    return <InvalidText type='badData' />;
  } else {
    const todayIdx = toolProps.soilSaturation.length - (toolProps.todayFromAcis ? 3 : 4);
    const todaysValue = toolProps.soilSaturation[todayIdx];

    // // Use coordsIdxs to access precalculated ets, replace following value with retrieved value
    // const maxET = 0.25;
    // const wateringThreshold = SOIL_DATA.soilmoistureoptions[toolProps.soilCap].stressthreshold - SOIL_DATA.soilmoistureoptions[toolProps.soilCap].fieldcapacity;
    // let finalDeficit = 0;
    // let daysUntilWaterNeeded = 0;
    // for (const deficit of toolProps.soilSaturation.slice(todayIdx)) {
    //   if (deficit <= wateringThreshold) {
    //     finalDeficit = deficit;
    //     break;
    //   } else {
    //     finalDeficit = deficit - maxET;
    //     daysUntilWaterNeeded++;
    //   }
    // }

    // while(finalDeficit > wateringThreshold) {
    //   console.log(finalDeficit);
    //   daysUntilWaterNeeded++;
    //   finalDeficit -= maxET;
    // }

    // console.log(daysUntilWaterNeeded);

    // Use coordsIdxs to access precalculated ets, replace following value with retrieved value
    let daysUntilWaterNeeded = 0;
    if (maxEt !== null) {
      const wateringThreshold = SOIL_DATA.soilmoistureoptions[toolProps.soilCap].prewiltingpoint - SOIL_DATA.soilmoistureoptions[toolProps.soilCap].fieldcapacity;
      let deficit = todaysValue;
      while(deficit > wateringThreshold) {
        daysUntilWaterNeeded++;
        deficit -= maxEt;
      }
    } else {
      daysUntilWaterNeeded = -1;
    }

    return (<>
      <Box sx={{
        position: 'absolute',
        top: 10,
        right: 10,
        zIndex: -1,
        '@media (max-width: 448px)': {
          top: 136,
          zIndex: 1
        },
      }}>
        <a href="https://www.nrcc.cornell.edu/" target='_blank' rel='noreferrer'><img src={process.env.PUBLIC_URL + '/Assets/ACIS_NRCC.jpg'} alt='Powered by ACIS NRCC, logo' style={{ width: '100px' }} /></a>
      </Box>

      <LawnWateringConditionalText
        open={handleOpen}
        close={handleClose}
        soilcap={toolProps.soilCap}
        today={todaysValue}
        daysUntilWaterNeeded={daysUntilWaterNeeded}
      />

      <StyledDivider />

      <SoilMoistureOptions
        recommendedSoilCap={toolProps.recommendedSoilCap}
        soilCap={toolProps.soilCap}
        setSoilCap={toolProps.setSoilCap}
        today={toolProps.today}
        irrigationDates={toolProps.irrigationDates}
        setIrrigationDates={toolProps.setIrrigationDates}
        useIdeal={toolProps.useIdeal}
        setUseIdeal={toolProps.setUseIdeal}
      />

      <WaterSaving
        open={handleOpen}
        close={handleClose}
        today={toolProps.today}
        optimalWaterTotal={toolProps.optimalWaterTotal}
      />
      
      <StyledDivider />

      <WaterDeficitGraph
        dates={toolProps.soilSaturationDates}
        deficits={toolProps.soilSaturation}
        soilCap={toolProps.soilCap}
        todayIdx={todayIdx}
        today={toolProps.today}
        irrigationDates={toolProps.irrigationDates}
      />
    </>);
  }
};



export default function LawnWateringPage(props: LawnWateringPageProps) {
  const [anchorEl, setAnchorEl] = useState<null | SVGSVGElement>(null);
  const [description, setDescription] = useState('');
  const [maxEt, setMaxEt] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const filename = `month_${props.today.getMonth()}_et_grid`;
      fetch(process.env.PUBLIC_URL + `/Data/${filename}.zip`)
      .then(response => response.blob())
          .then(blob => JSZip.loadAsync(blob))
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          .then(zip => zip.file(`${filename}.json`).async('string'))
          .then(strRes => {
            if (props.coordsIdxs !== null) {
              setMaxEt(JSON.parse(strRes)[props.coordsIdxs.idxLat][props.coordsIdxs.idxLng]);
            } else {
              setMaxEt(null);
            }
          });
      })();
  }), [props.coordsIdxs, props.today];

  const handleOpen = (event: React.MouseEvent<SVGSVGElement>, desc: string) => {
    console.log('open');
    console.log(event.currentTarget);
    setAnchorEl(event.currentTarget);
    setDescription(desc);
  };

  const handleClose = () => {
    console.log('close');
    setAnchorEl(null);
  };
  
  return (
    <StyledCard
      variant='outlined'
      sx={{
        position: 'relative',
        zIndex: 1,
        padding: '60px 10px 10px',
        boxSizing: 'border-box',
        maxWidth: '1100px',
        '@media (max-width: 448px)': {
          width: '100%',
          padding: '30px 0px 10px',
          border: 'none',
          position: 'initial'
        },
      }}
    >
      <Typography variant='h5' sx={{ marginLeft: '6px' }}>Lawn Watering Forecast for {props.currentLocation.address}</Typography>

      {renderTools(props, handleOpen, handleClose, maxEt)}

      <Popper open={Boolean(anchorEl)} anchorEl={anchorEl} transition sx={{ zIndex: 2 }}>
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={350}>
          <Box sx={{ border: 1, borderRadius: 2, p: 1, bgcolor: 'white', maxWidth: 275, textAlign: 'center' }}>
            <Typography sx={{ lineHeight: '15px', fontSize: '15px' }}>{description}</Typography>
          </Box>
        </Fade>
      )}
    </Popper>
    </StyledCard>
  );
}