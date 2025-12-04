// src/main/frontend/src/components/admin/EnhancedStatisticsTab.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useI18n } from '../../context/I18nContext.jsx';

export const EnhancedStatisticsTab = ({ onLoadCategoryStats, onLoadLanguageStats, loading }) => {
  const { t } = useI18n();
  const [categoryStats, setCategoryStats] = useState([]);
  const [languageStats, setLanguageStats] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // API 호출 함수들
  const loadCategoryTranslationStats = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/admin/translations/stats/category-completion', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCategoryStats(data);
      }
    } catch (error) {
      console.error('카테고리별 통계 로드 실패:', error);
    }
  };

  const loadLanguageCompletionStats = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/i18n/statistics/completion', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setLanguageStats(data);
      }
    } catch (error) {
      console.error('언어별 통계 로드 실패:', error);
    }
  };

  useEffect(() => {
    loadCategoryTranslationStats();
    loadLanguageCompletionStats();
  }, []);

  // 차트 데이터 준비
  const chartData = categoryStats.map(category => ({
    category: category.category,
    ...category.languages.reduce((acc, lang) => {
      acc[lang.languageCode] = lang.completionPercentage;
      return acc;
    }, {})
  }));

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00c49f'];

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3 }}>
        다국어 번역 통계
      </Typography>

      {/* 언어별 전체 완성도 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                언어별 번역 완성도
              </Typography>
              <Grid container spacing={2}>
                {languageStats.map((stat) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={stat.languageCode}>
                    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2">
                          {stat.languageName} ({stat.languageCode})
                        </Typography>
                        <Chip
                          label={`${stat.completionPercentage?.toFixed(1) || 0}%`}
                          color={stat.completionPercentage > 80 ? 'success' : stat.completionPercentage > 50 ? 'warning' : 'default'}
                          size="small"
                        />
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={stat.completionPercentage || 0}
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {stat.translatedCount || 0} / {stat.totalCount || 0} 키 번역됨
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 카테고리별 번역 완성도 차트 */}
      {chartData.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  카테고리별 언어별 번역 완성도
                </Typography>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => [`${value.toFixed(1)}%`, '완성도']}
                        labelFormatter={(label) => `카테고리: ${label}`}
                      />
                      {languageStats.map((lang, index) => (
                        <Bar
                          key={lang.languageCode}
                          dataKey={lang.languageCode}
                          fill={colors[index % colors.length]}
                          name={lang.languageName}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* 카테고리별 상세 통계 테이블 */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                카테고리별 상세 번역 현황
              </Typography>

              {categoryStats.length > 0 ? (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>카테고리</TableCell>
                        {languageStats.map((lang) => (
                          <TableCell key={lang.languageCode} align="center">
                            {lang.languageName}
                            <br />
                            <Typography variant="caption" color="text.secondary">
                              ({lang.languageCode})
                            </Typography>
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {categoryStats.map((category) => (
                        <TableRow key={category.category}>
                          <TableCell>
                            <Chip
                              label={category.category}
                              variant="outlined"
                              color="primary"
                            />
                          </TableCell>
                          {languageStats.map((lang) => {
                            const langStat = category.languages.find(l => l.languageCode === lang.languageCode);
                            const percentage = langStat?.completionPercentage || 0;
                            const translatedKeys = langStat?.translatedKeys || 0;
                            const totalKeys = langStat?.totalKeys || 0;

                            return (
                              <TableCell key={lang.languageCode} align="center">
                                <Box>
                                  <Chip
                                    label={`${percentage.toFixed(1)}%`}
                                    color={percentage > 80 ? 'success' : percentage > 50 ? 'warning' : 'default'}
                                    size="small"
                                    sx={{ mb: 0.5 }}
                                  />
                                  <Typography variant="caption" display="block" color="text.secondary">
                                    {translatedKeys}/{totalKeys}
                                  </Typography>
                                </Box>
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="info">
                  통계 데이터를 로드하는 중입니다...
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};