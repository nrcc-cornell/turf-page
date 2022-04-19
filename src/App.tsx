import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import { Box } from '@mui/material';

import {
  Header,
  Footer,
  Nav,
  MapPage,
  ToolPage
} from './Components';

import AppRouteInfo from './AppRouteInfo';

import { getGDDs } from './Scripts/Data';

type MapPageProps = {
  url: string,
  alt: string,
  description: string[]
};

type TextProps = {
  titlePart: string,
  description: string[]
};

interface ReferencedTextProps extends TextProps {
  references: string[]
}

type Row = {
  thresholds: {
    low: number,
    medium: number,
    high: number
  },
  name: string
}
type ThresholdObj = {
  low: number,
  medium: number,
  high: number
};

type ChartProps = {
  rows: Row[],
  ranges: string[][],
  title: string,
  data: number,
  colorizer: (val: number, thresholds: ThresholdObj) => string
};

type ToolPageProps = {
  text: TextProps | ReferencedTextProps,
  chart: ChartProps,
  maps: string[]
};

type PropsType = MapPageProps | ToolPageProps;

type GDDs = {
  gdd32: [string, number][],
  gdd50: [string, number][]
};





///////////////////////////////////////////
///////////////////////////////////////////
const lngLat = [-75.77959, 43.72207]; // Near Watertown
// const lngLat = [-76.45800, 42.45800]; // Ithaca
///////////////////////////////////////////
///////////////////////////////////////////

function App() {
  const [gdd32, setGdd32] = useState<[string,number][]>([]);
  const [gdd50, setGdd50] = useState<[string,number][]>([]);


  useEffect(() => {
    (async () => {
      const data: GDDs = await getGDDs(lngLat);
      console.log(data);
      setGdd32(data.gdd32);
      setGdd50(data.gdd50);
    })();
  }, []);

  
  const renderPage = (obj: PropsType) => {
    if ('url' in obj) {
      return <MapPage {...obj} />;
    }

    if ('chart' in obj) {
      return <ToolPage {...obj} data={obj.chart.data === 32 ? gdd32 : gdd50} />;
    }

    return <Box>{JSON.stringify(obj)}</Box>;
  };


  return (
    <Box sx={{
      minWidth: 400,
      position: 'relative'
    }}>
      <Header />

      <Nav />
      
      <Box component='main' sx={{
        boxSizing: 'border-box',
        padding: '20px',
        minHeight: 'calc(100vh - 273px)',
        '@media (max-width: 862px)': {
          minHeight: 'calc(100vh - 294px)',
          padding: '20px 12px'
        },
        '@media (max-width: 639px)': {
          minHeight: 'calc(100vh - 286px)',
          padding: '20px 6px'
        }
      }}>
        <Routes>
          <Route
            path='/'
            element={<div>Home</div>}
          />
          
          {AppRouteInfo.map(routeInfo => 
            <Route
              key={routeInfo.path}
              path={routeInfo.path}
              element={renderPage(routeInfo.props)}
            />)
          }

          <Route
            path='*'
            element={<Navigate to='/' replace />}
          />
        </Routes>
      </Box>

      <Footer />
    </Box>
  );
}

export default App;