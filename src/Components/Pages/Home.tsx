import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { Box, Divider, MenuItem, Modal, TextField } from '@mui/material';

import StyledButton from './StyledBtn';
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
  '&:focus-visible': {
    outline: 'none',
  },
  '@media (max-width: 500px)': {
    width: 350,
  },
};

export default function Home() {
  const [favMaps, setFavMaps] = useState<number[]>([]);
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    const storedFavMaps = localStorage.getItem('favMaps');
    if (storedFavMaps) {
      setFavMaps(JSON.parse(storedFavMaps));
    } else {
      setFavMaps([22, 23, 18, 19]);
    }
  }, []);

  const handleChange = (val: string, pos: number) => {
    const newMaps = [...favMaps];

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
        <StyledButton onClick={handleOpen}>Change Maps</StyledButton>
      </Box>

      <Modal open={open} onClose={handleClose}>
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
                sx={{ marginBottom: '10px' }}
              >
                {favMaps.length > 2 && (
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
                        color: 'white',
                      },
                    }}
                  >
                    Remove Map
                  </MenuItem>
                )}

                <Divider />

                {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                {/* @ts-ignore - necessary for loading object as value */}
                {frontPageMaps.map((m, i) => (
                  <MenuItem key={i} value={i}>
                    {m.alt}
                  </MenuItem>
                ))}
              </TextField>
            );
          })}

          {favMaps.length < 8 && (
            <StyledButton
              onClick={() => handleChange('add', 0)}
              sx={{
                width: 150,
                position: 'absolute',
                bottom: 32,
                left: 'calc(50% - 75px)',
              }}
            >
              Add Map
            </StyledButton>
          )}
        </Box>
      </Modal>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          boxSizing: 'border-box',
        }}
      >
        {favMaps.map((n, i) => (
          <Box
            key={i}
            sx={{
              width: '50%',
              '@media (max-width: 750px)': { width: '100%' },
            }}
            onClick={() => navigate(frontPageMaps[n].path)}
          >
            <MapPage
              {...frontPageMaps[n]}
              title={frontPageMaps[n].alt}
              description={[]}
              mainSX={{
                padding: '10px',
                boxSizing: 'border-box',
                width: '100%',
                maxWidth: 720,
                margin: '0 auto',
                border: 'none',
                borderRadius: 0,
              }}
            />
          </Box>
        ))}
      </Box>
    </StyledCard>
  );
}
