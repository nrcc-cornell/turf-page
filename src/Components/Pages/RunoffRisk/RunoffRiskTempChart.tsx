import React from 'react';
import { format, parse } from 'date-fns';

import Highcharts from 'highcharts/';
import HighchartsReact from 'highcharts-react-official';
import NoDataToDisplay from 'highcharts/modules/no-data-to-display';
import HighchartsMore from 'highcharts/highcharts-more';
import accessibility from 'highcharts/modules/accessibility';
HighchartsMore(Highcharts);
NoDataToDisplay(Highcharts);
accessibility(Highcharts);

type RRAirtemp = {
  dates: string[],
  mint: number[],
  maxt: number[],
  soil: number[],
};

export default function RunoffRiskTempChart(props: RRAirtemp) {
  const options = {
    chart: {
      borderColor: '#98AFC7',
      borderWidth: 2,
      height: 250,
    },
    series: [
      { 
        type: 'columnrange',
        name: 'Air Temp Range Fcst (°F)',
        data: props.dates.map((_,i) => [props.mint[i], props.maxt[i]]),
        dataLabels: {
          enabled:true,
        },
        color: '#000000'
      },{
        type: 'line',
        name: '2" Soil Temp Fcst (°F)',
        data: props.soil,
        color: '#aaaaaa',
        lineWidth: 3,
        marker: {
          radius: 0
        }
      }
    ],
    title: { text: '' },
    xAxis: {
      title: null,
      categories: props.dates.map(s => format(parse(s, 'yyyyMMdd', new Date()), 'dd MMM')),
    },
    yAxis: {
      labels:{
        enabled:true,
        reserveSpace: false,
        x: -13,
        y: -1
      },
      opposite: true,
      title: { enabled: false },
      plotLines: [{
        value: 32,
        color: '#0000ff',
        dashStyle: 'shortdash',
        width: 2,
        label: {
            text: '32°F'
        }
      }]
    },
    legend: {
      enabled: true,
      verticalAlign: 'top',
      itemStyle: {
        'fontSize': '14px'
      }
    },
    tooltip: { enabled:false },
  };

  return <HighchartsReact
    highcharts={Highcharts}
    options={options}
  />;
}