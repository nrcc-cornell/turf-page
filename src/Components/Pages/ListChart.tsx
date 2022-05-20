import React from 'react';

import {
  Typography,
  Box,
  CircularProgress
} from '@mui/material';


const dateSX = (i: number) => ({
  backgroundColor: 'white',
  height: '100%',
  width: '100%',
  boxSizing: 'border-box',
  fontSize: '14px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  padding: '0px 2px',
  borderLeft: i === 0 ? 'none' : '1px solid rgb(240,240,240)',
  '@media (max-width: 380px)': {
    fontSize: '12px'
  }
});

const HeaderSX = {
  backgroundColor: 'white',
  height: '100%',
  width: '100%',
  textAlign: 'center',
  boxSizing: 'border-box',
  fontSize: '14px',
  borderRight: '1px solid rgba(239,64,53,0.4)',
  '@media (max-width: 380px)': {
    fontSize: '12px'
  }
};


const constructCells = (data: StrDateValue[]) => {
  const GDDSx = {
    height: '100%',
    width: '100%',
    backgroundColor: 'white',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    fontWeight: 'bold',
    boxSizing: 'border-box',
    '@media (max-width: 500px)': {
      fontSize: '12px'
    }
  };
  
  return data.map((day, i) => <Box key={day[0]} sx={{ ...GDDSx, borderLeft: i === 0 ? 'none' : '1px solid rgb(240,240,240)' }}>{day[1]}</Box>);
};


const constructDates = (data: StrDateValue[]) => {
  return data.map((arr, i) => <Box key={arr[0]} sx={dateSX(i)}>
    <Box sx={{
      width: 'fit-content',
      '@media (max-width: 510px)': {
        width: '20px'
      }
    }}>{arr[0].slice(0,-5)}</Box>
  </Box>);
};


const renderChart = (data: StrDateValue[], todayFromAcis: boolean) => {
  const dates = constructDates(data);
  const cells = constructCells(data);

  // Handles edge case of approaching the end of the season, 11/30
  let shift = 0;
  if (new Date().getMonth() === 10 && new Date().getDate() > 25) shift = new Date().getDate() - 25;

  const lineSX = {
    width: '40px',
    height: '2px',
    backgroundColor: 'rgb(200,200,200)',
    margin: '0px 6px',
    position: 'relative',
    '@media (max-width: 942px)': {
      width: shift >= 4 ? '12px' : '40px'
    },
    '@media (max-width: 636px)': {
      width: shift >= 3 ? '12px' : '40px'
    },
    '@media (max-width: 570px)': {
      width: shift >= 2 ? '12px' : '40px'
    }
  };
  
  const arrowSX = {
    content: '""',
    height: 6,
    width: 6,
    position: 'absolute',
    top: -3,
    transform: 'rotate(45deg)'
  };

  const beforeSX = {
    '&::before': {
      ...arrowSX,
      borderLeft: '2px solid rgb(200,200,200)',
      borderBottom: '2px solid rgb(200,200,200)',
      left: 0
    }
  };

  const afterSX = {
    '&::after': {
      ...arrowSX,
      borderRight: '2px solid rgb(200,200,200)',
      borderTop: '2px solid rgb(200,200,200)',
      right: 0
    }
  };

  const numShift = (todayFromAcis ? 4 : 3) + shift;
  const mLeft = `calc((100% - 80px) * ${numShift} / 9 - 34px)`;
  const smallMLeft = `calc((100% - 66px) * ${numShift} / 9 - 49px)`;


  return (
    <>
      <Box sx={{
        display: 'flex',
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: mLeft,
        marginTop: '8px',
        width: 225,
        top: 2,
        '@media (max-width: 380px)': {
          marginLeft: smallMLeft,
        }
      }}>
        <Box sx={{ ...lineSX, ...beforeSX }}></Box>
        <Typography variant='underChart' sx={{ marginRight: '8px' }}>Observed</Typography>
        <Box sx={{
          backgroundColor: 'rgb(225,225,225)',
          width: '3px',
          height: 89,
          position: 'absolute',
          top: -3,
          left: '114px',
          zIndex: 1
        }}></Box>
        <Typography variant='underChart' sx={{ 
          color: shift === 5 ? 'white' : 'rgb(180,180,180)',
          '@media (max-width: 588px)': {
            color: shift >= 4 ? 'white' : 'rgb(180,180,180)'
          }
        }}>Forecast</Typography>
        <Box sx={{
          ...lineSX,
          ...afterSX,
          '@media (max-width: 814px)': {
            backgroundColor: shift >= 4 ? 'white' : 'rgb(200,200,200)',
            '&::after': {
              borderColor: shift >= 4 ? 'white' : 'rgb(200,200,200)'
            }
          },
          '@media (max-width: 484px)': {
            backgroundColor: shift >= 3 ? 'white' : 'rgb(200,200,200)',
            '&::after': {
              borderColor: shift >= 3 ? 'white' : 'rgb(200,200,200)'
            }
          }
        }}></Box>
      </Box>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: '80px repeat(9, auto)',
        gridTemplateRows: 'repeat(2, 38px)',
        rowGap: '1px',
        backgroundColor: 'rgba(239,64,53,0.4)',
        justifyItems: 'center',
        alignItems: 'center',
        boxSizing: 'border-box',
        position: 'relative',
        margin: '0px auto 8px auto',
        '@media (max-width: 380px)': {
          gridTemplateColumns: `66px repeat(9, auto)`,
        }
      }}>
        <Box sx={{ ...HeaderSX, padding: '5px 12px'}}>As of 8am on</Box>
        {dates}

        <Box sx={{ ...HeaderSX, padding: '12px'}}>GDDs</Box>
        {cells}
      </Box>
    </>
  );
};


const renderNotChart = (a: 'loading' | 'empty') => {
  return (
    <Box sx={{
      margin: '8px auto',
      height: 43,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-end',
      color: 'rgb(187,187,187)',
      fontStyle: 'italic'
    }}>
      {a === 'loading' ? <CircularProgress color='inherit' /> : 'No Data to Display'}
    </Box>
  );
};



export default function ListChart(props: ListChartProps) {
  return (
    <Box sx={{ maxWidth: 730, margin: '0 auto' }}>
      <Typography variant='h5' sx={{ marginLeft: '16px' }}>{props.title}</Typography>

      {!props.data ? renderNotChart('loading') :
        (props.data.length === 0 ? renderNotChart('empty') : renderChart(props.data, props.todayFromAcis))}
    </Box>
  );
}