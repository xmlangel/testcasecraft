// src/components/TestCase/InlineImageDialog.jsx

import React from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Slider,
    Alert,
    Typography,
} from '@mui/material';

/**
 * 인라인 이미지 삽입 다이얼로그 컴포넌트
 */
const InlineImageDialog = ({
    open,
    imageDialogState,
    t,
    onClose,
    onInsert,
    updateImageDialogState,
}) => {
    const widthUnit = imageDialogState.widthUnit === '%' ? '%' : 'px';
    const numericWidth = Number(imageDialogState.width);
    const sliderConfig = widthUnit === '%'
        ? { min: 10, max: 100, step: 5, defaultValue: 100 }
        : { min: 50, max: 1200, step: 10, defaultValue: 600 };
    const sliderValue = Number.isFinite(numericWidth) && numericWidth > 0
        ? Math.min(sliderConfig.max, Math.max(sliderConfig.min, numericWidth))
        : sliderConfig.defaultValue;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{t('testcase.inlineImage.dialogTitle', '클립보드 이미지 옵션')}</DialogTitle>
            <DialogContent dividers>
                <TextField
                    label={t('testcase.inlineImage.altLabel', '대체 텍스트')}
                    value={imageDialogState.altText}
                    onChange={(event) => updateImageDialogState({ altText: event.target.value })}
                    fullWidth
                    margin="dense"
                    autoFocus
                />
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <TextField
                            label={t('testcase.inlineImage.width', '가로 크기')}
                            type="number"
                            value={imageDialogState.width}
                            onChange={(event) => updateImageDialogState({ width: event.target.value })}
                            fullWidth
                            helperText={t('testcase.inlineImage.widthHelper', '비워두면 100%로 표시합니다.')}
                            slotProps={{
                                input: { inputProps: { min: 1 } }
                            }}
                        />
                        <FormControl sx={{ minWidth: 120 }}>
                            <InputLabel id="inline-image-width-unit-label">{t('testcase.inlineImage.unit', '단위')}</InputLabel>
                            <Select
                                labelId="inline-image-width-unit-label"
                                label={t('testcase.inlineImage.unit', '단위')}
                                value={imageDialogState.widthUnit}
                                onChange={(event) => {
                                    const nextUnit = event.target.value;
                                    updateImageDialogState((prev) => {
                                        const parsedWidth = Number(prev.width);
                                        const isValid = Number.isFinite(parsedWidth) && parsedWidth > 0;
                                        const fallback = nextUnit === '%' ? 100 : 600;
                                        return {
                                            ...prev,
                                            widthUnit: nextUnit,
                                            width: String(isValid ? parsedWidth : fallback),
                                        };
                                    });
                                }}
                            >
                                <MenuItem value="px">px</MenuItem>
                                <MenuItem value="%">%</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                    <Slider
                        min={sliderConfig.min}
                        max={sliderConfig.max}
                        step={sliderConfig.step}
                        value={sliderValue}
                        valueLabelDisplay="auto"
                        onChange={(_, newValue) => updateImageDialogState({ width: String(newValue) })}
                        marks={widthUnit === '%' ? [
                            { value: 25, label: '25%' },
                            { value: 50, label: '50%' },
                            { value: 75, label: '75%' },
                            { value: 100, label: '100%' },
                        ] : [
                            { value: 200, label: '200px' },
                            { value: 600, label: '600px' },
                            { value: 1000, label: '1000px' },
                        ]}
                    />
                </Box>
                <Box
                    sx={{
                        mt: 2,
                        border: '1px dashed',
                        borderColor: 'divider',
                        borderRadius: 1,
                        p: 2,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'background.default',
                        minHeight: 160,
                    }}
                >
                    {imageDialogState.attachment?.publicUrl ? (
                        <Box
                            component="img"
                            src={imageDialogState.attachment.publicUrl}
                            alt={imageDialogState.altText || 'inline-image-preview'}
                            sx={{
                                maxWidth: '100%',
                                height: 'auto',
                                width: Number.isFinite(numericWidth) && numericWidth > 0 ? `${numericWidth}${widthUnit}` : '100%'
                            }}
                        />
                    ) : (
                        <Typography variant="body2" color="text.secondary">
                            {t('testcase.inlineImage.previewUnavailable', '미리보기를 불러오는 중입니다...')}
                        </Typography>
                    )}
                </Box>
                <Alert severity="info" sx={{ mt: 2 }}>
                    {t('testcase.inlineImage.helper', '이미지는 MinIO에 업로드되며 공개 토큰 URL로 본문에 삽입됩니다.')}
                </Alert>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{t('common.cancel', '취소')}</Button>
                <Button onClick={onInsert} variant="contained">
                    {t('testcase.inlineImage.insert', '삽입')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

InlineImageDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    imageDialogState: PropTypes.shape({
        altText: PropTypes.string,
        width: PropTypes.string,
        widthUnit: PropTypes.string,
        attachment: PropTypes.object,
    }).isRequired,
    t: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    onInsert: PropTypes.func.isRequired,
    updateImageDialogState: PropTypes.func.isRequired,
};

export default InlineImageDialog;
