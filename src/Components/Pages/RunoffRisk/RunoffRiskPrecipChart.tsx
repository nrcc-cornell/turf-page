import React from 'react';
import { format, parse } from 'date-fns';

import Highcharts from 'highcharts/';
import HighchartsReact from 'highcharts-react-official';
import NoDataToDisplay from 'highcharts/modules/no-data-to-display';
import accessibility from 'highcharts/modules/accessibility';
NoDataToDisplay(Highcharts);
accessibility(Highcharts);

type RRPrecipChart = {
  dates: string[],
  swe: number[],
  raim: number[]
};

export default function RunoffRiskPrecipChart(props: RRPrecipChart) {
  const options = {
    chart: {
      borderColor: '#98AFC7',
      borderWidth: 2,
      height: 250,
    },
    series: [{
      type: 'area',
      name: 'Snow Water Equiv Fcst (in)',
      data: props.swe,
      color: '#aed6f1',
      marker: {
        radius: 0
      }
    },{
      type: 'column',
      name: 'Rain+Snowmelt Fcst (in)',
      data: props.raim,
      dataLabels: {
        enabled:true,
        formatter: function(this: Highcharts.TooltipFormatterContextObject){
          return (this.y) ? this.y.toFixed(2) : '';
        }
      },
      color: '#00aa00'
    }],
    xAxis: {
      title: null,
      categories: props.dates.map(s => format(parse(s, 'yyyyMMdd', new Date()), 'dd MMM')),
    },
    yAxis: { 
      labels:{
        enabled:true,
        reserveSpace: false,
        x: 0,
        y: -2,
        align: 'right'
      },
      opposite: true,
      title: { enabled: false },
    },
    legend: {
      enabled: true,
      verticalAlign: 'top',
      itemStyle: {
        'fontSize': '14px'
      }
    },
    title: { text: ''},
    tooltip: { enabled:false },
  };

  return <HighchartsReact
    highcharts={Highcharts}
    options={options}
  />;
}