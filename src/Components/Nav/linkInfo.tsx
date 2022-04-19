import React from 'react';
import {
  CalendarMonth,
  Coronavirus,
  Grass,
  Home,
  Link,
  Thermostat,
  Water,
} from '@mui/icons-material';

type NavItem = {
  pathname: string;
  label: string;
};

type MenuObj = {
  base: string;
  name: string;
  icon: JSX.Element;
  items: NavItem[];
};

const menuGroups: MenuObj[] = [
  {
    base: '',
    name: 'Home',
    icon: <Home />,
    items: []
  },
  {
    base: 'disease',
    name: 'Disease Risk',
    icon: <Coronavirus />,
    items: [
      { pathname: '/disease/anthracnose', label: 'Anthracnose' },
      { pathname: '/disease/brown-patch', label: 'Brown Patch' },
      { pathname: '/disease/dollarspot', label: 'Dollarspot' },
      { pathname: '/disease/pythium-blight', label: 'Pythium Blight' },
    ]
  },
  {
    base: 'turf-weed',
    name: 'Turf & Weed Development',
    icon: <Grass />,
    items: [
      { pathname: '/turf-weed/dandelion', label: 'Dandelion Recommendations' },
      { pathname: '/turf-weed/seedhead', label: 'Seedhead Recommendations' },
      { pathname: '/turf-weed/gdd/accumulation', label: '32°F GDD Accumulation since February 1' },
      { pathname: '/turf-weed/gdd/forecast', label: 'Forecast 32°F GDD Accumulation' }
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
      { pathname: '/irrigation/topsoil-moisture/current-vs-5-year-mean', label: 'USDA Topsoil Moisture - Current vs. 5-year Mean' },
      { pathname: '/irrigation/topsoil-moisture/current-vs-10-year-mean', label: 'USDA Topsoil Moisture - Current vs. 10-year Mean' }
    ]
  },
  {
    base: '50gdd',
    name: 'Base 50°F GDD',
    icon: <CalendarMonth />,
    items: [
      { pathname: '/50gdd/7-day', label: '7 Day 50°F GDD Accumulation' },
      { pathname: '/50gdd/forecast', label: 'Forecast 50°F GDD Accumulation' },
      { pathname: '/50gdd/since', label: '50°F GDD Accumulation since March 15' },
      { pathname: '/50gdd/difference/year/days', label: '50°F GDD Difference over last year (days)' },
      { pathname: '/50gdd/difference/year/gdd', label: '50°F GDD Difference over last year (GDD)' },
      { pathname: '/50gdd/difference/normal/days', label: '50°F GDD Difference from "normal" (days)' },
      { pathname: '/50gdd/difference/normal/gdd', label: '50°F GDD Difference from "normal" (GDD)' }
    ]
  },
  {
    base: 'temperature',
    name: 'Temperature',
    icon: <Thermostat />,
    items: [
      { pathname: '/temperature/heat-stress', label: 'Heat Stress index' },
      { pathname: '/temperature/departure', label: 'Temperature Departure' },
      { pathname: '/temperature/soil', label: 'Soil Temperature' },
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