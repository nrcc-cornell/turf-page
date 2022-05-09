import React from 'react';

import {
  Typography,
  Box,
  CircularProgress
} from '@mui/material';

type Row = {
  thresholds: {
    low: number,
    medium: number,
    high: number
  },
  name: string
}

type ThresholdObj = {
  low: number,
  medium: number,
  high: number
};

type DateValue = [ string, number ];

type HSTool = {
  Daily: DateValue[]
};

type Tool = HSTool & {
  '7 Day Avg': DateValue[]
};

type ChartProps = {
  rows: Row[],
  ranges: string[][],
  title: string,
  data: [string, number][] | Tool | HSTool | null,
  colorizer: (val: number, thresholds: ThresholdObj) => string,
  todayFromAcis: boolean
};

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
  '@media (max-width: 593px)': {
    borderLeft: i === 0 ? 'none' : '1px solid rgb(240,240,240)'
  },
  '@media (max-width: 380px)': {
    fontSize: '12px'
  }
});

const HeaderSX = {
  backgroundColor: 'white',
  height: '100%',
  width: '100%',
  padding: '5px 2px',
  textAlign: 'center',
  boxSizing: 'border-box',
  fontSize: '14px',
  borderRight: '1px solid rgb(240,240,240)',
  '@media (max-width: 380px)': {
    fontSize: '12px'
  }
};


const constructCells = (data: [string, number][] | Tool | HSTool, rows: Row[], colorizer: (val: number, thresholds: ThresholdObj) => string): JSX.Element[][] => {
  return rows.map(rowInfo => {
    const row = [<Box key={rowInfo.name} sx={HeaderSX}>{rowInfo.name}</Box>];
    
    // @ts-expect-error  'rows' should be composed of 'Daily' | '7 Day Avg' and should be in line with HSTool | Tool for whichever risk is being processed
    const d = data instanceof Array ? data : data[rowInfo.name as 'Daily' | '7 Day Avg'];

    d.forEach((arr: number[], i: number) => {
      const backgroundColor = colorizer(arr[1], rowInfo.thresholds);
      row.push(
        <Box key={rowInfo.name + i} sx={{
          height: '100%',
          width: '100%',
          backgroundColor: 'white',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          <Box sx={{
            backgroundColor,
            height: 15,
            width: 15,
            borderRadius: '50%',
            '@media (max-width: 380px)': {
              height: 11,
              width: 11
            }            
          }} />
        </Box>
      );
    });

    return row;
  });
};


const constructDates = (data: [string, number][]) => {
  return data.map((arr, i) => <Box key={arr[0]} sx={dateSX(i)}>
    <Box sx={{
      width: 'fit-content',
      '@media (max-width: 510px)': {
        width: '20px'
      }
    }}>{arr[0]}</Box>
  </Box>);
};


const renderChart = (data: [string, number][] | Tool | HSTool, rows: Row[], colorizer: (val: number, thresholds: ThresholdObj) => string, todayFromAcis: boolean) => {
  const sample = data instanceof Array ? data : data['Daily'];
  const dates = constructDates(sample);
  const cells = constructCells(data, rows, colorizer);

  const lineSX = { width: '40px', height: '2px', backgroundColor: 'rgb(200,200,200)', position: 'relative' };
  
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

  let smallMLeft, mLeft;
  if (sample.length === 9) {
    mLeft = `calc((100% - 89px) * ${todayFromAcis ? 4/9 : 3/9} - 33px)`;
    smallMLeft = `calc((100% - 66px) * ${todayFromAcis ? 4/9 : 3/9} - 49px)`;
  } else {
    // Might always be 4/10
    mLeft = `calc((100% - 89px) * ${todayFromAcis ? 5/10 : 4/10} - 31px)`;
    smallMLeft = `calc((100% - 66px) * ${todayFromAcis ? 5/10 : 4/10} - 48px)`;
  }

  return (
    <>
      <Box sx={{
        display: 'flex',
        position: 'relative',
        justifyContent: 'space-between',
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
        <Typography variant='underChart'>Observed</Typography>
        <Box sx={{
          backgroundColor: 'rgb(225,225,225)',
          width: '3px',
          height: `${(cells.length) * 25 + 50 + (cells.length)}px`,
          position: 'absolute',
          top: -3,
          left: '114px',
          zIndex: 1
        }}></Box>
        <Typography variant='underChart'>Forecast</Typography>
        <Box sx={{ ...lineSX, ...afterSX }}></Box>
      </Box>

      <Box sx={{
        display: 'grid',
        gridTemplateColumns: `80px repeat(${sample.length}, auto)`,
        gridTemplateRows: `38px repeat(${cells.length}, 25px)`,
        rowGap: '1px',
        backgroundColor: 'rgb(240,240,240)',
        justifyItems: 'center',
        alignItems: 'center',
        boxSizing: 'border-box',
        position: 'relative',
        margin: '0px auto 8px auto',
        '@media (max-width: 380px)': {
          gridTemplateColumns: `66px repeat(${sample.length}, auto)`,
        }
      }}>
        <Box sx={{ ...HeaderSX, padding: '5px 12px'}}>As of 8am on</Box>
        {dates}

        {cells}
      </Box>
    </>
  );
};

const renderLoading = (numRows: number) => {
  return (
    <Box sx={{
      margin: '8px auto',
      height: 2 + numRows + ((numRows + 1) * 20),
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-end',
      color: 'rgb(187,187,187)'
    }}><CircularProgress color='inherit' /></Box>
  );
};

const renderNoData = (numRows: number) => {
  return (
    <Box sx={{
      margin: '8px auto',
      height: 2 + numRows + ((numRows + 1) * 20),
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-end',
      color: 'rgb(187,187,187)',
      fontStyle: 'italic'
    }}>No Data to Display</Box>
  );
};



export default function DailyChart(props: ChartProps) {
  return (
    <Box sx={{ maxWidth: 730, margin: '0 auto' }}>
      <Typography variant='h5' sx={{ marginLeft: '16px' }}>{props.title}</Typography>

      

      {!props.data ? renderLoading(props.rows.length) :
        (props.data instanceof Array ?
          props.data.length === 0 ? renderNoData(props.rows.length) : renderChart(props.data, props.rows, props.colorizer, props.todayFromAcis)
          :
          props.data['Daily'].length === 0 ? renderNoData(props.rows.length) : renderChart(props.data, props.rows, props.colorizer, props.todayFromAcis))}

      <Box sx={{
        display: 'flex',
        width: '100%',
        justifyContent: 'center',
        marginTop: '22px',
        '@media (max-width: 380px)': {
          marginTop: '12px',
        }
      }}>
        <Box sx={{
          width: 'fit-content',
          display: 'flex',
          border: '1px solid rgb(240,240,240)',
          borderRadius: '5px',
          padding: '6px 12px'
        }}>
          {props.ranges.map(arr => {
            return (
              <Box key={arr[0]} sx={{
                display: 'flex',
                alignItems: 'center',
                margin: '0 6px'
              }}>
                <Box sx={{
                  backgroundColor: arr[1],
                  height: 15,
                  width: 15,
                  borderRadius: 8,
                  marginRight: '3px',
                  '@media (max-width: 380px)': {
                    height: 11,
                    width: 11,
                  }
                }}></Box>
                <Box sx={{
                  fontSize: '16px',
                  '@media (max-width: 380px)': {
                    fontSize: '12px',
                  }
                }}>{arr[0]}</Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}