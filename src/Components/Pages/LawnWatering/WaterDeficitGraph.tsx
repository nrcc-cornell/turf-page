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
  irrigationDates: string[];
};

const PLOT_BAND_COLORS = ['0,128,0', '255,255,0', '255,0,0'];
const PLOT_BAND_LABELS = ['No water necessary', 'Deficit, minor plant stress', 'Deficit, severe plant stress'];
const PLOT_LINE_LABELS = ['Saturation', 'Field Capacity', 'Plant Stress Begins', 'Wilting Danger Exists'];

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

const getPlotBandsLinesBreakpoints = (todayDeficit: number, soilCap: SoilMoistureOptionLevel, ) => {
  const soilConstants = SOIL_DATA.soilmoistureoptions[soilCap];

  const breakpoints = [
    roundXDigits(soilConstants.saturation - soilConstants.stressthreshold, 3),
    roundXDigits(soilConstants.fieldcapacity - soilConstants.stressthreshold, 3),
    roundXDigits(soilConstants.stressthreshold - soilConstants.stressthreshold, 3),
    roundXDigits(soilConstants.prewiltingpoint - soilConstants.stressthreshold, 3)
  ];

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

  breakpoints.shift();

  const plotBands = breakpoints.map((bp, i) => {
    const high = i === 0 ? 99 : bp;
    const low = breakpoints[i + 1] === undefined ? -99 : breakpoints[i + 1];
    const todayInBand = low <= todayDeficit && todayDeficit < high;

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

  breakpoints.shift();

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

  // Shift deficits to have stress threshold be 0 on the new scale (instead of field capacity as is output from the model)
  const adjustment = SOIL_DATA.soilmoistureoptions[props.soilCap].fieldcapacity - SOIL_DATA.soilmoistureoptions[props.soilCap].stressthreshold;
  const adjustedDeficits = props.deficits.map(val => val + adjustment);
  const defMin = Math.min(...adjustedDeficits) - 0.1;
  const defMax = Math.max(...adjustedDeficits) + 0.1;

  const { plotLines, plotBands, breakpoints }  = getPlotBandsLinesBreakpoints(adjustedDeficits[props.todayIdx], props.soilCap);
  const observedDeficits = colorPoints(breakpoints, adjustedDeficits.slice(0,props.todayIdx + 1).concat(Array(adjustedDeficits.length - (props.todayIdx + 1)).fill(null)));
  const forecastedDeficits = colorPoints(breakpoints, Array(props.todayIdx + 1).fill(null).concat(adjustedDeficits.slice(props.todayIdx + 1)));
  const irrigationIdxs = props.irrigationDates.length > 0 ? props.irrigationDates.map(irriDate => props.dates.findIndex(d => d === irriDate?.slice(5))) : [];

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
    plotOptions: {
      series: {
        marker: {
          enabled: true
        }
      }
    },
    title: {
      text: `Lawn Water Deficit for ${props.today.getFullYear()}`
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
      plotLines: irrigationIdxs.map(idx => ({
        color: 'rgba(0,0,255,0.5)',
        width: 2,
        dashStyle: 'dash',
        value: idx,
        label: {
            text: 'Irrigation',
            rotation: 90,
            y: 10,
        },
        zIndex: 1
      }))
    },
    yAxis: {
      title: {
        text: 'Water Deficit (in water/6in soil)',
      },
      max: defMax,
      min: defMin,
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
                <span style={{ fontWeight: 'bold' }}>{typeof p.y === 'number' ? roundXDigits(p.y, 2) : ''}</span> in
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