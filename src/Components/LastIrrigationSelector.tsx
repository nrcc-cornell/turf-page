import React, { Dispatch, SetStateAction } from 'react';
import { TextField } from '@mui/material';
import { format } from 'date-fns';

export type LastIrrigationSelectorProps = {
  today: Date,
  lastIrrigation: string | null;
  setLastIrrigation: Dispatch<SetStateAction<string>>;
};


export default function LastIrrigationSelector(props: LastIrrigationSelectorProps) {
  const strToday = format(props.today, 'yyyy-MM-dd');
  const strMarch1st = strToday.slice(0,4) + '-03-01';

  return (
    <TextField
      type='date'
      label='Last Irrigation Date'
      value={props.lastIrrigation}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => props.setLastIrrigation(e.target.value)}
      InputLabelProps={{ shrink: true }}
      inputProps={{
        min: strMarch1st,
        max: strToday,
        style: {
          textAlign: 'center',
        }
      }}
      helperText='Assumes 0.5" added to lawn'
    />
  );
}