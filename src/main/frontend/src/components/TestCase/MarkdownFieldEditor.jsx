// src/components/TestCase/MarkdownFieldEditor.jsx

import React from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Typography,
} from '@mui/material';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-md-editor/markdown-editor.css';
import '@uiw/react-markdown-preview/markdown.css';

/**
 * 텍스트/마크다운 모드를 지원하는 필드 에디터 컴포넌트
 */
const MarkdownFieldEditor = ({
    label,
    value,
    placeholder,
    height = 250,
    isViewer = false,
    helperText,
    theme,
    t,
    onChange,
    onPaste,
    defaultMarkdownMode = true,
}) => {
    const displayHelperText = helperText || (!value
        ? t('testcase.helper.enterContent', '내용을 입력하세요.')
        : t('testcase.helper.markdownSupported', 'Markdown 문법을 사용할 수 있습니다.'));

    return (
        <Box sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2">{label}</Typography>
            </Box>
            <Box data-color-mode={theme.palette.mode} sx={{ mt: 1 }}>
                <MDEditor
                    value={value}
                    onChange={(val) => onChange(val || '')}
                    preview="live"
                    height={height}
                    textareaProps={{
                        placeholder,
                        onPaste,
                    }}
                    disabled={isViewer}
                />
            </Box>
            {displayHelperText && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    {displayHelperText}
                </Typography>
            )}
        </Box>
    );
};

MarkdownFieldEditor.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string,
    placeholder: PropTypes.string,
    height: PropTypes.number,
    isViewer: PropTypes.bool,
    helperText: PropTypes.string,
    theme: PropTypes.object.isRequired,
    t: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onPaste: PropTypes.func,
};

export default MarkdownFieldEditor;
