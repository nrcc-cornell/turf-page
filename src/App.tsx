import React, { useState, useEffect, useMemo } from 'react';
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
  DailyChart,
  ConditionalText,
  RiskGraph,
  StyledDivider,
  RiskMaps,
  Loading,
  StyledButton,
  Graph,
  GrowthPotentialPage,
} from './Components';

import { AppRouteInfo } from './AppRouteInfo';

import { getData } from './Scripts/Data';
import MultiMapPage from './Components/Pages/MultiMapPage';
import StyledCard from './Components/Pages/StyledCard';

function App() {
  const [showGraphs, setShowGraphs] = useState(false);
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

  const renderPage = (info: DataType) => {
    if (toolData) {
      let sx = {};
      if (info.maps.length === 1) {
        sx = {
          maxWidth: 850,
        };
      }

      if (info.pageType === 'growthPotential') {
        return <GrowthPotentialPage />;
      }

      return (
        <StyledCard variant='outlined' sx={sx}>
          {(info.pageType === 'graph' || info.pageType === 'table') && (
            <DailyChart
              data={toolData[info.chart.data].table}
              rowNames={info.chart.rowNames}
              todayFromAcis={toolData.todayFromAcis}
              title={info.chart.title}
            />
          )}

          {info.pageType === 'text' && (
            <ConditionalText
              fromLast={
                toolData[info.data].table[0][toolData.todayFromAcis ? 3 : 4][1]
              }
              fromNormal={
                toolData[info.data].table[1][toolData.todayFromAcis ? 3 : 4][1]
              }
            />
          )}

          {info.pageType === 'seedWeed' && (
            <DailyChart
              {...info.chart}
              data={toolData[info.chart.data]}
              todayFromAcis={toolData.todayFromAcis}
            />
          )}

          {info.pageType === 'risk' && (
            <RiskGraph
              data={toolData[info.chart.data]}
              todayFromAcis={toolData.todayFromAcis}
              thresholds={info.chart.rows[0].thresholds}
              title={info.chart.title}
            />
          )}

          {info.pageType !== 'mapsOnly' && <StyledDivider />}

          {info.pageType === 'graph' && (
            <Box sx={{ width: '100%', textAlign: 'center' }}>
              {showGraphs ? (
                <StyledButton onClick={() => setShowGraphs(false)}>
                  Show Current Maps
                </StyledButton>
              ) : (
                <StyledButton onClick={() => setShowGraphs(true)}>
                  Show Season Graphs
                </StyledButton>
              )}
            </Box>
          )}

          {info.pageType === 'risk' || info.pageType === 'seedWeed' ? (
            <RiskMaps maps={info.maps} text={info.text} />
          ) : info.pageType === 'graph' && showGraphs ? (
            <Graph
              {...toolData[info.chart.data]}
              units={info.chart.data === 'precip' ? 'inches' : 'GDDs'}
            />
          ) : (
            <MultiMapPage maps={info.maps as MapPageProps[]} />
          )}
        </StyledCard>
      );
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

  const memoizedRoutes = useMemo(() => {
    return AppRouteInfo.map((routeInfo) => (
      <Route
        key={routeInfo.path}
        path={routeInfo.path}
        element={renderPage(routeInfo.props)}
      />
    ));
  }, [toolData, showGraphs, AppRouteInfo]);

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
          '@media (max-width: 640px)': {
            minHeight: 'calc(100vh - 293px)',
            padding: '20px 6px',
          },
        }}
      >
        <Routes>
          <Route path='/' element={<Home />} />

          {memoizedRoutes}

          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
      </Box>

      <Footer />

      <ShortCuttAd />
    </Box>
  );
}

export default App;
