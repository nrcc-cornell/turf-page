import React from 'react';
import { v4 as uuid } from 'uuid';

import { Box, Typography } from '@mui/material';

import { convertDate, convertRiskPercToRiskText } from './rrPageUtils';
import { runoffRiskLegendInfo } from './rrOptions';

type RRDailyChart = {
  dates: string[],
  oneDayPercentages: number[],
  threeDayPercentages: number[],
};

const chartSX = {
  margin: '20px auto',
  width: '100%',
  maxWidth: '725px',
  textAlign: 'center'
};

const rowSX = {
  display: 'flex',
};

const headerSX = {
  fontSize: '14px',
  '@media (max-width: 380px)': {
    fontSize: '12px',
  },
};

const cellSX = {
  height: '100%',
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  boxSizing: 'border-box',
  padding: '6px',
  borderTop: '1px solid rgb(240,240,240)',
};

const dateSX = {
  height: '100%',
  width: '100%',
  boxSizing: 'border-box',
  fontSize: '14px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  textAlign: 'center',
  padding: '12px 2px',
  borderTop: '1px solid rgb(240,240,240)',
  '@media (max-width: 380px)': {
    fontSize: '12px',
  },
};

const dotSX = (color: string) => ({
  backgroundColor: color,
  height: 15,
  width: 15,
  borderRadius: '50%',
  '@media (max-width: 380px)': {
    height: 11,
    width: 11,
  },
});

export default function RunoffRiskDailyChart(props: RRDailyChart) {
  const dates = props.dates.map(str => convertDate(str, '-'));
  const oneDayVals = props.oneDayPercentages.map(perc => convertRiskPercToRiskText(perc));
  const threeDayVals = props.threeDayPercentages.map(perc => convertRiskPercToRiskText(perc));

  const headerCell = (text: string, sx?: { [key:string]: string }) => <Box key={uuid()} sx={{...cellSX, borderRight: '1px solid rgb(240,240,240)', flex: '0 0 68px', justifyContent: 'flex-start', ...sx}}><Box sx={headerSX}>{text}</Box></Box>;

  const renderDotRow = (headerText: string, rowData: { color: string, riskText: string }[]) => {
    const firstCell = headerCell(headerText, { padding: '7px 0px' });

    const contentCells = rowData.map(cell => (
      <Box key={uuid()} sx={cellSX}>
        <Box
          sx={dotSX(cell.color)}
        />
      </Box>
    ));

    return [firstCell, ...contentCells];
  };

  const renderDatesRow = (dates: string[]) => {
    const firstCell = headerCell('Dates', { padding: '12px 0px' });
    
    const dateCells = dates.map(date => (
      <Box key={uuid()} sx={dateSX}>
        <Box>
          {date}
        </Box>
      </Box>
    ));

    return [firstCell, ...dateCells];
  };

  const renderLegend = () => {
    return (
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          justifyContent: 'center',
          marginTop: '12px',
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
          {runoffRiskLegendInfo.map(({ color, label }) => {
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
                    backgroundColor: color,
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
                  {label}
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  };

  return <Box sx={chartSX}>
    <Typography variant='h5' sx={{ textAlign: 'center' }}>Runoff Risk Forecasts</Typography>
    <Box sx={rowSX}>{renderDatesRow(dates)}</Box>
    <Box sx={rowSX}>{renderDotRow('Daily Risk', oneDayVals)}</Box>
    <Box sx={rowSX}>{renderDotRow('72-hr Risk', threeDayVals)}</Box>
    {renderLegend()}
  </Box>;
}