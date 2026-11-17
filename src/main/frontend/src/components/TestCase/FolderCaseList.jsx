// src/components/TestCase/FolderCaseList.jsx

import React, { useMemo } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Chip,
  IconButton,
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
  Edit as EditIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  SmartToy as SmartToyIcon,
} from "@mui/icons-material";
import { useI18n } from "../../context/I18nContext.jsx";
import { buildFolderCaseCountMap } from "../../utils/treeUtils.jsx";
import { RESULT_COLORS } from "../../constants/statusColors.js";

const PRIORITY_COLOR = {
  HIGH: "error",
  MEDIUM: "warning",
  LOW: "default",
};

// 텍스트 셀 공통: 최대 길이 초과 시 말줄임(…) + 전체 내용 툴팁
const MAX_CELL_TEXT_LENGTH = 100;

// ICT-495 cl-1: 이름·ID·소유자는 줄바꿈·말줄임 없이 한 줄로 전부 그린다.
// 표가 칸보다 넓어지면 TableContainer 의 가로 스크롤로 끝까지 본다.
const SINGLE_LINE_SX = { whiteSpace: "nowrap" };

const SingleLineText = ({ text, color = "text.primary", sx, ...rest }) => (
  <Typography
    variant="body2"
    color={color}
    sx={{ ...SINGLE_LINE_SX, ...sx }}
    {...rest}
  >
    {text || ""}
  </Typography>
);

SingleLineText.propTypes = {
  text: PropTypes.string,
  color: PropTypes.string,
  sx: PropTypes.object,
};

// ID 열은 `XXX-XXXX`(8글자) 폭까지만 보인다. 열 폭을 내용 폭으로 줄여(width 1%) 표의 남는 폭을
// 나눠 받지 않게 하고, 더 긴 ID 는 말줄임하고 전체 값은 title 로 보인다.
const ID_COLUMN_SX = { ...SINGLE_LINE_SX, width: "1%", pl: 0.5 };

