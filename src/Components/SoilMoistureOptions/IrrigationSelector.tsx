import React from 'react';
import { FormControl, FormHelperText, InputLabel } from '@mui/material';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import DatePanel from 'react-multi-date-picker/plugins/date_panel';
import InputIcon from 'react-multi-date-picker/components/input_icon';

export type IrrigationSelectorProps = {
  today: Date,
  irrigationDates: string[];
  setIrrigationDates: (a:string[]) => void;
};

type FullIrrigationSelectorProps = IrrigationSelectorProps & {
  disabled: boolean;
};


export default function IrrigationSelector(props: FullIrrigationSelectorProps) {
  const march1st = new Date(props.today.getFullYear(), 2, 1);

  const handleChange = (newDates: DateObject[]) => {
    props.setIrrigationDates(newDates.map(date => date.toString()));
  };

  return (
    <FormControl>
      <InputLabel shrink sx={{
        backgroundColor: 'white',
        padding: '0px 6px',
        left: '-3px'
      }}>Irrigation Dates</InputLabel>
      <DatePicker
        multiple
        value={props.irrigationDates}
        onChange={handleChange}
        format='YYYY-MM-DD'
        render={<InputIcon/>}
        hideYear={true}
        minDate={march1st}
        maxDate={props.today}
        sort={true}
        plugins={[
          <DatePanel key='datepanel' />
        ]}
        disabled={props.disabled}
      />
      <FormHelperText>&nbsp;</FormHelperText>
    </FormControl>
  );
}