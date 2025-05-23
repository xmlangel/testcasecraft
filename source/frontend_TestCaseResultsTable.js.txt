// src/components/TestCaseResultsTable.js

import React from "react";
import PropTypes from "prop-types";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  Box,
  Pagination,
} from "@mui/material";
import {
  ExpandLess,
  ExpandMore,
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  Check as CheckIcon,
  Clear as ClearIcon,
  Stop as StopIcon,
  HourglassEmpty as HourglassEmptyIcon,
} from "@mui/icons-material";

const PAGESIZE = 10;

const RESULT_ICON_MAP = {
  PASS: <CheckIcon color="success" fontSize="small" />,
  FAIL: <ClearIcon color="error" fontSize="small" />,
  BLOCKED: <StopIcon color="warning" fontSize="small" />,
  NOTRUN: <HourglassEmptyIcon color="disabled" fontSize="small" />,
};

function ResultCell({ result }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      {RESULT_ICON_MAP[result] || RESULT_ICON_MAP.NOTRUN}
      <Typography variant="body2">{result || "NOTRUN"}</Typography>
    </Box>
  );
}

function TreeRow({
  node,
  level,
  expandedFolders,
  onToggle,
  results,
  canEnterResults,
  onOpenResultForm,
  maxRowHeight,
}) {
  const isFolder = node.type === "folder";
  const resultEntry = results.find((r) => r.testCaseId === node.id);
  const result = resultEntry ? resultEntry.result : "NOTRUN";
  const notes = resultEntry ? resultEntry.notes : "";

  // 입력 버튼이 있는 셀을 항상 행의 맨 아래에 정렬
  return (
    <>
      <TableRow hover sx={{ height: maxRowHeight }}>
        {/* 폴더/파일 아이콘, 트리 들여쓰기, 확장버튼 */}
        <TableCell sx={{ pl: 2 + level * 2, width: 40, verticalAlign: "top" }}>
          {isFolder ? (
            <IconButton size="small" onClick={() => onToggle(node.id)}>
              {expandedFolders.includes(node.id) ? <ExpandLess /> : <ExpandMore />}
            </IconButton>
          ) : (
            <Box sx={{ width: 32, display: "inline-block" }} />
          )}
          {isFolder ? (
            <FolderIcon fontSize="small" sx={{ ml: 1, verticalAlign: "middle" }} />
          ) : (
            <FileIcon fontSize="small" sx={{ ml: 1, verticalAlign: "middle" }} />
          )}
        </TableCell>

        {/* 테스트케이스명 */}
        <TableCell sx={{ verticalAlign: "top" }}>
          <Typography
            variant="body2"
            fontWeight={isFolder ? 700 : 400}
            sx={{ whiteSpace: "pre-line" }}
          >
            {node.name}
          </Typography>
        </TableCell>

        {/* 결과 */}
        <TableCell align="center" sx={{ verticalAlign: "top" }}>
          {!isFolder && <ResultCell result={result} />}
        </TableCell>

        {/* 비고 */}
        <TableCell sx={{ verticalAlign: "top" }}>
          {!isFolder && (
            <Typography variant="body2" sx={{ whiteSpace: "pre-line", wordBreak: "break-all" }}>
              {notes || "-"}
            </Typography>
          )}
        </TableCell>

        {/* 입력 버튼: 항상 오른쪽 끝, 항상 하단 정렬 */}
        <TableCell
          align="right"
          sx={{
            verticalAlign: "bottom",
            pr: 2,
            height: 1,
            position: "relative",
            minWidth: 100,
            // flex 컨테이너로 하단 정렬
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            alignItems: "flex-end",
          }}
        >
          {!isFolder && (
            <IconButton
              size="small"
              variant="outlined"
              onClick={() => onOpenResultForm(node.id)}
              disabled={!canEnterResults}
              aria-label={`결과 입력: ${node.name}`}
              sx={{ border: "1px solid #1976d2", borderRadius: 1, px: 2 }}
            >
              입력
            </IconButton>
          )}
        </TableCell>
      </TableRow>
      {/* 폴더라면 자식 재귀 */}
      {isFolder &&
        expandedFolders.includes(node.id) &&
        node.children?.map((child) => (
          <TreeRow
            key={child.id}
            node={child}
            level={level + 1}
            expandedFolders={expandedFolders}
            onToggle={onToggle}
            results={results}
            canEnterResults={canEnterResults}
            onOpenResultForm={onOpenResultForm}
            maxRowHeight={maxRowHeight}
          />
        ))}
    </>
  );
}

function getMaxRowHeight(nodes, results) {
  // 각 leaf node의 비고(Notes) 길이에 따라 최대 높이 계산
  let max = 56; // 기본 최소값
  function traverse(node, level = 0) {
    if (node.type !== "folder") {
      const resultEntry = results.find((r) => r.testCaseId === node.id);
      const notes = resultEntry ? resultEntry.notes : "";
      // 한글 기준 30자마다 한 줄, 1줄당 24px, 16px 패딩
      const lines = notes ? Math.ceil(notes.length / 30) : 1;
      const height = lines * 24 + 16;
      if (height > max) max = height;
    }
    if (node.children) {
      node.children.forEach((child) => traverse(child, level + 1));
    }
  }
  nodes.forEach((node) => traverse(node));
  return max;
}

export default function TestCaseResultsTable({
  treeData,
  execution,
  canEnterResults,
  onOpenResultForm,
  page,
  setPage,
  expandedFolders,
  onToggleFolder,
}) {
  const results = execution?.results || [];
  const total = treeData.length;
  const totalPages = Math.ceil(total / PAGESIZE);
  const pagedTree = treeData.slice((page - 1) * PAGESIZE, page * PAGESIZE);

  // 최대 행 높이 계산 (비고가 가장 긴 행 기준)
  const maxRowHeight = getMaxRowHeight(pagedTree, results);

  return (
    <Box>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small" aria-label="테스트케이스 결과 테이블">
          <TableHead>
            <TableRow>
              <TableCell width={40}>폴더</TableCell>
              <TableCell width="40%">테스트케이스</TableCell>
              <TableCell width="15%" align="center">
                결과
              </TableCell>
              <TableCell width="25%">비고</TableCell>
              <TableCell width="10%" align="right">
                입력
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {total === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography variant="body2" color="text.secondary">
                    테스트케이스가 없습니다.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              pagedTree.map((node) => (
                <TreeRow
                  key={node.id}
                  node={node}
                  level={0}
                  expandedFolders={expandedFolders}
                  onToggle={onToggleFolder}
                  results={results}
                  canEnterResults={canEnterResults}
                  onOpenResultForm={onOpenResultForm}
                  maxRowHeight={maxRowHeight}
                />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, value) => setPage(value)}
            color="primary"
            showFirstButton
            showLastButton
            size="small"
          />
        </Box>
      )}
    </Box>
  );
}

TestCaseResultsTable.propTypes = {
  treeData: PropTypes.array.isRequired,
  execution: PropTypes.object.isRequired,
  canEnterResults: PropTypes.bool.isRequired,
  onOpenResultForm: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  setPage: PropTypes.func.isRequired,
  expandedFolders: PropTypes.array.isRequired,
  onToggleFolder: PropTypes.func.isRequired,
};

ResultCell.propTypes = {
  result: PropTypes.string,
};
