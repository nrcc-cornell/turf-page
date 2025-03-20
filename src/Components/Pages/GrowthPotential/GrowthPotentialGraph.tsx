/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useRef, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Box } from '@mui/material';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import NoDataToDisplay from 'highcharts/modules/no-data-to-display';
import accessibility from 'highcharts/modules/accessibility';
NoDataToDisplay(Highcharts);
accessibility(Highcharts);
Highcharts.Chart.prototype.showResetZoom = function () {
  return;
};

import { GrowthPotentialModelOutput } from './GrowthPotentialPage';
import StyledButton from '../../StyledBtn';

const PLOT_BAND_COLORS = ['0,128,0', '255,255,0', '255,0,0'];
const PLOT_BAND_LABELS = ['High Growth', 'Moderate Growth', 'Low Growth'];
const PLOT_LINE_LABELS = ['', '', ''];

const colorPoints = (bounds: number[], values: (number | null)[]) => {
  return values.map(value => {
    let color = 'transparent';
    if (value !== null) {
      for (let i = 0; i < bounds.length; i++) {
        const bound = bounds[i];
        if (value >= bound && PLOT_BAND_COLORS[i]) {
          color = `rgba(${PLOT_BAND_COLORS[i]},0.8)`;
          break;
        } else if (i === bounds.length - 1) {
          color = `rgba(${PLOT_BAND_COLORS[i + 1]},0.8)`;
        }
      }
    }
    return {
      color,
      y: value
    };
  });
};

const getPlotBandsLinesBreakpoints = (todayValue: number|null, breakpoints: number[], ) => {
  const plotBands = breakpoints.map((bp, i) => {
    const high = breakpoints[i - 1] === undefined ? 100 : breakpoints[i - 1];
    const low = i === breakpoints.length - 1 ? 0 : bp;
    const todayInBand = todayValue === null ? false : low <= todayValue && todayValue < high;

    return {
      to: high,
      from: low,
      color: `rgba(${PLOT_BAND_COLORS[i]},0.13)`,
      label: {
        text: PLOT_BAND_LABELS[i] || '',
        style: {
          fontSize: '1.0em',
          color: todayInBand ? 'black' : 'gray',
          fontWeight: todayInBand ? 'bold' : 'lighter',
        },
        align: 'left',
        verticalAlign: 'middle',
        x: 10,
        y: 5
      }
    };
  });
  
  breakpoints.pop();
  
  const plotLines = breakpoints.map((bp, i) => ({
    value: bp,
    width: 1.0,
    color: 'rgba(200,200,200,0.5)',
    label: {
      text: PLOT_LINE_LABELS[i] || '',
      style: {
          fontSize: '0.8em',
          color: 'gray',
          fontWeight: 'lighter',
      },
      align: 'right',
      x: -4,
      y: 8
    }
  }));

  return { plotBands, plotLines, breakpoints };
};

export default function GrowthPotentialGraph(props: {
  modelResults: GrowthPotentialModelOutput | null;
  thresholds: number[];
  todayIdx: number|null;
  today: Date
}) {
  const chartComponent = useRef<HighchartsReact.RefObject | null>(null);
  const [isZoomed, setIsZoomed] = useState(true);

  const resetZoom = () => {
    if (chartComponent && chartComponent.current) {
      chartComponent.current.chart.zoomOut();
    }
  };


  let breakpoints = [...props.thresholds];
  breakpoints.reverse();
  let series;
  let plotBands;
  let plotLines;
  let datesConverted: string[] = [];
  if (props.modelResults !== null) {
    datesConverted = props.modelResults.dates.map(
      (date: string) => date.slice(4, 6) + '-' + date.slice(6)
    );
    
    const lastObservedIdx = props.todayIdx === null ? props.modelResults.values.length - 1 : props.todayIdx;

    ({ plotLines, plotBands, breakpoints } = getPlotBandsLinesBreakpoints(props.modelResults.values[lastObservedIdx], breakpoints));
    
    const observed = colorPoints(breakpoints, props.modelResults.values.slice(0,lastObservedIdx + 1).concat(Array(props.modelResults.values.length - (lastObservedIdx + 1)).fill(null)));
    const forecasted = colorPoints(breakpoints, Array(lastObservedIdx + 1).fill(null).concat(props.modelResults.values.slice(lastObservedIdx + 1)));

    series = [
      {
        data: observed,
        name: 'Observed',
        id: 'Observed',
        zIndex: 2,
        color: 'black',
        marker: {
          enabledThresold: 0,
          lineColor: 'black',
          lineWidth: 1,
          symbol: 'circle',
          radius: 3
        }
      },
      {
        data: forecasted,
        name: 'Forecast',
        id: 'Forecast',
        zIndex: 2,
        color: 'black',
        dashStyle: 'ShortDot',
        marker: {
          enabledThresold: 0,
          lineColor: 'black',
          lineWidth: 1,
          symbol: 'circle',
          radius: 3
        }
      },
    ];
  } else {
    series = null;
  }

  const options = {
    credits: { enabled: false },
    plotOptions: {
      line: {
        marker: {
          symbol: 'circle',
          radius: 3,
          enabled: true
        },
      },
    },
    legend: {
      enabled: false
    },
    chart: {
      type: 'line',
      zoomType: 'x',
      events: {
        selection: function (e: any) {
          setIsZoomed(e.resetSelection ? false : true);
        },
        load: function () {
          // @ts-ignore
          const axis = this.xAxis[0];
          axis.setExtremes(Math.max(axis.categories.length - 30, 0), axis.categories.length - 1);
        }
      },
      plotBorderWidth: 1,
      spacingBottom: 17,
      spacingTop: 5
    },
    title: {
      text: `Growth Potential Estimates for ${props.today.getFullYear()}`,
    },
    series,
    xAxis: {
      categories: datesConverted,
    },
    yAxis: {
      min: 0,
      max: 100,
      gridLineWidth: 0,
      title: { text: 'Growth Potential (%)' },
      plotBands,
      plotLines
    },
    tooltip: {
      outside: true,
      useHTML: true,
      formatter: function (this: Highcharts.TooltipFormatterContextObject) {
        if (!this || !this.point) return '';

        return renderToStaticMarkup(
          <Box
            style={{
              padding: '0px 6px',
              height: 'fit-content',
            }}
          >
            <Box
              style={{
                fontSize: '16px',
                fontWeight: 'bold',
                textAlign: 'center',
              }}
            >
              {this.key}
            </Box>

            <Box
              style={{
                height: '1px',
                width: '85%',
                backgroundColor: 'rgb(239,64,53)',
                margin: '2px auto',
              }}
            />

            <Box
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 50%)',
                gridTemplateRows: `repeat(1, 18px)`,
                gridColumnGap: '3px',
                alignItems: 'center',
              }}
            >
              <Box>{this.series.name}</Box>
              <Box style={{ justifySelf: 'right' }}>
                <span style={{ fontWeight: 'bold' }}>{this.y}</span>%
              </Box>
            </Box>
          </Box>
        );
      },
    },
  };

  return (
    <Box
      sx={{
        position: 'relative',
        height: 400,
        width: '100%',
        paddingBottom: isZoomed ? '20px' : '0px'
      }}
    >
      {isZoomed && (
        <StyledButton
          sx={{
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1
          }}
          onClick={resetZoom}
        >
          Reset zoom
        </StyledButton>
      )}

      <HighchartsReact ref={chartComponent} highcharts={Highcharts} options={options} />
    </Box>
  );
}
