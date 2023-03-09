import { Box } from '@mui/material';
import React from 'react';

type PageDivider = {
  type: number;
  sx?: { [key:string]: string }
};

export default function PageDivider(props: PageDivider) {
  let styles = {};
  switch (props.type) {
    case 1:
      styles = {
        width: '75%',
        margin: '0 auto',
        height: '2px',
        backgroundColor: 'rgb(239,64,53)',
        '@media (max-width: 1100px)': {
          width: '100%',
        },
      };
      break;
    case 2:
      styles = {
        width: '50%',
        margin: '0 auto',
        height: '2px',
        backgroundColor: 'rgb(239,64,53)',
      };
      break;
    case 3:
      styles = {
        backgroundColor: 'rgb(240,240,240)',
        width: '1px',
        margin: '0 10px',
        '@media (max-width: 1100px)': {
          height: '2px',
          width: '75%',
          backgroundColor: 'rgb(239,64,53)',
          margin: '20px auto',
        },
      };
      break;
    default:
      break;
  }

  return <Box sx={{...styles, ...props.sx}} />;
}
