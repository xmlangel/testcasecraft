// src/components/atoms/LoadingSpinner/LoadingSpinner.jsx
/**
 * 원자적 로딩 스피너 컴포넌트
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingSpinner = ({
  size = 40,
  color = 'primary',
  text,
  centered = true,
  fullPage = false,
  ...props
}) => {
  const content = (
    <>
      <CircularProgress size={size} color={color} {...props} />
      {text && (
        <Typography 
          variant="body2" 
          color="textSecondary" 
          sx={{ mt: 2, textAlign: 'center' }}
        >
          {text}
        </Typography>
      )}
    </>
  );

  if (fullPage) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          zIndex: 9999,
        }}
      >
        {content}
      </Box>
    );
  }

  if (centered) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
        }}
      >
        {content}
      </Box>
    );
  }

  return content;
};

LoadingSpinner.propTypes = {
  size: PropTypes.number,
  color: PropTypes.oneOf(['inherit', 'primary', 'secondary', 'error', 'info', 'success', 'warning']),
  text: PropTypes.string,
  centered: PropTypes.bool,
  fullPage: PropTypes.bool,
};

export default LoadingSpinner;