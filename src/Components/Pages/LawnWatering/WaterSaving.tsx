import React from 'react';
import { Box } from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';
import { eachDayOfInterval, isMonday, isWednesday, isFriday } from 'date-fns';

type WaterSavingProps = {
  open: (event: React.MouseEvent<SVGSVGElement>, desc: string) => void;
  close: () => void;
  optimalWaterTotal: number;
  today: Date;
}

function calculateWaterUsed( d0: Date, d1: Date ) {
  const waterPerDay = 0.5;

  try {
    const dates = eachDayOfInterval({
      start: d0,
      end: d1
    });

    const numberWateringDays = dates.reduce((count, date) => (isMonday(date) || isWednesday(date) || isFriday(date)) ? count += 1 : count, 0);
    return numberWateringDays * waterPerDay;
  } catch {
    return null;
  }
}

export default function WaterSaving(props: WaterSavingProps) {
  const typicalWaterUsed = calculateWaterUsed(new Date(props.today.getFullYear(), 4, 1), props.today);
  
  return (
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
      {typicalWaterUsed === null ? <>
        <Box sx={{ fontSize: '18px' }}>
          <span>Irrigation amount since May 1<sup>st</sup>:</span>
          <HelpIcon onMouseLeave={props.close} onMouseEnter={(e) => props.open(e, 'Assuming 0.5" of water added per watering session')} sx={{ color: 'rgb(120,150,255)', fontSize: '14px', position: 'relative', bottom:'6px' }} />
        </Box>
        <Box sx={{ fontWeight: 'bold', fontSize: '18px', marginTop: '8px' }}>Too Early In the Season to Water</Box>
      </> : <>
        <Box sx={{ fontSize: '18px' }}>
          <span>Irrigation amount since May 1<sup>st</sup> using:</span>
          <HelpIcon onMouseLeave={props.close} onMouseEnter={(e) => props.open(e, 'Assuming 0.5" of water added per watering session')} sx={{ color: 'rgb(120,150,255)', fontSize: '14px', position: 'relative', bottom:'6px' }} />
        </Box>
        <Box sx={{ display: 'flex', margin: '18px auto 13px' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center' }}>
            <Box sx={{ fontSize: '14px' }}>Water Deficit</Box>
            <Box sx={{ fontWeight: 'bold', fontSize: '18px' }}>{props.optimalWaterTotal} in</Box>
          </Box>
          <Box sx={{ margin: '0px 10px', width: '2px', height: '40px', backgroundColor: 'rgb(220,220,220)' }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center' }}>
            <Box sx={{ fontSize: '14px' }}>M/W/F Watering Schedule</Box>
            <Box sx={{ fontWeight: 'bold', fontSize: '18px' }}>{typicalWaterUsed} in</Box>
          </Box>
        </Box>
        <Box sx={{ fontSize: '18px' }}>Potential Water Savings</Box>
        <Box sx={{ fontWeight: 'bold' }}>{typicalWaterUsed - props.optimalWaterTotal} in</Box>
      </>}
    </Box>
  );
}