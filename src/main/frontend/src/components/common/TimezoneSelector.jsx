// src/main/frontend/src/components/common/TimezoneSelector.jsx
import React from "react";
import PropTypes from "prop-types";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Box,
  Autocomplete,
  TextField
} from "@mui/material";
import { useI18n } from "../../context/I18nContext.jsx";

/**
 * 시간대 선택 컴포넌트
 */
export function TimezoneSelector({
  value,
  onChange,
  label,
  helperText,
  variant = "outlined",
  size = "medium",
  fullWidth = false,
  error = false,
  errorText = "",
  disabled = false,
  useAutocomplete = false
}) {
  const { t } = useI18n();

  // 주요 타임존 목록
  const commonTimezones = [
    { value: "UTC", label: t('timezone.utc', 'UTC (UTC+0)'), offset: "+0:00" },
    { value: "Asia/Seoul", label: t('timezone.seoul', 'Seoul (UTC+9)'), offset: "+9:00" },
    { value: "America/New_York", label: t('timezone.newYork', 'New York (UTC-5/-4)'), offset: "-5:00/-4:00" },
    { value: "America/Los_Angeles", label: t('timezone.losAngeles', 'Los Angeles (UTC-8/-7)'), offset: "-8:00/-7:00" },
    { value: "Europe/London", label: t('timezone.london', 'London (UTC+0/+1)'), offset: "+0:00/+1:00" },
    { value: "Europe/Paris", label: t('timezone.paris', 'Paris (UTC+1/+2)'), offset: "+1:00/+2:00" },
    { value: "Asia/Tokyo", label: t('timezone.tokyo', 'Tokyo (UTC+9)'), offset: "+9:00" },
    { value: "Asia/Shanghai", label: t('timezone.shanghai', 'Shanghai (UTC+8)'), offset: "+8:00" },
    { value: "Asia/Singapore", label: t('timezone.singapore', 'Singapore (UTC+8)'), offset: "+8:00" },
    { value: "Asia/Hong_Kong", label: t('timezone.hongKong', 'Hong Kong (UTC+8)'), offset: "+8:00" },
    { value: "Australia/Sydney", label: t('timezone.sydney', 'Sydney (UTC+10/+11)'), offset: "+10:00/+11:00" },
  ];

  const handleChange = (event) => {
    const newValue = event.target.value;
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleAutocompleteChange = (event, newValue) => {
    if (onChange && newValue) {
      onChange(newValue.value);
    }
  };

  // Autocomplete 버전
  if (useAutocomplete) {
    const selectedTimezone = commonTimezones.find(tz => tz.value === value) || null;

    return (
      <FormControl
        fullWidth={fullWidth}
        variant={variant}
        size={size}
        error={error}
        disabled={disabled}
      >
        <Autocomplete
          value={selectedTimezone}
          onChange={handleAutocompleteChange}
          options={commonTimezones}
          getOptionLabel={(option) => option.label}
          renderInput={(params) => (
            <TextField
              {...params}
              label={label || t('timezone.label', '시간대')}
              variant={variant}
              error={error}
              helperText={error && errorText ? errorText : helperText}
            />
          )}
          renderOption={(props, option) => (
            <Box component="li" {...props}>
              <Box>
                <Box sx={{ fontWeight: 'medium' }}>{option.label}</Box>
                <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                  {option.value}
                </Box>
              </Box>
            </Box>
          )}
          disabled={disabled}
          disableClearable
        />
        {!error && helperText && (
          <FormHelperText>{helperText}</FormHelperText>
        )}
      </FormControl>
    );
  }

  // Select 버전
  return (
    <FormControl
      fullWidth={fullWidth}
      variant={variant}
      size={size}
      error={error}
      disabled={disabled}
    >
      <InputLabel>{label || t('timezone.label', '시간대')}</InputLabel>
      <Select
        value={value || "UTC"}
        onChange={handleChange}
        label={label || t('timezone.label', '시간대')}
      >
        {commonTimezones.map((tz) => (
          <MenuItem key={tz.value} value={tz.value}>
            <Box>
              <Box sx={{ fontWeight: 'medium' }}>{tz.label}</Box>
              <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                {tz.value}
              </Box>
            </Box>
          </MenuItem>
        ))}
      </Select>
      {error && errorText ? (
        <FormHelperText error>{errorText}</FormHelperText>
      ) : helperText ? (
        <FormHelperText>{helperText}</FormHelperText>
      ) : null}
    </FormControl>
  );
}

TimezoneSelector.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  label: PropTypes.string,
  helperText: PropTypes.string,
  variant: PropTypes.oneOf(["outlined", "filled", "standard"]),
  size: PropTypes.oneOf(["small", "medium"]),
  fullWidth: PropTypes.bool,
  error: PropTypes.bool,
  errorText: PropTypes.string,
  disabled: PropTypes.bool,
  useAutocomplete: PropTypes.bool
};

export default TimezoneSelector;
