import React, { useState, MouseEvent } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';

import {
  Box,
  Button,
  MenuItem,
  MenuList,
  Typography,
  Popper,
  Grow,
  Paper,
  ListItemText,
} from '@mui/material';
import { styled } from '@mui/material/styles';

type NavBarProp = {
  group: {
    base: string;
    name: string;
    icon: JSX.Element;
    items: {
      pathname: string;
      label: string;
    }[];
  };
};

const bkColor = 'rgba(125, 193, 57, 0.75)';
const LinkLine = styled(Box)({
  height: '5px',
  width: '100%',
  backgroundColor: bkColor,
  position: 'absolute',
  bottom: '0px',
});

const btnSX = {
  borderRadius: 0,
  height: '100%',
  position: 'relative',
  '&:hover': {
    backgroundColor: 'rgb(149,0,0)',
  },
};

export default function NavBar({ group }: NavBarProp) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const hyphenName = group.name.split(' ').join('-');
  const navigate = useNavigate();
  const location = useLocation();
  const isActiveGroup = location.pathname.split('/')[1] === group.base;

  const handleOpen = (event: MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
    setOpen(true);
  };

  const handleClose = (): void => {
    setOpen(false);
  };

  const handleLinkClick = (pathname: string): void => {
    if (pathname[0] === '/') {
      navigate(pathname);
      setOpen(false);
      localStorage.setItem('lastPage', pathname);
    } else {
      window.open(pathname, '_blank')?.focus();
    }
  };

  if (group.items.length === 1 && group.items[0].label === '') {
    return (
      <Box>
        <Button
          id={`${hyphenName}-button`}
          sx={{
            ...btnSX,
            '& .MuiTouchRipple-child': {
              backgroundColor: 'rgb(180,180,180)',
            },
          }}
          onClick={() => handleLinkClick(group.items[0].pathname)}
        >
          <Typography variant='links'>{group.name}</Typography>
          {isActiveGroup && <LinkLine />}
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Popper
        id={`${hyphenName}-menu`}
        open={open}
        anchorEl={anchorEl}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={handleClose}
        placement='bottom'
        transition
        sx={{ zIndex: 3 }}
      >
        {({ TransitionProps }) => (
          <Grow {...TransitionProps} style={{ transformOrigin: 'top' }}>
            <Paper
              sx={{
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
                border: '1px solid rgb(242,242,242)',
                borderTop: '2px solid rgb(189,187,187)',
              }}
            >
              <MenuList>
                {group.items.map((item) => {
                  const isActiveLink = location.pathname === item.pathname;

                  return (
                    <MenuItem
                      key={item.label}
                      onClick={() => handleLinkClick(item.pathname)}
                      sx={{
                        backgroundColor: isActiveLink
                          ? 'rgba(0,0,0,0.08)'
                          : 'white',
                      }}
                    >
                      <ListItemText>{item.label}</ListItemText>
                    </MenuItem>
                  );
                })}
              </MenuList>
            </Paper>
          </Grow>
        )}
      </Popper>

      <Button
        disableRipple
        id={`${hyphenName}-button`}
        aria-controls={anchorEl ? `${hyphenName}-menu` : undefined}
        aria-haspopup='true'
        aria-expanded={anchorEl ? 'true' : undefined}
        onMouseEnter={handleOpen}
        onMouseLeave={handleClose}
        sx={btnSX}
      >
        <Typography variant='links'>{group.name}</Typography>
        {isActiveGroup && <LinkLine />}
      </Button>
    </Box>
  );
}

NavBar.propTypes = {
  group: PropTypes.object,
};
