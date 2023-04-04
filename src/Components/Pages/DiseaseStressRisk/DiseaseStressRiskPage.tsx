import React from 'react';

import StyledCard from '../../StyledCard';
import StyledDivider from '../../StyledDivider';
import RiskGraph from './RiskGraph';
import RSWMaps from '../../RSWMaps';

type DiseaseStressRiskProps = {
  todayFromAcis: boolean;
  sx: {
    [key:string]: string
  };
  data: RiskData;
  pageInfo: DiseaseStressRiskPageInfo
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
      />

      <StyledDivider />

      <RSWMaps maps={props.pageInfo.maps} text={props.pageInfo.text} />
    </StyledCard>
  );
}