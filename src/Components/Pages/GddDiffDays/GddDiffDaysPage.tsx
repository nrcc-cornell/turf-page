import React from 'react';
import { format } from 'date-fns';

import StyledCard from '../../StyledCard';
import StyledDivider from '../../StyledDivider';
import MultiMapPage, { MultiMapPageMaps } from '../../MultiMapPage';
import GddConditionalText from './GddConditionalText';

export type GddDiffDaysPageInfo = {
  maps: {
    url: string;
    alt: string;
    description: string[];
    title?: string;
    mainSX?: {
      [key: string]: string | number;
    };
  }[];
  pageType: 'text';
  data: 'gdd50DiffDays';
};

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
      <GddConditionalText
        fromLast={
          props.data[0][todayIdx][1]
        }
        fromNormal={
          props.data[1][todayIdx][1]
        }
      />

      <StyledDivider />

      <MultiMapPage maps={props.pageInfo.maps as MultiMapPageMaps} />
    </StyledCard>
  );
}