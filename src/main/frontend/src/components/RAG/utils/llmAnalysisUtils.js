// src/components/RAG/utils/llmAnalysisUtils.js
import { alpha } from "@mui/material/styles";

/**
 * LLM 분석 결과를 마크다운 형식으로 변환
 *
 * @param {Array<Object>} results - LLM 분석 결과 배열
 * @param {number} results[].chunkIndex - 청크 인덱스
 * @param {string} results[].llmResponse - LLM 응답
 * @returns {string} 마크다운 형식 문자열
 */
export function buildSummaryMarkdown(results) {
  if (!results || results.length === 0) {
    return "";
  }

  return results
    .map((result, index) => {
      const chunkNumber = Number.isInteger(result.chunkIndex)
        ? result.chunkIndex + 1
        : index + 1;
      const cleanedResponse = (result.llmResponse || "")
        .replace(/\n{2,}/g, "\n")
        .trim();
      return `### 📄 청크 ${chunkNumber}\n${cleanedResponse}`;
    })
    .join("\n\n---\n\n");
}

/**
 * 처리된 청크와 전체 청크로 진행률 계산
 *
 * @param {number} processedChunks - 처리된 청크 수
 * @param {number} totalChunks - 전체 청크 수
 * @returns {number} 진행률 (0-100)
 */
export function calculateProgress(processedChunks, totalChunks) {
  if (!totalChunks || totalChunks === 0) return 0;
  return Math.round((processedChunks / totalChunks) * 100);
}

/**
 * 요약 마크다운 스타일 객체 생성
 *
 * @param {Object} theme - MUI 테마 객체
 * @param {boolean} isFullScreen - 전체화면 여부
 * @returns {Object} MUI sx 스타일 객체
 */
