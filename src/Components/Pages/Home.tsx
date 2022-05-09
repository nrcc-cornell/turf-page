import React, { useState, useEffect } from 'react';

import { Box, Button, Divider, MenuItem, Modal, TextField } from '@mui/material';

import StyledCard from './StyledCard';
import MapPage from './MapPage';

import { frontPageMaps } from '../../AppRouteInfo';


const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  height: 470,
  boxShadow: 24,
  border: '10px solid rgb(79,88,93)',
  borderRadius: '4px',
  p: 4,
  backgroundColor: 'white',
  boxSizing: 'border-box',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  '&:focus-visible': {
    outline: 'none'
  },
  '@media (max-width: 500px)': {
    width: 350
  }
};

const btnSX = {
  backgroundColor: 'rgb(85,86,90)',
  color: 'white',
  '&:hover': {
    backgroundColor: 'rgb(105,106,110)'
  }
};



export default function Home() {
  const [favMaps, setFavMaps] = useState<number[]>([]);
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    const storedFavMaps = localStorage.getItem('favMaps');
    if (storedFavMaps) {
      setFavMaps(JSON.parse(storedFavMaps));
    } else {
      setFavMaps([ 22, 23, 18, 19 ]);
    }
  }, []);

  const handleChange = (val: string, pos: number) => {
    const newMaps = [ ...favMaps ];

    if (val === 'remove' && favMaps.length > 2) {
      newMaps.splice(pos, 1);
    } else if (val === 'add' && favMaps.length < 8) {
      newMaps.push(0);
    } else {
      newMaps[pos] = parseInt(val);
    }

    setFavMaps(newMaps);
    localStorage.setItem('favMaps', JSON.stringify(newMaps));
  };


  return (
    <StyledCard variant='outlined'>
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          onClick={handleOpen}
          sx={btnSX}
        >
          Change Maps
        </Button>
      </Box>

      <Modal
        open={open}
        onClose={handleClose}
      >
        <Box sx={style}>
          {favMaps.map((fm, i: number) => { 
            return (
              <TextField
                key={i}
                size='small'
                variant='outlined'
                label={`Map #${i + 1}`}
                select
                value={fm}
                onChange={(e) => handleChange(e.target.value, i)}
              >
                {favMaps.length > 2 &&
                  <MenuItem
                    value='remove'
                    sx={{
                      justifyContent: 'center',
                      width: 200,
                      margin: '0 auto',
                      borderRadius: '5px',
                      backgroundColor: 'rgba(255, 0, 0, 0.12)',
                      fontSize: '12px',
                      '&:hover': {
                        backgroundColor: 'rgb(200, 0, 0)',
                        color: 'white'
                      }
                    }}
                  >Remove Map</MenuItem>}
                
                <Divider/>

                {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                {/* @ts-ignore - necessary for loading object as value */}
                {frontPageMaps.map((m, i) => <MenuItem key={i} value={i}>{m.alt}</MenuItem>)}
              </TextField>
            );
          })}

          {favMaps.length < 8 &&
            <Button
              onClick={() => handleChange('add', 0)}
              sx={{
                ...btnSX,
                width: 150,
                position: 'absolute',
                bottom: 32,
                left: 'calc(50% - 75px)'
              }}
            >Add Map</Button>}
        </Box>
      </Modal>
      
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 50%)',
        gridTemplateRows: `repeat(${Math.ceil(favMaps.length / 2)}, ${100 / Math.ceil(favMaps.length / 2)}%)`,
        boxSizing: 'border-box',
        '@media (max-width: 800px)': {
          gridTemplateColumns: 'repeat(1, 100%)',
          gridTemplateRows: `repeat(${favMaps.length}, auto)`
        }
      }}>
        {favMaps.map((n, i) => <MapPage key={i} {...frontPageMaps[n]} title={frontPageMaps[n].alt} description={[]} />)}
      </Box>
    </StyledCard>
  );
}