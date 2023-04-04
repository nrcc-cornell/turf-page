import React from 'react';

import StyledCard from '../../StyledCard';
import MultiMapPage from '../../MultiMapPage';

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
      <MultiMapPage maps={props.pageInfo.maps as MapPageProps[]} />
    </StyledCard>
  );
}