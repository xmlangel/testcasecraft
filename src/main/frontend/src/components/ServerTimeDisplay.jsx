// src/main/frontend/src/components/ServerTimeDisplay.jsx

import React, { useState, useEffect, useContext } from "react";
import { Box, Typography, Chip, IconButton, Tooltip } from "@mui/material";
import {
  AccessTime as TimeIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import packageJson from "../../package.json";
const APP_VERSION = packageJson.version;
import { useAppContext } from "../context/AppContext";
import { formatDateTime, getTimezoneOffset } from "../utils/timezoneUtils";

const ServerTimeDisplay = () => {
  const { user } = useAppContext();
  const isAdmin = user?.role === "ADMIN";
  // 기본은 접힘 — 작은 시계 아이콘만 노출, 클릭 시 펼침
  const [expanded, setExpanded] = useState(false);
  const [serverTimeState, setServerTimeState] = useState({
    time: "",
    loading: true,
    error: null,
  });

  const fetchServerTime = async () => {
    try {
      const response = await fetch("/api/monitoring/server-time-iso");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      setServerTimeState({
        time: data.serverTime, // ISO String
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("서버 시간 조회 실패:", error);
      setServerTimeState((prev) => ({
        ...prev,
        loading: false,
        error: error.message,
      }));
    }
  };

  useEffect(() => {
    // 관리자이고 펼쳐진 상태에서만 서버 시간 조회/폴링 (접힘 상태는 폴링 생략)
    if (!isAdmin || !expanded) return undefined;

    // 초기 로드
    fetchServerTime();

    // 30초마다 업데이트
    const interval = setInterval(fetchServerTime, 30000);

    return () => clearInterval(interval);
  }, [isAdmin, expanded]);

  // 시간·버전 하단 위젯은 관리자(ADMIN)에게만 노출
  if (!isAdmin) {
    return null;
  }

  // 접힘 상태: 좌측 하단에 작은 시계 아이콘만 (클릭 시 펼침)
  if (!expanded) {
    return (
      <Tooltip title="서버 시간·버전 보기">
        <IconButton
          size="small"
          onClick={() => setExpanded(true)}
          sx={{
            position: "fixed",
            bottom: 16,
            left: 16,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            boxShadow: 2,
            zIndex: 1000,
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          <TimeIcon fontSize="small" color="primary" />
        </IconButton>
      </Tooltip>
    );
  }

  // 사용자 타임존 정보 (렌더링 시 계산)
  const userTimezone = user?.timezone || "UTC";
  const isUTC = userTimezone === "UTC";
  const timezoneOffset = getTimezoneOffset(userTimezone);

  if (serverTimeState.loading) {
    return (
      <Box
        sx={{
          position: "fixed",
          bottom: 16,
          left: 16,
          display: "flex",
          alignItems: "center",
          gap: 1,
          bgcolor: "background.paper",
          px: 2,
          py: 1,
          borderRadius: 1,
          boxShadow: 2,
          zIndex: 1000,
        }}
      >
        <TimeIcon fontSize="small" color="action" />
        <Typography variant="caption" color="text.secondary">
          시간 로딩 중...
        </Typography>
      </Box>
    );
  }

  if (serverTimeState.error) {
    return (
      <Box
        sx={{
          position: "fixed",
          bottom: 16,
          left: 16,
          display: "flex",
          alignItems: "center",
          gap: 1,
          bgcolor: "error.light",
          px: 2,
          py: 1,
          borderRadius: 1,
          boxShadow: 2,
          zIndex: 1000,
        }}
      >
        <TimeIcon fontSize="small" color="error" />
        <Typography variant="caption" color="error.main">
          시간 로드 실패
        </Typography>
      </Box>
    );
  }

  const getTimezoneChipColor = () => {
    if (isUTC) return "success";
    if (userTimezone?.includes("Asia/Seoul")) return "info";
    return "default";
  };

  const getTimezoneLabel = () => {
    if (isUTC) return "UTC";
    if (userTimezone?.includes("Asia/Seoul")) return "KST";
    return userTimezone?.split("/").pop() || "LOCAL";
  };

  const displayTime = formatDateTime(
    serverTimeState.time,
    userTimezone,
    "datetime",
  );

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 16,
        left: 16,
        display: "flex",
        alignItems: "center",
        gap: 1,
        bgcolor: "background.paper",
        px: 2,
        py: 1,
        borderRadius: 1,
        boxShadow: 2,
        border: "1px solid",
        borderColor: "divider",
        zIndex: 1000,
      }}
    >
      <TimeIcon fontSize="small" color="primary" />

      <Typography
        variant="body2"
        component="span"
        sx={{
          fontFamily: "monospace",
          fontWeight: "medium",
          color: "text.primary",
        }}
      >
        {displayTime}
      </Typography>

      <Chip
        label={getTimezoneLabel()}
        size="small"
        color={getTimezoneChipColor()}
        variant="outlined"
        sx={{
          height: 20,
          fontSize: "0.75rem",
          fontWeight: "bold",
        }}
      />

      {timezoneOffset && !isUTC && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontFamily: "monospace" }}
        >
          ({timezoneOffset})
        </Typography>
      )}

      {/* 앱 버전 표시 추가 */}
      <Box
        sx={{
          borderLeft: "1px solid",
          borderColor: "divider",
          pl: 1,
          ml: 0.5,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            fontFamily: "monospace",
            fontWeight: "bold",
            color: "text.secondary",
            fontSize: "0.7rem",
          }}
        >
          v{APP_VERSION}
        </Typography>
      </Box>

      {/* 접기 버튼 */}
      <Tooltip title="접기">
        <IconButton
          size="small"
          onClick={() => setExpanded(false)}
          sx={{ ml: 0.5, p: 0.25 }}
        >
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default ServerTimeDisplay;
