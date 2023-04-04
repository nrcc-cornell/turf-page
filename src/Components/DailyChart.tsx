import React from 'react';
import { v4 as uuid } from 'uuid';

import { Typography, Box, CircularProgress } from '@mui/material';

import { format } from 'date-fns';

export type StringRow = { 
  rowName: string;
  type: 'dots' | 'dates';
  data: string[];
};

export type NumberRow = { 
  rowName: string;
  type: 'numbers';
  data: number[];
};

export type DailyChartProps = {
  data: (NumberRow | StringRow)[];
  todayFromAcis: boolean;
  title: string;
  numRows: number;
  legend?: string[][];
};


const dateSX = (i: number, isLineOnRight: boolean) => ({
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
  borderRight: isLineOnRight ? '3px solid rgb(230,230,230)' : 'none',
  '@media (max-width: 593px)': {
    borderLeft: i === 0 ? 'none' : '1px solid rgb(240,240,240)',
  },
  '@media (max-width: 380px)': {
    fontSize: '12px',
  },
});

const HeaderSX = {
  backgroundColor: 'white',
  height: '100%',
  width: '100%',
  padding: '5px 2px',
  textAlign: 'center',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  boxSizing: 'border-box',
  fontSize: '14px',
  borderRight: '1px solid rgb(240,240,240)',
  '@media (max-width: 380px)': {
    fontSize: '12px',
  },
};

const cellSX = (isLineOnRight: boolean) => ({
  height: '100%',
  width: '100%',
  backgroundColor: 'white',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  fontWeight: 'bold',
  boxSizing: 'border-box',
  borderRight: isLineOnRight ? '3px solid rgb(230,230,230)' : 'none',
  '@media (max-width: 545px)': {
    fontSize: '12px',
  },
  '@media (max-width: 465px)': {
    fontSize: '10px',
  },
});

const renderObservationForecastDivider = (obsSpan: number, foreSpan: number) => {
  const lineSX = (isLeft: boolean) => ({
    width: '20px',
    height: '2px',
    backgroundColor: 'rgb(200,200,200)',
    margin: '0px 6px',
    position: 'absolute',
    top: 8,
    zIndex: 1,
    [isLeft ? 'right' : 'left']: isLeft ? 55 : 52,
  });

  const arrowSX = {
    content: '""',
    height: 6,
    width: 6,
    position: 'absolute',
    top: -3,
    transform: 'rotate(45deg)',
  };

  const beforeSX = {
    '&::before': {
      ...arrowSX,
      borderLeft: '2px solid rgb(200,200,200)',
      borderBottom: '2px solid rgb(200,200,200)',
      left: 0,
    },
  };

  const afterSX = {
    '&::after': {
      ...arrowSX,
      borderRight: '2px solid rgb(200,200,200)',
      borderTop: '2px solid rgb(200,200,200)',
      right: 0,
    },
  };

  return (
    <>
      <Box sx={{
        gridColumnStart: `span ${obsSpan}`,
        borderRight: '3px solid rgb(230,230,230)',
        textAlign: 'right',
        width: '100%',
        boxSizing: 'border-box',
        paddingRight: '4px',
        backgroundColor: 'white',
        position: 'relative'
      }}>
        <Box sx={{ ...lineSX(true), ...beforeSX }} />
        <Typography variant='underChart'>Observed</Typography>
      </Box>
      
      <Box sx={{
        gridColumnStart: `span ${foreSpan}`,
        textAlign: 'left',
        width: '100%',
        boxSizing: 'border-box',
        paddingLeft: '5px',
        backgroundColor: 'white',
        position: 'relative'
      }}>
        <Typography variant='underChart'>Forecast</Typography>
        <Box sx={{ ...lineSX(false), ...afterSX }} />
      </Box>
    </>
  );
};

const renderDatesRow = (name:string, data: string[], idx: number) => {
  const dates = data.map((str, i) => (
    <Box key={uuid()} sx={dateSX(i, i === idx)}>
      <Box
        sx={{
          width: 'fit-content',
          '@media (max-width: 650px)': {
            fontSize: '12px',
          },
          '@media (max-width: 485px)': {
            wordWrap: 'break-word',
            width: '20px'
          },
        }}
      >
        {str}
      </Box>
    </Box>
  ));

  return [<Box key={uuid()} sx={{ ...HeaderSX, padding: '5px 12px' }}>{name}</Box>].concat(dates);
};

