import React from 'react';

import StyledCard from '../../StyledCard';
import MultiMapPage, { MultiMapPageMaps } from '../../MultiMapPage';

export type MapsOnlyPageInfo = {
  maps: {
    url: string;
    alt: string;
    description: string[];
    title?: string;
    mainSX?: {
      [key: string]: string | number;
    };
  }[];
  pageType: 'mapsOnly' | 'runoffRisk' | 'growthPotential';
};

type MapsOnlyPageProps = {
  sx: {
    [key:string]: string
  };
  pageInfo: MapsOnlyPageInfo
};

export default function MapsOnlyPage(props: MapsOnlyPageProps) {
  return (
    <StyledCard
      variant='outlined'
      sx={props.sx}
    >
      <MultiMapPage maps={props.pageInfo.maps as MultiMapPageMaps} />
    </StyledCard>
  );
}