import React from 'react';
import {
  CalendarMonth,
  Coronavirus,
  Grass,
  Home,
  Link,
  Water,
} from '@mui/icons-material';


const menuGroups: MenuObj[] = [
  {
    base: '',
    name: 'Home',
    icon: <Home />,
    items: []
  },
  {
    base: 'disease-stress',
    name: 'Disease/Stress Risk',
    icon: <Coronavirus />,
    items: [
      { pathname: '/disease-stress/anthracnose', label: 'Anthracnose' },
      { pathname: '/disease-stress/brown-patch', label: 'Brown Patch' },
      { pathname: '/disease-stress/dollarspot', label: 'Dollarspot' },
      { pathname: '/disease-stress/heat-stress', label: 'Heat Stress index' },
      { pathname: '/disease-stress/pythium-blight', label: 'Pythium Blight' }
    ]
  },
  {
    base: 'seedhead-weed',
    name: 'Seedhead/Weed Management',
    icon: <Grass />,
    items: [
      { pathname: '/seedhead-weed/dandelion', label: 'Dandelion Recommendations' },
      { pathname: '/seedhead-weed/seedhead', label: 'Seedhead Recommendations' }
    ]
  },
  {
    base: 'season',
    name: 'Season Progress',
    icon: <CalendarMonth />,
    items: [
      { pathname: '/season/gdd/32', label: '32°F GDDs' },
      { pathname: '/season/gdd/50', label: '50°F GDDs' },
      { pathname: '/season/gdd/differences/gdd', label: '50°F GDD Differences (GDD)' },
      { pathname: '/season/gdd/differences/days', label: '50°F GDD Differences (days)' },
      { pathname: '/season/soil-temperature', label: 'Soil Temperature' },
      { pathname: '/season/temperature-departure', label: 'Temperature Departure' }
    ]
  },
  {
    base: 'irrigation',
    name: 'Irrigation Information',
    icon: <Water />,
    items: [
      { pathname: '/irrigation/rainfall', label: `Last Week's Rainfall` },
      { pathname: '/irrigation/evapotranspiration', label: 'Evapotranspiration' },
      { pathname: '/irrigation/moisture-deficit', label: 'Moisture Deficit' },
      { pathname: '/irrigation/topsoil-moisture/current/', label: 'USDA Topsoil Moisture - Current' },
      { pathname: '/irrigation/topsoil-moisture/current-vs-10-year-mean', label: 'USDA Topsoil Moisture - Current vs. 10-year Mean' }
    ]
  },
  {
    base: 'x',
    name: 'Useful Links',
    icon: <Link />,
    items: [
      { pathname: 'http://www.nrcc.cornell.edu/industry/grass/grassWeb_dd.html', label: 'Seasonal GDD Table' },
      { pathname: 'http://www.nrcc.cornell.edu/industry/grass/grassWeb_precip.html', label: 'Seasonal Precipitation Table' },
      // { pathname: 'broken', label: 'Weekly New York PET Table' },
      { pathname: 'http://www.nrcc.cornell.edu/regional/drought/drought.html', label: 'NRCC Northeast Drought Page' },
      { pathname: 'http://www.nrcc.cornell.edu/industry/lawn_water/', label: 'NRCC Lawn Watering Page' },
      { pathname: 'http://www.nrcc.cornell.edu/industry/grass/lastweek_maps.html', label: `Last Week's Maps` },
    ]
  },
  // 'Radar' // broken
];

export default menuGroups;