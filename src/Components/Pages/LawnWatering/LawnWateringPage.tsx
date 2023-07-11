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
    const mayFirstIdx = toolProps.soilSaturationDates.findIndex(d => d === '05-01');
    const wateringDaysSinceMayFirst = Math.round((todayIdx - mayFirstIdx) / 7 * 3);
    const typicalWaterUsed = wateringDaysSinceMayFirst * 0.5;

    return (<>
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

      <Box
        sx={{
          boxSizing: 'border-box',
          margin: '10px auto 0px auto',
          position: 'relative',
          top: '13px',
          border: '2px solid rgb(220,220,220)',
          borderRadius: '4px',
          padding: '10px',
          width: 'fit-content',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
          alignItems: 'center',
        }}
      >
        <Box sx={{ fontSize: '18px', fontWeight: 'bold' }}>
          <span>Wasted Water</span>
          <HelpIcon onMouseLeave={handleClose} onMouseEnter={handleOpen} sx={{ color: 'rgb(120,150,255)', fontSize: '14px', position: 'relative', bottom:'6px' }} />
        </Box>
        <Box sx={{ marginBottom: '10px', fontSize: '14px' }}>with a typical watering schedule</Box>
        <Box sx={{ fontWeight: 'bold', fontSize: '24px' }}>{typicalWaterUsed - toolProps.optimalWaterTotal} in</Box>
      </Box>
      
      <StyledDivider />
      
      <LawnWateringConditionalText
        soilcap={toolProps.soilCap}
        today={todaysValue}
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
    setDescription('Wasted water is defined as the difference between the total water used in a typical watering schedule (0.5" added 3 times per week) and the total water used in an optimal watering plan (0.5" added when the water deficit crosses the plant stress threshold).');
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  
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

      {renderTools(props, handleOpen, handleClose)}

      <Popper open={Boolean(anchorEl)} anchorEl={anchorEl} transition>
      {({ TransitionProps }) => (
        <Fade {...TransitionProps} timeout={350}>
          <Box sx={{ border: 1, borderRadius: 2, p: 1, bgcolor: 'white', maxWidth: 275, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Typography sx={{ lineHeight: '15px', fontSize: '15px' }}>{description}</Typography>
          </Box>
        </Fade>
      )}
    </Popper>
    </StyledCard>
  );
}