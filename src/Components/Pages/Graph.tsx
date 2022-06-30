/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useState, useRef, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Box } from '@mui/material';
import { format, addDays, subDays } from 'date-fns';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import NoDataToDisplay from 'highcharts/modules/no-data-to-display';
import accessibility from 'highcharts/modules/accessibility';
NoDataToDisplay(Highcharts);
accessibility(Highcharts);
Highcharts.Chart.prototype.showResetZoom = function () { return; };

import StyledButton from './StyledBtn';



export default function Graph(props: GraphDataObj & { units: string }) {
  const chartComponent = useRef<HighchartsReact.RefObject | null>(null);
  const [isZoomed, setIsZoomed] = useState(true);

  const resetZoom = () => {
    if (chartComponent && chartComponent.current) {
      chartComponent.current.chart.zoomOut();
    }
  };

  // Gathers and formats the data for the forecast line segment
  const getForecastData = () => {
    const today = new Date();
    const todayStr = format(today, 'MM-dd-yyyy');
    const todayIdx = props.table[0].findIndex((arr: [string, number]) => arr[0] === todayStr);
    
    let forecastData = props.table[0].slice(todayIdx + 1).map((arr): [string, number] => [arr[0].slice(0,5), arr[1]]);
    
    if (props.units === 'inches') {
      forecastData.pop();
      let sum = props.current[props.current.length - 1][1];
      forecastData = forecastData.map((arr: [string, number]) => {
        sum += arr[1];
        return [arr[0], sum];
      });
    }

    return forecastData;
  };

  const options = {
    credits: { enabled: false },
    chart: {
      zoomType: 'x',
      events: {
        selection: function (e: any) {
          if (e.xAxis) {
            const minIdx = Math.floor(e.xAxis[0].min);
            const maxIdx = Math.ceil(e.xAxis[0].max);
  
            let min = Infinity, max = -Infinity;
            ['current', 'last', 'normal'].forEach(arrName => {
              const data = props[arrName as 'current' | 'last' | 'normal'].slice(minIdx, maxIdx);
              data.forEach((dayArr: StrDateValue) => {
                if (dayArr[1] > max) max = dayArr[1];
                if (dayArr[1] < min) min = dayArr[1];
              });
            });
  
            // @ts-ignore
            this.yAxis[0].setExtremes(Math.max(0, min - 5),max + 5);
          }

          if (e.resetSelection) {
            setIsZoomed(false);
          } else {
            setIsZoomed(true);
          }
        },
        load: function () {
          const today = new Date();
          const now = format(addDays(today, 7), 'MM-dd');
          const lastMonth = format(subDays(today, 30), 'MM-dd');
          
          // @ts-ignore
          const axis = this.xAxis[0];
          const begin = axis.names.findIndex((date: string) => date === lastMonth);
          const end = axis.names.findIndex((date: string) => date === now);

          axis.setExtremes(begin, end);
        }
      }
    },
    title: {
      text: `Current, Last, and Normal Season ${props.units === 'GDDs' ? 'GDD' : 'Precipitation'} Accumulation`
    },
    series: [{
      type: 'area',
      data: props.normal,
      linkedTo: 'normal',
      threshold: Infinity,
      fillColor: props.units === 'inches' ? 'rgba(52,137,235,0.2)' : 'rgba(231,49,49, 0.15)',
      lineWidth: 0,
      enableMouseTracking: false,
      marker: {
        enabled: false
      }
    },{
      type: 'line',
      data: props.current.map(arr => [arr[0].slice(0,5), arr[1]]).concat(),
      name: props.current.length > 0 ? props.current[0][0].slice(6) : 'Current',
      color: 'rgb(163,41,41)',
      zIndex: 3,
      marker: {
        symbol: 'circle',
        radius: 2
      }
    },{
      type: 'line',
      data: getForecastData(),
      name: 'Forecast',
      color: 'rgb(240,164,74)',
      zIndex: 3,
      marker: {
        symbol: 'circle',
        radius: 2
      }
    },{
      type: 'line',
      data: props.last.map(arr => [arr[0].slice(0,5), arr[1]]),
      name: props.last.length > 0 ? props.last[0][0].slice(6) : 'Last',
      color: 'rgb(27,155,32)',
      zIndex: 2,
      marker: {
        symbol: 'circle',
        radius: 2
      }
    },{
      type: 'area',
      data: props.normal,
      name: 'Normal',
      color: 'black',
      fillColor: props.units === 'inches' ? 'rgba(231,49,49, 0.15)' : 'rgba(52,137,235,0.2)',
      id: 'normal',
      zIndex: 1,
      marker: {
        symbol: 'circle',
        radius: 2
      }
    }],
    xAxis: {
      type: 'category'
    },
    yAxis: {
      title: {
        text: props.units[0].toUpperCase() + props.units.slice(1)
      },
      startOnTick: false,
      endOnTick: false
    },
    tooltip: {
      shared: true,
      outside: true,
      split: false,
      useHTML: true,
      formatter: function(this: Highcharts.TooltipFormatterContextObject) {
        if (!this || !this.points) return '';

        const dataElems = this.points.map(p => {
          return (
            <Fragment key={p.series.name}>
              <Box>{p.series.name}</Box>
              <Box style={{ justifySelf: 'right' }}><span style={{ fontWeight: 'bold' }}>{p.y}</span> {props.units}</Box>
            </Fragment>
          );
        });

        return renderToStaticMarkup(<Box style={{
          padding: '0px 6px',
          height: 'fit-content'
        }}>
          <Box style={{ fontSize: '16px', fontWeight: 'bold', textAlign: 'center' }}>{this.points[0].key}</Box>
          
          <Box style={{
            height: '1px',
            width: '85%',
            backgroundColor: 'rgb(239,64,53)',
            margin: '2px auto'
          }} />
          
          <Box style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 50%)',
            gridTemplateRows: `repeat(${this.points.length}, 18px)`,
            gridColumnGap: '3px',
            alignItems: 'center'
          }}>
            {dataElems}
          </Box>
        </Box>);
      }
    }
  };


  return (
    <Box sx={{
      position: 'relative',
      paddingTop: '60px',
      height: 380,
      width: '100%'
    }}>
      {isZoomed && (
        <StyledButton
          sx={{
            position: 'absolute',
            top: 12,
            left: '50%',
            transform: 'translateX(-50%)'
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