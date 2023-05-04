/// <reference types="react-scripts" />

type ColorizerFunc = (val: number) => string;

type UserLocation = {
  address: string;
  lngLat: [number, number];
};

type DisplayProps = {
  currentLocation: UserLocation;
  pastLocations: UserLocation[];
  handleChangeLocations: (
    a: 'add' | 'remove' | 'change',
    b: UserLocation
  ) => void;
};