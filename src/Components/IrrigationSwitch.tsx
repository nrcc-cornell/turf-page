import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, FormControlLabel, Switch } from '@mui/material';

type IrrigationSwitchProps = {
  checked: boolean;
  setFunction: (a: boolean) => void;
};

export default function IrrigationSwitch(props: IrrigationSwitchProps) {
  return (
    <FormGroup sx={{ alignItems: 'center' }}>
      <FormControlLabel
        control={
          <Switch
            checked={props.checked}
            onChange={(e) => props.setFunction(e.target.checked)}
          />
        }
        label='Irrigation Used?'
      />
    </FormGroup>
  );
}

IrrigationSwitch.propTypes = {
  checked: PropTypes.bool,
  setFunction: PropTypes.func,
};
