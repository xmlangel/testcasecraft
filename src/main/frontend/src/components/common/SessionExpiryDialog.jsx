import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useTranslation } from '../../context/I18nContext';

const SessionExpiryDialog = ({ open, onRefresh, onLogin }) => {
    const { t } = useTranslation();

    return (
        <Dialog
            open={open}
            maxWidth="xs"
            fullWidth
            disableEscapeKeyDown
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningAmberIcon color="warning" />
                {t('auth.session.expired.title')}
            </DialogTitle>
            <DialogContent>
                <Typography variant="body1" gutterBottom>
                    {t('auth.session.expired.message')}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                    {t('auth.session.expired.cause')}
                </Typography>
            </DialogContent>
            <DialogActions sx={{ flexDirection: 'column', gap: 1, p: 2 }}>
                <Button
                    onClick={onRefresh}
                    variant="contained"
                    color="primary"
                    fullWidth
                >
                    {t('auth.session.button.refresh')}
                </Button>
                <Button
                    onClick={onLogin}
                    variant="outlined"
                    color="secondary"
                    fullWidth
                    sx={{ ml: 0 }} // DialogActions default margin removal
                >
                    {t('auth.session.button.login')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SessionExpiryDialog;
