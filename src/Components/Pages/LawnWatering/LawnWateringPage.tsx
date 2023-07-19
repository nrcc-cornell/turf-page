import React, { useState } from 'react';
import { Box, Typography, Popper, Fade } from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';

import StyledCard from '../../StyledCard';
import StyledDivider from '../../StyledDivider';
import InvalidText from '../../InvalidText';
import Loading from '../../Loading';
import DailyChart, { NumberRow, StringRow } from '../../DailyChart';
import { TablePageInfo } from '../TablePage/TablePage';

import roundXDigits from '../../../Scripts/Rounding';
import LawnWateringConditionalText from './LawnWateringConditionalText';
import SoilCapacitySelector, { SoilCapacitySelectorProps } from '../../SoilCapacitySelector';
import LastIrrigationSelector, { LastIrrigationSelectorProps } from '../../LastIrrigationSelector';
import WaterDeficitGraph from './WaterDeficitGraph';
import WaterSaving from './WaterSaving';

type LawnWateringPageProps = {
  currentLocation: UserLocation;
  pageInfo: TablePageInfo;
  todayFromAcis: boolean;
  soilSaturation:  number[];
  soilSaturationDates: string[];
  isLoading: boolean;
  optimalWaterTotal: number;
} & LastIrrigationSelectorProps & SoilCapacitySelectorProps



const renderTools = (toolProps: LawnWateringPageProps,  handleOpen: (event: React.MouseEvent<SVGSVGElement>) => void, handleClose: () => void) => {
  if (!toolProps.currentLocation.address.includes('New York')) {
    return <InvalidText type='notNY' />;
  } else if (toolProps.isLoading) {
    return <Loading />;
  } else if (!toolProps.soilSaturation) {
    return <InvalidText type='outOfSeason' />;
  } else {
    const data = [{
      rowName: 'As of 8am On',
      type: 'dates',
      data: toolProps.soilSaturationDates.slice(-6)
    },{
      rowName: toolProps.pageInfo.chart.rowNames[0],
      type: 'numbers',
      data: toolProps.soilSaturation.slice(-6).map(val => roundXDigits(val, 2))
    }] as (StringRow | NumberRow)[];

    const todayIdx = toolProps.soilSaturation.length - (toolProps.todayFromAcis ? 3 : 4);
    const todaysValue = toolProps.soilSaturation[todayIdx];


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
        soilcap={toolProps.soilCap}
        today={todaysValue}
      />

      <StyledDivider />

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
        <SoilCapacitySelector
          recommendedSoilCap={toolProps.recommendedSoilCap}
          soilCap={toolProps.soilCap}
          setSoilCap={toolProps.setSoilCap}
        />
        
        <LastIrrigationSelector
          today={toolProps.today}
          lastIrrigation={toolProps.lastIrrigation}
          setLastIrrigation={toolProps.setLastIrrigation}
        />
      </Box>

      <DailyChart
        {...toolProps.pageInfo.chart}
        data={data}
        todayFromAcis={toolProps.todayFromAcis}
        numRows={3}
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
        lastIrrigation={toolProps.lastIrrigation}
      />
    </>);
  }
};



export default function LawnWateringPage(props: LawnWateringPageProps) {
  const [anchorEl, setAnchorEl] = useState<null | SVGSVGElement>(null);
  const [description, setDescription] = useState('');

  const handleOpen = (event: React.MouseEvent<SVGSVGElement>) => {
    setAnchorEl(event.currentTarget);
    setDescription('Assuming 0.5" of water added per watering session');
  };

  const handleClose = () => {
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

      {renderTools(props, handleOpen, handleClose)}

      <Popper open={Boolean(anchorEl)} anchorEl={anchorEl} transition>
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