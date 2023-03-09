import React from 'react';
import { format, parse } from 'date-fns';

import Highcharts from 'highcharts/';
import HighchartsReact from 'highcharts-react-official';
import NoDataToDisplay from 'highcharts/modules/no-data-to-display';
import accessibility from 'highcharts/modules/accessibility';
NoDataToDisplay(Highcharts);
accessibility(Highcharts);

import { convertRiskPercToColumn } from './rrPageUtils';

type RRColumnChart = {
  dates: string[],
  percentages: number[]
};

export default function RunoffRiskColumnChart(props: RRColumnChart) {
  console.log(props);
  
  const options = {
    chart: {
      borderColor: '#98AFC7',
      borderWidth: 2,
      alignTicks:false,
      height: 225,
    },
    series: [
      { 
        data: props.percentages.map((perc, i) => convertRiskPercToColumn(perc, i)),
        type: 'column',
        dataLabels: {
          enabled:true,
          inside:true,
        },
      },
    ],
    title: { text: null},
    xAxis: {
      title: { text: '*NRE: Little/No Runoff Expected' },
      categories: props.dates.map(s => format(parse(s, 'yyyyMMdd', new Date()), 'dd MMM')),
    },
    yAxis: { 
      title:null, max:4, min:0, labels:{ enabled:false }, tickInterval: 1,
    },
    legend: { enabled:false },
    tooltip: { enabled:false },
  };

  return <HighchartsReact
    highcharts={Highcharts}
    options={options}
  />;
}