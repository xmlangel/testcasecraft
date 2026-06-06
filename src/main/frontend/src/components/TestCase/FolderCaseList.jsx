// src/components/TestCase/FolderCaseList.jsx

import React, { useMemo } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Folder as FolderIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import { useI18n } from "../../context/I18nContext.jsx";
import { buildFolderCaseCountMap } from "../../utils/treeUtils.jsx";

const PRIORITY_COLOR = {
  HIGH: "error",
  MEDIUM: "warning",
  LOW: "default",
};

// 텍스트 셀 공통: 최대 길이 초과 시 말줄임(…) + 전체 내용 툴팁
const MAX_CELL_TEXT_LENGTH = 100;

const TruncatedText = ({ text, color = "text.primary" }) => {
  const fullText = text || "";
  const isTruncated = fullText.length > MAX_CELL_TEXT_LENGTH;
  const displayText = isTruncated
    ? `${fullText.slice(0, MAX_CELL_TEXT_LENGTH)}…`
    : fullText;

  const typography = (
    <Typography
      variant="body2"
      color={color}
      sx={{
        whiteSpace: "pre-line", // 원본 줄바꿈 보존
        wordBreak: "break-word",
      }}
    >
      {displayText}
    </Typography>
  );

  if (!isTruncated) return typography;
  return (
    <Tooltip
      title={
        <Box sx={{ whiteSpace: "pre-line", maxWidth: 480 }}>{fullText}</Box>
      }
      arrow
    >
      {typography}
    </Tooltip>
  );
};

TruncatedText.propTypes = {
  text: PropTypes.string,
  color: PropTypes.string,
};

/**
 * FolderCaseList - 폴더 선택 시 폴더 내용(하위 폴더 + 테스트케이스)을 테이블로 표시
 *
 * 폴더 전용 트리 모드에서 케이스 열람/이동의 기본 진입점.
 * 행 클릭 시 onSelectItem(item) 호출 — 폴더면 해당 폴더로 이동, 케이스면 상세 폼 열림.
 */
const FolderCaseList = ({ folder, items, onSelectItem, rows }) => {
  const { t } = useI18n();

  // 폴더별 재귀 케이스 개수 (하위 폴더 행의 개수 배지용)
  const caseCountMap = useMemo(() => buildFolderCaseCountMap(items), [items]);

  // 가상 노드 목록(rows 제공)에서는 각 케이스의 소속 폴더 경로를 함께 표시
  const showFolderColumn = Boolean(rows);

  // 기대결과: 통합 expectedResults 필드 우선, 없으면 스텝별 기대결과를 줄바꿈으로 합침
  const getExpectedResults = (item) => {
    if (item.expectedResults && String(item.expectedResults).trim()) {
      return String(item.expectedResults).trim();
    }
    if (!Array.isArray(item.steps)) return "";
    const results = item.steps
      .map((step) => step?.expectedResult)
      .filter((text) => text && String(text).trim().length > 0);
    if (results.length <= 1) return results[0] || "";
    return results.map((text, idx) => `${idx + 1}. ${text}`).join("\n");
  };

  const itemMap = useMemo(
    () => new Map(items.map((item) => [item.id, item])),
    [items],
  );

  // 케이스의 조상 폴더 경로 (루트 → 직속 부모 순)
  const getFolderPath = (item) => {
    const path = [];
    const visited = new Set();
    let cur = itemMap.get(item.parentId);
    while (cur && !visited.has(cur.id)) {
      visited.add(cur.id);
      path.unshift(cur);
      cur = itemMap.get(cur.parentId);
    }
    return path;
  };

  // rows가 주어지면 그대로 사용(가상 노드 목록), 없으면 직속 자식 계산
  const children = useMemo(() => {
    if (rows) return rows;
    return items
      .filter((item) => item && String(item.parentId) === String(folder.id))
      .slice()
      .sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
  }, [rows, items, folder.id]);

  const totalCaseCount = rows
    ? rows.filter((item) => item.type === "testcase").length
    : caseCountMap.get(folder.id) || 0;

  return (
    <Box data-testid="folder-case-list">
      {/* 폴더 헤더 */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
        <FolderIcon color="primary" />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {folder.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t("testcase.folderList.caseCount", "케이스 {count}개", {
            count: totalCaseCount,
          })}
        </Typography>
      </Box>

      {children.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 3, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            {t("testcase.folderList.empty", "이 폴더에 항목이 없습니다.")}
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ width: 56 }} />
                {showFolderColumn && (
                  <TableCell sx={{ width: "22%" }}>
                    {t("testcase.folderList.column.folder", "폴더")}
                  </TableCell>
                )}
                <TableCell>
                  {t("testcase.folderList.column.name", "이름")}
                </TableCell>
                <TableCell sx={{ width: "25%" }}>
                  {t("testcase.folderList.column.description", "설명")}
                </TableCell>
                <TableCell sx={{ width: "25%" }}>
                  {t("testcase.folderList.column.expectedResult", "기대결과")}
                </TableCell>
                <TableCell sx={{ width: 120 }}>
                  {t("testcase.folderList.column.priority", "우선순위")}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {children.map((item) => {
                const isChildFolder = item.type === "folder";
                return (
                  <TableRow
                    key={item.id}
                    hover
                    onClick={() => onSelectItem && onSelectItem(item)}
                    sx={{ cursor: "pointer" }}
                    data-testid={`folder-case-row-${item.id}`}
                  >
                    <TableCell>
                      {isChildFolder ? (
                        <FolderIcon fontSize="small" color="primary" />
                      ) : (
                        <DescriptionIcon fontSize="small" color="action" />
                      )}
                    </TableCell>
                    {showFolderColumn && (
                      <TableCell>
                        {(() => {
                          const path = getFolderPath(item);
                          if (path.length === 0) return null;
                          const parentFolder = path[path.length - 1];
                          return (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                cursor: "pointer",
                                "&:hover .folder-path-text": {
                                  textDecoration: "underline",
                                  color: "primary.main",
                                },
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (onSelectItem) onSelectItem(parentFolder);
                              }}
                              title={path.map((p) => p.name).join(" › ")}
                            >
                              <FolderIcon
                                sx={{ fontSize: 16 }}
                                color="action"
                              />
                              <Typography
                                className="folder-path-text"
                                variant="body2"
                                color="text.secondary"
                                noWrap
                              >
                                {path.map((p) => p.name).join(" › ")}
                              </Typography>
                            </Box>
                          );
                        })()}
                      </TableCell>
                    )}
                    <TableCell>
                      <TruncatedText text={item.name} />
                    </TableCell>
                    <TableCell>
                      <TruncatedText
                        text={item.description}
                        color="text.secondary"
                      />
                    </TableCell>
                    <TableCell>
                      {!isChildFolder && (
                        <TruncatedText
                          text={getExpectedResults(item)}
                          color="text.secondary"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {!isChildFolder && item.priority && (
                        <Chip
                          label={item.priority}
                          size="small"
                          color={PRIORITY_COLOR[item.priority] || "default"}
                          variant="outlined"
                        />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

FolderCaseList.propTypes = {
  folder: PropTypes.object.isRequired,
  items: PropTypes.array.isRequired,
  onSelectItem: PropTypes.func,
  rows: PropTypes.array,
};

export default FolderCaseList;
