// src/components/UserProfile/PasswordChangeForm.jsx
import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  TextField,
  Button,
  Alert,
  Typography,
  Card,
  CardContent,
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  CheckCircle,
  Cancel,
  Info
} from "@mui/icons-material";
import { passwordService } from "../../services/passwordService.js";
import { useI18n } from "../../context/I18nContext.jsx";

/**
 * 비밀번호 변경 폼 컴포넌트
 * ICT-270: 사용자 비밀번호 변경 기능
 */
function PasswordChangeForm({ onSuccess, onError }) {
  const { t } = useI18n();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [showRequirements, setShowRequirements] = useState(false);

  // 비밀번호 유효성 검사
  const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 8) {
      errors.push(t('password.validation.minLength', '최소 8자 이상이어야 합니다'));
    }

    if (password.length > 100) {
      errors.push(t('password.validation.maxLength', '최대 100자까지 입력 가능합니다'));
    }
    
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    const complexity = [hasLetter, hasDigit, hasSpecial].filter(Boolean).length;
    if (complexity < 2) {
      errors.push(t('password.validation.complexity', '영문, 숫자, 특수문자 중 최소 2가지를 포함해야 합니다'));
    }
    
    return errors;
  };

  // 폼 입력 처리
  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    
    // 실시간 유효성 검사
    const newErrors = { ...validationErrors };
    
    if (field === 'newPassword') {
      const errors = validatePassword(value);
      if (errors.length > 0) {
        newErrors.newPassword = errors;
      } else {
        delete newErrors.newPassword;
      }
      
      // 확인 비밀번호 검증
      if (form.confirmPassword && value !== form.confirmPassword) {
        newErrors.confirmPassword = [t('password.validation.mismatch', '새 비밀번호와 일치하지 않습니다')];
      } else if (form.confirmPassword && value === form.confirmPassword) {
        delete newErrors.confirmPassword;
      }
    }

    if (field === 'confirmPassword') {
      if (value !== form.newPassword) {
        newErrors.confirmPassword = [t('password.validation.mismatch', '새 비밀번호와 일치하지 않습니다')];
      } else {
        delete newErrors.confirmPassword;
      }
    }

    if (field === 'currentPassword' && !value.trim()) {
      newErrors.currentPassword = [t('password.validation.currentRequired', '현재 비밀번호를 입력해주세요')];
    } else if (field === 'currentPassword') {
      delete newErrors.currentPassword;
    }
    
    setValidationErrors(newErrors);
  };

  // 비밀번호 표시/숨김 토글
  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // 폼 제출
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // 유효성 검사
    const errors = {};
    
    if (!form.currentPassword.trim()) {
      errors.currentPassword = [t('password.validation.currentRequired', '현재 비밀번호를 입력해주세요')];
    }

    if (!form.newPassword.trim()) {
      errors.newPassword = [t('password.validation.newRequired', '새 비밀번호를 입력해주세요')];
    } else {
      const passwordErrors = validatePassword(form.newPassword);
      if (passwordErrors.length > 0) {
        errors.newPassword = passwordErrors;
      }
    }

    if (!form.confirmPassword.trim()) {
      errors.confirmPassword = [t('password.validation.confirmRequired', '비밀번호 확인을 입력해주세요')];
    } else if (form.newPassword !== form.confirmPassword) {
      errors.confirmPassword = [t('password.validation.mismatch', '새 비밀번호와 일치하지 않습니다')];
    }

    if (form.currentPassword === form.newPassword) {
      errors.newPassword = [t('password.validation.sameAsCurrent', '새 비밀번호는 현재 비밀번호와 달라야 합니다')];
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setLoading(true);
    
    try {
      await passwordService.changeMyPassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      });
      
      // 성공 시 폼 초기화
      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setValidationErrors({});
      
      if (onSuccess) {
        onSuccess(t('password.success.changed', '비밀번호가 성공적으로 변경되었습니다.'));
      }

    } catch (error) {
      console.error('비밀번호 변경 실패:', error);

      if (onError) {
        onError(error.message || t('password.error.changeFailed', '비밀번호 변경 중 오류가 발생했습니다.'));
      }
    } finally {
      setLoading(false);
    }
  };

  // 비밀번호 요구사항 체크
  const getPasswordRequirements = () => {
    const password = form.newPassword;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    const isLengthOk = password.length >= 8 && password.length <= 100;
    const complexity = [hasLetter, hasDigit, hasSpecial].filter(Boolean).length >= 2;
    
    return [
      { text: t('password.requirements.length', '8-100자 길이'), valid: isLengthOk },
      { text: t('password.requirements.letter', '영문 포함'), valid: hasLetter },
      { text: t('password.requirements.digit', '숫자 포함'), valid: hasDigit },
      { text: t('password.requirements.special', '특수문자 포함'), valid: hasSpecial },
      { text: t('password.requirements.combination', '2가지 이상 조합'), valid: complexity }
    ];
  };

  const passwordRequirements = getPasswordRequirements();

  return (
    <Card elevation={1}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t('password.change.title', '비밀번호 변경')}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {t('password.change.description', '보안을 위해 정기적으로 비밀번호를 변경해주세요.')}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          {/* 현재 비밀번호 */}
          <TextField
            fullWidth
            required
            type={showPassword.current ? "text" : "password"}
            label={t('password.form.current', '현재 비밀번호')}
            placeholder={t('password.placeholder.current', '현재 사용 중인 비밀번호를 입력하세요')}
            value={form.currentPassword}
            onChange={(e) => handleInputChange('currentPassword', e.target.value)}
            error={!!validationErrors.currentPassword}
            helperText={validationErrors.currentPassword?.[0]}
            margin="normal"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle current password visibility"
                      onClick={() => togglePasswordVisibility('current')}
                      edge="end"
                    >
                      {showPassword.current ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }
            }}
          />

          {/* 새 비밀번호 */}
          <TextField
            fullWidth
            required
            type={showPassword.new ? "text" : "password"}
            label={t('password.form.new', '새 비밀번호')}
            placeholder={t('password.placeholder.new', '새로운 비밀번호를 입력하세요 (8자 이상)')}
            value={form.newPassword}
            onChange={(e) => handleInputChange('newPassword', e.target.value)}
            onFocus={() => setShowRequirements(true)}
            error={!!validationErrors.newPassword}
            helperText={validationErrors.newPassword?.[0]}
            margin="normal"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle new password visibility"
                      onClick={() => togglePasswordVisibility('new')}
                      edge="end"
                    >
                      {showPassword.new ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }
            }}
          />

          {/* 비밀번호 요구사항 */}
          <Collapse in={showRequirements && form.newPassword.length > 0}>
            <Box sx={{ mt: 1, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                <Info sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                {t('password.requirements.title', '비밀번호 요구사항:')}
              </Typography>
              <List dense>
                {passwordRequirements.map((req, index) => (
                  <ListItem key={index} sx={{ py: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      {req.valid ? (
                        <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                      ) : (
                        <Cancel sx={{ fontSize: 16, color: 'error.main' }} />
                      )}
                    </ListItemIcon>
                    <ListItemText 
                      primary={req.text}
                      slotProps={{
                        primary: { 
                          variant: 'body2',
                          color: req.valid ? 'success.main' : 'text.secondary' 
                        }
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Collapse>

          {/* 비밀번호 확인 */}
          <TextField
            fullWidth
            required
            type={showPassword.confirm ? "text" : "password"}
            label={t('password.form.confirm', '새 비밀번호 확인')}
            placeholder={t('password.placeholder.confirm', '새 비밀번호를 다시 입력하세요')}
            value={form.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            error={!!validationErrors.confirmPassword}
            helperText={validationErrors.confirmPassword?.[0]}
            margin="normal"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={() => togglePasswordVisibility('confirm')}
                      edge="end"
                    >
                      {showPassword.confirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }
            }}
          />

          {/* 제출 버튼 */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || Object.keys(validationErrors).length > 0}
              sx={{ minWidth: 120 }}
            >
              {loading ? t('password.button.changing', '변경 중...') : t('password.button.change', '비밀번호 변경')}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

PasswordChangeForm.propTypes = {
  onSuccess: PropTypes.func,
  onError: PropTypes.func,
};

export default PasswordChangeForm;