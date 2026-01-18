// src/main/frontend/src/components/common/LanguageSelector.jsx
import React, { useState } from 'react';
import {
  Select,
  MenuItem,
  FormControl,
  Box,
  Typography,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Language as LanguageIcon,
  KeyboardArrowDown as ArrowDownIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { useI18n } from '../../context/I18nContext.jsx';

// 언어별 이모지 맵
const LANGUAGE_EMOJIS = {
  ko: '🇰🇷',
  en: '🇺🇸',
  ja: '🇯🇵',
  zh: '🇨🇳'
};

// 컴팩트 언어 선택기 (헤더용)
export const CompactLanguageSelector = () => {
  const { currentLanguage, availableLanguages, changeLanguage, loading } = useI18n();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const currentLang = availableLanguages.find(lang => lang.code === currentLanguage);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLanguageChange = async (languageCode) => {
    if (languageCode !== currentLanguage) {
      await changeLanguage(languageCode);
    }
    handleClose();
  };

  return (
    <>
      <Tooltip title="언어 선택">
        <IconButton
          onClick={handleClick}
          size="small"
          sx={{
            ml: 1,
            color: 'text.primary',
            '&:hover': { backgroundColor: 'action.hover' }
          }}
          disabled={loading}
        >
          {loading ? (
            <CircularProgress size={20} />
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="body2">
                {LANGUAGE_EMOJIS[currentLanguage] || '🌐'}
              </Typography>
              <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                {currentLang?.code.toUpperCase()}
              </Typography>
              <ArrowDownIcon fontSize="small" />
            </Box>
          )}
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            minWidth: 200,
            mt: 1
          }
        }}
      >
        {availableLanguages
          .filter(lang => lang.isActive)
          .map((language) => (
            <MenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              selected={language.code === currentLanguage}
              sx={{
                py: 1,
                '&.Mui-selected': {
                  backgroundColor: 'action.selected',
                  '&:hover': {
                    backgroundColor: 'action.selected',
                  }
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: '30px' }}>
                <Typography variant="body1">
                  {LANGUAGE_EMOJIS[language.code] || '🌐'}
                </Typography>
              </ListItemIcon>
              <ListItemText>
                <Typography variant="body2">
                  {language.nativeName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {language.name}
                </Typography>
              </ListItemText>
              {language.code === currentLanguage && (
                <CheckIcon color="primary" fontSize="small" />
              )}
            </MenuItem>
          ))}
      </Menu>
    </>
  );
};

// 풀사이즈 언어 선택기 (설정 페이지용)
export const LanguageSelector = ({
  label = '언어 선택',
  helperText,
  variant = 'outlined',
  size = 'medium',
  showEmoji = true,
  showNativeName = true,
  fullWidth = false
}) => {
  const { currentLanguage, availableLanguages, changeLanguage, loading, t } = useI18n();

  const handleChange = (event) => {
    const languageCode = event.target.value;
    if (languageCode !== currentLanguage) {
      changeLanguage(languageCode);
    }
  };

  const getLanguageDisplay = (language) => {
    const parts = [];

    if (showEmoji) {
      parts.push(LANGUAGE_EMOJIS[language.code] || '🌐');
    }

    if (showNativeName) {
      parts.push(language.nativeName);
    } else {
      parts.push(language.name);
    }

    return parts.join(' ');
  };

  return (
    <FormControl variant={variant} size={size} fullWidth={fullWidth}>
      {label && (
        <Typography variant="body2" component="label" sx={{ mb: 1 }}>
          {label}
        </Typography>
      )}
      <Select
        value={currentLanguage}
        onChange={handleChange}
        disabled={loading}
        displayEmpty
        startAdornment={loading && (
          <CircularProgress size={16} sx={{ mr: 1 }} />
        )}
        sx={{
          '& .MuiSelect-select': {
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }
        }}
      >
        {availableLanguages
          .filter(lang => lang.isActive)
          .map((language) => (
            <MenuItem key={language.code} value={language.code}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {showEmoji && (
                  <Typography variant="body1">
                    {LANGUAGE_EMOJIS[language.code] || '🌐'}
                  </Typography>
                )}
                <Box>
                  <Typography variant="body2">
                    {language.nativeName}
                  </Typography>
                  {language.name !== language.nativeName && (
                    <Typography variant="caption" color="text.secondary">
                      {language.name}
                    </Typography>
                  )}
                </Box>
                {language.isDefault && (
                  <Typography
                    variant="caption"
                    sx={{
                      ml: 'auto',
                      px: 1,
                      py: 0.25,
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                      borderRadius: 1,
                      fontSize: '0.65rem'
                    }}
                  >
                    기본
                  </Typography>
                )}
              </Box>
            </MenuItem>
          ))}
      </Select>
      {helperText && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
          {helperText}
        </Typography>
      )}
    </FormControl>
  );
};

// 인라인 언어 토글 (로그인 페이지용)
export const InlineLanguageToggle = () => {
  const { currentLanguage, availableLanguages, changeLanguage, loading } = useI18n();

  // 주요 언어들만 표시 (최대 4개)
  const mainLanguages = availableLanguages
    .filter(lang => lang.isActive)
    .slice(0, 4);

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      <LanguageIcon fontSize="small" color="action" />
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        {mainLanguages.map((language) => (
          <Box
            key={language.code}
            component="button"
            onClick={() => changeLanguage(language.code)}
            disabled={loading || language.code === currentLanguage}
            sx={{
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 1,
              fontSize: '0.875rem',
              color: language.code === currentLanguage ? 'primary.main' : 'text.secondary',
              backgroundColor: language.code === currentLanguage ? 'action.selected' : 'transparent',
              '&:hover:not(:disabled)': {
                backgroundColor: 'action.hover',
              },
              '&:disabled': {
                cursor: 'default',
                opacity: 0.7
              },
              transition: 'all 0.2s ease'
            }}
          >
            {LANGUAGE_EMOJIS[language.code] || language.code.toUpperCase()}
          </Box>
        ))}
      </Box>
      {loading && <CircularProgress size={16} />}
    </Box>
  );
};

export default LanguageSelector;