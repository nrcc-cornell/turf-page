import React, { useState, useRef } from 'react';

import { Box } from '@mui/material';

import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
const token =
  'pk.eyJ1IjoicHJlY2lwYWRtaW4iLCJhIjoiY2txYjNjMHYxMGF4NTJ1cWhibHNub3BrdiJ9.1T_U5frbnHaHonvFpHenxQ';
mapboxgl.accessToken = token;
import Map, { Popup, ViewState } from 'react-map-gl';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
mapboxgl.workerClass =
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;

import Markers from '../LocationComponents/Markers';

import { getLocation } from '../../Scripts/Data';
import roundXDigits from '../../Scripts/Rounding';

const bounds = { south: 37.09, west: -82.7542 };

function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

export default function GrowthPotentialMap(props: MapProps) {
  const [popup, setPopup] = useState<PopupContent | null>(null);
  const [viewState, setViewState] = useState({
    bounds: [-79.9, 40.45, -71.8, 45.05],
    // fitBoundsOptions: {
    //   padding: {
    //     top: 100,
    //     bottom: 10,
    //     left: 15,
    //     right: 15,
    //   },
    // },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any | null>(null);

  const handlePanning = (view: ViewState) => {
    if (view.latitude > 47.53 || view.latitude < bounds.south) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      view.latitude = viewState.latitude;
    }

    if (view.longitude > -66.89 || view.longitude < bounds.west) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      view.longitude = viewState.longitude;
    }

    setViewState((prev) => {
      return {
        ...prev,
        ...view,
      };
    });
  };

  const handleMarkerClick = (
    e: mapboxgl.MapboxEvent<MouseEvent>,
    loc: UserLocation
  ) => {
    e.originalEvent.stopPropagation();
    props.handleChangeLocations('change', loc);
  };

  const handleMarkerRightClick = (loc: UserLocation, isSelected: boolean) => {
    if (!isSelected) {
      props.handleChangeLocations('remove', loc);
      setPopup(null);
    }
  };

  const handleMarkerMouseEnter = (newContent: PopupContent) => {
    setPopup(newContent);
  };

  const handleMarkerMouseLeave = () => {
    setPopup(null);
  };

  const handleMapClick = async (e: mapboxgl.MapLayerMouseEvent) => {
    const lng = e.lngLat.lng;
    const lat = e.lngLat.lat;

    if (lng >= bounds.west && lat >= bounds.south) {
      const newLocation: UserLocation | false = await getLocation(
        lng,
        lat,
        token
      );

      if (newLocation && mapRef.current) {
        props.handleChangeLocations('add', newLocation);
        mapRef.current.flyTo({
          center: newLocation.lngLat,
          speed: 0.8,
          essential: true,
        });
      }
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
      }}
    >
      <Map
        {...viewState}
        ref={mapRef}
        mapStyle='mapbox://styles/precipadmin/clbqxcrdb000014pjs0qz90h5'
        boxZoom={false}
        dragRotate={false}
        touchPitch={false}
        doubleClickZoom={false}
        attributionControl={false}
        onMove={(evt) => handlePanning(evt.viewState)}
        onClick={handleMapClick}
      >
        <Markers
          currentLocation={props.currentLocation}
          pastLocations={props.pastLocations}
          onMarkerMouseEnter={handleMarkerMouseEnter}
          onMarkerMouseLeave={handleMarkerMouseLeave}
          onMarkerClick={handleMarkerClick}
          onMarkerRightClick={handleMarkerRightClick}
        />
        {popup && (
          <Popup
            longitude={popup.lngLat[0]}
            latitude={popup.lngLat[1]}
            closeOnClick={false}
            closeButton={false}
            onClose={() => setPopup(null)}
            offset={{
              center: [0, 0],
              left: [12, 0],
              right: [-12, 0],
              top: [0, -6],
              'top-left': [10, 3],
              'top-right': [-20, 3],
              bottom: [0, -16],
              'bottom-left': [10, -12],
              'bottom-right': [-20, -12],
            }}
            style={{ zIndex: 4 }}
          >
            <h3>{popup.address}</h3>
            <h4>
              Coordinates: {roundXDigits(popup.lngLat[0], 5)},{' '}
              {roundXDigits(popup.lngLat[1], 5)}
            </h4>
            {popup.isSelected ? (
              ''
            ) : (
              <>
                <h5>Click to Use</h5>
                {isTouchDevice() ? (
                  <h5>Click and Hold to Remove</h5>
                ) : (
                  <h5>Right Click to Remove</h5>
                )}
              </>
            )}
          </Popup>
        )}
      </Map>
    </Box>
  );
}
