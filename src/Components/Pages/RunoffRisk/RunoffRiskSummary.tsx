import React, { useState } from 'react';

import { Box, Typography, Popper, Fade } from '@mui/material';
import HelpIcon from '@mui/icons-material/Help';

import { convertDate, convertRiskPercToRiskText, descriptionFromRiskText } from './rrPageUtils';

import StyledButton from '../../StyledBtn';
import roundXDigits from '../../../Scripts/Rounding';
import { RRData } from './RunoffRiskPage';

type RRSummary = {
  data: RRData
};

export default function RunoffRiskSummary(props: RRSummary) {
  const [assumptionsOpen, setAssumptionsOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | SVGSVGElement>(null);
  const [description, setDescription] = useState({ desc: '', warning: '' });

  const handleOpen = (event: React.MouseEvent<SVGSVGElement>, newDescription: { desc: string, warning: string }) => {
    setAnchorEl(event.currentTarget);
    setDescription(newDescription);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  if (props.data.dates.length < 3) {
    return <Box>No data to display. Please try again later.</Box>;
  }
  
  const boxes = [];
  for (let i = 0; i < 3; i++) {
    const date = convertDate(props.data.dates[i], '/');
    const riskPerc = props.data.riskWinter[i];
    const {riskText, color} = convertRiskPercToRiskText(riskPerc);
    const newDescription = descriptionFromRiskText(riskText);

    boxes.push(<Box key={i} sx={{ width: '207px', paddingTop: '25px', boxSizing: 'border-box', textAlign: 'center'}}>
      <Typography sx={{ fontWeight: 'bold', fontSize: '24px' }}>{date}</Typography>
      <Box sx={{ boxSizing: 'border-box', padding: '0px 10px' }}>
        <Typography sx={{ fontWeight: 'bold', fontSize: '16px', color }}>
          {riskText}
          <HelpIcon onMouseLeave={handleClose} onMouseEnter={(e) => handleOpen(e, newDescription)} sx={{ color: 'rgb(120,150,255)', fontSize: '14px', position: 'relative', bottom:'6px'  }} />
        </Typography>
      </Box>
    </Box>);

    if (i < 2) {
      boxes.push(<Box key={`divider${i}`} sx={{ height: '120px', width: '3px', backgroundColor: 'rgb(200,200,200)' }}/>);
    }
  }

  return <Box>
    <Typography variant='h5' sx={{ textAlign: 'center' }}>3 Day Runoff Risk Summary</Typography>

    <Box sx={{ maxWidth: '700px', display: 'flex', margin: '0 auto', justifyContent: 'space-evenly' }}>
      {boxes}
    </Box>

    <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <Typography variant='underChart'>*NOTE: Forecasts are updated ~6:30am ET daily</Typography>
      <StyledButton onClick={() => setAssumptionsOpen(!assumptionsOpen)} sx={{ width: 'fit-content', margin: '12px auto 8px' }}>{assumptionsOpen ? 'Hide Assumptions' : 'Show Assumptions'}</StyledButton>
    </Box>

    {assumptionsOpen && <Box sx={{ maxWidth: '400px', margin: '0 auto' }}>
      <Box sx={{ fontSize: '17px', fontWeight: 'bold', textAlign: 'center', margin: '20px auto' }}>
        <Box>Last 24hrs Precipitation: {roundXDigits(props.data.past24Pcpn, 2).toFixed(2)} inches</Box>
        <Box>Next 24hrs Precipitation: {roundXDigits(props.data.next24Pcpn, 2).toFixed(2)} inches</Box>
      </Box>
      <Box sx={{ fontSize: '14px', textAlign: 'center' }}>
        <Box>These estimates are determined from observations in your area. However, local conditions can vary at field level.</Box>
         <Box sx={{ marginTop: '6px', color: 'red', fontWeight: 'bold' }}> If you are currently observing different conditions than those listed above,
         these forecasts should have limited influence on your decision making today.</Box>
      </Box>
      </Box>}

      <Popper open={Boolean(anchorEl)} anchorEl={anchorEl} transition>
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Box sx={{ border: 1, borderRadius: 2, p: 1, bgcolor: 'white', maxWidth: 275, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Typography sx={{ lineHeight: '15px', fontSize: '15px' }}>{description.desc}</Typography>
              {description.warning && <Typography sx={{ lineHeight: '15px', fontSize: '15px', color: 'red' }}>{description.warning}</Typography>}
            </Box>
          </Fade>
        )}
      </Popper>
  </Box>;
}