// 형태 아이콘·즐겨찾기 열은 아이콘 폭만 쓴다. 칸 좌우 여백(기본 16px)을 줄여 아이콘·별·ID 가 붙어 보이게 한다.
const TYPE_ICON_COLUMN_SX = { width: "1%", pl: 1.5, pr: 0.5 };
const FAVORITE_COLUMN_SX = { width: "1%", px: 0 };
const ID_TEXT_SX = {
  fontFamily: "monospace",
  maxWidth: "8.5ch",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

// 설명·기대결과처럼 여러 줄인 열은 폭을 묶어 두고 그 안에서 줄바꿈한다(가로로 끝없이 늘지 않게)
const MULTI_LINE_CELL_SX = { minWidth: 200, maxWidth: 320 };

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

// 「최근 결과」 색 막대(ICT-491). 실행된 적 없는 케이스는 회색 막대로 둔다.
const RESULT_LABEL_FALLBACK = {
  PASS: "통과",
  FAIL: "실패",
  BLOCKED: "차단",
  SKIPPED: "건너뜀",
  NOT_RUN: "미실행",
};

const LatestResultBar = ({ latest, testId }) => {
  const { t } = useI18n();
  const result = latest?.result || "NOT_RUN";
  const color =
    RESULT_COLORS[result] ||
    RESULT_COLORS[result.replace("_", "")] ||
    RESULT_COLORS.NOTRUN;
  const label = t(
    `testcase.folderList.result.${result}`,
    RESULT_LABEL_FALLBACK[result] || result,
  );
  const title = latest?.executedAt
    ? `${label} · ${String(latest.executedAt).replace("T", " ").slice(0, 16)}`
    : t("testcase.folderList.result.none", "실행 기록 없음");
  return (
    <Tooltip title={title} arrow>
      <Box
        data-testid={testId}
        data-result={latest ? result : "NONE"}
        aria-label={title}
        sx={{
          width: "100%",
          maxWidth: 48,
          height: 6,
          borderRadius: 1,
          bgcolor: latest ? color : "action.disabledBackground",
        }}
      />
    </Tooltip>
  );
};

LatestResultBar.propTypes = {
  latest: PropTypes.shape({
    result: PropTypes.string,
    executedAt: PropTypes.string,
  }),
  testId: PropTypes.string,
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
const FolderCaseList = ({
  folder,
  items,
  onSelectItem,
  rows,
  onEditFolder,
  favoriteIds,
  onToggleFavorite,
  selectedId,
  compact = false,
  // ICT-494 tl-1: 3단 가운데 칸이 좁을 때 우선순위 열을 감춘다(우선순위는 상세 칸에 남는다)
  hidePriority = false,
  latestResults,
}) => {
  const { t } = useI18n();
  const showFavorite = typeof onToggleFavorite === "function";

  // 폴더별 재귀 케이스 개수 (하위 폴더 행의 개수 배지용)
  const caseCountMap = useMemo(() => buildFolderCaseCountMap(items), [items]);

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

  // 케이스의 조상 폴더 경로 (루트 → 직속 부모 순).
  // baseId 가 주어지면 그 폴더까지(미포함)만 — 선택 폴더 기준의 상대 경로 표시용.
  const getFolderPath = (item, baseId = null) => {
    const path = [];
    const visited = new Set();
    let cur = itemMap.get(item.parentId);
    while (cur && !visited.has(cur.id)) {
      if (baseId != null && String(cur.id) === String(baseId)) break;
      visited.add(cur.id);
      path.unshift(cur);
      cur = itemMap.get(cur.parentId);
    }
    return path;
  };

  // rows가 주어지면 그대로 사용(가상 노드 목록).
  // 폴더 선택 시: 직속 하위 폴더(탐색용) + 모든 하위 케이스(재귀, DFS 순서) —
  // 폴더>폴더>케이스 구조에서도 상위 폴더만 선택하면 케이스 전체를 볼 수 있게 한다.
  const children = useMemo(() => {
    if (rows) return rows;

    const byParent = new Map();
    items.forEach((item) => {
      if (!item) return;
      const key = String(item.parentId);
      if (!byParent.has(key)) byParent.set(key, []);
      byParent.get(key).push(item);
    });
    const sortByOrder = (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0);

    const directFolders = (byParent.get(String(folder.id)) || [])
      .filter((item) => item.type === "folder")
      .slice()
      .sort(sortByOrder);

    // DFS 로 하위 전체 케이스 수집 — 폴더 단위로 묶이고 displayOrder 유지
    const descendantCases = [];
    const visited = new Set(); // 순환 참조 방지
    const visit = (parentId) => {
      if (visited.has(String(parentId))) return;
      visited.add(String(parentId));
      const kids = (byParent.get(String(parentId)) || [])
        .slice()
        .sort(sortByOrder);
      kids.forEach((kid) => {
        if (kid.type === "testcase") descendantCases.push(kid);
        else if (kid.type === "folder") visit(kid.id);
      });
    };
    visit(folder.id);

    return [...directFolders, ...descendantCases];
  }, [rows, items, folder.id]);

  // 폴더 경로 컬럼: 가상 노드 목록이거나, 하위 폴더의 케이스가 포함된 경우 표시
  const hasNestedCases =
    !rows &&
    children.some(
      (item) =>
        item.type === "testcase" && String(item.parentId) !== String(folder.id),
    );
  // 3단 분할(ICT-491)의 가운데 칸은 좁으므로 ID·이름·우선순위만 남긴다(compact)
  const showFolderColumn = !compact && (Boolean(rows) || hasNestedCases);
  const showDetailColumns = !compact;
  const showPriority = !hidePriority;
  // 3단 가운데 칸(compact)에서는 소유자를 빼고 우선순위·최근 결과까지만 보인다(ICT-496)
  const showOwner = !compact;
  // 좁은 칸에서는 아이콘·즐겨찾기 열을 줄여 이름 열 자리를 남긴다
  // 경로 기준: 가상 목록은 전체 경로, 폴더 선택 시 선택 폴더 기준 상대 경로
  const pathBaseId = rows ? null : folder.id;

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
        {onEditFolder && (
          <Tooltip
            title={t("testcase.folderList.editFolder", "폴더 정보 편집")}
            arrow
          >
            <IconButton
              size="small"
              onClick={onEditFolder}
              data-testid="folder-edit-button"
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
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
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ overflowX: "auto" }}
          data-testid="folder-case-table-container"
        >
          {/* ICT-495 cl-1: table-layout: auto — 이름·ID·소유자를 한 줄로 두고 그 길이만큼
              열이 늘어난다. 칸보다 넓어지면 위 컨테이너에 가로 스크롤이 생긴다.
              (예전 fixed 배치는 좁은 칸에서 이름을 한 글자씩 줄바꿈했다) */}
          <Table
            size="small"
            sx={{ tableLayout: "auto", minWidth: "100%" }}
            data-testid="folder-case-table"
          >
            <TableHead>
              <TableRow>
                <TableCell sx={TYPE_ICON_COLUMN_SX} />
                {showFavorite && <TableCell sx={FAVORITE_COLUMN_SX} />}
                {showFolderColumn && (
                  <TableCell sx={SINGLE_LINE_SX}>
                    {t("testcase.folderList.column.folder", "폴더")}
                  </TableCell>
                )}
                <TableCell sx={ID_COLUMN_SX}>
                  {t("testcase.folderList.column.id", "ID")}
                </TableCell>
                <TableCell sx={SINGLE_LINE_SX}>
                  {t("testcase.folderList.column.name", "이름")}
                </TableCell>
                {showDetailColumns && (
                  <TableCell sx={MULTI_LINE_CELL_SX}>
                    {t("testcase.folderList.column.description", "설명")}
                  </TableCell>
                )}
                {showDetailColumns && (
                  <TableCell sx={MULTI_LINE_CELL_SX}>
                    {t("testcase.folderList.column.expectedResult", "기대결과")}
                  </TableCell>
                )}
                {showPriority && (
                  <TableCell sx={SINGLE_LINE_SX}>
                    {t("testcase.folderList.column.priority", "우선순위")}
                  </TableCell>
                )}
                {showOwner && (
                  <TableCell sx={SINGLE_LINE_SX}>
                    {t("testcase.folderList.column.owner", "소유자")}
                  </TableCell>
                )}
                <TableCell sx={{ ...SINGLE_LINE_SX, width: compact ? 64 : 80 }}>
                  {t("testcase.folderList.column.latestResult", "최근 결과")}
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
                    // 3단 분할(ICT-491)에서 오른쪽 상세에 열린 케이스를 표시한다
                    selected={
                      selectedId != null &&
                      String(item.id) === String(selectedId)
                    }
                    onClick={() => onSelectItem && onSelectItem(item)}
                    sx={{ cursor: "pointer" }}
                    data-testid={`folder-case-row-${item.id}`}
                  >
                    <TableCell sx={TYPE_ICON_COLUMN_SX}>
                      {isChildFolder ? (
                        <FolderIcon fontSize="small" color="primary" />
                      ) : (
                        <DescriptionIcon fontSize="small" color="action" />
                      )}
                    </TableCell>
                    {showFavorite && (
                      <TableCell sx={FAVORITE_COLUMN_SX}>
                        {!isChildFolder &&
                          (() => {
                            const active =
                              favoriteIds && favoriteIds.has(item.id);
                            return (
                              <Tooltip
                                title={
                                  active
                                    ? t(
                                        "bookmark.favorite.remove",
                                        "즐겨찾기 제거",
                                      )
                                    : t(
                                        "bookmark.favorite.add",
                                        "즐겨찾기 추가",
                                      )
                                }
                                arrow
                              >
                                <IconButton
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onToggleFavorite(item);
                                  }}
                                  data-testid={`favorite-toggle-${item.id}`}
                                >
                                  {active ? (
                                    <StarIcon
                                      fontSize="small"
                                      sx={{ color: "warning.main" }}
                                    />
                                  ) : (
                                    <StarBorderIcon
                                      fontSize="small"
                                      color="action"
                                    />
                                  )}
                                </IconButton>
                              </Tooltip>
                            );
                          })()}
                      </TableCell>
                    )}
                    {showFolderColumn && (
                      <TableCell>
                        {(() => {
                          const path = getFolderPath(item, pathBaseId);
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
                                sx={{ maxWidth: 240 }}
                              >
                                {path.map((p) => p.name).join(" › ")}
                              </Typography>
                            </Box>
                          );
                        })()}
                      </TableCell>
                    )}
                    <TableCell
                      sx={ID_COLUMN_SX}
                      data-testid={`folder-case-id-${item.id}`}
                    >
                      {!isChildFolder && item.displayId && (
                        <SingleLineText
                          text={item.displayId}
                          color="text.secondary"
                          title={item.displayId}
                          sx={ID_TEXT_SX}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {!isChildFolder && item.isAutomated === true ? (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            minWidth: 0,
                          }}
                        >
                          <Tooltip
                            title={t("testcase.tree.automated", "자동화")}
                            arrow
                          >
                            <SmartToyIcon
                              data-testid={`folder-case-automated-icon-${item.id}`}
                              aria-label={t(
                                "testcase.tree.automated",
                                "자동화",
                              )}
                              sx={{
                                fontSize: 16,
                                color: "secondary.main",
                                flexShrink: 0,
                              }}
                            />
                          </Tooltip>
                          <SingleLineText
                            text={item.name}
                            data-testid={`folder-case-name-${item.id}`}
                          />
                        </Box>
                      ) : (
                        <SingleLineText
                          text={item.name}
                          data-testid={`folder-case-name-${item.id}`}
                        />
                      )}
                    </TableCell>
                    {showDetailColumns && (
                      <TableCell>
                        <Box sx={MULTI_LINE_CELL_SX}>
                          <TruncatedText
                            text={item.description}
                            color="text.secondary"
                          />
                        </Box>
                      </TableCell>
                    )}
                    {showDetailColumns && (
                      <TableCell>
                        {!isChildFolder && (
                          <Box sx={MULTI_LINE_CELL_SX}>
                            <TruncatedText
                              text={getExpectedResults(item)}
                              color="text.secondary"
                            />
                          </Box>
                        )}
                      </TableCell>
                    )}
                    {showPriority && (
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
                    )}
                    {/* 소유자: 담당자 필드가 없어 작성자(createdBy)로 대신한다(ICT-491 결정) */}
                    {showOwner && (
                      <TableCell data-testid={`folder-case-owner-${item.id}`}>
                        {!isChildFolder && item.createdBy && (
                          <SingleLineText
                            text={item.createdBy}
                            color="text.secondary"
                          />
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      {!isChildFolder && (
                        <LatestResultBar
                          latest={latestResults?.[item.id]}
                          testId={`folder-case-result-${item.id}`}
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
  onEditFolder: PropTypes.func,
  favoriteIds: PropTypes.instanceOf(Set),
  onToggleFavorite: PropTypes.func,
  selectedId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  compact: PropTypes.bool,
  hidePriority: PropTypes.bool,
  latestResults: PropTypes.object,
};

export default FolderCaseList;
