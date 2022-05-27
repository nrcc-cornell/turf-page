import React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
// import reportWebVitals from './reportWebVitals';

import { createTheme, ThemeProvider, ThemeOptions } from '@mui/material';
import { TypographyOptions } from '@mui/material/styles/createTypography';

import './index.css';
import App from './App';

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    headerMain: true;
    headerSub: true;
    headerSecondary: true;
    footerContact: true;
    footerCopyright: true;
    links: true;
    dayMapDate: true;
    underChart: true;
    mapPage: true;
    homeMap: true;
  }
}

interface ExtendedTypographyOptions extends TypographyOptions {
  headerMain: React.CSSProperties;
  headerSub: React.CSSProperties;
  headerSecondary: React.CSSProperties;
  footerContact: React.CSSProperties;
  footerCopyright: React.CSSProperties;
  links: React.CSSProperties;
  dayMapDate: React.CSSProperties;
  underChart: React.CSSProperties;
  mapPage: React.CSSProperties;
  homeMap: React.CSSProperties;
}


const theme = createTheme({
  'palette': {
    'primary': {
      'main': '#1976d2',
      'light': '#42a5f5',
      'dark': '#1565c0',
      'contrastText': '#fff'
    },
    'secondary': {
      'main': '#9c27b0',
      'light': '#ba68c8',
      'dark': '#7b1fa2',
      'contrastText': '#fff'
    }
  },
  typography: {
    fontFamily: '"Open Sans", "Helvetica Neue", "Helvetica", "Roboto", "Arial", "sans-serif"',
    h1: {
      fontSize: '2rem',
      fontFamily: '"Raleway", "Helvetica Neue", "Helvetica", "Roboto", "Arial", "sans-serif"',
    },
    h2: {
      fontSize: '1.5rem',
      fontFamily: '"Raleway", "Helvetica Neue", "Helvetica", "Roboto", "Arial", "sans-serif"',
    },
    h3: {
      fontSize: '2rem',
      fontFamily: '"Raleway", "Helvetica Neue", "Helvetica", "Roboto", "Arial", "sans-serif"',
    },
    h4: {
      fontSize: '1.7rem',
      fontFamily: '"Raleway", "Helvetica Neue", "Helvetica", "Roboto", "Arial", "sans-serif"',
    },
    h5: {
      fontSize: '1.5rem',
      ['@media screen and (max-width: 380px)']: {
        fontSize: '1.35rem'
      }
    },
    subtitle1: {
      fontSize: '1.4rem',
      fontStyle: 'italic',
      fontFamily: '"Raleway", "Helvetica Neue", "Helvetica", "Roboto", "Arial", "sans-serif"',
    },
    headerMain: {
      color: 'rgb(131,213,38)',
      fontFamily: '"EB Garamond", "Arial", "serif"',
      fontWeight: 600,
      fontSize: '2rem',
      ['@media screen and (max-width: 510px)']: {
        fontSize: '1.75rem'
      },
      ['@media screen and (max-width: 400px)']: {
        fontSize: '1.35rem'
      }
    },
    headerSub: {
      color: 'rgb(234,246,126)',
      fontFamily: '"EB Garamond", "Arial", "serif"',
      fontStyle: 'italic',
      fontSize: '1.2rem',
      ['@media screen and (max-width: 550px)']: {
        fontSize: '1rem'
      },
      ['@media screen and (max-width: 510px)']: {
        fontSize: '0.9rem'
      },
      ['@media screen and (max-width: 400px)']: {
        fontSize: '0.7rem'
      }
    },
    headerSecondary: {
      fontSize: '1rem',
      fontFamily: '"Roboto", "Arial", "sans-serif"',
      fontVariant: 'small-caps',
      color: 'white',
      ['@media screen and (max-width: 510px)']: {
        fontSize: '0.9rem'
      },
      ['@media screen and (max-width: 400px)']: {
        fontSize: '0.7rem'
      }
    },
    footerContact: {
      fontSize: '14px',
      lineHeight: '22px',
      ['@media screen and (max-width: 636px)']: {
        fontSize: '11px'
      },
      ['@media screen and (max-width: 555px)']: {
        fontSize: '9px'
      },
      ['@media screen and (max-width: 450px)']: {
        lineHeight: '14px'
      }
    },
    footerCopyright: {
      fontSize: '14px',
      ['@media screen and (max-width: 720px)']: {
        fontSize: '12px'
      },
      ['@media screen and (max-width: 450px)']: {
        fontSize: '10px'
      }
    },
    links: {
      color: 'white',
      fontSize: '12px',
      fontFamily: '"Roboto", "Arial", "sans-serif"',
      lineHeight: '16px'
    },
    dayMapDate: {
      fontSize: '12px'
    },
    underChart: {
      fontSize: '12px',
      color: 'rgb(180,180,180)'
    },
    mapPage: {
      '@media (max-width: 400px)': {
        fontSize: '14px'
      }
    },
    homeMap: {
      fontSize: '16px',
      textAlign: 'center',
      marginBottom: '10px',
    }
  } as ExtendedTypographyOptions
} as ThemeOptions);


const container = document.getElementById('root') as Element;
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <HashRouter>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </HashRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();