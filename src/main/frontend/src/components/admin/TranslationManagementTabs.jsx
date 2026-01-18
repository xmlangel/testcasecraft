// src/main/frontend/src/components/admin/TranslationManagementTabs.jsx
import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Switch,
  FormControlLabel,
  Tooltip,
  Typography,
  Pagination,
  Stack
} from '@mui/material';
import { Download as DownloadIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useI18n } from '../../context/I18nContext.jsx';

// 언어 관리 탭
export const LanguageManagementTab = ({ languages, onAdd, onEdit, onDelete, loading }) => {
  const { t } = useI18n();
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">{t('translation.languageTab.listTitle')}</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAdd}
          disabled={loading}
        >
          {t('translation.languageTab.addLanguage')}
        </Button>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('translation.languageTab.table.code')}</TableCell>
              <TableCell>{t('translation.languageTab.table.name')}</TableCell>
              <TableCell>{t('translation.languageTab.table.nativeName')}</TableCell>
              <TableCell>{t('translation.languageTab.table.isDefault')}</TableCell>
              <TableCell>{t('translation.languageTab.table.isActive')}</TableCell>
              <TableCell>{t('translation.languageTab.table.sortOrder')}</TableCell>
              <TableCell>{t('common.table.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {languages.map((language) => (
              <TableRow key={language.id}>
                <TableCell>
                  <Chip
                    label={language.code}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{language.name}</TableCell>
                <TableCell>{language.nativeName}</TableCell>
                <TableCell>
                  {language.isDefault && (
                    <Chip label={t('common.default')} size="small" color="primary" />
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={language.isActive ? t('common.active') : t('common.inactive')}
                    size="small"
                    color={language.isActive ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell>{language.sortOrder}</TableCell>
                <TableCell>
                  <Tooltip title={t('common.buttons.edit')}>
                    <IconButton
                      size="small"
                      onClick={() => onEdit(language)}
                      disabled={loading}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('common.buttons.delete')}>
                    <IconButton
                      size="small"
                      onClick={() => onDelete(language.id)}
                      disabled={loading || language.isDefault}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

// 번역 키 관리 탭
export const TranslationKeyManagementTab = ({ translationKeys, filters, onFiltersChange, onAdd, onEdit, onDelete, loading }) => {
  const { t } = useI18n();
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">{t('translation.keyTab.listTitle')}</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAdd}
          disabled={loading}
        >
          {t('translation.keyTab.addKey')}
        </Button>
      </Box>
      {/* 필터 */}
      <Box sx={{ mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              label={t('common.search.keyword')}
              value={filters.keyword}
              onChange={(e) => onFiltersChange({ ...filters, keyword: e.target.value })}
              fullWidth
              size="small"
              slotProps={{
                input: {
                  startAdornment: <SearchIcon color="action" />
                }
              }}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('translation.keyTab.categoryLabel')}</InputLabel>
              <Select
                value={filters.category}
                onChange={(e) => onFiltersChange({ ...filters, category: e.target.value })}
                label={t('translation.keyTab.categoryLabel')}
              >
                <MenuItem value="">{t('common.all')}</MenuItem>
                <MenuItem value="login">{t('translation.keyDialog.category.login')}</MenuItem>
                <MenuItem value="register">{t('translation.keyDialog.category.register')}</MenuItem>
                <MenuItem value="button">{t('translation.keyDialog.category.button')}</MenuItem>
                <MenuItem value="message">{t('translation.keyDialog.category.message')}</MenuItem>
                <MenuItem value="validation">{t('translation.keyDialog.category.validation')}</MenuItem>
                <MenuItem value="navigation">{t('translation.keyDialog.category.navigation')}</MenuItem>
                <MenuItem value="form">{t('translation.keyDialog.category.form')}</MenuItem>
                <MenuItem value="error">{t('translation.keyDialog.category.error')}</MenuItem>
                <MenuItem value="success">{t('translation.keyDialog.category.success')}</MenuItem>
                <MenuItem value="common">{t('translation.keyDialog.category.common')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('translation.keyTab.isActiveLabel')}</InputLabel>
              <Select
                value={filters.isActive}
                onChange={(e) => onFiltersChange({ ...filters, isActive: e.target.value })}
                label={t('translation.keyTab.isActiveLabel')}
              >
                <MenuItem value="">{t('common.all')}</MenuItem>
                <MenuItem value="true">{t('common.active')}</MenuItem>
                <MenuItem value="false">{t('common.inactive')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('translation.keyTab.table.keyName')}</TableCell>
              <TableCell>{t('translation.keyTab.table.category')}</TableCell>
              <TableCell>{t('translation.keyTab.table.description')}</TableCell>
              <TableCell>{t('translation.keyTab.table.defaultValue')}</TableCell>
              <TableCell>{t('translation.keyTab.table.isActive')}</TableCell>
              <TableCell>{t('common.table.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {translationKeys.map((key) => (
              <TableRow key={key.id}>
                <TableCell>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {key.keyName}
                  </Typography>
                </TableCell>
                <TableCell>
                  {key.category && (
                    <Chip label={key.category} size="small" variant="outlined" />
                  )}
                </TableCell>
                <TableCell>{key.description}</TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {key.defaultValue}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={key.isActive ? t('common.active') : t('common.inactive')}
                    size="small"
                    color={key.isActive ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title={t('common.buttons.edit')}>
                    <IconButton
                      size="small"
                      onClick={() => onEdit(key)}
                      disabled={loading}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('common.buttons.delete')}>
                    <IconButton
                      size="small"
                      onClick={() => onDelete(key.id)}
                      disabled={loading}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

// 번역 관리 탭
export const TranslationManagementTab = ({ translations, languages, filters, onFiltersChange, pagination, onPageChange, onAdd, onEdit, onDelete, onExportCsv, loading }) => {
  const { t } = useI18n();
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h6">{t('translation.translationTab.listTitle')}</Typography>
          <Typography variant="body2" color="text.secondary">
            총 {pagination.totalElements}개 번역 (페이지 {pagination.page + 1}/{pagination.totalPages})
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {filters.languageCode && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={() => onExportCsv(filters.languageCode)}
              disabled={loading}
            >
              {t('translation.translationTab.exportCsvByLanguage', { languageCode: filters.languageCode })}
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAdd}
            disabled={loading}
          >
            {t('translation.translationTab.addTranslation')}
          </Button>
        </Box>
      </Box>

      {/* 필터 */}
      <Box sx={{ mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('translation.translationTab.languageLabel')}</InputLabel>
              <Select
                value={filters.languageCode}
                onChange={(e) => onFiltersChange({ ...filters, languageCode: e.target.value })}
                label={t('translation.translationTab.languageLabel')}
              >
                <MenuItem value="">{t('common.all')}</MenuItem>
                {languages.map((lang) => (
                  <MenuItem key={lang.code} value={lang.code}>
                    {lang.nativeName} ({lang.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              label={t('translation.translationTab.keyNameLabel')}
              value={filters.keyName}
              onChange={(e) => onFiltersChange({ ...filters, keyName: e.target.value })}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('translation.translationTab.table.isActive')}</InputLabel>
              <Select
                value={filters.isActive}
                onChange={(e) => onFiltersChange({ ...filters, isActive: e.target.value })}
                label={t('translation.translationTab.table.isActive')}
              >
                <MenuItem value="">{t('common.all')}</MenuItem>
                <MenuItem value="true">{t('common.active')}</MenuItem>
                <MenuItem value="false">{t('common.inactive')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('translation.translationTab.table.keyName')}</TableCell>
              <TableCell>{t('translation.translationTab.table.language')}</TableCell>
              <TableCell>{t('translation.translationTab.table.value')}</TableCell>
              <TableCell>{t('translation.translationTab.table.context')}</TableCell>
              <TableCell>{t('translation.translationTab.table.isActive')}</TableCell>
              <TableCell>{t('translation.translationTab.table.updatedBy')}</TableCell>
              <TableCell>{t('common.table.actions')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {translations.map((translation) => (
              <TableRow key={translation.id}>
                <TableCell>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {translation.translationKey?.keyName}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={`${translation.language?.nativeName} (${translation.language?.code})`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {translation.value}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {translation.context}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={translation.isActive ? t('common.active') : t('common.inactive')}
                    size="small"
                    color={translation.isActive ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell>{translation.updatedBy}</TableCell>
                <TableCell>
                  <Tooltip title={t('common.buttons.edit')}>
                    <IconButton
                      size="small"
                      onClick={() => onEdit(translation)}
                      disabled={loading}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={t('common.buttons.delete')}>
                    <IconButton
                      size="small"
                      onClick={() => onDelete(translation.id)}
                      disabled={loading}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 페이지네이션 */}
      {pagination.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.page + 1}
            onChange={(e, page) => onPageChange(page - 1)}
            color="primary"
            disabled={loading}
          />
        </Box>
      )}
    </Box>
  );
};

// 통계 탭
export const StatisticsTab = ({ stats, loading }) => {
  const { t } = useI18n();
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>{t('translation.statisticsTab.title')}</Typography>

      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={stat.languageCode}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                  {stat.languageName}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {stat.languageCode.toUpperCase()}
                </Typography>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{t('translation.statisticsTab.completionRateLabel')}</Typography>
                    <Typography variant="body2">{stat.completionRate}%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={stat.completionRate}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('translation.statisticsTab.translatedCountLabel')}
                    </Typography>
                    <Typography variant="h6">
                      {stat.translatedCount}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">
                      {t('translation.statisticsTab.totalCountLabel')}
                    </Typography>
                    <Typography variant="h6">
                      {stat.totalCount}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};