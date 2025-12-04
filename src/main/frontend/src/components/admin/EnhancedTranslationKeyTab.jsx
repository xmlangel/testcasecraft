// src/main/frontend/src/components/admin/EnhancedTranslationKeyTab.jsx
import React from 'react';
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
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Pagination,
  Stack,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useI18n } from '../../context/I18nContext.jsx';

// 개선된 번역 키 관리 탭
export const EnhancedTranslationKeyTab = ({
  translationKeys,
  filters,
  onFiltersChange,
  pagination,
  onPageChange,
  availableCategories,
  languages,
  onAdd,
  onEdit,
  onDelete,
  loading
}) => {
  const { t } = useI18n();

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box>
          <Typography variant="h6">{t('translation.keyTab.listTitle')}</Typography>
          <Typography variant="body2" color="text.secondary">
            총 {pagination.totalElements}개 키 (페이지 {pagination.page + 1}/{pagination.totalPages})
          </Typography>
        </Box>
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
                {availableCategories.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('translation.keyTab.statusLabel')}</InputLabel>
              <Select
                value={filters.isActive}
                onChange={(e) => onFiltersChange({ ...filters, isActive: e.target.value })}
                label={t('translation.keyTab.statusLabel')}
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
              <TableCell>기본값</TableCell>
              <TableCell>번역 상태</TableCell>
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
                  {key.description && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      {key.description}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  {key.category ? (
                    <Chip
                      label={key.category}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ) : (
                    <Typography variant="caption" color="text.disabled">
                      없음
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {key.defaultValue || '-'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5} flexWrap="wrap">
                    {languages.map((language) => {
                      const hasTranslation = key.translationStatus?.[language.code] || false;
                      return (
                        <Chip
                          key={language.code}
                          label={language.code.toUpperCase()}
                          size="small"
                          variant={hasTranslation ? "filled" : "outlined"}
                          color={hasTranslation ? "success" : "default"}
                          sx={{
                            minWidth: 40,
                            fontSize: '0.75rem',
                            height: 20
                          }}
                        />
                      );
                    })}
                  </Stack>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                    {languages.filter(lang => key.translationStatus?.[lang.code]).length}/{languages.length} 완료
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