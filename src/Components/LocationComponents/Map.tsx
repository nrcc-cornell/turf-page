import React, { useState, useRef } from 'react';

import { Box } from '@mui/material';

import 'mapbox-gl/dist/mapbox-gl.css';
import mapboxgl from 'mapbox-gl';
const token = 'pk.eyJ1IjoicHJlY2lwYWRtaW4iLCJhIjoiY2txYjNjMHYxMGF4NTJ1cWhibHNub3BrdiJ9.1T_U5frbnHaHonvFpHenxQ';
mapboxgl.accessToken = token;
import Map, { Popup, ViewState } from 'react-map-gl';

import Markers from './Markers';

import { getLocation } from '../../Scripts/Data';
import MapBar from './MapBar';
import roundXDigits from '../../Scripts/Rounding';



const bounds = { south: 37.09, west: -82.7542 };

function isTouchDevice() {
  return (('ontouchstart' in window) ||
     (navigator.maxTouchPoints > 0));
}

// Uses all past locations to find the bounding coordinates for the initial map view
function calcInitBounds(locations: UserLocation[]) {
  let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;
  Object.values(locations).forEach(loc => {
    const lng = loc.lngLat[0];
    const lat = loc.lngLat[1];
    if (lat > maxLat) maxLat = lat;
    if (lat < minLat) minLat = lat;
    if (lng > maxLng) maxLng = lng;
    if (lng < minLng) minLng = lng;
  });


  // If only one location is present, adjust the coordinates to reduce initial zoom
  const adjustment = 0.1;
  if (minLat === maxLat) {
    minLat -= adjustment;
    maxLat += adjustment;
  }

  if (minLng === maxLng) {
    minLng -= adjustment;
    maxLng += adjustment;
  }

  return [minLng, minLat, maxLng, maxLat];
}



export default function MapComp( props: MapProps) {
  // const [popup, setPopup] = useState<PopupContent | null>(null);
  // const [viewState, setViewState] = useState({
  //   longitude: props.currentLocation.lngLat[0],
  //   latitude: props.currentLocation.lngLat[1],
  //   zoom: 12
  // });

  const [popup, setPopup] = useState<PopupContent | null>(null);
  const [viewState, setViewState] = useState({
    bounds: calcInitBounds(props.pastLocations),
    fitBoundsOptions: {
      padding: {
        top: 100,
        bottom: 10,
        left: 15,
        right: 15
      }
    }
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

    setViewState(prev => {
      return {
        ...prev,
        ...view
      };
    });
  };

  const handleMarkerClick = (e: mapboxgl.MapboxEvent<MouseEvent>, loc: UserLocation) => {
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
      const newLocation: UserLocation | false = await getLocation(lng, lat, token);
  
      if (newLocation && mapRef.current) {
        props.handleChangeLocations('add', newLocation);
        mapRef.current.flyTo({
          center: newLocation.lngLat,
          speed: 0.8,
          essential: true
        });
      }
    }
  };


  return (
    <Box sx={{
      width: '100%',
      height: '100%',
      position: 'relative'
    }}>
      <Map
        {...viewState}
        ref={mapRef}
        mapStyle='mapbox://styles/mapbox/satellite-streets-v11'
        boxZoom={false}
        dragRotate={false}
        touchPitch={false}
        doubleClickZoom={false}
        attributionControl={false}
        onMove={evt => handlePanning(evt.viewState)}
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
        {
          popup && <Popup
            longitude={popup.lngLat[0]}
            latitude={popup.lngLat[1]}
            closeOnClick={false}
            closeButton={false}
            onClose={() => setPopup(null)}
            offset={{
              'center': [0, 0],
              'left': [12, 0],
              'right': [-12, 0],
              'top': [0, -6],
              'top-left': [10, 3],
              'top-right': [-20, 3],
              'bottom': [0, -16],
              'bottom-left': [10, -12],
              'bottom-right' : [-20, -12]
            }}
            style={{ zIndex: 4 }}
          >
            <h3>{popup.address}</h3>
            <h4>Coordinates: {roundXDigits(popup.lngLat[0], 5)}, {roundXDigits(popup.lngLat[1], 5)}</h4>
            {
              popup.isSelected ? '' : <>
                <h5>Click to Use</h5>
                {isTouchDevice() ? 
                  <h5>Click and Hold to Remove</h5>
                  :
                  <h5>Right Click to Remove</h5>
                }
              </>
            }
          </Popup>
        }
      </Map>

      <MapBar
        token={token}
        bounds={bounds}
        handleChangeLocations={props.handleChangeLocations}
        mapRef={mapRef}
      />
    </Box>
  );
}