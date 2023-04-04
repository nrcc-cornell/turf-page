import { Card } from '@mui/material';
import { styled } from '@mui/material/styles';
const StyledCard = styled(Card)({
  padding: '10px',
  boxSizing: 'border-box',
  width: '90%',
  maxWidth: 1300,
  margin: '0 auto',
  '@media (max-width: 430px)': {
    width: '100%',
    padding: '10px 0px',
    border: 'none',
  },
});

export default StyledCard;
