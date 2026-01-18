import React from 'react';
import { Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledDashboardPaperRoot = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
}));

const StyledDashboardPaper = ({ children, ...props }) => {
  return (
    <StyledDashboardPaperRoot elevation={3} {...props}>
      {children}
    </StyledDashboardPaperRoot>
  );
};

export default StyledDashboardPaper;
