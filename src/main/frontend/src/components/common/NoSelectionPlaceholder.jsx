import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import TouchAppIcon from '@mui/icons-material/TouchApp'; // Or another suitable icon
import { useI18n } from '../../context/I18nContext';

const NoSelectionPlaceholder = () => {
    const { t } = useI18n();

    return (
        <Box
            sx={{
                flexGrow: 1,
                p: 3,
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'background.default',
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    p: 5,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    bgcolor: 'transparent',
                }}
            >
                <TouchAppIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" color="text.secondary" align="center" gutterBottom>
                    {t('testcase.message.noSelection', '폴더나 테스트 케이스를 선택해주세요.')}
                </Typography>
                <Typography variant="body2" color="text.disabled" align="center">
                    {t('testcase.message.selectTreeItem', '좌측 트리에서 항목을 선택하면 상세 정보를 볼 수 있습니다.')}
                </Typography>
            </Paper>
        </Box>
    );
};

export default NoSelectionPlaceholder;
