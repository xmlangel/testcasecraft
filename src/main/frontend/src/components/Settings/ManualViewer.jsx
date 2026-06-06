// src/main/frontend/src/components/Settings/ManualViewer.jsx
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  useMediaQuery,
  Select,
  MenuItem,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Close as CloseIcon,
  Print as PrintIcon,
  Replay as ReplayIcon,
  MenuBook as MenuBookIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import MDEditor from "@uiw/react-md-editor";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useI18n } from "../../context/I18nContext";
import { getDynamicApiUrl } from "../../utils/apiConstants.js";

/**
 * 사용자 매뉴얼 뷰어 — 섹션별 탐색.
 *
 * 전체 마크다운을 한 번 받아 `## N. 제목` 헤딩 기준으로 분할하고,
 * 좌측 섹션 목록에서 선택한 섹션만 렌더한다. 본문의 "목차" 섹션은
 * 사이드바가 대체하므로 제거한다. 이미지는 백엔드
 * /api/manual/images/{lang}/ 로 서빙된다 (본문에서 자동 재작성됨).
 */

/** GitHub 스타일 헤딩 앵커 슬러그 (한글 유지, 구두점 제거, 공백→하이픈) */
function slugify(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s/g, "-");
}

/** 마크다운을 머리말 + 번호 섹션 + 말미(변경 이력)로 분할 */
function splitSections(markdown, introLabel) {
  const lines = markdown.split("\n");
  const sections = [];
  let current = { id: "intro", label: introLabel, lines: [], anchors: [] };
  for (const line of lines) {
    const m = line.match(/^## (.+)$/);
    if (m) {
      sections.push(current);
      const heading = m[1].trim();
      const num = heading.match(/^(\d+)\./);
      current = {
        id: num
          ? `s${num[1]}`
          : heading.toLowerCase().replace(/[^a-z0-9가-힣]+/g, "-"),
        label: heading,
        lines: [line],
        anchors: [slugify(heading)],
      };
    } else {
      const h = line.match(/^#{1,4} (.+)$/);
      if (h) current.anchors.push(slugify(h[1]));
      current.lines.push(line);
    }
  }
  sections.push(current);
  // "목차/Table of Contents" 섹션은 사이드바가 대체 → 제거
  return sections.filter(
    (s) => !/^(목차|table of contents)$/i.test(s.label.trim()),
  );
}

const ManualViewer = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, currentLanguage } = useI18n();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isWide = useMediaQuery("(min-width:900px)");
  const langParam = searchParams.get("l");
  const [lang, setLang] = useState(
    langParam === "en" || langParam === "ko"
      ? langParam
      : currentLanguage === "en"
        ? "en"
        : "ko",
  );
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const introLabel = t("manual.viewer.intro", "소개");
  const sections = useMemo(
    () => (content ? splitSections(content, introLabel) : []),
    [content, introLabel],
  );

  const sectionParam = searchParams.get("s") || "intro";
  const currentIndex = Math.max(
    0,
    sections.findIndex((s) => s.id === sectionParam),
  );
  const currentSection = sections[currentIndex];

  const [pendingAnchor, setPendingAnchor] = useState(null);
  const contentRef = React.useRef(null);

  const selectSection = useCallback(
    (id) => {
      setSearchParams(id === "intro" ? {} : { s: id }, { replace: false });
      window.scrollTo({ top: 0 });
    },
    [setSearchParams],
  );

  /** 본문 내 해시 링크(#앵커) 클릭 → 앵커가 속한 섹션으로 전환 후 스크롤 */
  const handleContentClick = useCallback(
    (e) => {
      const a = e.target.closest && e.target.closest("a");
      if (!a) return;
      const href = a.getAttribute("href") || "";
      if (!href.startsWith("#")) return;
      e.preventDefault();
      const slug = decodeURIComponent(href.slice(1));
      const target = sections.find((s) => s.anchors.includes(slug));
      if (target && target.id !== currentSection?.id) {
        selectSection(target.id);
      }
      setPendingAnchor(slug);
    },
    [sections, currentSection, selectSection],
  );

  // 렌더된 헤딩에 GitHub 스타일 id 부여 + 대기 중 앵커로 스크롤
  useEffect(() => {
    const root = contentRef.current;
    if (!root) return;
    root.querySelectorAll("h1, h2, h3, h4").forEach((el) => {
      if (!el.id) el.id = slugify(el.textContent || "");
    });
    if (pendingAnchor) {
      // 레이아웃 확정 후 절대 좌표로 스크롤 (smooth scrollIntoView 는
      // 섹션 전환 직후 window.scrollTo(0) 와 경합해 무시될 수 있음)
      requestAnimationFrame(() => {
        const el = root.querySelector(`#${CSS.escape(pendingAnchor)}`);
        if (el) {
          const y = el.getBoundingClientRect().top + window.scrollY - 12;
          window.scrollTo({ top: y });
          setPendingAnchor(null);
        }
        // el 이 없으면 대상 섹션 렌더 전 — 보류했다가 섹션 전환 후
        // effect 재실행 시 처리한다 (소진 금지)
      });
    }
  }, [currentSection, pendingAnchor, loading]);

  const fetchManual = useCallback(
    async (targetLang) => {
      setLoading(true);
      setError(null);
      try {
        const baseUrl = (await getDynamicApiUrl()) || window.location.origin;
        const res = await fetch(`${baseUrl}/api/manual/${targetLang}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        setContent(await res.text());
      } catch (err) {
        console.error("Manual loading failed:", err);
        setError(
          t(
            "manual.viewer.error",
            "매뉴얼을 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
          ),
        );
      } finally {
        setLoading(false);
      }
    },
    [t],
  );

  useEffect(() => {
    fetchManual(lang);
  }, [lang, fetchManual]);

  const handleClose = () => {
    if (window.opener) {
      window.close();
    } else {
      navigate(-1);
    }
  };

  const sectionList = (
    <List dense sx={{ py: 0 }} data-testid="manual-section-list">
      {sections.map((s, i) => (
        <ListItemButton
          key={s.id}
          selected={i === currentIndex}
          onClick={() => selectSection(s.id)}
          sx={{ borderRadius: 1, mb: 0.25 }}
        >
          <ListItemText
            primary={s.label}
            primaryTypographyProps={{
              fontSize: 13.5,
              fontWeight: i === currentIndex ? 700 : 400,
              noWrap: true,
            }}
          />
        </ListItemButton>
      ))}
    </List>
  );

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: 3 }}>
      <Box sx={{ maxWidth: 1280, mx: "auto", px: 2 }}>
        <Paper elevation={3} sx={{ borderRadius: 3, overflow: "hidden" }}>
          {/* Header */}
          <Box
            sx={{
              p: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              bgcolor: "primary.main",
              color: "white",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", minWidth: 0 }}>
              <IconButton color="inherit" onClick={handleClose} sx={{ mr: 1 }}>
                <ArrowBackIcon />
              </IconButton>
              <MenuBookIcon sx={{ mr: 1, fontSize: 20 }} />
              <Typography variant="h6" fontWeight="bold" noWrap>
                {t("manual.viewer.title", "사용자 매뉴얼")}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={lang}
                onChange={(e, v) => v && setLang(v)}
                sx={{
                  bgcolor: "rgba(255,255,255,0.15)",
                  "& .MuiToggleButton-root": { color: "white", px: 1.5 },
                  "& .Mui-selected": {
                    bgcolor: "rgba(255,255,255,0.35) !important",
                    color: "white !important",
                  },
                }}
              >
                <ToggleButton value="ko" data-testid="manual-lang-ko">
                  한국어
                </ToggleButton>
                <ToggleButton value="en" data-testid="manual-lang-en">
                  English
                </ToggleButton>
              </ToggleButtonGroup>
              <IconButton
                color="inherit"
                onClick={() => window.print()}
                title={t("manual.viewer.print", "인쇄")}
              >
                <PrintIcon />
              </IconButton>
              <IconButton color="inherit" onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>

          {loading ? (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                py: 12,
                bgcolor: "background.paper",
              }}
            >
              <CircularProgress size={40} sx={{ mb: 2 }} />
              <Typography color="text.secondary">
                {t("manual.viewer.loading", "매뉴얼 로딩 중...")}
              </Typography>
            </Box>
          ) : error ? (
            <Box sx={{ p: 5, bgcolor: "background.paper" }}>
              <Alert
                severity="error"
                action={
                  <Button
                    color="inherit"
                    size="small"
                    startIcon={<ReplayIcon />}
                    onClick={() => fetchManual(lang)}
                  >
                    {t("manual.viewer.retry", "다시 시도")}
                  </Button>
                }
              >
                {error}
              </Alert>
            </Box>
          ) : (
            <Box sx={{ display: "flex", bgcolor: "background.paper" }}>
              {/* 섹션 사이드바 (넓은 화면) */}
              {isWide && (
                <Box
                  sx={{
                    width: 300,
                    flexShrink: 0,
                    bgcolor: isDark ? "rgba(255,255,255,0.05)" : "grey.100",
                    borderRight: 1,
                    borderColor: "divider",
                    p: 1.5,
                    position: "sticky",
                    top: 0,
                    alignSelf: "flex-start",
                    maxHeight: "100vh",
                    overflowY: "auto",
                  }}
                >
                  {sectionList}
                </Box>
              )}

              {/* 본문 */}
              <Box sx={{ flexGrow: 1, p: { xs: 2.5, md: 4 }, minWidth: 0 }}>
                {/* 좁은 화면: 섹션 선택 드롭다운 */}
                {!isWide && (
                  <Select
                    fullWidth
                    size="small"
                    value={currentSection?.id || "intro"}
                    onChange={(e) => selectSection(e.target.value)}
                    sx={{ mb: 2 }}
                  >
                    {sections.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.label}
                      </MenuItem>
                    ))}
                  </Select>
                )}

                <div
                  ref={contentRef}
                  onClick={handleContentClick}
                  data-color-mode={isDark ? "dark" : "light"}
                >
                  <MDEditor.Markdown
                    source={
                      currentSection ? currentSection.lines.join("\n") : ""
                    }
                    style={{
                      backgroundColor: "transparent",
                      color: theme.palette.text.primary,
                    }}
                  />
                </div>

                {/* 이전/다음 섹션 내비게이션 */}
                <Divider sx={{ mt: 4, mb: 2 }} />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Button
                    startIcon={<NavigateBeforeIcon />}
                    disabled={currentIndex <= 0}
                    onClick={() => selectSection(sections[currentIndex - 1].id)}
                    data-testid="manual-prev-section"
                    sx={{ maxWidth: "45%" }}
                  >
                    <Typography noWrap variant="button">
                      {currentIndex > 0 ? sections[currentIndex - 1].label : ""}
                    </Typography>
                  </Button>
                  <Button
                    endIcon={<NavigateNextIcon />}
                    disabled={currentIndex >= sections.length - 1}
                    onClick={() => selectSection(sections[currentIndex + 1].id)}
                    data-testid="manual-next-section"
                    sx={{ maxWidth: "45%" }}
                  >
                    <Typography noWrap variant="button">
                      {currentIndex < sections.length - 1
                        ? sections[currentIndex + 1].label
                        : ""}
                    </Typography>
                  </Button>
                </Box>
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default ManualViewer;
