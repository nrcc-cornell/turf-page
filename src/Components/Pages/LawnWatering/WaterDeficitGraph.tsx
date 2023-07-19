/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useState, useRef, Fragment } from 'react';
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

import StyledButton from '../../StyledBtn';
import { SoilMoistureOptionLevel, SOIL_DATA } from '../../../Scripts/waterDeficitModel';
import roundXDigits from '../../../Scripts/Rounding';

type WaterDeficitGraphProps = {
  dates: string[];
  deficits: number[];
  soilCap: SoilMoistureOptionLevel;
  todayIdx: number;
  today: Date;
  lastIrrigation: string | null;
};

const GRAPH_MINS = {
  'low': -1.5,
  'medium': -2.0,
  'high': -2.5
};

const PLOT_BAND_COLORS = ['0,128,0', '255,255,0', '255,128,0', '255,0,0'];
const PLOT_BAND_LABELS = ['No deficit for plant', 'Deficit, no plant stress', 'Deficit, plant stress likely', 'Deficit, severe plant stress'];
const PLOT_LINE_LABELS = ['Saturation', 'Field Capacity', 'Plant Stress Begins', 'WIlting Danger Exists'];

const colorPoints = (breakpoints: number[], values: (number | null)[]) => {
  const bounds = [...breakpoints].reverse();
  const reversedColors = [...PLOT_BAND_COLORS].reverse();
  return values.map(value => {
    let color = 'transparent';
    if (value !== null) {
      for (let i = 0; i < bounds.length; i++) {
        const bound = bounds[i];
        if (value < bound && reversedColors[i]) {
          color = `rgba(${reversedColors[i]},0.8)`;
          break;
        }
      }
    }
    return {
      color,
      y: value
    };
  });
};

const getPlotBandsLinesBreakpoints = (todayDeficit: number, soilCap: SoilMoistureOptionLevel, ) => {
  const soilConstants = SOIL_DATA.soilmoistureoptions.lawn[soilCap];

  const breakpoints = [
    soilConstants.saturation - soilConstants.fieldcapacity,
    soilConstants.fieldcapacity - soilConstants.fieldcapacity,
    soilConstants.stressthreshold - soilConstants.fieldcapacity,
    soilConstants.prewiltingpoint - soilConstants.fieldcapacity
  ];
  
  const plotLines = [];
  const plotBands = [];
  for (let i = 0; i < breakpoints.length; i++) {
    const high = breakpoints[i] === undefined ? 99 : breakpoints[i];
    const low = breakpoints[i + 1] === undefined ? -99 : breakpoints[i + 1];
    const todayInBand = low <= todayDeficit && todayDeficit < high;

    plotBands.push({
      to: high,
      from: low,
      color: PLOT_BAND_COLORS[i] && todayInBand ? `rgba(${PLOT_BAND_COLORS[i]},0.5)` : 'transparent',
      label: {
        text: PLOT_BAND_LABELS[i] || '',
        style: {
          fontSize: '1.2em',
          color: todayInBand ? 'black' : 'gray',
          fontWeight: todayInBand ? 'bold' : 'lighter',
        },
        align: 'left',
        verticalAlign: 'middle',
        x: 10,
        y: 5
      }
    });

    plotLines.push({
      value: high,
      width: 1.0,
      color: '#808080',
      label: {
        text: PLOT_LINE_LABELS[i] || '',
        style: {
            fontSize: '0.8em',
            color: todayInBand ? 'black' : 'gray',
            fontWeight: todayInBand ? 'bold' : 'lighter',
        },
        align: 'right',
        x: -4,
        y: 12
      }
    });
  }

  return { plotBands, plotLines, breakpoints };
};

export default function WaterDeficitGraph(props: WaterDeficitGraphProps) {
  const chartComponent = useRef<HighchartsReact.RefObject | null>(null);
  const [isZoomed, setIsZoomed] = useState(true);

  const resetZoom = () => {
    if (chartComponent && chartComponent.current) {
      chartComponent.current.chart.zoomOut();
    }
  };

  const { plotLines, plotBands, breakpoints }  = getPlotBandsLinesBreakpoints(props.deficits[props.todayIdx], props.soilCap);
  const observedDeficits = colorPoints(breakpoints, props.deficits.slice(0,props.todayIdx + 1).concat(Array(props.deficits.length - (props.todayIdx + 1)).fill(null)));
  const forecastedDeficits = colorPoints(breakpoints, Array(props.todayIdx + 1).fill(null).concat(props.deficits.slice(props.todayIdx + 1)));
  const irrigationIdx = props.lastIrrigation ? props.dates.findIndex(d => d === props.lastIrrigation?.slice(5)) : null;

  const options = {
    credits: {
      href: 'https://www.nrcc.cornell.edu/',
      text: 'Northeast Regional Climate Center',
      position: {
        y: -4
      }
    },
    chart: {
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
      spacingTop: 0
    },
    title: {
      text: `Water Deficit for ${props.today.getFullYear()}`
    },
    series: [
      {
        type: 'line',
        data: observedDeficits,
        name: 'Observed',
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
        type: 'line',
        data: forecastedDeficits,
        name: 'Forecast',
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
      }
    ],
    legend: {
      enabled: false
    },
    xAxis: {
      categories: props.dates,
      plotLines: [{
        color: 'rgba(0,0,255,0.5)',
        width: 2,
        dashStyle: 'dash',
        value: irrigationIdx,
        label: {
            text: 'Irrigation',
            rotation: 90,
            y: 10,
        },
        zIndex: 1
      }]
    },
    yAxis: {
      title: {
        text: 'Water Deficit (in/ft soil)',
      },
      max: 0.5,
      min: GRAPH_MINS[props.soilCap],
      tickInterval: 0.5,
      gridLineWidth : 0,
      plotBands,
      plotLines
    },
    tooltip: {
      shared: true,
      outside: true,
      split: false,
      useHTML: true,
      formatter: function (this: Highcharts.TooltipFormatterContextObject) {
        if (!this || !this.points) return '';

        const dataElems = this.points.map((p) => {
          return (
            <Fragment key={p.series.name}>
              <Box>{p.series.name}</Box>
              <Box style={{ justifySelf: 'right' }}>
                <span style={{ fontWeight: 'bold' }}>{p.y ? roundXDigits(p.y, 2) : ''}</span> in
              </Box>
            </Fragment>
          );
        });

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
              {this.points[0].key}
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
                gridTemplateRows: `repeat(${this.points.length}, 18px)`,
                gridColumnGap: '3px',
                alignItems: 'center',
              }}
            >
              {dataElems}
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

      <HighchartsReact
        ref={chartComponent}
        highcharts={Highcharts}
        options={options}
      />
    </Box>
  );
}