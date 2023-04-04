import React, { Fragment, ReactNode } from 'react';

import { Box } from '@mui/material';

import NavBar from './NavBar';
import NavDrawer from './NavDrawer';
import menuGroups from './linkInfo';

export default function Nav() {
  const renderBar = (): ReactNode => {
    return (
      <Box
        component='nav'
        sx={{
          backgroundColor: 'rgb(179,27,27)',
          display: 'flex',
          height: 40,
          '@media (max-width: 712px)': {
            display: 'none',
          },
        }}
      >
        {menuGroups.map((group, i) => {
          return (
            <Fragment key={group.name}>
              <Box component={NavBar} group={group} />

              {i !== menuGroups.length - 1 && (
                <Box
                  sx={{
                    marginTop: '4px',
                    height: '32px',
                    width: '0px',
                    borderLeft: '1px solid rgb(130,0,0)',
                  }}
                />
              )}
            </Fragment>
          );
        })}
      </Box>
    );
  };

  const renderBurger = (): ReactNode => {
    return (
      <Box
        component='nav'
        sx={{
          height: 46,
          position: 'absolute',
          top: 83,
          left: 10,
          '@media (min-width: 713px)': {
            display: 'none',
          },
        }}
      >
        <NavDrawer />
      </Box>
    );
  };

  return (
    <Box>
      {renderBurger()}
      {renderBar()}
    </Box>
  );
}
