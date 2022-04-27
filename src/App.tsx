import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import { Box } from '@mui/material';

import {
  Header,
  Footer,
  Nav,
  MapPage,
  ToolPage,
  ShortCuttAd,
  LocationDisplay
} from './Components';

import AppRouteInfo from './AppRouteInfo';

import { getToolData } from './Scripts/Data';

type Thumb = {
  fullSizeUrl: string,
  thumbUrl: string,
  alt: string,
  date: string
};

type MapThumbs = {
  title: string,
  thumbs: Thumb[]
};

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
  maps: MapThumbs[]
};

type PropsType = MapPageProps | ToolPageProps;

type ToolData = {
  gdd32: [string, number][],
  gdd50: [string, number][]
};

type UserLocation = {
  address: string,
  lngLat: number[]
};





///////////////////////////////////////////
///////////////////////////////////////////
// const lngLat = [-75.77959, 43.72207]; // Near Watertown
// const lngLat = [-76.46754, 42.457975]; // Ithaca

// 213 Warren Road, Ithaca, New York 14850, United States
// [
//   0:-76.46754
//   1:42.457975
// ]
///////////////////////////////////////////
///////////////////////////////////////////

function App() {
  const [gdd32, setGdd32] = useState<[string,number][]>([]);
  const [gdd50, setGdd50] = useState<[string,number][]>([]);
  const [pastLocations, setPastLocations] = useState<UserLocation[]>(() => {
    const pastLocations = localStorage.getItem('pastLocations');
    if (pastLocations) {
      return JSON.parse(pastLocations);
    } else {
      return [
        { address: '213 Warren Road, Ithaca, New York 14850, United States', lngLat: [-76.46754, 42.457975] },
      ];
    }
  });
  const [currentLocation, setCurrentLocation] = useState<UserLocation>(() => {
    const currentLocation = localStorage.getItem('currentLocation');
    if (currentLocation) {
      return JSON.parse(currentLocation);
    } else {
      return { address: '213 Warren Road, Ithaca, New York 14850, United States', lngLat: [-76.46754, 42.457975] };
    }
  });
  
  const goTo = useNavigate();
  
  
  useEffect(() => {
    const lastPage = localStorage.getItem('lastPage');
    if (lastPage) {
      goTo(lastPage);
    }
  }, []);
  
  useEffect(() => {
    (async () => {
      const data: ToolData | null = await getToolData(currentLocation.lngLat);
      console.log(data);

      if (data) {
        setGdd32(data.gdd32);
        setGdd50(data.gdd50);
      } else {
        //////////////////////////////////
        //////////////////////////////////
        //////////////////////////////////
        //////////////////////////////////
        // Handle no data / errors!!!  ///
        //////////////////////////////////
        //////////////////////////////////
        //////////////////////////////////
      }
    })();
  }, [currentLocation]);

  
  const renderPage = (obj: PropsType) => {    
    if ('url' in obj) {
      return <MapPage {...obj} />;
    }

    if ('chart' in obj) {
      return <ToolPage {...obj} data={obj.chart.data === 32 ? gdd32 : gdd50} />;
    }

    return <Box>{JSON.stringify(obj)}</Box>;
  };

  const handleChangeLocations = (action: 'add' | 'remove' | 'change', location: UserLocation): void => {
    if (action === 'add') {
      setPastLocations(prev => {
        const newLocs = [...prev, location];
        localStorage.setItem('pastLocations', JSON.stringify(newLocs));
        return newLocs;
      });
    }

    if (action === 'remove') {
      setPastLocations(prev => {
        const newLocs = prev.filter(l => !(l.lngLat[0] === location.lngLat[0] && l.lngLat[1] === location.lngLat[1]));
        localStorage.setItem('pastLocations', JSON.stringify(newLocs));
        return newLocs;
      });
    }

    if (action === 'add' || action === 'change') {
      setCurrentLocation(location);
      localStorage.setItem('currentLocation', JSON.stringify(location));
    }
  };


  return (
    <Box sx={{
      minWidth: 400,
      position: 'relative'
    }}>
      <Header />

      <Nav />

      <LocationDisplay
        currentLocation={currentLocation}
        pastLocations={pastLocations}
        handleChangeLocations={handleChangeLocations}
      />
      
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

      <ShortCuttAd />
    </Box>
  );
}

export default App;


// // Refactor to use retrieved location from storage or default to get GDDs
// Create component to show current location
// Verify that current location matches the GDDs shown
// Create popup from clicking 'Change Location' that has past locations and locations search
// Write necessary logic to make that all functional
// Add map with pins, etc.
// Write logic to make that all functional

// When all of that is finished deploy, talk to Art, and tell the guys where we're at.
// Find out what weather might be useful
// Create weather widget OR create link for local forecasts

// Work on other models