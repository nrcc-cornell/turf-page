import React, { useState, useEffect } from 'react';
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';

import { Box } from '@mui/material';

import {
  Header,
  Footer,
  Nav,
  ShortCuttAd,
  LocationDisplay,
  Home,
  Loading,
  GrowthPotentialPage,
  PollinatorRiskPage
} from './Components';

import { AppRouteInfo } from './AppRouteInfo';
import { usePageTracking } from './Scripts/usePageTracking';

import { getData } from './Scripts/Data';
import SoilSaturationPage from './Components/Pages/SoilSaturation/SoilSaturationPage';
import RunoffRiskPage from './Components/Pages/RunoffRisk/RunoffRiskPage';
import DiseaseStressRiskPage from './Components/Pages/DiseaseStressRisk/DiseaseStressRiskPage';
import SeedWeedPage from './Components/Pages/SeedWeed/SeedWeedPage';
import GraphPage from './Components/Pages/GraphPage/GraphPage';
import TablePage from './Components/Pages/TablePage/TablePage';
import GddDiffDaysPage from './Components/Pages/GddDiffDays/GddDiffDaysPage';
import MapsOnlyPage from './Components/Pages/MapsOnlyPage/MapsOnlyPage';

function App() {
  const [toolData, setToolData] = useState<ToolData | null>(null);
  const [pastLocations, setPastLocations] = useState<UserLocation[]>(() => {
    const pastLocations = localStorage.getItem('pastLocations');
    if (pastLocations) {
      return JSON.parse(pastLocations);
    } else {
      return [
        {
          address: '213 Warren Road, Ithaca, New York',
          lngLat: [-76.46754, 42.457975],
        },
      ];
    }
  });
  const [currentLocation, setCurrentLocation] = useState<UserLocation>(() => {
    const currentLocation = localStorage.getItem('currentLocation');
    if (currentLocation) {
      return JSON.parse(currentLocation);
    } else {
      return {
        address: '213 Warren Road, Ithaca, New York',
        lngLat: [-76.46754, 42.457975],
      };
    }
  });

  const goTo = useNavigate();
  const reqPage = useLocation().pathname;
  usePageTracking();

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
      const data = await getData(currentLocation.lngLat);
      setToolData(data);
    })();
  }, [currentLocation]);

  const renderPage = (info: PageInfo) => {
    if (toolData) {
      let sx = {};
      if (info.maps.length === 1) {
        sx = {
          maxWidth: 850,
        };
      }

      if (info.pageType === 'risk') {
        return (
          <DiseaseStressRiskPage
            data={toolData[info.chart.rows[0].data]}
            todayFromAcis={toolData.todayFromAcis}
            sx={sx}
            pageInfo={info}
          />
        );
      } else if (info.pageType === 'seedWeed') {
        return (
          <SeedWeedPage
            data={toolData[info.chart.rows[0].data]}
            todayFromAcis={toolData.todayFromAcis}
            sx={sx}
            pageInfo={info}
          />
        );
      } else if (info.pageType === 'graph') {
        return (
          <GraphPage
            data={toolData[info.chart.data]}
            todayFromAcis={toolData.todayFromAcis}
            sx={sx}
            pageInfo={info}
          />
        );
      } else if (info.pageType === 'table') {
        return (
          <TablePage
            data={toolData[info.chart.data]}
            todayFromAcis={toolData.todayFromAcis}
            sx={sx}
            pageInfo={info}
          />
        );
      } else if (info.pageType === 'text') {
        return (
          <GddDiffDaysPage
            data={toolData[info.data].table}
            sx={sx}
            pageInfo={info}
          />
        );
      } else if (info.pageType === 'mapsOnly') {
        return (
          <MapsOnlyPage
            sx={sx}
            pageInfo={info}
          />
        );
      } else if (info.pageType === 'growthPotential') {
        return (
          <GrowthPotentialPage
            currentLocation={currentLocation}
            pastLocations={pastLocations}
            handleChangeLocations={handleChangeLocations}
          />
        );
      } else if (info.pageType === 'runoff-risk') {
        return (
          <RunoffRiskPage
            currentLocation={currentLocation}
            pastLocations={pastLocations}
            handleChangeLocations={handleChangeLocations}
          />
        );
      } else if (info.pageType === 'overlayMap') {
        return (
          <SoilSaturationPage
            currentLocation={currentLocation}
            pastLocations={pastLocations}
            handleChangeLocations={handleChangeLocations}
          />
        );
      } else if (info.pageType === 'pollinator') {
        return ( 
          <PollinatorRiskPage
            latitude={currentLocation.lngLat[1]}
            gddData={toolData.gdd50.table[0]}
            pageInfo={info}
            todayFromAcis={toolData.todayFromAcis}
          />
        );
      }
    } else {
      return <Loading />;
    }
  };

  const handleChangeLocations = (
    action: 'add' | 'remove' | 'change',
    location: UserLocation
  ): void => {
    if (action === 'add') {
      setPastLocations((prev) => {
        const newLocs = [...prev, location];
        localStorage.setItem('pastLocations', JSON.stringify(newLocs));
        return newLocs;
      });
    }

    if (action === 'remove') {
      setPastLocations((prev) => {
        const newLocs = prev.filter(
          (l) =>
            !(
              l.lngLat[0] === location.lngLat[0] &&
              l.lngLat[1] === location.lngLat[1]
            )
        );
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
    <Box
      sx={{
        minWidth: 320,
        position: 'relative',
      }}
    >
      <Header />

      <Nav />

      <LocationDisplay
        currentLocation={currentLocation}
        pastLocations={pastLocations}
        handleChangeLocations={handleChangeLocations}
      />

      <Box
        component='main'
        sx={{
          boxSizing: 'border-box',
          padding: '20px',
          width: '100%',
          minHeight: 'calc(100vh - 333px)',
          '@media (max-width: 862px)': {
            padding: '20px 12px',
          },
          '@media (max-width: 700px)': {
            minHeight: 'calc(100vh - 293px)',
            padding: '20px 6px',
          },
        }}
      >
        <Routes>
          <Route path='/' element={<Home />} />

          {AppRouteInfo.map((routeInfo) => (
            <Route
              key={routeInfo.path}
              path={routeInfo.path}
              element={renderPage(routeInfo.props)}
            />
          ))}

          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      </Box>

      <Footer />

      <ShortCuttAd />
    </Box>
  );
}

export default App;
