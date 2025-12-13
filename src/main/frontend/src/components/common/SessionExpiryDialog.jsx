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

const SessionExpiryDialog = ({ open, onRefresh, onLogin, cause }) => {
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
                {t('auth.session.expired.title', 'Connection Check')}
            </DialogTitle>
            <DialogContent>
                <Typography variant="body1" gutterBottom>
                    {t('auth.session.expired.message', 'We can\'t verify your connection right now.')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {cause
                        ? t('auth.session.expired.cause', 'Reason: {cause}', { cause })
                        : t('auth.session.expired.default_help', 'Try refreshing the page. If the issue persists, please log in again.')}
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={onRefresh}
                    color="primary"
                    variant="outlined"
                >
                    {t('auth.session.button.login', 'Go to Login')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default SessionExpiryDialog;
