import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Box } from '@mui/material';
import { format, addDays } from 'date-fns';

import NoDataToDisplay from 'highcharts/modules/no-data-to-display';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import accessibility from 'highcharts/modules/accessibility';
import xrange from 'highcharts/modules/xrange';
import roundXDigits from '../../Scripts/Rounding';
NoDataToDisplay(Highcharts);
accessibility(Highcharts);
xrange(Highcharts);

Highcharts.setOptions({
  lang: {
    rangeSelectorTo: 'To'
  }
});



export default function SeasonChart(props: SeasonChartProps) {
  let noRiskCount = 0;
  let moderateCount = 0;
  let highCount = 0;
  
  const data = props.data.map((arr, i) => {
    const riskColor = props.colorizer(arr[1], props.thresholds);

    let riskName, riskNumber;
    if (riskColor === 'gold') {
      riskNumber = 1.5;
      riskName = 'Moderate';
      moderateCount++;
    } else if (riskColor === 'rgb(255,0,0)') {
      riskNumber = 2;
      riskName = 'High';
      highCount++;
    } else {
      riskNumber = 1;
      riskName = 'No Risk';
      noRiskCount++;
    }

    const parts = arr[0].split('-');
    const month = parseInt(parts[0]) - 1;
    const day = parseInt(parts[1]);
    const year = parseInt(parts[2]);

    return {
      x: Date.UTC(year, month, day, 0, 0, 0),
      name: riskName,
      y: riskNumber,
      color: riskColor,
      std: {
        low: i === 0 ? '0.0' : roundXDigits(noRiskCount/(i + 1) * 100, 0),
        moderate: i === 0 ? '0.0' : roundXDigits(moderateCount/(i + 1) * 100, 0),
        high: i === 0 ? '0.0' : roundXDigits(highCount/(i + 1) * 100, 0)
      }
    };
  });

  const options = {
    chart: {
      height: 220
    },
    series: [
      {
        type: 'column',
        data,
        showInNavigator: true,
        groupPadding: 0.06,
        pointPadding: 0
      }
    ],
    xAxis: {
      ordinal: false
    },
    yAxis: {
      opposite: false,
      min: 0,
      max: 2,
      tickPositions: [0,0.7,1.2,1.7],
      gridLineWidth: 0,
      showLastLabel: true,
      labels: {
        allowOverlap: true,
        step: 1,
        x: -2,
        y: 3,
        formatter: function(x:any) {
          if (x.value === 0.7) {
            return 'No Risk';
          }

          if (x.value === 1.2) {
            return 'Moderate';
          }

          if (x.value === 1.7) {
            return 'High';
          }

          return '';
        }
      }
    },
    rangeSelector: {
      buttons: [{
        type: 'day',
        count: 9,
        text: '10 days',
        title: 'View 10 days',
      }, {
        type: 'day',
        count: 30,
        text: '30 days',
        title: 'View 30 days',
      }, {
        type: 'all',
        text: 'Season',
        title: 'View Entire Season'
      }],
      buttonSpacing: 3,
      buttonTheme: {
        fill: 'none',
        stroke: 'none',
        'stroke-width': 0,
        r: 8,
        width: 46,
        style: {
          color: '#039',
          fontWeight: 'bold',
        },
        states: {
          hover: {
          },
          select: {
            fill: '#039',
            style: {
              color: 'white'
            }
          }
        }
      },
      inputBoxBorderColor: 'gray',
      inputBoxWidth: 120,
      inputBoxHeight: 18,
      inputStyle: {
        color: '#039',
        fontWeight: 'bold'
      },
      labelStyle: {
        color: 'silver',
        fontWeight: 'bold'
      },
      selected: 0
    },
    navigator: {
      series: {
        type: 'column'
      },
      yAxis: {
        min: 0,
        max: 3
      },
      xAxis: {
        labels: {
          y: -28
        }
      }
    },
    responsive: {
      rules: [{
        chartOptions: {
          rangeSelector: {
            inputBoxBorderColor: 'gray',
            inputBoxWidth: 80,
            inputBoxHeight: 18,
            inputStyle: {
              color: '#039',
              fontWeight: 'bold'
            }
          }
        },
        condition: {
          maxWidth: 465
        }
      },{
        chartOptions: {
          rangeSelector: {
            buttonPosition: {
              x: -40
            }
          }
        },
        condition: {
          maxWidth: 350
        }
      }]
    },
    tooltip: {
      outside: true,
      split: false,
      useHTML: true,
      formatter: function(this: Highcharts.TooltipFormatterContextObject) {
        try {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore - appeasing ts, the try-catch will handle errors
          const std = this.point.options.std;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore - appeasing ts, the try-catch will handle errors
          const risk = this.key;
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore - appeasing ts, the try-catch will handle errors
          const date = format(addDays(new Date(this.x), 1), 'MMM do, yyyy');

          return renderToStaticMarkup(<Box style={{
            padding: '6px'
          }}>
            <Box style={{ fontSize: '16px', fontWeight: 'bold', textAlign: 'center' }}>{risk}</Box>
            
            <Box style={{
              height: '1px',
              width: '85%',
              backgroundColor: 'rgb(239,64,53)',
              margin: '2px auto'
            }} />
            
            <Box style={{
              fontStyle: 'italic',
              fontSize: '10px',
              textAlign: 'center'
            }}>{date}</Box>
            
            <Box style={{
              margin: '12px auto 4px auto',
              fontWeight: 'bold'
            }}>Season to Date</Box>
            
            <Box style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 50%)',
              gridTemplateRows: 'repeat(3, 18px)',
              alignItems: 'center'
            }}>
              <Box>No Risk</Box>
              <Box style={{ justifySelf: 'right', width: 'fit-content' }}><span style={{ fontWeight: 'bold' }}>{std.low}</span>%</Box>
              <Box>Moderate</Box>
              <Box style={{ justifySelf: 'right' }}><span style={{ fontWeight: 'bold' }}>{std.moderate}</span>%</Box>
              <Box>High</Box>
              <Box style={{ justifySelf: 'right' }}><span style={{ fontWeight: 'bold' }}>{std.high}</span>%</Box>
            </Box>
          </Box>);
        } catch {
          return 'Error';
        }
      }
    }
  };

  return (
    <Box sx={{
      width: 'calc(100% - 8px)',
      height: 220,
      '@media (max-width: 360px)': {
        width: '100%'
      }
    }}>
      <HighchartsReact
        highcharts={Highcharts}
        constructorType={'stockChart'}
        options={options}
      />
    </Box>
  );
}