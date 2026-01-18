// src/components/molecules/SearchInput/SearchInput.jsx
/**
 * 검색 입력 분자적 컴포넌트
 */

import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { InputAdornment, IconButton } from '@mui/material';
import { Search, Clear } from '@mui/icons-material';
import { Input } from '../../atoms';

const SearchInput = ({
  value = '',
  onChange,
  onSearch,
  placeholder = '검색어를 입력하세요',
  debounceMs = 300,
  clearable = true,
  autoSearch = true,
  ...props
}) => {
  const [searchValue, setSearchValue] = useState(value);
  
  // Debounce search
  useEffect(() => {
    if (!autoSearch) return;
    
    const timeoutId = setTimeout(() => {
      if (searchValue !== value) {
        onChange?.(searchValue);
        onSearch?.(searchValue);
      }
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [searchValue, value, onChange, onSearch, autoSearch, debounceMs]);

  // 외부에서 value가 변경될 때 동기화
  useEffect(() => {
    setSearchValue(value);
  }, [value]);

  const handleChange = useCallback((newValue) => {
    setSearchValue(newValue);
    if (!autoSearch) {
      onChange?.(newValue);
    }
  }, [onChange, autoSearch]);

  const handleKeyPress = useCallback((event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onSearch?.(searchValue);
    }
  }, [onSearch, searchValue]);

  const handleClear = useCallback(() => {
    setSearchValue('');
    onChange?.('');
    onSearch?.('');
  }, [onChange, onSearch]);

  const handleSearchClick = useCallback(() => {
    onSearch?.(searchValue);
  }, [onSearch, searchValue]);

  const startAdornment = (
    <InputAdornment position="start">
      <IconButton
        size="small"
        onClick={handleSearchClick}
        disabled={!onSearch}
      >
        <Search />
      </IconButton>
    </InputAdornment>
  );

  const endAdornment = clearable && searchValue ? (
    <InputAdornment position="end">
      <IconButton
        size="small"
        onClick={handleClear}
      >
        <Clear />
      </IconButton>
    </InputAdornment>
  ) : null;

  return (
    <Input
      value={searchValue}
      onChange={handleChange}
      placeholder={placeholder}
      startAdornment={startAdornment}
      endAdornment={endAdornment}
      onKeyPress={handleKeyPress}
      {...props}
    />
  );
};

SearchInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  onSearch: PropTypes.func,
  placeholder: PropTypes.string,
  debounceMs: PropTypes.number,
  clearable: PropTypes.bool,
  autoSearch: PropTypes.bool,
};

export default SearchInput;