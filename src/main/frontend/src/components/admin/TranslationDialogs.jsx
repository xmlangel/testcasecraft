// src/main/frontend/src/components/admin/TranslationDialogs.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Grid,
  Typography,
  Alert
} from '@mui/material';

// 언어 관리 다이얼로그
export const LanguageDialog = ({ open, mode, data, onClose, onSave }) => {
  const [form, setForm] = useState({
    code: '',
    name: '',
    nativeName: '',
    isDefault: false,
    isActive: true,
    sortOrder: 0
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && data) {
        setForm(data);
      } else {
        setForm({
          code: '',
          name: '',
          nativeName: '',
          isDefault: false,
          isActive: true,
          sortOrder: 0
        });
      }
      setErrors({});
    }
  }, [open, mode, data]);

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.code.trim()) newErrors.code = '언어 코드는 필수입니다';
    else if (!/^[a-z]{2,3}$/.test(form.code)) newErrors.code = '언어 코드는 2-3자의 소문자여야 합니다';

    if (!form.name.trim()) newErrors.name = '언어명은 필수입니다';
    if (!form.nativeName.trim()) newErrors.nativeName = '원어명은 필수입니다';

    if (form.sortOrder < 0) newErrors.sortOrder = '정렬 순서는 0 이상이어야 합니다';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(form);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {mode === 'create' ? '언어 추가' : '언어 편집'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              label="언어 코드"
              value={form.code}
              onChange={handleChange('code')}
              error={!!errors.code}
              helperText={errors.code || '예: ko, en, ja'}
              fullWidth
              disabled={mode === 'edit'}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="정렬 순서"
              type="number"
              value={form.sortOrder}
              onChange={handleChange('sortOrder')}
              error={!!errors.sortOrder}
              helperText={errors.sortOrder}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="언어명"
              value={form.name}
              onChange={handleChange('name')}
              error={!!errors.name}
              helperText={errors.name || '예: 한국어, English'}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="원어명"
              value={form.nativeName}
              onChange={handleChange('nativeName')}
              error={!!errors.nativeName}
              helperText={errors.nativeName || '예: 한국어, English'}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.isDefault}
                  onChange={handleChange('isDefault')}
                />
              }
              label="기본 언어로 설정"
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.isActive}
                  onChange={handleChange('isActive')}
                />
              }
              label="활성 상태"
            />
          </Grid>
        </Grid>

        {form.isDefault && (
          <Alert severity="info" sx={{ mt: 2 }}>
            기본 언어로 설정하면 다른 언어들의 기본 설정이 해제됩니다.
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button onClick={handleSave} variant="contained">
          {mode === 'create' ? '추가' : '저장'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// 번역 키 관리 다이얼로그
export const TranslationKeyDialog = ({ open, mode, data, onClose, onSave }) => {
  const [form, setForm] = useState({
    keyName: '',
    category: '',
    description: '',
    defaultValue: '',
    isActive: true
  });
  const [errors, setErrors] = useState({});

  const categories = [
    { value: 'login', label: '로그인' },
    { value: 'register', label: '회원가입' },
    { value: 'button', label: '버튼' },
    { value: 'message', label: '메시지' },
    { value: 'validation', label: '검증' },
    { value: 'navigation', label: '네비게이션' },
    { value: 'form', label: '폼' },
    { value: 'error', label: '오류' },
    { value: 'success', label: '성공' },
    { value: 'common', label: '공통' }
  ];

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && data) {
        setForm(data);
      } else {
        setForm({
          keyName: '',
          category: '',
          description: '',
          defaultValue: '',
          isActive: true
        });
      }
      setErrors({});
    }
  }, [open, mode, data]);

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.keyName.trim()) newErrors.keyName = '키 이름은 필수입니다';
    else if (!/^[a-zA-Z][a-zA-Z0-9._]*$/.test(form.keyName)) {
      newErrors.keyName = '키 이름은 영문자로 시작하며 영문자, 숫자, 점, 언더스코어만 사용 가능합니다';
    }

    if (!form.category) newErrors.category = '카테고리를 선택해주세요';
    if (!form.description.trim()) newErrors.description = '설명은 필수입니다';
    if (!form.defaultValue.trim()) newErrors.defaultValue = '기본값은 필수입니다';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(form);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {mode === 'create' ? '번역 키 추가' : '번역 키 편집'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={8}>
            <TextField
              label="키 이름"
              value={form.keyName}
              onChange={handleChange('keyName')}
              error={!!errors.keyName}
              helperText={errors.keyName || '예: login.title, button.submit'}
              fullWidth
              disabled={mode === 'edit'}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth error={!!errors.category}>
              <InputLabel>카테고리</InputLabel>
              <Select
                value={form.category}
                onChange={handleChange('category')}
                label="카테고리"
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </MenuItem>
                ))}
              </Select>
              {errors.category && (
                <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                  {errors.category}
                </Typography>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="설명"
              value={form.description}
              onChange={handleChange('description')}
              error={!!errors.description}
              helperText={errors.description || '이 키가 어디에 사용되는지 설명해주세요'}
              fullWidth
              multiline
              rows={2}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="기본값"
              value={form.defaultValue}
              onChange={handleChange('defaultValue')}
              error={!!errors.defaultValue}
              helperText={errors.defaultValue || '번역이 없을 때 표시될 기본 텍스트'}
              fullWidth
              multiline
              rows={2}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.isActive}
                  onChange={handleChange('isActive')}
                />
              }
              label="활성 상태"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button onClick={handleSave} variant="contained">
          {mode === 'create' ? '추가' : '저장'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// 번역 관리 다이얼로그
export const TranslationDialog = ({ open, mode, data, languages, translationKeys, onClose, onSave }) => {
  const [form, setForm] = useState({
    translationKeyId: '',
    languageCode: '',
    value: '',
    context: '',
    isActive: true
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && data) {
        setForm({
          translationKeyId: data.translationKey?.id || '',
          languageCode: data.language?.code || '',
          value: data.value || '',
          context: data.context || '',
          isActive: data.isActive !== undefined ? data.isActive : true
        });
      } else {
        setForm({
          translationKeyId: '',
          languageCode: '',
          value: '',
          context: '',
          isActive: true
        });
      }
      setErrors({});
    }
  }, [open, mode, data]);

  const handleChange = (field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.translationKeyId) newErrors.translationKeyId = '번역 키를 선택해주세요';
    if (!form.languageCode) newErrors.languageCode = '언어를 선택해주세요';
    if (!form.value.trim()) newErrors.value = '번역값은 필수입니다';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(form);
    }
  };

  const selectedKey = translationKeys.find(key => key.id === form.translationKeyId);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {mode === 'create' ? '번역 추가' : '번역 편집'}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.translationKeyId}>
              <InputLabel>번역 키</InputLabel>
              <Select
                value={form.translationKeyId}
                onChange={handleChange('translationKeyId')}
                label="번역 키"
                disabled={mode === 'edit'}
              >
                {translationKeys.map((key) => (
                  <MenuItem key={key.id} value={key.id}>
                    {key.keyName} ({key.category})
                  </MenuItem>
                ))}
              </Select>
              {errors.translationKeyId && (
                <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                  {errors.translationKeyId}
                </Typography>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={!!errors.languageCode}>
              <InputLabel>언어</InputLabel>
              <Select
                value={form.languageCode}
                onChange={handleChange('languageCode')}
                label="언어"
                disabled={mode === 'edit'}
              >
                {languages.map((lang) => (
                  <MenuItem key={lang.code} value={lang.code}>
                    {lang.nativeName} ({lang.code})
                  </MenuItem>
                ))}
              </Select>
              {errors.languageCode && (
                <Typography variant="caption" color="error" sx={{ ml: 2, mt: 0.5 }}>
                  {errors.languageCode}
                </Typography>
              )}
            </FormControl>
          </Grid>

          {selectedKey && (
            <Grid item xs={12}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>키 설명:</strong> {selectedKey.description}
                </Typography>
                <Typography variant="body2">
                  <strong>기본값:</strong> {selectedKey.defaultValue}
                </Typography>
              </Alert>
            </Grid>
          )}

          <Grid item xs={12}>
            <TextField
              label="번역값"
              value={form.value}
              onChange={handleChange('value')}
              error={!!errors.value}
              helperText={errors.value || '이 언어로 표시될 텍스트를 입력하세요'}
              fullWidth
              multiline
              rows={3}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="컨텍스트"
              value={form.context}
              onChange={handleChange('context')}
              helperText="번역의 맥락이나 사용 상황을 설명해주세요 (선택사항)"
              fullWidth
              multiline
              rows={2}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.isActive}
                  onChange={handleChange('isActive')}
                />
              }
              label="활성 상태"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button onClick={handleSave} variant="contained">
          {mode === 'create' ? '추가' : '저장'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};