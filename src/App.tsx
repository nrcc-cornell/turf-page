import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';

import { Box } from '@mui/material';

import {
  Header,
  Footer,
  Nav,
  MapPage,
  ToolPage,
  GDDPage,
  ShortCuttAd,
  LocationDisplay,
  Home
} from './Components';

import { AppRouteInfo } from './AppRouteInfo';

import { getToolData } from './Scripts/Data';
import MultiMapPage from './Components/Pages/MultiMapPage';
import StyledCard from './Components/Pages/StyledCard';



function App() {
  const [toolData, setToolData] = useState<ToolData | null>(null);
  const [pastLocations, setPastLocations] = useState<UserLocation[]>(() => {
    const pastLocations = localStorage.getItem('pastLocations');
    if (pastLocations) {
      return JSON.parse(pastLocations);
    } else {
      return [
        { address: '213 Warren Road, Ithaca, New York', lngLat: [-76.46754, 42.457975] },
      ];
    }
  });
  const [currentLocation, setCurrentLocation] = useState<UserLocation>(() => {
    const currentLocation = localStorage.getItem('currentLocation');
    if (currentLocation) {
      return JSON.parse(currentLocation);
    } else {
      return { address: '213 Warren Road, Ithaca, New York', lngLat: [-76.46754, 42.457975] };
    }
  });
  
  const goTo = useNavigate();
  const reqPage = useLocation().pathname;
  
  
  useEffect(() => {
    if (reqPage === '/') {
      const lastPage = localStorage.getItem('lastPage');
      if (lastPage) {
        goTo(lastPage);
      }
    } else {
      localStorage.setItem('lastPage', reqPage);
    }
  }, []);

  useEffect(() => {
    (async () => {
      const data = await getToolData(currentLocation.lngLat);
      setToolData(data);
    })();
  }, [currentLocation]);

  const renderPage = (info: PropsType) => {    
    if (info instanceof Array) {
      return <StyledCard variant='outlined'><MultiMapPage maps={info} /></StyledCard>;
    }
    
    if ('url' in info) {
      return <MapPage {...info} />;
    }
    
    if ('chart' in info) {
      return <ToolPage
        {...info}
        data={toolData === null ? toolData : toolData[info.chart.data]}
        seasonData={(
          toolData === null || info.chart.data === 'gdd32' || info.chart.data === 'gdd50'
        ) ? null : toolData.season[info.chart.data]}
        todayFromAcis={toolData === null ? false : toolData.todayFromAcis}
      />;
    }

    if ('maps' in info) {
      return <GDDPage {...info} data={toolData === null ? toolData : toolData[info.data]} base={info.data.slice(3)} todayFromAcis={toolData === null ? false : toolData.todayFromAcis}/>;
    }

    return <Box>{JSON.stringify(info)}</Box>;
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
      minWidth: 320,
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
        width: '100%',
        minHeight: 'calc(100vh - 326px)',
        '@media (max-width: 862px)': {
          padding: '20px 12px'
        },
        '@media (max-width: 847px)': {
          minHeight: 'calc(100vh - 347px)'
        },
        '@media (max-width: 639px)': {
          minHeight: 'calc(100vh - 293px)',
          padding: '20px 6px'
        }
      }}>
        <Routes>
          <Route
            path='/'
            element={<Home />}
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