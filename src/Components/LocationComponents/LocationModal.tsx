import React, { useState } from 'react';
import {
  Backdrop,
  Box,
  Modal,
  Fade,
  Typography,
  IconButton,
} from '@mui/material';
import { Close } from '@mui/icons-material';

import Map from './Map';
import StyledTooltip from './StyledTooltip';

import { radarStations } from '../../Scripts/Data';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  height: '80vh',
  width: '80vw',
  minHeight: 315,
  minWidth: 336,
  boxShadow: 24,
  border: '10px solid rgb(79,88,93)',
  borderRadius: '4px',
  p: 0,
  '&:focus-visible': {
    outline: 'none',
  },
  '@media (max-width: 350px)': {
    minWidth: '100vw',
  },
};

const getSX = {
  color: 'rgb(82,82,82)',
  fontSize: '11px',
  fontStyle: 'italic',
  textDecoration: 'underline',
  textAlign: 'center',
  marginRight: '6px',
  '&:hover': {
    cursor: 'pointer',
    color: 'rgb(50,50,255)',
  },
  '@media (max-width: 700px)': {
    color: 'rgb(220,220,220)',
  },
};

export default function LocationModal(props: ModalProps) {
  const [open, setOpen] = useState(false);
  const [showRadar, setShowRadar] = useState<JSX.Element | null>(null);

  const handleOpen = (isRadar: boolean) => {
    if (isRadar) {
      const nearest = getNearestStation(
        props.currentLocation.lngLat,
        radarStations
      );
      setShowRadar(
        <Box
          sx={{
            backgroundColor: 'rgb(79,88,93)',
            position: 'absolute',
            top: -1,
            bottom: -1,
            left: -1,
            right: -1,
            zIndex: 5,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Box
            component='img'
            src={`https://radar.weather.gov/ridge/lite/${nearest}_loop.gif`}
            alt='Local radar map GIF.'
            sx={{
              maxWidth: '100%',
              maxHeight: 'calc(100% - 40px)',
            }}
          />
        </Box>
      );
    }

    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setShowRadar(null);
  };

  const handleForecast = () => {
    window
      .open(
        `https://forecast.weather.gov/MapClick.php?lat=${props.currentLocation.lngLat[1]}&lon=${props.currentLocation.lngLat[0]}`,
        '_blank'
      )
      ?.focus();
  };

  function distanceBetween(pnt1: number[], pnt2: number[]): number {
    // Convert coordinates to from degrees to radians
    const radians = Math.PI / 180;
    const phi1 = (90 - pnt1[1]) * radians;
    const phi2 = (90 - pnt2[1]) * radians;

    const theta1 = pnt1[0] * radians;
    const theta2 = pnt2[0] * radians;

    // Compute distance between points
    const cos =
      Math.sin(phi1) * Math.sin(phi2) * Math.cos(theta1 - theta2) +
      Math.cos(phi1) * Math.cos(phi2);

    let arc;
    if (cos >= -1.0 && cos <= 1.0) {
      arc = Math.acos(cos);
    } else {
      arc = -999;
    }

    return arc * 3959;
  }

  const getNearestStation = (
    coords: number[],
    stns: { sid: string; lngLat: number[] }[]
  ): string => {
    const closest = stns.reduce(
      (acc, stn) => {
        const distance = distanceBetween(coords, stn.lngLat);

        if (distance < acc.distanceFrom) {
          acc = {
            sid: stn.sid,
            distanceFrom: distance,
          };
        }

        return acc;
      },
      { sid: '', distanceFrom: 9999 }
    );

    return closest.sid;
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <StyledTooltip title='Get Local Weather' placement='top'>
          <Typography sx={getSX} onClick={handleForecast}>
            Get Forecast
          </Typography>
        </StyledTooltip>

        <StyledTooltip title='Get Local Radar' placement='top'>
          <Typography sx={getSX} onClick={() => handleOpen(true)}>
            Get Radar
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
            },
            '@media (max-width: 700px)': {
              color: 'rgb(220,220,220)',
            },
          }}
          onClick={() => handleOpen(false)}
        >
          Change Location
        </Typography>
      </Box>

      <Modal
        keepMounted
        aria-labelledby='transition-modal-title'
        aria-describedby='transition-modal-description'
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
            <Map {...props} />

            {showRadar}

            <IconButton
              onClick={handleClose}
              sx={{
                position: 'absolute',
                top: 8,
                right: 5,
                backgroundColor: 'rgb(240,240,240)',
                zIndex: 5,
                '&:hover': {
                  backgroundColor: 'rgb(220,220,220)',
                },
              }}
            >
              <Close sx={{ fontSize: '13px', color: 'black' }} />
            </IconButton>
          </Box>
        </Fade>
      </Modal>
    </Box>
  );
}
