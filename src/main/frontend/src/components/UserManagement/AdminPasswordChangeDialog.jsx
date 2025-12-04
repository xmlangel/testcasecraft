// src/components/UserManagement/AdminPasswordChangeDialog.jsx
import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Box,
  Typography,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
  Divider
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  Security,
  Person
} from "@mui/icons-material";
import { passwordService } from "../../services/passwordService.js";
import { useI18n } from "../../context/I18nContext.jsx";

/**
 * 관리자용 사용자 비밀번호 변경 다이얼로그
 * ICT-270: 관리자가 다른 사용자의 비밀번호를 변경하는 기능
 */
function AdminPasswordChangeDialog({ open, onClose, user, onSuccess }) {
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
  const [skipCurrentPassword, setSkipCurrentPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  // 다이얼로그 열릴 때 폼 초기화
  React.useEffect(() => {
    if (open) {
      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setError("");
      setValidationErrors({});
      setSkipCurrentPassword(false);
      setShowPassword({
        current: false,
        new: false,
        confirm: false
      });
    }
  }, [open]);

  // 비밀번호 유효성 검사
  const validatePassword = (password) => {
    const errors = [];

    if (password.length < 8) {
      errors.push(t("userDetail.password.validation.minLength", "최소 8자 이상이어야 합니다"));
    }

    if (password.length > 100) {
      errors.push(t("userDetail.password.validation.maxLength", "최대 100자까지 입력 가능합니다"));
    }

    const hasLetter = /[a-zA-Z]/.test(password);
    const hasDigit = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

    const complexity = [hasLetter, hasDigit, hasSpecial].filter(Boolean).length;
    if (complexity < 2) {
      errors.push(t("userDetail.password.validation.complexity", "영문, 숫자, 특수문자 중 최소 2가지를 포함해야 합니다"));
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
        newErrors.confirmPassword = [t("userDetail.password.validation.mismatch", "새 비밀번호와 일치하지 않습니다")];
      } else if (form.confirmPassword && value === form.confirmPassword) {
        delete newErrors.confirmPassword;
      }
    }

    if (field === 'confirmPassword') {
      if (value !== form.newPassword) {
        newErrors.confirmPassword = [t("userDetail.password.validation.mismatch", "새 비밀번호와 일치하지 않습니다")];
      } else {
        delete newErrors.confirmPassword;
      }
    }

    setValidationErrors(newErrors);
    setError("");
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

    if (!skipCurrentPassword && !form.currentPassword.trim()) {
      errors.currentPassword = [t("userDetail.password.validation.currentRequired", "현재 비밀번호를 입력해주세요")];
    }

    if (!form.newPassword.trim()) {
      errors.newPassword = [t("userDetail.password.validation.newRequired", "새 비밀번호를 입력해주세요")];
    } else {
      const passwordErrors = validatePassword(form.newPassword);
      if (passwordErrors.length > 0) {
        errors.newPassword = passwordErrors;
      }
    }

    if (!form.confirmPassword.trim()) {
      errors.confirmPassword = [t("userDetail.password.validation.confirmRequired", "비밀번호 확인을 입력해주세요")];
    } else if (form.newPassword !== form.confirmPassword) {
      errors.confirmPassword = [t("userDetail.password.validation.mismatch", "새 비밀번호와 일치하지 않습니다")];
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const passwordData = {
        newPassword: form.newPassword
      };

      // 현재 비밀번호가 필요한 경우 추가
      if (!skipCurrentPassword) {
        passwordData.currentPassword = form.currentPassword;
      }

      await passwordService.changeUserPassword(user.id, passwordData);

      if (onSuccess) {
        onSuccess(t("userDetail.password.success", "{userName}님의 비밀번호가 성공적으로 변경되었습니다.", { userName: user.name }));
      }

      onClose();

    } catch (error) {
      console.error('비밀번호 변경 실패:', error);
      setError(error.message || t("userDetail.password.error", "비밀번호 변경 중 오류가 발생했습니다."));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} disableRestoreFocus maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Security color="primary" />
          <Typography variant="h6">
            {t("userDetail.password.title", "비밀번호 변경 (관리자)")}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        {user && (
          <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <Person color="action" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                {t("userDetail.password.targetUser", "대상 사용자:")}
              </Typography>
              <Typography variant="body2" fontWeight="medium">
                {user.name} ({user.username})
              </Typography>
            </Box>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          {/* 현재 비밀번호 스킵 옵션 */}
          <FormControlLabel
            control={
              <Checkbox
                checked={skipCurrentPassword}
                onChange={(e) => setSkipCurrentPassword(e.target.checked)}
                disabled={loading}
              />
            }
            label={t("userDetail.password.skipCurrent", "현재 비밀번호 확인 생략 (관리자 권한으로 변경)")}
            sx={{ mb: 2 }}
          />

          <Divider sx={{ mb: 2 }} />

          {/* 현재 비밀번호 */}
          {!skipCurrentPassword && (
            <TextField
              fullWidth
              required
              type={showPassword.current ? "text" : "password"}
              label={t("userDetail.password.current", "현재 비밀번호")}
              value={form.currentPassword}
              onChange={(e) => handleInputChange('currentPassword', e.target.value)}
              error={!!validationErrors.currentPassword}
              helperText={validationErrors.currentPassword?.[0]}
              disabled={loading}
              margin="normal"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle current password visibility"
                        onClick={() => togglePasswordVisibility('current')}
                        edge="end"
                        disabled={loading}
                      >
                        {showPassword.current ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }
              }}
            />
          )}

          {/* 새 비밀번호 */}
          <TextField
            fullWidth
            required
            type={showPassword.new ? "text" : "password"}
            label={t("userDetail.password.new", "새 비밀번호")}
            value={form.newPassword}
            onChange={(e) => handleInputChange('newPassword', e.target.value)}
            error={!!validationErrors.newPassword}
            helperText={validationErrors.newPassword?.[0]}
            disabled={loading}
            margin="normal"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle new password visibility"
                      onClick={() => togglePasswordVisibility('new')}
                      edge="end"
                      disabled={loading}
                    >
                      {showPassword.new ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }
            }}
          />

          {/* 새 비밀번호 확인 */}
          <TextField
            fullWidth
            required
            type={showPassword.confirm ? "text" : "password"}
            label={t("userDetail.password.confirm", "새 비밀번호 확인")}
            value={form.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            error={!!validationErrors.confirmPassword}
            helperText={validationErrors.confirmPassword?.[0]}
            disabled={loading}
            margin="normal"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={() => togglePasswordVisibility('confirm')}
                      edge="end"
                      disabled={loading}
                    >
                      {showPassword.confirm ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }
            }}
          />

          {/* 비밀번호 요구사항 안내 */}
          <Box sx={{ mt: 2, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
            <Typography variant="body2" color="info.contrastText">
              <strong>{t("userDetail.password.requirements.title", "비밀번호 요구사항:")}</strong>
            </Typography>
            <Typography variant="body2" color="info.contrastText" component="ul" sx={{ m: 1, pl: 2 }}>
              <li>{t("userDetail.password.requirements.length", "8-100자 길이")}</li>
              <li>{t("userDetail.password.requirements.complexity", "영문, 숫자, 특수문자 중 최소 2가지 포함")}</li>
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={handleClose}
          disabled={loading}
          color="inherit"
        >
          {t("userDetail.password.button.cancel", "취소")}
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || Object.keys(validationErrors).length > 0}
          sx={{ minWidth: 120 }}
        >
          {loading ? t("userDetail.password.button.changing", "변경 중...") : t("userDetail.password.button.change", "비밀번호 변경")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

AdminPasswordChangeDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
  }),
  onSuccess: PropTypes.func,
};

export default AdminPasswordChangeDialog;