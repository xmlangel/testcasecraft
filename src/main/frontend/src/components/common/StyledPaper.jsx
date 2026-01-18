import React from 'react';
import { Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaperRoot = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: "100%",
  transition: "box-shadow 0.3s, transform 0.3s",
  "&:hover": { boxShadow: 6, transform: "scale(1.03)" },
}));

const StyledPaper = ({ children, ...props }) => {
  return (
    <StyledPaperRoot elevation={3} {...props}>
      {children}
    </StyledPaperRoot>
  );
};

export default StyledPaper;
