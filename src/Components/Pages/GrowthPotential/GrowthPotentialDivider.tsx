import { Box } from '@mui/material';
import React from 'react';

type GPDivider = {
  type: number;
};

export default function GrowthPotentialDivider(props: GPDivider) {
  let styles = {};
  switch (props.type) {
    case 1:
      styles = {
        width: '80%',
        margin: '15px auto 22px auto',
        height: '2px',
        backgroundColor: 'rgb(239,64,53)',
        '@media (max-width: 1100px)': {
          margin: '15px auto 0px auto',
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
          width: '50%',
          backgroundColor: 'rgb(239,64,53)',
          margin: '0px auto 5px auto',
        },
      };
      break;
    default:
      break;
  }

  console.log(props.type, styles);

  return <Box sx={styles} />;
}
