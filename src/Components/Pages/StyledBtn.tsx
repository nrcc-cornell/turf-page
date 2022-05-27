import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';
const StyledButton = styled(Button)({
  backgroundColor: 'rgb(85,86,90)',
  color: 'white',
  '&:hover': {
    backgroundColor: 'rgb(105,106,110)'
  }
});

export default StyledButton;