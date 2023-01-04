import React, { SetStateAction, Dispatch } from 'react';
import { TextField } from '@mui/material';
import { styled } from '@mui/system';

type GPSelectorProps = {
  value: number;
  label: string;
  setFunction: Dispatch<SetStateAction<number>>;
};

function changeModelSetting(value: string, setFunction: (a: number) => void) {
  let newValue = parseFloat(value);
  if (newValue > 100) newValue = 100;
  if (newValue < 0) newValue = 0;
  setFunction(newValue);
}

const StyledTextField = styled(TextField)({
  '&.MuiTextField-root': {
    width: '180px',
    textAlign: 'center',
    height: '50px',
    '@media (max-width:400px)': {
      width: '152px',
    },
  },
  label: {
    '@media (max-width: 400px)': {
      fontSize: '14px',
      backgroundColor: 'white',
    },
  },
});

export default function GrowthPotentialSelector(props: GPSelectorProps) {
  return (
    <StyledTextField
      type='number'
      size='small'
      label={props.label}
      value={props.value}
      onChange={(e) => changeModelSetting(e.target.value, props.setFunction)}
      inputProps={{
        step: 0.1,
        min: 0,
        max: 100,
        style: {
          textAlign: 'center',
        },
      }}
    />
  );
}
