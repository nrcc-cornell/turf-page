import React, { useState } from 'react';
import { Box, Typography, Popper, Fade } from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';
import { eachDayOfInterval, isMonday, isWednesday, isFriday } from 'date-fns';

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

function countWateringDays( d0: Date, d1: Date ) {
  const dates = eachDayOfInterval({
    start: d0,
    end: d1
  });

  return dates.reduce((count, date) => (isMonday(date) || isWednesday(date) || isFriday(date)) ? count += 1 : count, 0);
}

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
    const numberWateringDays = countWateringDays(new Date(toolProps.today.getFullYear(), 4, 1), toolProps.today);
    const typicalWaterUsed = numberWateringDays * 0.5;

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
        <Box sx={{ fontSize: '18px' }}>
          <span>Irrigation amount since May 1<sup>st</sup> using:</span>
          <HelpIcon onMouseLeave={handleClose} onMouseEnter={handleOpen} sx={{ color: 'rgb(120,150,255)', fontSize: '14px', position: 'relative', bottom:'6px' }} />
        </Box>
        <Box sx={{ display: 'flex', margin: '5px auto 10px' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center' }}>
            <Box sx={{ fontSize: '14px' }}>Water Deficit</Box>
            <Box sx={{ fontWeight: 'bold', fontSize: '18px' }}>{toolProps.optimalWaterTotal} in</Box>
          </Box>
          <Box sx={{ margin: '0px 10px', width: '2px', height: '40px', backgroundColor: 'rgb(220,220,220)' }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center' }}>
            <Box sx={{ fontSize: '14px' }}>M/W/F Watering Schedule</Box>
            <Box sx={{ fontWeight: 'bold', fontSize: '18px' }}>{typicalWaterUsed} in</Box>
          </Box>
        </Box>
        <Box sx={{ fontSize: '18px' }}>Potential Water Savings</Box>
        <Box sx={{ fontWeight: 'bold' }}>{typicalWaterUsed - toolProps.optimalWaterTotal} in</Box>
        <Box
          sx={{
            color: 'rgb(80,80,80)',
            fontSize: '12px',
            fontStyle: 'italic',
            position: 'relative',
            top: 9
          }}
        >
          *assumes 0.5&quot; added per watering
        </Box>
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
    setDescription('Assuming 0.5" of water added per session');
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