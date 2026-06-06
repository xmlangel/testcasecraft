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
                <TableCell>
                  {t("testcase.folderList.column.name", "이름")}
                </TableCell>
                <TableCell sx={{ width: 120 }}>
                  {t("testcase.folderList.column.priority", "우선순위")}
                </TableCell>
                <TableCell sx={{ width: 100 }} align="right">
                  {t("testcase.folderList.column.cases", "케이스")}
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
                    <TableCell>
                      <Typography variant="body2">{item.name}</Typography>
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
                    <TableCell align="right">
                      {isChildFolder && (
                        <Typography variant="body2" color="text.secondary">
                          {caseCountMap.get(item.id) || 0}
                        </Typography>
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
