import React from "react";
import {
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

function ExploratoryDebriefTab({ t, sessionDraft, setSessionDraft }) {
  return (
    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 8 }}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              {t("exploratory.debrief.report.title", "디브리프 리포트")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t(
                "exploratory.debrief.report.meta",
                "세션: Sprint 22 결제 탐색 | 테스터: Kim QA | 상태: DONE",
              )}
            </Typography>
            <Divider sx={{ my: 1.5 }} />
            <Typography variant="body2" sx={{ mb: 1 }}>
              {t(
                "exploratory.debrief.report.summary",
                "요약: 결제 승인 단계에서 간헐적 타임아웃 재현. 재시도 경로에서 중복 승인 위험 발견.",
              )}
            </Typography>
            <Typography variant="body2">
              {t(
                "exploratory.debrief.report.keyBugs",
                "주요 버그: PAY-421, PAY-433",
              )}
            </Typography>
            <Typography variant="body2">
              {t(
                "exploratory.debrief.report.evidence",
                "증적: screenshot_0210.png, payment-retry.log",
              )}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
              {t("exploratory.debrief.checklist.title", "체크리스트")}
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText
                  primary={t(
                    "exploratory.debrief.checklist.scope",
                    "차터 범위 준수",
                  )}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary={t(
                    "exploratory.debrief.checklist.timebox",
                    "타임박스/중단 시간 기록",
                  )}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary={t(
                    "exploratory.debrief.checklist.evidence",
                    "버그 근거 자료 첨부",
                  )}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary={t(
                    "exploratory.debrief.checklist.action",
                    "후속 액션 제안 포함",
                  )}
                />
              </ListItem>
            </List>
            <TextField
              fullWidth
              multiline
              minRows={3}
              label={t("exploratory.debrief.leadComment", "리드 코멘트")}
              value={sessionDraft.leadComment}
              onChange={(e) =>
                setSessionDraft((prev) => ({
                  ...prev,
                  leadComment: e.target.value,
                }))
              }
              sx={{ mt: 1 }}
            />
            <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
              <Button variant="contained" color="success">
                {t("exploratory.debrief.action.approve", "승인")}
              </Button>
              <Button variant="outlined" color="warning">
                {t("exploratory.debrief.action.requestChanges", "보완요청")}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

export default ExploratoryDebriefTab;
