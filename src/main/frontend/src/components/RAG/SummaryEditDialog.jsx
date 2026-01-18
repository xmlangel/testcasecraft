// src/components/RAG/SummaryEditDialog.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Chip,
  FormControlLabel,
  Switch,
  Typography,
  IconButton,
  Alert,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

/**
 * 분석 요약 작성/편집 다이얼로그
 *
 * 분석 요약을 생성하거나 편집합니다.
 * - 제목 입력
 * - 요약 내용 입력 (다중 라인)
 * - 태그 관리 (추가/삭제)
 * - 공개/비공개 토글
 */
function SummaryEditDialog({ open, onClose, onSave, summary, documentId }) {
  // 폼 상태
  const [title, setTitle] = useState('');
  const [summaryContent, setSummaryContent] = useState('');
  const [tags, setTags] = useState([]);
  const [isPublic, setIsPublic] = useState(false);
  const [newTag, setNewTag] = useState('');

  // 에러 및 로딩 상태
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  // 유효성 검사
  const [titleError, setTitleError] = useState('');
  const [contentError, setContentError] = useState('');

  // summary가 변경될 때마다 폼 초기화
  useEffect(() => {
    if (summary) {
      // 편집 모드
      setTitle(summary.title || '');
      setSummaryContent(summary.summaryContent || '');
      setTags(summary.tags || []);
      setIsPublic(summary.isPublic || false);
    } else {
      // 생성 모드
      setTitle('');
      setSummaryContent('');
      setTags([]);
      setIsPublic(false);
    }

    setNewTag('');
    setError(null);
    setTitleError('');
    setContentError('');
  }, [summary, open]);

  // 태그 추가
  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (!trimmedTag) return;

    if (tags.includes(trimmedTag)) {
      setError('이미 추가된 태그입니다.');
      return;
    }

    setTags([...tags, trimmedTag]);
    setNewTag('');
    setError(null);
  };

  // 태그 제거
  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  // 저장 버튼
  const handleSave = async () => {
    // 유효성 검사
    let hasError = false;

    if (!title.trim()) {
      setTitleError('제목을 입력해주세요.');
      hasError = true;
    } else {
      setTitleError('');
    }

    if (!summaryContent.trim()) {
      setContentError('요약 내용을 입력해주세요.');
      hasError = true;
    } else {
      setContentError('');
    }

    if (hasError) return;

    setSaving(true);
    setError(null);

    try {
      await onSave({
        title: title.trim(),
        summaryContent: summaryContent.trim(),
        tags,
        isPublic,
        documentId,
      });

      // 성공 시 다이얼로그 닫기 (부모 컴포넌트에서 처리)
    } catch (err) {
      console.error('요약 저장 실패:', err);
      setError(err.response?.data?.message || '요약 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  // Enter 키로 태그 추가
  const handleTagKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {summary ? '요약 편집' : '새 요약 작성'}
        <IconButton
          onClick={onClose}
          sx={{ position: 'absolute', right: 8, top: 8 }}
          disabled={saving}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* 제목 입력 */}
        <TextField
          label="제목"
          fullWidth
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={!!titleError}
          helperText={titleError}
          sx={{ mb: 2 }}
          disabled={saving}
        />

        {/* 요약 내용 입력 */}
        <TextField
          label="요약 내용"
          fullWidth
          required
          multiline
          rows={10}
          value={summaryContent}
          onChange={(e) => setSummaryContent(e.target.value)}
          error={!!contentError}
          helperText={contentError}
          placeholder="분석 결과를 요약하여 작성해주세요..."
          sx={{ mb: 2 }}
          disabled={saving}
        />

        {/* 태그 관리 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            태그
          </Typography>

          {/* 태그 표시 */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
            {tags.length > 0 ? (
              tags.map((tag, idx) => (
                <Chip
                  key={idx}
                  label={tag}
                  onDelete={() => handleRemoveTag(tag)}
                  size="small"
                  disabled={saving}
                />
              ))
            ) : (
              <Typography variant="caption" color="text.secondary">
                태그가 없습니다
              </Typography>
            )}
          </Box>

          {/* 태그 추가 입력 */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              label="새 태그"
              size="small"
              fullWidth
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={handleTagKeyPress}
              placeholder="태그 입력 후 Enter 또는 추가 버튼"
              disabled={saving}
            />
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleAddTag}
              disabled={!newTag.trim() || saving}
            >
              추가
            </Button>
          </Box>
        </Box>

        {/* 공개/비공개 토글 */}
        <Box>
          <FormControlLabel
            control={
              <Switch
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                disabled={saving}
              />
            }
            label={
              <Box>
                <Typography variant="body2">
                  {isPublic ? '공개' : '비공개'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {isPublic
                    ? '모든 사용자가 이 요약을 볼 수 있습니다'
                    : '나만 이 요약을 볼 수 있습니다'}
                </Typography>
              </Box>
            }
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          취소
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving || !title.trim() || !summaryContent.trim()}
        >
          {saving ? '저장 중...' : '저장'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

SummaryEditDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  summary: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    summaryContent: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    isPublic: PropTypes.bool,
  }),
  documentId: PropTypes.string,
};

SummaryEditDialog.defaultProps = {
  summary: null,
  documentId: null,
};

export default SummaryEditDialog;
