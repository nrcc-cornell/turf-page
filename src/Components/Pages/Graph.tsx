import React, { useState, useRef, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Box } from '@mui/material';

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
  const [isZoomed, setIsZoomed] = useState(false);

  const resetZoom = () => {
    if (chartComponent && chartComponent.current) {
      chartComponent.current.chart.zoomOut();
    }
  };
  

  console.log(props);

  const options = {
    credits: { enabled: false },
    chart: {
      zoomType: 'x',
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
      text: `Current, Last, and Normal Season ${props.units === 'GDDs' ? 'GDD' : 'Precipitation'} Accumulation`
    },
    series: [{
      type: 'area',
      data: props.normal,
      linkedTo: 'normal',
      threshold: Infinity,
      fillColor: props.units === 'inches' ? 'rgba(52,137,235,0.2)' : 'rgba(231,49,49, 0.15)',
      lineWidth: 0,
      enableMouseTracking: false
    },{
      type: 'line',
      data: props.current.map(arr => [arr[0].slice(0,5), arr[1]]),
      name: props.current.length > 0 ? props.current[0][0].slice(6) : 'Current',
      color: 'rgb(163,41,41)'
    },{
      type: 'line',
      data: props.last.map(arr => [arr[0].slice(0,5), arr[1]]),
      name: props.last.length > 0 ? props.last[0][0].slice(6) : 'Last',
      color: 'rgb(27,155,32)'
    },{
      type: 'area',
      data: props.normal,
      name: 'Normal',
      color: 'black',
      fillColor: props.units === 'inches' ? 'rgba(231,49,49, 0.15)' : 'rgba(52,137,235,0.2)',
      id: 'normal'
    }],
    xAxis: {
      type: 'category'
    },
    yAxis: {
      title: {
        text: props.units[0].toUpperCase() + props.units.slice(1)
      }
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
      marginTop: '20px',
      height: 420,
      width: '100%'
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
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)'
          }}
          onClick={resetZoom}
        >
          Reset zoom
        </StyledButton>
      )}
    </Box>
  );
}