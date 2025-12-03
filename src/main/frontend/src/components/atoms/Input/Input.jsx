// src/components/atoms/Input/Input.jsx
/**
 * 원자적 입력 컴포넌트
 * Material-UI TextField를 확장하여 일관된 스타일과 검증 제공
 */

import React, { forwardRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { TextField, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const Input = forwardRef(({
  label,
  value,
  onChange,
  onBlur,
  error = false,
  helperText,
  placeholder,
  type = 'text',
  variant = 'outlined',
  size = 'small',
  fullWidth = true,
  required = false,
  disabled = false,
  multiline = false,
  rows,
  maxRows,
  startAdornment,
  endAdornment,
  showPasswordToggle = false,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  
  const handlePasswordToggle = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const handleChange = useCallback((event) => {
    onChange?.(event.target.value, event);
  }, [onChange]);

  const actualType = type === 'password' && showPassword ? 'text' : type;
  
  const passwordAdornment = showPasswordToggle && type === 'password' ? (
    <InputAdornment position="end">
      <IconButton
        aria-label="toggle password visibility"
        onClick={handlePasswordToggle}
        edge="end"
        size="small"
      >
        {showPassword ? <VisibilityOff /> : <Visibility />}
      </IconButton>
    </InputAdornment>
  ) : null;

  const finalEndAdornment = passwordAdornment || endAdornment;

  return (
    <TextField
      ref={ref}
      label={label}
      value={value}
      onChange={handleChange}
      onBlur={onBlur}
      error={error}
      helperText={helperText}
      placeholder={placeholder}
      type={actualType}
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      required={required}
      disabled={disabled}
      multiline={multiline}
      rows={rows}
      maxRows={maxRows}
      {...props}
      slotProps={{
        input: {
          startAdornment,
          endAdornment: finalEndAdornment,
        }
      }} />
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  label: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  placeholder: PropTypes.string,
  type: PropTypes.oneOf(['text', 'password', 'email', 'number', 'tel', 'url', 'search']),
  variant: PropTypes.oneOf(['outlined', 'filled', 'standard']),
  size: PropTypes.oneOf(['small', 'medium']),
  fullWidth: PropTypes.bool,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  multiline: PropTypes.bool,
  rows: PropTypes.number,
  maxRows: PropTypes.number,
  startAdornment: PropTypes.node,
  endAdornment: PropTypes.node,
  showPasswordToggle: PropTypes.bool,
};

export default Input;