import React, { useState, useRef, useEffect } from 'react';

import { Box } from '@mui/material';

import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
const token =
  'pk.eyJ1IjoicHJlY2lwYWRtaW4iLCJhIjoiY2xkdGFiNTVwMXo2cjNycWU1N2syaGw4bSJ9.AGGEeNa70dDIEFL3W6KezQ';
mapboxgl.accessToken = token;
import Map, { Layer, Popup, Source, ViewState } from 'react-map-gl';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
mapboxgl.workerClass =
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;

  
import { getLocation } from '../../Scripts/Data';
import roundXDigits from '../../Scripts/Rounding';
import WarningIcon from '../WarningIcon';
import Markers from '../LocationComponents/Markers';

const bounds = { south: 37.09, west: -82.7542 };
const mainMapStyle =
  'mapbox://styles/precipadmin/clbqxcrdb000014pjs0qz90h5/draft';
const zoomedMapStyle = 'mapbox://styles/mapbox/satellite-streets-v11';

function isTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

export default function OverlayMap(props: OverlayMapProps) {
  const [mapStyle, setMapStyle] = useState(mainMapStyle);
  const [popup, setPopup] = useState<PopupContent | null>(null);
  const [viewState, setViewState] = useState({
    bounds: [-79.9, 40.45, -71.8, 45.05],
    longitude: props.currentLocation.lngLat[0],
    latitude: props.currentLocation.lngLat[1],
    zoom: 8.5,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const overlayMapRef = useRef<any | null>(null);

  useEffect(() => {
    if ('zoom' in viewState && overlayMapRef.current) {
      const currStyle = overlayMapRef.current.getStyle().name;
      if (viewState.zoom >= 11 && currStyle === 'Soil Saturation') {
        setMapStyle(zoomedMapStyle);
      } else if (viewState.zoom < 11 && currStyle !== 'Soil Saturation') {
        setMapStyle(mainMapStyle);
      }
    }
  }, [viewState]);

  const handlePanning = (view: ViewState) => {
    if (view.latitude > 47.53 || view.latitude < bounds.south) {
      view.latitude = viewState.latitude;
    }

    if (view.longitude > -66.89 || view.longitude < bounds.west) {
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

      if (newLocation && overlayMapRef.current) {
        props.handleChangeLocations('add', newLocation);
        overlayMapRef.current.flyTo({
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
        height: '500px',
        border: '1px solid black',
        position: 'relative'
      }}
    >
      <Map
        {...viewState}
        ref={overlayMapRef}
        mapStyle={mapStyle}
        boxZoom={false}
        dragRotate={false}
        touchPitch={false}
        doubleClickZoom={false}
        attributionControl={false}
        onMove={(evt) => handlePanning(evt.viewState)}
        onClick={handleMapClick}
      >
        {props.src && (
          <Source
            id='overlay'
            type='image'
            url={props.src}
            coordinates={[
              [-79.95970329697062, 46.54645497007963],
              [-69.66501014096089, 46.54645497007963],
              [-69.66501014096083, 39.33905737461734],
              [-79.95970329697053, 39.3390573746173],
            ]}
          >
            <Layer
              id='overlay-layer'
              source='overlay'
              type='raster'
              paint={{ 'raster-opacity': viewState.zoom >= 11 ? 0 : 0.85 }}
            />
          </Source>
        )}

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

      {props.currentLocation.address.split(', ').slice(-1)[0] !== 'New York' &&
      <Box sx={{ position: 'absolute',
      top: 0, left: 0 }}>
        <WarningIcon onClick={() => overlayMapRef.current.flyTo({
          center: [-75.5, 42.9],
          zoom: 5.2,
          speed: 1.5,
          essential: true,
        })}/>
      </Box>}
    </Box>
  );
}
