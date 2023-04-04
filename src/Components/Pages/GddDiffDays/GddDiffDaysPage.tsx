import React from 'react';
import { format } from 'date-fns';

import StyledCard from '../../StyledCard';
import StyledDivider from '../../StyledDivider';
import MultiMapPage from '../../MultiMapPage';
import ConditionalText from '../../ConditionalText';

type GddDiffDaysProps = {
  sx: {
    [key:string]: string
  };
  data: [string, number][][];
  pageInfo: GddDiffDaysPageInfo
};

export default function GddDiffDaysPage(props: GddDiffDaysProps) {
  const today = format(new Date(), 'MM-dd-yyyy');
  const todayIdx = props.data[0].findIndex(arr => arr[0] === today);

  return (
    <StyledCard
      variant='outlined'
      sx={props.sx}
    >
      <ConditionalText
        fromLast={
          props.data[0][todayIdx][1]
        }
        fromNormal={
          props.data[1][todayIdx][1]
        }
      />

      <StyledDivider />

      <MultiMapPage maps={props.pageInfo.maps as MapPageProps[]} />
    </StyledCard>
  );
}