export function getSummaryMarkdownStyles(theme, isFullScreen) {
  const isDarkMode = theme.palette.mode === "dark";
  const baseTextColor = isDarkMode
    ? theme.palette.text.primary
    : theme.palette.text.primary;
  const headingGradient = isDarkMode
    ? `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.secondary.light} 100%)`
    : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`;

  return {
    // 문단 내 단일 줄바꿈만 보존 — 루트에 pre-wrap 을 걸면 블록 사이 개행까지
    // 빈 줄로 렌더링되어 과도한 공백이 생긴다.
    "& .wmde-markdown p, & .wmde-markdown li": { whiteSpace: "pre-wrap" },
    mt: 2,
    border: "2px solid",
    borderColor: isDarkMode ? theme.palette.divider : "rgba(6, 182, 212, 0.3)",
    borderRadius: 3,
    maxHeight: isFullScreen ? "calc(100vh - 250px)" : "600px",
    overflow: "auto",
    background: isDarkMode
      ? alpha(theme.palette.background.paper, 0.8)
      : "rgba(255, 255, 255, 0.6)",
    backdropFilter: "blur(18px) saturate(170%)",
    "& .wmde-markdown": {
      p: 3,
      bgcolor: "transparent",
      fontFamily: "'Bricolage Grotesque', sans-serif",
      color: baseTextColor,
    },
    "& .wmde-markdown h1": {
      fontFamily: "'Bricolage Grotesque', sans-serif",
      fontSize: "2.5rem",
      fontWeight: 800,
      mt: 2,
      mb: 1.5,
      borderBottom: `3px solid ${
        isDarkMode
          ? alpha(theme.palette.primary.light, 0.5)
          : alpha(theme.palette.primary.main, 0.5)
      }`,
      pb: 1,
      background: headingGradient,
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    "& .wmde-markdown h2": {
      fontFamily: "'Bricolage Grotesque', sans-serif",
      fontSize: "2rem",
      fontWeight: 700,
      mt: 2,
      mb: 1,
      background: headingGradient,
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
    "& .wmde-markdown h3": {
      fontFamily: "'Bricolage Grotesque', sans-serif",
      fontSize: "1.5rem",
      fontWeight: 600,
      mt: 1.5,
      mb: 0.75,
      color: isDarkMode
        ? theme.palette.primary.light
        : theme.palette.primary.main,
      borderLeft: `4px solid ${
        isDarkMode
          ? alpha(theme.palette.primary.light, 0.5)
          : alpha(theme.palette.primary.main, 0.5)
      }`,
      paddingLeft: "12px",
    },
    "& .wmde-markdown p": {
      mb: 1,
      mt: 0,
      lineHeight: 1.7,
      fontSize: "1rem",
      color: baseTextColor,
    },
    "& .wmde-markdown ul, & .wmde-markdown ol": {
      pl: 4,
      mb: 1,
      mt: 0,
    },
    "& .wmde-markdown li": {
      mb: 0.5,
      color: baseTextColor,
    },
    "& .wmde-markdown code": {
      fontFamily: "'JetBrains Mono', monospace",
      bgcolor: isDarkMode
        ? alpha(theme.palette.common.white, 0.1)
        : alpha(theme.palette.primary.main, 0.1),
      color: isDarkMode
        ? theme.palette.primary.light
        : theme.palette.primary.dark,
      px: 0.75,
      py: 0.5,
      borderRadius: 0.5,
      fontSize: "0.875rem",
      border: `1px solid ${
        isDarkMode
          ? alpha(theme.palette.common.white, 0.1)
          : alpha(theme.palette.primary.main, 0.2)
      }`,
    },
    "& .wmde-markdown pre": {
      fontFamily: "'JetBrains Mono', monospace",
      bgcolor: isDarkMode
        ? alpha(theme.palette.background.paper, 0.5)
        : theme.palette.grey[50],
      color: isDarkMode
        ? theme.palette.text.primary
        : theme.palette.text.primary,
      p: 2,
      borderRadius: 2,
      overflow: "auto",
      mb: 1.5,
      mt: 1,
      border: `2px solid ${
        isDarkMode
          ? theme.palette.divider
          : alpha(theme.palette.primary.main, 0.3)
      }`,
      boxShadow: isDarkMode ? "none" : "0 8px 32px 0 rgba(6, 182, 212, 0.1)",
    },
    "& .wmde-markdown blockquote": {
      borderLeft: `4px solid ${
        isDarkMode ? theme.palette.primary.light : theme.palette.primary.main
      }`,
      pl: 2.5,
      py: 1,
      ml: 0,
      my: 1,
      bgcolor: isDarkMode
        ? alpha(theme.palette.primary.main, 0.1)
        : alpha(theme.palette.primary.main, 0.05),
      fontStyle: "italic",
      color: isDarkMode
        ? theme.palette.text.secondary
        : theme.palette.text.secondary,
      borderRadius: "0 12px 12px 0",
    },
    "& .wmde-markdown table": {
      borderCollapse: "collapse",
      width: "100%",
      mb: 1.5,
      mt: 1,
      boxShadow: isDarkMode ? "none" : "0 8px 32px 0 rgba(6, 182, 212, 0.1)",
    },
    "& .wmde-markdown th, & .wmde-markdown td": {
      border: `1px solid ${
        isDarkMode ? theme.palette.divider : theme.palette.divider
      }`,
      p: 1,
      fontSize: "0.9rem",
    },
    "& .wmde-markdown th": {
      bgcolor: isDarkMode
        ? alpha(theme.palette.primary.main, 0.2)
        : alpha(theme.palette.primary.main, 0.1),
      fontWeight: 600,
      color: baseTextColor,
      fontFamily: "'Bricolage Grotesque', sans-serif",
    },
    "& .wmde-markdown hr": {
      my: 2,
      height: "3px",
      background: headingGradient,
      border: "none",
      boxShadow: isDarkMode ? "none" : "0 2px 4px rgba(6, 182, 212, 0.2)",
    },
  };
}
