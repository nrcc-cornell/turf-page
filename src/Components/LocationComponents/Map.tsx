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


type UserLocation = {
  address: string,
  lngLat: [number, number]
};

type PopupContent = UserLocation & {
  isSelected: boolean
};

type MapProps = {
  currentLocation: UserLocation,
  pastLocations: UserLocation[],
  handleChangeLocations: (a: 'add' | 'remove' | 'change', b: UserLocation) => void,
  handleClose: () => void
};

const bounds = { south: 37.09, west: -82.7542 };



export default function MapComp( props: MapProps) {
  const [popup, setPopup] = useState<PopupContent | null>(null);
  const [viewState, setViewState] = useState({
    longitude: props.currentLocation.lngLat[0],
    latitude: props.currentLocation.lngLat[1],
    zoom: 12
  });

  const mapRef = useRef<any | null>(null);


  const handlePanning = (view: ViewState) => {
    if (view.latitude > 47.53 || view.latitude < bounds.south) {
      view.latitude = viewState.latitude;
    }

    if (view.longitude > -66.89 || view.longitude < bounds.west) {
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
    // props.handleClose();
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
        ref={mapRef}
        mapStyle='mapbox://styles/mapbox/satellite-streets-v11'
        boxZoom={false}
        dragRotate={false}
        touchPitch={false}
        touchZoomRotate={false}
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
          >
            <h3>{popup.address}</h3>
            <h4>Coordinates: {popup.lngLat.join(', ')}</h4>
            {
              popup.isSelected ? '' : <>
                <h5>Click to Use</h5>
                <h5>Right Click to Remove</h5>
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