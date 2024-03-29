import React from 'react';

import {
  CardContent,
  Typography,
  Box
} from '@mui/material';
import StyledDivider from './StyledDivider';

export type TextProps = {
  titlePart: string;
  description: string[];
  references?: string[];
};

const BoxSX = {
  display: 'flex',
  flexDirection: 'column',
  boxSizing: 'border-box'
};

const TitleSX = {
  marginBottom: '10px'
};



export default function TextContent(props: TextProps) {
  const renderText = (arr: string[]) => {
    return arr.map((text, i) => <Typography key={i} variant='mapPage' sx={{ textAlign: 'justify', lineHeight: '1.2', margin: '7px 0px' }} dangerouslySetInnerHTML={{__html: text}}></Typography>);
  };
  
  return (
    <CardContent sx={{ maxWidth: 700, margin: '0 auto' }}>
      <Typography variant='h5' sx={TitleSX}>{props.titlePart}</Typography>
      <Box sx={BoxSX}>{props.description && renderText(props.description)}</Box>

      {'references' in props &&
        <>
          <StyledDivider />
          <Typography variant='h5' sx={TitleSX}>References</Typography>
          <Box sx={BoxSX}>{props?.references && renderText(props.references)}</Box>
        </>
      }
    </CardContent>
  );
}