const renderNumbersRow = (name:string, data: number[], idx: number) => {
  const cells = data.map((value, i) => {
    return (
      <Box
        key={uuid()}
        sx={{
          ...cellSX(i === idx),
          borderLeft: i === 0 ? 'none' : '1px solid rgb(240,240,240)',
        }}
      >
        {value}
      </Box>
    );
  });

  return [<Box key={uuid()} sx={{ ...HeaderSX, padding: '5px 12px' }}>{name}</Box>].concat(cells);
};

const renderDotsRow = (name:string, data: string[], idx: number) => {
  const dots = data.map((value, i) => {
    return (
      <Box key={uuid()} sx={cellSX(i === idx)}>
        <Box
          sx={{
            backgroundColor: value,
            height: 15,
            width: 15,
            borderRadius: '50%',
            '@media (max-width: 380px)': {
              height: 11,
              width: 11,
            },
          }}
        />
      </Box>
    );
  });

  return [<Box key={uuid()} sx={{ ...HeaderSX, padding: '5px 12px' }}>{name}</Box>].concat(dots);
};

const renderChart = (rows: (NumberRow | StringRow)[], todayFromAcis: boolean) => {
  const numRows = rows.length;
  const numCols = rows[0].data.length;

  const todayStr = format(new Date(), 'MM-dd');
  const iOfToday = rows[0].data.findIndex((date) => date === todayStr);
  const iOfDivider = iOfToday + (todayFromAcis ? 1 : 0);

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `81px repeat(${numCols}, calc((100% - 80px) / ${numCols}))`,
        gridTemplateRows: `16px 38px repeat(${numRows - 1}, 25px)`,
        rowGap: '1px',
        backgroundColor: 'rgb(240,240,240)',
        justifyItems: 'center',
        alignItems: 'center',
        boxSizing: 'border-box',
        position: 'relative',
        margin: '0px auto 8px auto',
        '@media (max-width: 380px)': {
          gridTemplateColumns: `67px repeat(${numCols}, calc((100% - 66px) / ${numCols}))`,
        },
      }}
    >
      {renderObservationForecastDivider(iOfDivider + 1, numCols - iOfDivider)}

      {rows.map(row => {
        if (row.type === 'dates') {
          return renderDatesRow(row.rowName, row.data, iOfDivider - 1);
        } else if (row.type === 'numbers') {
          return renderNumbersRow(row.rowName, row.data, iOfDivider - 1);
        } else if (row.type === 'dots') {
          return renderDotsRow(row.rowName, row.data, iOfDivider - 1);
        }
      })}
    </Box>
  );
};

const renderNotChart = (numRows: number, a: 'loading' | 'empty') => {
  return (
    <Box
      sx={{
        margin: '8px auto',
        height: 2 + numRows + (numRows + 1) * 20,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        color: 'rgb(187,187,187)',
        fontStyle: 'italic',
      }}
    >
      {a === 'loading' ? (
        <CircularProgress color='inherit' />
      ) : (
        'No Data to Display'
      )}
    </Box>
  );
};

const renderLegend = (legendItems: string[][]) => {
  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        justifyContent: 'center',
        marginTop: '22px',
        '@media (max-width: 380px)': {
          marginTop: '12px',
        },
      }}
    >
      <Box
        sx={{
          width: 'fit-content',
          display: 'flex',
          border: '1px solid rgb(240,240,240)',
          borderRadius: '5px',
          padding: '6px 12px',
        }}
      >
        {legendItems.map((arr) => {
          return (
            <Box
              key={uuid()}
              sx={{
                display: 'flex',
                alignItems: 'center',
                margin: '0 6px',
              }}
            >
              <Box
                sx={{
                  backgroundColor: arr[1],
                  height: 15,
                  width: 15,
                  borderRadius: 8,
                  marginRight: '3px',
                  '@media (max-width: 380px)': {
                    height: 11,
                    width: 11,
                  },
                }}
              ></Box>
              <Box
                sx={{
                  fontSize: '16px',
                  '@media (max-width: 380px)': {
                    fontSize: '12px',
                  },
                }}
              >
                {arr[0]}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default function DailyChart(props: DailyChartProps) {
  if (!props.data) {
    return renderNotChart(props.numRows, 'loading');
  } else if (props.data.length === 0) {
    return renderNotChart(props.numRows, 'empty');
  }

  return (
    <Box sx={{ maxWidth: 730, margin: '0 auto' }}>
      <Typography variant='h5' sx={{ marginLeft: '16px' }}>
        {props.title}
      </Typography>

      {renderChart(props.data, props.todayFromAcis)}

      {props.legend !== undefined && renderLegend(props.legend)}
    </Box>
  );
}
