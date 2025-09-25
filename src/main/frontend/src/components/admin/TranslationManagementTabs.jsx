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
  Typography
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Download as DownloadIcon
} from '@mui/icons-material';

// 언어 관리 탭
export const LanguageManagementTab = ({ languages, onAdd, onEdit, onDelete, loading }) => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">언어 목록</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAdd}
          disabled={loading}
        >
          언어 추가
        </Button>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>언어 코드</TableCell>
              <TableCell>언어명</TableCell>
              <TableCell>원어명</TableCell>
              <TableCell>기본 언어</TableCell>
              <TableCell>활성 상태</TableCell>
              <TableCell>정렬 순서</TableCell>
              <TableCell>작업</TableCell>
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
                    <Chip label="기본" size="small" color="primary" />
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    label={language.isActive ? '활성' : '비활성'}
                    size="small"
                    color={language.isActive ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell>{language.sortOrder}</TableCell>
                <TableCell>
                  <Tooltip title="편집">
                    <IconButton
                      size="small"
                      onClick={() => onEdit(language)}
                      disabled={loading}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="삭제">
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
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">번역 키 목록</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAdd}
          disabled={loading}
        >
          번역 키 추가
        </Button>
      </Box>

      {/* 필터 */}
      <Box sx={{ mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              label="키워드 검색"
              value={filters.keyword}
              onChange={(e) => onFiltersChange({ ...filters, keyword: e.target.value })}
              fullWidth
              size="small"
              InputProps={{
                startAdornment: <SearchIcon color="action" />
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>카테고리</InputLabel>
              <Select
                value={filters.category}
                onChange={(e) => onFiltersChange({ ...filters, category: e.target.value })}
                label="카테고리"
              >
                <MenuItem value="">전체</MenuItem>
                <MenuItem value="login">로그인</MenuItem>
                <MenuItem value="register">회원가입</MenuItem>
                <MenuItem value="button">버튼</MenuItem>
                <MenuItem value="message">메시지</MenuItem>
                <MenuItem value="validation">검증</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>활성 상태</InputLabel>
              <Select
                value={filters.isActive}
                onChange={(e) => onFiltersChange({ ...filters, isActive: e.target.value })}
                label="활성 상태"
              >
                <MenuItem value="">전체</MenuItem>
                <MenuItem value="true">활성</MenuItem>
                <MenuItem value="false">비활성</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>키 이름</TableCell>
              <TableCell>카테고리</TableCell>
              <TableCell>설명</TableCell>
              <TableCell>기본값</TableCell>
              <TableCell>활성 상태</TableCell>
              <TableCell>작업</TableCell>
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
                    label={key.isActive ? '활성' : '비활성'}
                    size="small"
                    color={key.isActive ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="편집">
                    <IconButton
                      size="small"
                      onClick={() => onEdit(key)}
                      disabled={loading}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="삭제">
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
export const TranslationManagementTab = ({ translations, languages, filters, onFiltersChange, onAdd, onEdit, onDelete, onExportCsv, loading }) => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">번역 목록</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {filters.languageCode && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={() => onExportCsv(filters.languageCode)}
              disabled={loading}
            >
              {filters.languageCode} CSV 내보내기
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAdd}
            disabled={loading}
          >
            번역 추가
          </Button>
        </Box>
      </Box>

      {/* 필터 */}
      <Box sx={{ mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>언어</InputLabel>
              <Select
                value={filters.languageCode}
                onChange={(e) => onFiltersChange({ ...filters, languageCode: e.target.value })}
                label="언어"
              >
                <MenuItem value="">전체</MenuItem>
                {languages.map((lang) => (
                  <MenuItem key={lang.code} value={lang.code}>
                    {lang.nativeName} ({lang.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="번역 키 이름"
              value={filters.keyName}
              onChange={(e) => onFiltersChange({ ...filters, keyName: e.target.value })}
              fullWidth
              size="small"
            />
          </Grid>
        </Grid>
      </Box>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>번역 키</TableCell>
              <TableCell>언어</TableCell>
              <TableCell>번역값</TableCell>
              <TableCell>컨텍스트</TableCell>
              <TableCell>활성 상태</TableCell>
              <TableCell>수정자</TableCell>
              <TableCell>작업</TableCell>
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
                    label={translation.isActive ? '활성' : '비활성'}
                    size="small"
                    color={translation.isActive ? 'success' : 'default'}
                  />
                </TableCell>
                <TableCell>{translation.updatedBy}</TableCell>
                <TableCell>
                  <Tooltip title="편집">
                    <IconButton
                      size="small"
                      onClick={() => onEdit(translation)}
                      disabled={loading}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="삭제">
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
    </Box>
  );
};

// 통계 탭
export const StatisticsTab = ({ stats, loading }) => {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>번역 완성도 통계</Typography>

      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid item xs={12} md={6} lg={4} key={stat.languageCode}>
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
                    <Typography variant="body2">완성도</Typography>
                    <Typography variant="body2">{stat.completionRate}%</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={stat.completionRate}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      번역됨
                    </Typography>
                    <Typography variant="h6">
                      {stat.translatedCount}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      전체
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