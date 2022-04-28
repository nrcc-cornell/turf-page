import React, { useState } from 'react';
import {
  Backdrop,
  Box,
  Modal,
  Fade,
  Typography,
  Icon,
  IconButton
} from '@mui/material';
import { Close, WbSunny } from '@mui/icons-material';

import Map from './Map';
import StyledTooltip from './StyledTooltip';


const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  height: '80vh',
  width: '80vw',
  minHeight: 400,
  minWidth: 400,
  boxShadow: 24,
  border: '10px solid rgb(79,88,93)',
  borderRadius: '4px',
  p: 0,
  '&:focus-visible': {
    outline: 'none'
  }
};

type UserLocation = {
  address: string,
  lngLat: number[]
};

type ModalProps = {
    currentLocation: UserLocation,
    pastLocations: UserLocation[],
    handleChangeLocations: (a: 'add' | 'remove' | 'change', b: UserLocation) => void
};



export default function LocationModal(props: ModalProps) {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleForecast = () => {
    window.open(`https://forecast.weather.gov/MapClick.php?lat=${props.currentLocation.lngLat[1]}&lon=${props.currentLocation.lngLat[0]}`, '_blank')?.focus();
  };

  
  return (
    <Box>
      <Box sx={{
        display: 'flex',
        gap: '6px',
        justifyContent: 'center'
      }}>
        <StyledTooltip
          title='Get Local Weather'
          placement='top'
        >
          <Typography
            sx={{
              color: 'rgb(82,82,82)',
              fontSize: '11px',
              fontStyle: 'italic',
              textDecoration: 'underline',
              textAlign: 'center',
              '&:hover': {
                cursor: 'pointer',
                color: 'rgb(50,50,255)',
              }
            }}
            onClick={handleForecast}
          >
            Get Forecast
          </Typography>
        </StyledTooltip>
        <Typography
          sx={{
            color: 'rgb(82,82,82)',
            fontSize: '11px',
            fontStyle: 'italic',
            textDecoration: 'underline',
            textAlign: 'center',
            '&:hover': {
              cursor: 'pointer',
              color: 'rgb(50,50,255)',
            }
          }}
          onClick={handleOpen}
        >
          Change Location
        </Typography>
      </Box>

      <Modal
        keepMounted
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500,
        }}
      >
        <Fade in={open}>
          <Box sx={style}>
            <Map { ...props } handleClose={handleClose} />

            <IconButton onClick={handleClose} sx={{
              position: 'absolute',
              top: 3,
              right: 3,
              backgroundColor: 'white',
              '&:hover': {
                backgroundColor: 'rgb(230,230,230)'
              }
            }}>
              <Close sx={{ fontSize: '13px', color: 'black' }} />
            </IconButton>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
}