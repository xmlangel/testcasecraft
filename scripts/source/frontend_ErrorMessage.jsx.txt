// src/components/atoms/ErrorMessage/ErrorMessage.jsx
/**
 * 원자적 에러 메시지 컴포넌트
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Alert, AlertTitle, Box, Button } from '@mui/material';
import { Refresh } from '@mui/icons-material';

const ErrorMessage = ({
  title = '오류가 발생했습니다',
  message,
  severity = 'error',
  variant = 'filled',
  showRetry = false,
  onRetry,
  retryText = '다시 시도',
  onClose,
  ...props
}) => {
  return (
    <Alert
      severity={severity}
      variant={variant}
      onClose={onClose}
      action={
        showRetry && onRetry ? (
          <Button
            color="inherit"
            size="small"
            startIcon={<Refresh />}
            onClick={onRetry}
          >
            {retryText}
          </Button>
        ) : null
      }
      {...props}
    >
      {title && <AlertTitle>{title}</AlertTitle>}
      {message && (
        <Box component="div" sx={{ whiteSpace: 'pre-wrap' }}>
          {message}
        </Box>
      )}
    </Alert>
  );
};

ErrorMessage.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  severity: PropTypes.oneOf(['error', 'warning', 'info', 'success']),
  variant: PropTypes.oneOf(['filled', 'outlined', 'standard']),
  showRetry: PropTypes.bool,
  onRetry: PropTypes.func,
  retryText: PropTypes.string,
  onClose: PropTypes.func,
};

export default ErrorMessage;