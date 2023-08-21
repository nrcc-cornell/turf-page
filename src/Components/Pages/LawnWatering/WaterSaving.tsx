import React from 'react';
import { Box } from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';
import { eachDayOfInterval, isMonday, isWednesday, isFriday } from 'date-fns';

type Open = (event: React.MouseEvent<SVGSVGElement>, desc: string) => void;
type Close = () => void;

type WaterSavingProps = {
  open: Open;
  close: Close;
  avoidPlantStressWaterTotal: number;
  avoidDormancyWaterTotal: number;
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

const createRow = (items: { name: string, total: (string | number), diff: (number | string) }[], useWhich: ('total' | 'diff')) => {
  const DIVIDER = <Box sx={{ margin: '0px 10px', width: '2px', height: '40px', backgroundColor: 'rgb(220,220,220)' }} />;
  return (
    <Box sx={{ display: 'flex', margin: '18px auto 13px' }}>
      {items.map(({name, total, diff}, i) => {
        return (
          <React.Fragment key={name}>
            {i > 0 && DIVIDER}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center' }}>
              <Box sx={{ fontSize: '14px' }}>{name}</Box>
              <Box sx={{ fontWeight: 'bold', fontSize: '18px' }}>{useWhich === 'total' ? total + ' in' : diff}</Box>
            </Box>
          </React.Fragment>
        );
      })}
    </Box>
  );
};

const createTitle = (text: (JSX.Element | string), extra?: (JSX.Element)) => {
  return (
    <Box sx={{ fontSize: '18px' }}>
      {text}
      {extra ? extra : ''}
    </Box>
  );
};

export default function WaterSaving(props: WaterSavingProps) {
  const typicalWaterUsed = calculateWaterUsed(new Date(props.today.getFullYear(), 4, 1), props.today);
  const IRRI_AMOUNT_ITEMS = typicalWaterUsed ? [{
    name: 'M/W/F Watering Schedule',
    total: typicalWaterUsed,
    diff: '-'
  },{
    name: 'Avoid Plant Stress',
    total: props.avoidPlantStressWaterTotal,
    diff: typicalWaterUsed - props.avoidPlantStressWaterTotal
  },{
    name: 'Avoid Dormancy',
    total: props.avoidDormancyWaterTotal,
    diff: typicalWaterUsed - props.avoidDormancyWaterTotal
  }] : [];

  const HELP_ICON = <HelpIcon
    onMouseLeave={props.close}
    onMouseEnter={(e) => props.open(e, 'Assuming 0.5" of water added per watering session')}
    sx={{
      color:'rgb(120,150,255)',
      fontSize: '14px',
      position: 'relative',
      bottom:'6px'
    }}
  />;

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
        {createTitle(<span>Irrigation amount since May 1<sup>st</sup> using:</span>, HELP_ICON)}
        <Box sx={{ fontWeight: 'bold', fontSize: '18px', marginTop: '8px' }}>Too Early In the Season to Water</Box>
      </> : <>
        {createTitle(<span>Irrigation amount since May 1<sup>st</sup> using:</span>, HELP_ICON)}
        {createRow(IRRI_AMOUNT_ITEMS, 'total')}
        <Box sx={{ height: '6px' }} />
        {createTitle('Potential Water Savings Using:')}
        {createRow(IRRI_AMOUNT_ITEMS, 'diff')}
      </>}
    </Box>
  );
}