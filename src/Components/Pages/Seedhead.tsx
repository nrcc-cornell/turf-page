import React from 'react';

type SeedheadProps = {
  coords: number[]
};



export default function Seedhead(props: SeedheadProps) {
  return (
    <div>{JSON.stringify(props)}</div>
  );
}