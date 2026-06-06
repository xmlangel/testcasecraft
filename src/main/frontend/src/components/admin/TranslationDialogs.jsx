// src/main/frontend/src/components/admin/TranslationDialogs.jsx
import React, { useState, useEffect } from "react";
import { Alert } from "@mui/material";
import { useI18n } from "../../context/I18nContext.jsx";
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
} from "@mui/material";

// 언어 관리 다이얼로그
export const LanguageDialog = ({ open, mode, data, onClose, onSave }) => {
  const { t } = useI18n();
  const [form, setForm] = useState({
    code: "",
    name: "",
    nativeName: "",
    isDefault: false,
    isActive: true,
    sortOrder: 0,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (mode === "edit" && data) {
        setForm(data);
      } else {
        setForm({
          code: "",
          name: "",
          nativeName: "",
          isDefault: false,
          isActive: true,
          sortOrder: 0,
        });
      }
      setErrors({});
    }
  }, [open, mode, data]);

  const handleChange = (field) => (event) => {
    const value =
      event.target.type === "checkbox"
        ? event.target.checked
        : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.code.trim()) newErrors.code = t("translation.languageDialog.codeRequired");
    else if (!/^[a-z]{2,3}$/.test(form.code))
      newErrors.code = t("translation.languageDialog.codeFormat");

    if (!form.name.trim()) newErrors.name = t("translation.languageDialog.nameRequired");
    if (!form.nativeName.trim()) newErrors.nativeName = t("translation.languageDialog.nativeNameRequired");

    if (form.sortOrder < 0)
      newErrors.sortOrder = t("translation.languageDialog.sortOrderMin");

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
        {mode === "create"
          ? t("translation.languageDialog.addTitle")
          : t("translation.languageDialog.editTitle")}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label={t("translation.languageDialog.codeLabel")}
              value={form.code}
              onChange={handleChange("code")}
              error={!!errors.code}
              helperText={
                errors.code || t("translation.languageDialog.codeHelper")
              }
              fullWidth
              disabled={mode === "edit"}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label={t("translation.languageDialog.sortOrderLabel")}
              type="number"
              value={form.sortOrder}
              onChange={handleChange("sortOrder")}
              error={!!errors.sortOrder}
              helperText={
                errors.sortOrder ||
                t("translation.languageDialog.sortOrderHelper")
              }
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label={t("translation.languageDialog.nameLabel")}
              value={form.name}
              onChange={handleChange("name")}
              error={!!errors.name}
              helperText={
                errors.name || t("translation.languageDialog.nameHelper")
              }
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              label={t("translation.languageDialog.nativeNameLabel")}
              value={form.nativeName}
              onChange={handleChange("nativeName")}
              error={!!errors.nativeName}
              helperText={
                errors.nativeName ||
                t("translation.languageDialog.nativeNameHelper")
              }
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.isDefault}
                  onChange={handleChange("isDefault")}
                />
              }
              label={t("translation.languageDialog.isDefaultLabel")}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.isActive}
                  onChange={handleChange("isActive")}
                />
              }
              label={t("translation.languageDialog.isActiveLabel")}
            />
          </Grid>
        </Grid>

        {form.isDefault && (
          <Alert severity="info" sx={{ mt: 2 }}>
            {t("translation.languageDialog.defaultLanguageWarning")}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("common.buttons.cancel")}</Button>
        <Button onClick={handleSave} variant="contained">
          {mode === "create"
            ? t("common.buttons.add")
            : t("common.buttons.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// 번역 키 관리 다이얼로그
export const TranslationKeyDialog = ({ open, mode, data, onClose, onSave }) => {
  const { t } = useI18n();
  const [form, setForm] = useState({
    keyName: "",
    category: "",
    description: "",
    defaultValue: "",
    isActive: true,
  });
  const [errors, setErrors] = useState({});

  const getCategoryOptions = () => [
    { value: "login", label: t("translation.keyDialog.category.login") },
    { value: "register", label: t("translation.keyDialog.category.register") },
    { value: "button", label: t("translation.keyDialog.category.button") },
    { value: "message", label: t("translation.keyDialog.category.message") },
    { value: "validation", label: t("translation.keyDialog.category.validation") },
    { value: "navigation", label: t("translation.keyDialog.category.navigation") },
    { value: "form", label: t("translation.keyDialog.category.form") },
    { value: "error", label: t("translation.keyDialog.category.error") },
    { value: "success", label: t("translation.keyDialog.category.success") },
    { value: "common", label: t("translation.keyDialog.category.common") },
  ];
  const categories = getCategoryOptions();

  useEffect(() => {
    if (open) {
      if (mode === "edit" && data) {
        setForm(data);
      } else {
        setForm({
          keyName: "",
          category: "",
          description: "",
          defaultValue: "",
          isActive: true,
        });
      }
      setErrors({});
    }
  }, [open, mode, data]);

  const handleChange = (field) => (event) => {
    const value =
      event.target.type === "checkbox"
        ? event.target.checked
        : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.keyName.trim()) newErrors.keyName = t("translation.keyDialog.keyNameRequired");
    else if (!/^[a-zA-Z][a-zA-Z0-9._]*$/.test(form.keyName)) {
      newErrors.keyName = t("translation.keyDialog.keyNameFormat");
    }

    if (!form.category) newErrors.category = t("translation.keyDialog.categoryRequired");
    if (!form.description.trim()) newErrors.description = t("translation.keyDialog.descriptionRequired");
    if (!form.defaultValue.trim())
      newErrors.defaultValue = t("translation.keyDialog.defaultValueRequired");

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
        {mode === "create"
          ? t("translation.keyDialog.addTitle")
          : t("translation.keyDialog.editTitle")}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, md: 8 }}>
            <TextField
              label={t("translation.keyDialog.keyNameLabel")}
              value={form.keyName}
              onChange={handleChange("keyName")}
              error={!!errors.keyName}
              helperText={
                errors.keyName || t("translation.keyDialog.keyNameHelper")
              }
              fullWidth
              disabled={mode === "edit"}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth error={!!errors.category}>
              <InputLabel>
                {t("translation.keyDialog.categoryLabel")}
              </InputLabel>
              <Select
                value={form.category}
                onChange={handleChange("category")}
                label={t("translation.keyDialog.categoryLabel")}
              >
                <MenuItem value="">{t("common.all")}</MenuItem>
                <MenuItem value="login">
                  {t("translation.keyDialog.category.login")}
                </MenuItem>
                <MenuItem value="register">
                  {t("translation.keyDialog.category.register")}
                </MenuItem>
                <MenuItem value="button">
                  {t("translation.keyDialog.category.button")}
                </MenuItem>
                <MenuItem value="message">
                  {t("translation.keyDialog.category.message")}
                </MenuItem>
                <MenuItem value="validation">
                  {t("translation.keyDialog.category.validation")}
                </MenuItem>
                <MenuItem value="navigation">
                  {t("translation.keyDialog.category.navigation")}
                </MenuItem>
                <MenuItem value="form">
                  {t("translation.keyDialog.category.form")}
                </MenuItem>
                <MenuItem value="error">
                  {t("translation.keyDialog.category.error")}
                </MenuItem>
                <MenuItem value="success">
                  {t("translation.keyDialog.category.success")}
                </MenuItem>
                <MenuItem value="common">
                  {t("translation.keyDialog.category.common")}
                </MenuItem>
              </Select>
              {errors.category && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ ml: 2, mt: 0.5 }}
                >
                  {errors.category}
                </Typography>
              )}
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label={t("translation.keyDialog.descriptionLabel")}
              value={form.description}
              onChange={handleChange("description")}
              error={!!errors.description}
              helperText={
                errors.description ||
                t("translation.keyDialog.descriptionHelper")
              }
              fullWidth
              multiline
              rows={2}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label={t("translation.keyDialog.defaultValueLabel")}
              value={form.defaultValue}
              onChange={handleChange("defaultValue")}
              error={!!errors.defaultValue}
              helperText={
                errors.defaultValue ||
                t("translation.keyDialog.defaultValueHelper")
              }
              fullWidth
              multiline
              rows={2}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.isActive}
                  onChange={handleChange("isActive")}
                />
              }
              label={t("translation.keyDialog.isActiveLabel")}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("common.buttons.cancel")}</Button>
        <Button onClick={handleSave} variant="contained">
          {mode === "create"
            ? t("common.buttons.add")
            : t("common.buttons.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// 번역 관리 다이얼로그
export const TranslationDialog = ({
  open,
  mode,
  data,
  languages,
  translationKeys,
  onClose,
  onSave,
}) => {
  const { t } = useI18n();
  const [form, setForm] = useState({
    keyName: "",
    languageCode: "",
    value: "",
    context: "",
    isActive: true,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      if (mode === "edit" && data) {
        setForm({
          keyName: data.translationKey?.keyName || "",
          languageCode: data.language?.code || "",
          value: data.value || "",
          context: data.context || "",
          isActive: data.isActive !== undefined ? data.isActive : true,
        });
      } else {
        setForm({
          keyName: "",
          languageCode: "",
          value: "",
          context: "",
          isActive: true,
        });
      }
      setErrors({});
    }
  }, [open, mode, data]);

  const handleChange = (field) => (event) => {
    const value =
      event.target.type === "checkbox"
        ? event.target.checked
        : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.keyName) newErrors.keyName = t("translation.translationDialog.keyRequired");
    if (!form.languageCode) newErrors.languageCode = t("translation.translationDialog.languageRequired");
    if (!form.value.trim()) newErrors.value = t("translation.translationDialog.valueRequired");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(form);
    }
  };

  const selectedKey = translationKeys.find(
    (key) => key.keyName === form.keyName,
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {mode === "create"
          ? t("translation.translationDialog.addTitle")
          : t("translation.translationDialog.editTitle")}
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth error={!!errors.keyName}>
              <InputLabel>
                {t("translation.translationDialog.keyLabel")}
              </InputLabel>
              <Select
                value={form.keyName}
                onChange={handleChange("keyName")}
                label={t("translation.translationDialog.keyLabel")}
                disabled={mode === "edit"}
              >
                {translationKeys.map((key) => (
                  <MenuItem key={key.id} value={key.keyName}>
                    {key.keyName} ({key.category})
                  </MenuItem>
                ))}
              </Select>
              {errors.keyName && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ ml: 2, mt: 0.5 }}
                >
                  {errors.keyName}
                </Typography>
              )}
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <FormControl fullWidth error={!!errors.languageCode}>
              <InputLabel>
                {t("translation.translationDialog.languageLabel")}
              </InputLabel>
              <Select
                value={form.languageCode}
                onChange={handleChange("languageCode")}
                label={t("translation.translationDialog.languageLabel")}
                disabled={mode === "edit"}
              >
                {languages.map((lang) => (
                  <MenuItem key={lang.code} value={lang.code}>
                    {lang.nativeName} ({lang.code})
                  </MenuItem>
                ))}
              </Select>
              {errors.languageCode && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ ml: 2, mt: 0.5 }}
                >
                  {errors.languageCode}
                </Typography>
              )}
            </FormControl>
          </Grid>

          {selectedKey && (
            <Grid size={{ xs: 12 }}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>
                    {t("translation.translationDialog.keyDescription")}:
                  </strong>{" "}
                  {selectedKey.description}
                </Typography>
                <Typography variant="body2">
                  <strong>
                    {t("translation.translationDialog.defaultValue")}:
                  </strong>{" "}
                  {selectedKey.defaultValue}
                </Typography>
              </Alert>
            </Grid>
          )}

          <Grid size={{ xs: 12 }}>
            <TextField
              label={t("translation.translationDialog.valueLabel")}
              value={form.value}
              onChange={handleChange("value")}
              error={!!errors.value}
              helperText={
                errors.value || t("translation.translationDialog.valueHelper")
              }
              fullWidth
              multiline
              rows={3}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              label={t("translation.translationDialog.contextLabel")}
              value={form.context}
              onChange={handleChange("context")}
              helperText={t("translation.translationDialog.contextHelper")}
              fullWidth
              multiline
              rows={2}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.isActive}
                  onChange={handleChange("isActive")}
                />
              }
              label={t("translation.translationDialog.isActiveLabel")}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t("common.buttons.cancel")}</Button>
        <Button onClick={handleSave} variant="contained">
          {mode === "create"
            ? t("common.buttons.add")
            : t("common.buttons.save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
