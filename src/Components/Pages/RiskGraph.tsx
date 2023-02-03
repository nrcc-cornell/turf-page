/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useState, useRef, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Box, Typography } from '@mui/material';
import { format, addDays, subDays } from 'date-fns';

import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import NoDataToDisplay from 'highcharts/modules/no-data-to-display';
import accessibility from 'highcharts/modules/accessibility';
NoDataToDisplay(Highcharts);
accessibility(Highcharts);
Highcharts.Chart.prototype.showResetZoom = function () {
  return;
};

import StyledButton from './StyledBtn';
import roundXDigits from '../../Scripts/Rounding';

export default function RiskGraph(props: RiskGraph) {
  const chartComponent = useRef<HighchartsReact.RefObject | null>(null);
  const [isZoomed, setIsZoomed] = useState(true);

  const resetZoom = () => {
    if (chartComponent && chartComponent.current) {
      chartComponent.current.chart.zoomOut();
    }
  };

  const pastCutoff = props.todayFromAcis ? -5 : -6;
  const datesConverted = props.data['season'].map((arr: [string, number]) => [
    arr[0].slice(0, 5),
    Math.max(0, arr[1]),
  ]);

  const series: SeriesObj[] = [
    {
      data: datesConverted.slice(0, pastCutoff),
      name: 'Daily',
      color: 'rgb(163,41,41)',
      zIndex: 2,
      id: 'Observed Daily',
    },
    {
      data: datesConverted.slice(pastCutoff),
      name: 'Forecast',
      color: 'rgb(163,41,41)',
      zIndex: 2,
      dashStyle: 'Dash',
      id: 'Forecast Daily',
      linkedTo: 'Observed Daily',
    },
  ];

  if ('7 Day Avg' in props.data) {
    const otherDatesConverted = props.data['7 Day Avg'].map(
      (arr: [string, number]) => [arr[0].slice(0, 5), Math.max(0, arr[1])]
    );

    series.push({
      data: otherDatesConverted.slice(0, pastCutoff),
      name: '7 Day Avg',
      color: 'rgb(27,155,32)',
      zIndex: 1,
      id: 'Observed 7 Day Avg',
    });

    series.push({
      data: otherDatesConverted.slice(pastCutoff),
      name: 'Forecast',
      color: 'rgb(27,155,32)',
      zIndex: 1,
      dashStyle: 'Dash',
      id: 'Forecast 7 Day Avg',
      linkedTo: 'Observed 7 Day Avg',
    });
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
      zoomType: 'x',
      type: 'line',
      events: {
        selection: function (e: any) {
          if (e.resetSelection) {
            setIsZoomed(false);
          } else {
            setIsZoomed(true);
          }
        },
        load: function () {
          const today = new Date();
          const now = format(addDays(today, 5), 'MM-dd');
          const lastMonth = format(subDays(today, 8), 'MM-dd');

          // @ts-ignore
          const axis = this.xAxis[0];
          const begin = axis.names.findIndex(
            (date: string) => date === lastMonth
          );
          const end = axis.names.findIndex((date: string) => date === now);

          axis.setExtremes(begin, end);
        },
      },
    },
    title: {
      floating: true,
      text: '',
    },
    series,
    xAxis: {
      type: 'category',
    },
    yAxis: {
      min: 0,
      softMax: props.thresholds.high + props.thresholds.high * 0.2,
      gridLineWidth: 0,
      title: { text: 'Risk Index Value' },
      plotBands: [
        {
          from: 0,
          to: props.thresholds.low,
          color: 'rgba(104, 227, 82, 0.13)',
          label: {
            text: 'No Risk',
            style: {
              fontSize: 10,
              color: 'rgb(150,150,150)',
            },
          },
        },
        {
          from: props.thresholds.low,
          to: props.thresholds.high,
          color: 'rgba(222, 227, 82, 0.13)',
          label: {
            text: 'Moderate',
            style: {
              fontSize: 10,
              color: 'rgb(150,150,150)',
            },
          },
        },
        {
          from: props.thresholds.high,
          to: Infinity,
          color: 'rgba(228, 111, 82, 0.13)',
          label: {
            text: 'High',
            style: {
              fontSize: 10,
              color: 'rgb(150,150,150)',
            },
          },
        },
      ],
    },
    tooltip: {
      shared: true,
      outside: true,
      split: false,
      useHTML: true,
      formatter: function (this: Highcharts.TooltipFormatterContextObject) {
        if (!this || !this.points) return '';

        const dataElems = this.points.map((p) => {
          const nameArr = p.series.userOptions.id?.split(' ');
          return (
            <Fragment key={p.series.userOptions.id}>
              <Box>{nameArr?.slice(1).join(' ')}</Box>
              <Box style={{ justifySelf: 'right', fontWeight: 'bold' }}>
                {typeof p.y === 'number' ? roundXDigits(p.y, 2) : 'null'}
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
                fontSize: '12px',
                fontStyle: 'italic',
                textAlign: 'center',
              }}
            >
              ({this.points[0].series.userOptions.id?.split(' ')[0]})
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
        paddingBottom: '40px',
        height: 425,
        width: '100%',
      }}
    >
      <Box
        sx={{
          margin: '10px auto 10px 16px',
          maxWidth: 700,
          '@media (min-width: 892px)': { marginLeft: 'auto' },
        }}
      >
        <Typography variant='h5'>{props.title}</Typography>
      </Box>

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
            transform: 'translateX(-50%)',
          }}
          onClick={resetZoom}
        >
          Reset zoom
        </StyledButton>
      )}
    </Box>
  );
}
