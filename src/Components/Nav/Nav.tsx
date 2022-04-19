import React, { Fragment, ReactNode, useState, useEffect } from 'react';

import { Box }from '@mui/material';

import NavBar from './NavBar';
import NavDrawer from './NavDrawer';
import menuGroups from './linkInfo';

const getWidth = (): number => window.innerWidth 
  || document.documentElement.clientWidth 
  || document.body.clientWidth || 0;



export default function Nav() {
  const [width, setWidth] = useState(getWidth());
  
  useEffect(() => {
    window.addEventListener('resize', () => setWidth(getWidth()));
  }, []);


  const renderBar = (): ReactNode => {
    return (
      <Box component='nav' sx={{
        backgroundColor: 'rgb(85,86,90)',
        display: 'flex'
      }}>
        {
          menuGroups.map((group, i) => {
            return (
              <Fragment key={group.name}>
                <Box component={NavBar} group={group} />

                {i !== menuGroups.length - 1 &&
              <Box sx={{
                marginTop: '4px',
                height: '25px',
                width: '1px',
                backgroundColor: 'black',
                '@media (max-width: 847px)': {
                  height: '46px'
                }
              }}></Box>
                }
              </Fragment>
            );
          })
        }
      </Box>
    );
  };

  const renderBurger = (): ReactNode => {
    return (
      <Box component='nav' sx={{
        backgroundColor: 'white',
        height: 46
      }}>
        <NavDrawer />
      </Box>
    );
  };

  return <Box>{width < 640 ? renderBurger() : renderBar()}</Box>;
}