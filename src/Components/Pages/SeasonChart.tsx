import React, { useState, useRef } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Box } from '@mui/material';
import { format, addDays } from 'date-fns';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HC_more from 'highcharts/highcharts-more';
import NoDataToDisplay from 'highcharts/modules/no-data-to-display';
import accessibility from 'highcharts/modules/accessibility';
HC_more(Highcharts);
NoDataToDisplay(Highcharts);
accessibility(Highcharts);
Highcharts.Chart.prototype.showResetZoom = function () { return; };

import roundXDigits from '../../Scripts/Rounding';
import StyledButton from './StyledBtn';



export default function SeasonChart(props: SeasonChartProps) {
  const chartComponent = useRef<HighchartsReact.RefObject | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  
  const resetZoom = () => {
    if (chartComponent && chartComponent.current) {
      chartComponent.current.chart.zoomOut();
    }
  };


  let noRiskCount = 0;
  let moderateCount = 0;
  let highCount = 0;

  const data = props.data.map((arr, i) => {
    const riskColor = props.colorizer(arr[1], props.thresholds);

    let riskName;
    if (riskColor === 'rgb(255,215,0)') {
      riskName = 'Moderate';
      moderateCount++;
    } else if (riskColor === 'rgb(255,0,0)') {
      riskName = 'High';
      highCount++;
    } else {
      riskName = 'No Risk';
      noRiskCount++;
    }

    return {
      x: new Date(arr[0]).getTime() - 1,
      y: 0,
      z: Math.max(0, arr[1]),
      name: riskName,
      color: riskColor,
      std: {
        low: i === 0 ? '0.0' : roundXDigits(noRiskCount/(i + 1) * 100, 0),
        moderate: i === 0 ? '0.0' : roundXDigits(moderateCount/(i + 1) * 100, 0),
        high: i === 0 ? '0.0' : roundXDigits(highCount/(i + 1) * 100, 0)
      }
    };
  });

  const options = {
    credits: { enabled: false },
    chart: {
      height: 70,
      zoomType: 'x',
      spacingTop: 18,
      spacingBottom: 2,
      spacingRight: 0,
      spacingLeft: 0,
      resetZoomButton: {
        position: {
          y: -20
        },
        theme: {
          style: {
            width: '20px'
          }
        }
      },
      events: {
        selection: function (e: any) {
          if (e.resetSelection) {
            setIsZoomed(false);
          } else {
            setIsZoomed(true);
          }
        }
      }
    },
    title: {
      text: 'Season to Date Estimates',
      floating: true,
      y: -3
    },
    series: [
      {
        type: 'bubble',
        data,
        marker: {
          fillOpacity: 0.75,
          lineWidth: 0
        },
        maxSize: '75%'
      }
    ],
    legend: {
      enabled: false
    },
    xAxis: {
      type: 'datetime',
      lineWidth: 1
    },
    yAxis: {
      labels: {
        enabled: false
      },
      title: {
        enabled: false
      },
      gridLineWidth: 0
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
            <Box style={{ fontSize: '14px', textAlign: 'center', marginBottom: '3px' }}>{roundXDigits(this.point.options.z ? this.point.options.z : 0, 2)}</Box>
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
      position: 'relative',
      width: 'calc(100% - 8px)',
      marginTop: '20px',
      height: 70,
      '@media (max-width: 360px)': {
        width: '100%'
      }
    }}>
      <HighchartsReact
        ref={chartComponent}
        highcharts={Highcharts}
        options={options}
      />

      {isZoomed && (
        <StyledButton
          sx={{
            position: 'absolute',
            bottom: -38,
            right: '50%',
            transform: 'translateX(50%)'
          }}
          onClick={resetZoom}
        >
          Reset zoom
        </StyledButton>
      )}
    </Box>
  );
}