import React, { Fragment, useState, useEffect, MouseEvent, KeyboardEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse
} from '@mui/material';
import { Menu } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

import menuGroups from './linkInfo';


const StyledListItem = styled(ListItem)({
  '&:hover': {
    backgroundColor: 'rgb(50,50,50)',
    cursor: 'pointer'
  }
});

const StyledGroupItem = styled(ListItem)({
  color: 'rgb(179,27,27)',
  display: 'flex',
  alignItems: 'center',
  '&:hover': {
    backgroundColor: 'rgb(50,50,50)',
    cursor: 'pointer'
  }
});

const LightDivider = styled(Divider)({
  borderColor: 'rgba(179,27,27, 0.8)'
});

const StyledListIcon = styled(ListItemIcon)({
  minWidth: 40,
  color: 'rgb(234,246,126)'
});

type Toggle = {
  type: string;
};



export default function TemporaryDrawer() {
  const [open, setOpen] = useState(false);
  const [section, setSection] = useState('');

  const navigate = useNavigate();
  const thisLocation = useLocation();
  const currentGroup = thisLocation.pathname.split('/')[1];

  useEffect(() => {
    setSection(currentGroup);
  }, [open]);


  const toggleDrawer = (event: MouseEvent<HTMLElement> | KeyboardEvent<HTMLInputElement> | Toggle) => {
    if (event.type === 'keydown' && ((event as KeyboardEvent).key === 'Tab' || (event as KeyboardEvent).key === 'Shift')) {
      return;
    }
    
    setOpen(!open);
  };

  const handleGroupSelect = (name: string) => {
    if (name === '') {
      navigate('/');
      toggleDrawer({type: 'func'} as Toggle);
    } else {
      setSection(section === name ? '' : name);
    }
  };

  const handlePageSelect = (path: string) => {
    if (path[0] === '/') {
      navigate(path);
      toggleDrawer({type: 'func'} as Toggle);
    } else {
      window.open(path, '_blank')?.focus();
    }
  };


  return (
    <Box>
      <IconButton
        sx={{
          color: 'black',
          backgroundColor: 'rgb(240,240,240)',
          borderRadius: '8px',
          margin: '3px',
          '&:hover': {
            backgroundColor: 'rgb(220,220,220)'
          }
        }}
        onClick={() => setOpen(!open)}
      >
        <Menu />
      </IconButton>

      <Drawer
        anchor='left'
        open={open}
        onClose={toggleDrawer}
        PaperProps={{style: {
          backgroundColor: 'black',
          color: 'white',
          width: 300,
          paddingTop: 20
        }}}
      >
        <Box
          role='presentation'
          onKeyDown={toggleDrawer}
        >
          <LightDivider />

          {menuGroups.map((group, i) => {
            return (
              <Fragment key={group.name + i}>
                <StyledGroupItem onClick={() => handleGroupSelect(group.base)} sx={{ backgroundColor: group.base === currentGroup ? 'rgba(255,255,255,0.2)' : 'black' }}>
                  <ListItemText sx={{ color: 'rgb(131,213,38)' }}>{group.name}</ListItemText>
                  <StyledListIcon>{group.icon}</StyledListIcon>
                </StyledGroupItem>
                
                {group.name !== 'Home' &&
                  <Collapse in={section === group.base} timeout="auto" unmountOnExit>
                    <List sx={{ paddingLeft: '20px' }}>
                      {group.items.map(item => (
                        thisLocation.pathname === item.pathname ? 
                          <StyledListItem
                            key={item.label}
                            sx={{
                              backgroundColor: 'rgba(255,255,255,0.2)',
                              '&:hover': {
                                cursor: 'default'
                              }
                            }}
                          >
                            <ListItemText primary={item.label} />
                          </StyledListItem>
                          :
                          <StyledListItem
                            key={item.label}
                            onClick={() => handlePageSelect(item.pathname)}
                          >
                            <ListItemText primary={item.label} />
                          </StyledListItem>
                      ))}
                    </List>
                  </Collapse>
                }

                <LightDivider />
              </Fragment>    
            );
          })}
        </Box>
      </Drawer>
    </Box>
  );
}