import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Fade,
} from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { useTranslation } from "../../context/I18nContext";

const SessionExpiryDialog = ({ open, onRefresh, onLogin, cause }) => {
  const { t } = useTranslation();

  return (
    <Dialog
      open={open}
      TransitionComponent={Fade}
      transitionDuration={500}
      maxWidth="xs"
      fullWidth
      disableEscapeKeyDown
      PaperProps={{
        sx: {
          borderRadius: 4,
          padding: 1,
          background: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.3)",
          boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.2)",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          pt: 3,
          px: 4,
          fontWeight: 700,
          color: "warning.main",
        }}
      >
        <WarningAmberRoundedIcon sx={{ fontSize: 32 }} />
        {t("auth.session.expired.title", "세션 만료")}
      </DialogTitle>
      <DialogContent sx={{ px: 4, py: 2 }}>
        <Typography
          variant="body1"
          sx={{ fontWeight: 500, color: "text.primary", mb: 1 }}
        >
          {t(
            "auth.session.expired.message",
            "보안을 위해 세션이 안전하게 종료되었습니다.",
          )}
        </Typography>
        <Box
          sx={{
            mt: 2,
            p: 2,
            borderRadius: 2,
            bgcolor: "rgba(0, 0, 0, 0.04)",
            borderLeft: "4px solid",
            borderColor: "warning.light",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {cause
              ? t("auth.session.expired.cause", "원인: {cause}", { cause })
              : t(
                  "auth.session.expired.default_help",
                  "계속 이용하시려면 다시 로그인해주세요.",
                )}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 4, pb: 4, pt: 2, gap: 2 }}>
        <Button
          onClick={onRefresh}
          color="inherit"
          variant="text"
          sx={{
            fontWeight: 600,
            "&:hover": { bgcolor: "rgba(0, 0, 0, 0.05)" },
          }}
        >
          {t("auth.session.button.refresh", "새로고침")}
        </Button>
        <Button
          onClick={onLogin}
          fullWidth
          variant="contained"
          sx={{
            py: 1.2,
            borderRadius: 2,
            fontWeight: 700,
            fontSize: "1rem",
            textTransform: "none",
            background: "linear-gradient(135deg, #00BCD4 0%, #0097A7 100%)",
            boxShadow: "0 4px 14px 0 rgba(0, 188, 212, 0.4)",
            "&:hover": {
              background: "linear-gradient(135deg, #00acc1 0%, #00838F 100%)",
              boxShadow: "0 6px 20px rgba(0, 188, 212, 0.5)",
              transform: "translateY(-1px)",
            },
            transition: "all 0.2s ease-in-out",
          }}
        >
          {t("auth.session.button.login", "로그인 페이지로 이동")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SessionExpiryDialog;
