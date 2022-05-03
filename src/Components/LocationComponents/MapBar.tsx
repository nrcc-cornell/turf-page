/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';

import {
  TextField,
  Box,
  Button
} from '@mui/material';

import { states } from '../../Scripts/Data';

type MapBarProps = {
  token: string,
  bounds: {
    south: number,
    west: number
  },
  handleChangeLocations: (a: 'add' | 'change' | 'remove', b: UserLocation) => void,
  mapRef: any
};

type UserLocation = {
  address: string,
  lngLat: [number, number]
};



export default function MapBar(props: MapBarProps ) {
  const [address, setAddress] = useState('');

  const handleSearch = (): void => {
    fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${address.replaceAll(' ', '%20')}.json?proximity=-75.37,43.21&country=US&types=postcode,place,address&access_token=${props.token}`, { method: 'GET' })
      .then(response => response.json())
      .then(jData => {
        const newLocation = jData.features.reduce((acc: UserLocation | false, feat: any) => {
          const region = feat.context.find((c: any) => c.id.includes('region') && Object.keys(states).includes(c.text));
          if (!acc && region && feat.center[0] >= props.bounds.west && feat.center[1] >= props.bounds.south) {
            const type = feat.place_type[0];
            
            let address;
            if (type === 'postcode') {
              address = feat.place_name.split(',').slice(0,2).join(',');
            } else if (type === 'place') {
              address = `${feat.text}, ${region.text}`;
            } else if (type === 'address') {
              const city = feat.context.find((c: any) => c.id.includes('place'));
              address = `${feat.text}, ${city.text}, ${region.text}`;
            }
  
            return {
              address,
              lngLat: feat.center
            };
          }

          return acc;
        }, false);

        if (newLocation) {
          setAddress(newLocation.address);
          props.handleChangeLocations('add', newLocation);
          props.mapRef.current.flyTo({
            center: newLocation.lngLat,
            speed: 0.8,
            essential: true
          });
        }
      })
      .catch(e => {
        console.log(e);
        return false;
      });
  };


  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      backgroundColor: 'white',
      paddingLeft: '12px',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 45,
      zIndex: 2
    }}>
      <TextField
        size='small'
        label='Address Search'
        onChange={(e) => setAddress(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' ? handleSearch() : ''}
        value={address}
        InputLabelProps={{ shrink: true }}
        sx={{
          width: '62.5%',
          maxWidth: 500,
          '& .MuiInputBase-input': {
            fontSize: '12px',
            padding: '6px 8px'
          }
        }}
      />

      <Button
        onClick={handleSearch}
        sx={{
          height: '30px',
          backgroundColor: 'rgb(230,230,230)',
          fontSize: '12px',
          color: 'black',
          '&:hover': {
            backgroundColor: 'rgb(210,210,210)'
          }
        }}
      >Search</Button>
    </Box>
  );
}