import React from 'react';

import StyledCard from '../../StyledCard';
import StyledDivider from '../../StyledDivider';
import RiskGraph from './RiskGraph';
import RSWMaps from '../../RSWMaps';
import { RiskDataObj } from '../../../Scripts/getRiskIndices';

export type DiseaseStressRiskPageInfo = {
  maps: {
    title: string;
    thumbs: {
      fullSizeUrl: string;
      thumbUrl: string;
      name: string;
      title: string;
      alt?: string;
      date?: string;
    }[];
  }[];
  pageType: 'risk';
  chart: {
    rows: {
      thresholds: {
        low: number;
        medium: number;
        high: number;
      };
      rowName: string;
      data: 'anthracnose' | 'brownPatch' | 'dollarspot' | 'pythiumBlight' | 'heatStress';
    }[];
    legend: string[][];
    title: string;
  };
  text: {
    titlePart: string;
    description: string[];
    references?: string[];
  };
};

type DiseaseStressRiskProps = {
  todayFromAcis: boolean;
  sx: {
    [key:string]: string
  };
  data: RiskDataObj;
  pageInfo: DiseaseStressRiskPageInfo;
  today: Date;
};

export default function DiseaseStressRiskPage(props: DiseaseStressRiskProps) {
  return (
    <StyledCard
      variant='outlined'
      sx={props.sx}
    >
      <RiskGraph
        data={props.data}
        todayFromAcis={props.todayFromAcis}
        thresholds={props.pageInfo.chart.rows[0].thresholds}
        title={props.pageInfo.chart.title}
        today={props.today}
      />

      <StyledDivider />

      <RSWMaps maps={props.pageInfo.maps} text={props.pageInfo.text} />
    </StyledCard>
  );
}