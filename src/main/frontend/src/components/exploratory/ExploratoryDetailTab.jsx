import React from "react";
import {
  Card,
  CardContent,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";

function ExploratoryDetailTab({ t }) {
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>
          {t(
            "exploratory.detail.timeline.title",
            "세션 활동 타임라인 (Read-only)",
          )}
        </Typography>
        <List>
          <ListItem divider>
            <ListItemText
              primary={t(
                "exploratory.detail.timeline.start.primary",
                "10:02 세션 시작",
              )}
              secondary={t(
                "exploratory.detail.timeline.start.secondary",
                "차터 바인딩: 결제 실패 복구 시나리오 탐색",
              )}
            />
          </ListItem>
          <ListItem divider>
            <ListItemText
              primary={t(
                "exploratory.detail.timeline.bug.primary",
                "10:27 버그 발견",
              )}
              secondary={t(
                "exploratory.detail.timeline.bug.secondary",
                "PAY-421 생성, 증적 2건 첨부",
              )}
            />
          </ListItem>
          <ListItem divider>
            <ListItemText
              primary={t(
                "exploratory.detail.timeline.pause.primary",
                "10:41 중단/재개",
              )}
              secondary={t(
                "exploratory.detail.timeline.pause.secondary",
                "환경 불안정으로 4분 중단 후 재개",
              )}
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary={t(
                "exploratory.detail.timeline.done.primary",
                "11:03 종료 및 승인 완료",
              )}
              secondary={t(
                "exploratory.detail.timeline.done.secondary",
                "리드 승인자: Choi Lead (2026-02-10)",
              )}
            />
          </ListItem>
        </List>
        <Divider sx={{ my: 1.5 }} />
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
          {t("exploratory.detail.archive.title", "최종 승인 리포트 아카이브")}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Chip label="session-101-report.pdf" />
          <Chip label="debrief-comment.txt" />
          <Chip label="evidence-bundle.zip" />
        </Stack>
      </CardContent>
    </Card>
  );
}

export default ExploratoryDetailTab;
