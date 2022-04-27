import React from 'react';
import { Marker } from 'react-map-gl';
import { Box } from '@mui/material';


type UserLocation = {
  address: string,
  lngLat: number[]
};

type PopupContent = UserLocation & {
  isSelected: boolean
};

type MarkersProps = {
  onMarkerMouseEnter: (a: PopupContent) => void
  onMarkerMouseLeave: () => void
  onMarkerClick: (a: mapboxgl.MapboxEvent<MouseEvent>, b: UserLocation) => void
  onMarkerRightClick: (a: UserLocation, b: boolean) => void
  currentLocation: UserLocation
  pastLocations: UserLocation[]
};



export default function Markers(props: MarkersProps) {
  return <>
    {props.pastLocations.map(loc => {
      const isSelected = loc.lngLat[0] === props.currentLocation.lngLat[0] && loc.lngLat[1] === props.currentLocation.lngLat[1];
          
      return (
        <Marker
          key={loc.address}
          longitude={loc.lngLat[0]}
          latitude={loc.lngLat[1]}
          onClick={(e) => props.onMarkerClick(e, loc)}
          style={{ zIndex: isSelected ? 2 : 1 }}
        >
          <Box
            className={isSelected ? 'curr-marker' : 'marker'}
            onMouseEnter={() => props.onMarkerMouseEnter({ ...loc, isSelected })}
            onMouseLeave={props.onMarkerMouseLeave}
            onContextMenu={() => props.onMarkerRightClick(loc, isSelected)}
          ></Box>
        </Marker>
      );
    })}
  </>;
}