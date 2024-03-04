import React from 'react';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';

const LightTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.common.white,
    color: 'rgba(0, 0, 0, 0.87)',
    boxShadow: theme.shadows[1],
    fontSize: 11,
    width: '150px',
    textAlign: 'center'
  },
}));

type WarningIconProps = {
  onClick: () => void;
};

export default function WarningIcon(props: WarningIconProps) {
  const text = <span>Selected location is not in NY so you may not see the intended overlay.<br/><br/>Click to zoom to overlay.</span>;

  return (
    <LightTooltip title={text} placement='right'>
      <IconButton sx={{
          backgroundColor: 'white',
          height: '45px',
          width: '45px',
          border: '2px solid rgb(240,240,240)',
          '&:hover': {
            backgroundColor: 'rgb(240,240,240)'
          }
        }}
        onClick={props.onClick}>
        <WarningAmberIcon fontSize='inherit' sx={{ color: '#ff7f00', position: 'relative', top: '-1px' }} />
      </IconButton>
    </LightTooltip>
  );
}