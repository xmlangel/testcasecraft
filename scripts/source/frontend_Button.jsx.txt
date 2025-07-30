// src/components/atoms/Button/Button.jsx
/**
 * 원자적 버튼 컴포넌트
 * Material-UI Button을 확장하여 일관된 스타일과 동작 제공
 */

import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Button as MuiButton, CircularProgress } from '@mui/material';

const Button = forwardRef(({
  children,
  loading = false,
  disabled = false,
  loadingText = '처리중...',
  startIcon,
  endIcon,
  variant = 'contained',
  color = 'primary',
  size = 'medium',
  fullWidth = false,
  onClick,
  ...props
}, ref) => {
  const handleClick = (event) => {
    if (loading || disabled) {
      event.preventDefault();
      return;
    }
    onClick?.(event);
  };

  const isDisabled = disabled || loading;

  return (
    <MuiButton
      ref={ref}
      variant={variant}
      color={color}
      size={size}
      fullWidth={fullWidth}
      disabled={isDisabled}
      onClick={handleClick}
      startIcon={loading ? <CircularProgress size={16} /> : startIcon}
      endIcon={!loading ? endIcon : undefined}
      {...props}
    >
      {loading ? loadingText : children}
    </MuiButton>
  );
});

Button.displayName = 'Button';

Button.propTypes = {
  children: PropTypes.node.isRequired,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  loadingText: PropTypes.string,
  startIcon: PropTypes.node,
  endIcon: PropTypes.node,
  variant: PropTypes.oneOf(['text', 'outlined', 'contained']),
  color: PropTypes.oneOf(['inherit', 'primary', 'secondary', 'success', 'error', 'info', 'warning']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  fullWidth: PropTypes.bool,
  onClick: PropTypes.func,
};

export default Button;