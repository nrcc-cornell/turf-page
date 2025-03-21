import React from 'react';
import { Box, Typography } from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';
import { SOIL_DATA, SoilMoistureOptionLevel } from '../../../Scripts/waterDeficitModel';
import roundXDigits from '../../../Scripts/Rounding';

type LWCTProps = {
  soilcap: SoilMoistureOptionLevel;
  today: number|null;
  daysUntilWaterNeeded: number;
  open: (event: React.MouseEvent<SVGSVGElement>, desc: string) => void;
  close: () => void;
}

const valueToText = (value: number, thresholds: number[], textOpts: string[]) => {
  for (let i = 0; i < textOpts.length; i++) {
    if (thresholds[i] !== undefined && value >= thresholds[i]) {
      return textOpts[i];
    }
  }
  return textOpts[textOpts.length - 1];
};


export default function LawnWateringConditionalText(props: LWCTProps) {
  const soilConstants = SOIL_DATA.soilmoistureoptions[props.soilcap];

  const breakpoints = [
    0,
    roundXDigits(soilConstants.prewiltingpoint - soilConstants.stressthreshold, 3)
  ];

  const adjustment = SOIL_DATA.soilmoistureoptions[props.soilcap].fieldcapacity - SOIL_DATA.soilmoistureoptions[props.soilcap].stressthreshold;
  const todayAdjusted = props.today === null ? null : props.today + adjustment;

  return (
    <Box
      sx={{
        boxSizing: 'border-box',
        margin: '10px auto 0px auto',
        position: 'relative',
        top: '13px',
        border: '2px solid rgb(220,220,220)',
        borderRadius: '4px',
        padding: '30px 12px',
        width: '80%',
        minWidth: 'fit-content'
      }}
    >
      <Box sx={{ textAlign: 'center', marginBottom: '12px' }}>
        <Typography variant='h5' sx={{ fontSize: '24px' }}>Lawn Watering Recommendations</Typography>
      </Box>
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <Box sx={{ textAlign: 'right' }}>
          <span style={{ whiteSpace: 'nowrap', fontSize: '20px' }}>Today:&nbsp;&nbsp;&nbsp;</span>
        </Box>
        <Box>
          <Typography
            variant='mapPage'
            sx={{
              lineHeight: '1.2', fontWeight: 'bold'
            }}
          >{todayAdjusted === null ? 'Too early in the season to water' : valueToText(todayAdjusted, breakpoints, SOIL_DATA.soilRecommendations.text)}</Typography>
        </Box>
      </Box>

      {props.daysUntilWaterNeeded > 0 &&
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', flexWrap: 'nowrap' }}>
            <span style={{ fontSize: '20px' }}>Forecast</span>
            <HelpIcon onMouseLeave={props.close} onMouseEnter={(e) => props.open(e, 'This forecast assumes maximum evapotranspiration and no rain to create a conservative estimate of how long your lawn can last without irrigation.')} sx={{ color: 'rgb(120,150,255)', fontSize: '14px', position: 'relative', bottom:'6px' }} />
            <span>:&nbsp;&nbsp;&nbsp;</span>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography
              variant='mapPage'
              sx={{
                lineHeight: '1.2', fontWeight: 'bold'
              }}
            >{props.daysUntilWaterNeeded === 1 ? 'You may need to water tomorrow.' : `You can go AT LEAST ${props.daysUntilWaterNeeded} days without irrigating.`}</Typography>
          </Box>
        </Box>
      }
    </Box>
  );
}