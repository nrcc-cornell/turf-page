import React from 'react';
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

import { ModelOutput } from './GrowthPotentialPage';

const thresholdTexts = ['Low Growth', 'Moderate', 'High'];
const thresholdColors = [
  'rgba(104, 227, 82, 0.13)',
  'rgba(222, 227, 82, 0.13)',
  'rgba(228, 111, 82, 0.13)',
];

export default function GrowthPotentialGraph(props: {
  modelResults: ModelOutput | null;
  thresholds: number[];
}) {
  const todayIdx = 5;
  let series;
  let datesConverted: string[] = [];
  if (props.modelResults !== null) {
    const nullArray = Array(6).fill(null);
    datesConverted = props.modelResults.dates.map(
      (date: string) => date.slice(4, 6) + '-' + date.slice(6)
    );
    const modelValues = props.modelResults.values.map((v, i) => [
      datesConverted[i],
      v,
    ]);

    series = [
      // { data: modelValues },
      {
        data: modelValues.slice(0, todayIdx).concat(nullArray),
        name: 'Observed',
        color: 'rgb(163,41,41)',
        id: 'Observed',
      },
      {
        data: nullArray
          .slice(1)
          .concat([modelValues[todayIdx]])
          .concat(nullArray.slice(1)),
        name: 'Today',
        color: 'rgb(163,41,41)',
        id: 'Today',
        marker: {
          symbol: 'diamond',
          radius: 6,
          lineWidth: 1,
        },
      },
      {
        data: nullArray.concat(modelValues.slice(todayIdx + 1)),
        name: 'Forecast',
        color: 'rgb(163,41,41)',
        dashStyle: 'Dash',
        id: 'Forecast',
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
        },
      },
    },
    chart: {
      type: 'line',
    },
    title: {
      floating: true,
      text: '',
    },
    series,
    xAxis: {
      type: 'category',
      categories: datesConverted,
    },
    yAxis: {
      min: 0,
      max: 100,
      gridLineWidth: 0,
      title: { text: 'Growth Potential (%)' },
      plotBands: props.thresholds.map((val, i) => {
        let lower, upper;
        if (i === props.thresholds.length - 1) {
          lower = val;
          upper = 100;
        } else {
          lower = val;
          upper = props.thresholds[i + 1];
        }

        return {
          from: lower,
          to: upper,
          color: thresholdColors[i],
          label: {
            text: thresholdTexts[i],
            style: {
              fontSize: 10,
              color: 'rgb(150,150,150)',
            },
          },
        };
      }),
    },
    tooltip: {
      outside: true,
      useHTML: true,
      formatter: function (this: Highcharts.TooltipFormatterContextObject) {
        if (!this || !this.point) return '';

        let when = 'Today';
        if (this.point.x < todayIdx) {
          when = 'Observed';
        } else if (this.point.x > todayIdx) {
          when = 'Forecast';
        }

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
              {this.x}
            </Box>
            <Box
              style={{
                fontSize: '12px',
                fontStyle: 'italic',
                textAlign: 'center',
              }}
            >
              ({when})
            </Box>

            <Box
              style={{
                height: '1px',
                width: '85%',
                backgroundColor: 'rgb(239,64,53)',
                margin: '2px auto',
              }}
            />

            <Box style={{ textAlign: 'center' }}>{this.point.y}%</Box>
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
      }}
    >
      <HighchartsReact highcharts={Highcharts} options={options} />
    </Box>
  );
}
