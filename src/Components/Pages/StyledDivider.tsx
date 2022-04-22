import { Divider } from '@mui/material';
import { styled } from '@mui/material/styles';

const circle = {
  content: '"~"',
  display: 'inline-block',
  position: 'absolute',
  top: -24,
  color: 'rgb(239,64,53)',
  fontSize: '45px'
};

const StyledDivider = styled(Divider)({
  width: '66%',
  margin: '40px auto 30px auto',
  border: '1px solid rgb(239,64,53)',
  borderRadius: 5,
  position: 'relative',
  overflow: 'visible',
  '::before': {
    ...circle,
    left: -40
  },
  '::after': {
    ...circle,
    right: -40,
    transform: 'scale(-1, 1)'
  }
});

export default StyledDivider;