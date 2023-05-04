import React from 'react';
import { Marker } from 'react-map-gl';
import { Box } from '@mui/material';



export default function Markers(props: MarkersProps) {
  return <>
    {props.pastLocations.map((loc, i) => {
      const isSelected = loc.lngLat[0] === props.currentLocation.lngLat[0] && loc.lngLat[1] === props.currentLocation.lngLat[1];
          
      return (
        <Marker
          key={loc.address + i}
          longitude={loc.lngLat[0]}
          latitude={loc.lngLat[1]}
          onClick={(e) => props.onMarkerClick(e, loc)}
          style={{ zIndex: isSelected ? 2 : 1, top: -20 }}
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