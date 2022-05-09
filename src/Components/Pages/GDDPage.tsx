import React from 'react';

import ListChart from './ListChart';
import StyledDivider from './StyledDivider';
import MultiMapPage from './MultiMapPage';
import StyledCard from './StyledCard';


type DateValue = [ string, number ];

type MapPageProps = {
  url: string,
  alt: string,
  description: string[]
};

type GDDProps = {
  maps: MapPageProps[],
  data: DateValue[] | null,
  todayFromAcis: boolean,
  base: string
};



export default function GDDPage(props: GDDProps) {
  return (
    <StyledCard variant='outlined'>
      <ListChart data={props.data} todayFromAcis={props.todayFromAcis} title={`${props.base}°F GDD Accumulations`} />
      
      <StyledDivider />

      <MultiMapPage maps={props.maps} />
    </StyledCard>
  );
}