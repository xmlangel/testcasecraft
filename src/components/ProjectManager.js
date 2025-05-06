// src/components/ProjectManager.js

import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Tooltip,
  Pagination,
  Grid,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Launch as LaunchIcon,
} from "@mui/icons-material";
import { useAppContext } from "../context/AppContext";

// displayOrder 순 정렬 함수
function sortByDisplayOrder(items) {
  return items.slice().sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
}

const PROJECTS_PER_ROW = 3;
const ROWS_PER_PAGE = 10;
const PROJECTS_PER_PAGE = PROJECTS_PER_ROW * ROWS_PER_PAGE;

function ProjectManager({ onSelectProject }) {
  const {
    projects,
    addProject,
    updateProject,
    deleteProject,
    fetchProjects,
    testCases,
  } = useAppContext();

  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [form, setForm] = useState({
    name: "",
    code: "",
    description: "",
    displayOrder: 1,
  });
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    // 서버 호출을 AppContext의 fetchProjects로 위임
    const load = async () => {
      setLoading(true);
      try {
        await fetchProjects();
      } catch (err) {
        setError("프로젝트 목록을 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fetchProjects]);

  // 프로젝트별 테스트케이스 개수 계산 함수
  const getTestCaseCount = (projectId) => {
    if (!Array.isArray(testCases)) return 0;
    return testCases.filter((tc) => tc.projectId === projectId && tc.type === "testcase").length;
  };

  const handleOpenDialog = (project = null) => {
    setEditingProject(project);
    setForm(
      project
        ? {
            name: project.name,
            code: project.code,
            description: project.description,
            displayOrder: project.displayOrder,
          }
        : { name: "", code: "", description: "", displayOrder: 1 }
    );
    setDialogOpen(true);
    setError(null);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingProject(null);
    setForm({ name: "", code: "", description: "", displayOrder: 1 });
    setError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "code" ? value.toUpperCase().replace(/[^A-Z0-9\-]/g, "") : value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.code.trim()) {
      setError("프로젝트 이름과 코드는 필수입니다.");
      return;
    }
    try {
      let savedProject;
      if (editingProject) {
        savedProject = await updateProject({ ...editingProject, ...form });
      } else {
        savedProject = await addProject(form);
      }
      if (savedProject) setDialogOpen(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "저장 실패");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteProject(id);
    } catch (err) {
      setError(err.message || "삭제 실패");
    }
  };

  // 페이지네이션 관련
  const sortedProjects = sortByDisplayOrder(projects);
  const totalPages = Math.ceil(sortedProjects.length / PROJECTS_PER_PAGE);
  const paginatedProjects = sortedProjects.slice(
    (page - 1) * PROJECTS_PER_PAGE,
    page * PROJECTS_PER_PAGE
  );

  // 3개씩 1줄, 10줄씩 Grid로 렌더링
  const renderProjectGrid = () => (
    <Grid container spacing={2}>
      {paginatedProjects.map((project) => (
        <Grid item xs={12} sm={4} md={4} key={project.id}>
          <Paper sx={{ p: 2, mb: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="subtitle1" sx={{ mr: 1 }}>
                  {project.name} ({project.code})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {project.description}
                </Typography>
                <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">
                    테스트케이스: {getTestCaseCount(project.id)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    순서: {project.displayOrder}
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Tooltip title="프로젝트 바로가기" arrow>
                  <IconButton
                    edge="end"
                    onClick={() => onSelectProject(project.id)}
                    aria-label="바로가기"
                    sx={{
                      bgcolor: "#1976d2",
                      color: "#fff",
                      boxShadow: 2,
                      border: "2px solid #1565c0",
                      "&:hover": {
                        bgcolor: "#1565c0",
                        color: "#fff",
                        transform: "scale(1.1)",
                      },
                      mr: 1.5,
                      transition: "all 0.2s",
                    }}
                  >
                    <LaunchIcon sx={{ fontSize: 30 }} />
                  </IconButton>
                </Tooltip>
                <IconButton edge="end" onClick={() => handleOpenDialog(project)} aria-label="수정">
                  <EditIcon />
                </IconButton>
                <IconButton edge="end" onClick={() => handleDelete(project.id)} aria-label="삭제">
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ flexGrow: 1 }}>
          프로젝트 선택
        </Typography>
        <Typography variant="body1" color="text.secondary">
          전체 프로젝트: <b>{projects.length}</b>개
        </Typography>
      </Box>
      {projects.length ? (
        <Typography variant="body2" sx={{ mb: 2 }}>
          프로젝트를 선택하세요.
        </Typography>
      ) : null}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => handleOpenDialog()}
        sx={{ mb: 2 }}
      >
        새 프로젝트 추가
      </Button>
      <Paper sx={{ maxWidth: 900, p: 2 }}>
        {loading ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <CircularProgress />
            <Typography sx={{ mt: 1 }}>로딩 중...</Typography>
          </Box>
        ) : projects.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mt: 3 }}>
            등록된 프로젝트가 없습니다.
          </Typography>
        ) : (
          <>
            {renderProjectGrid()}
            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </>
        )}
      </Paper>
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingProject ? "프로젝트 수정" : "새 프로젝트 추가"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="코드"
            name="code"
            value={form.code}
            onChange={handleChange}
            fullWidth
            required
            inputProps={{ pattern: "[A-Z0-9\\-]+", maxLength: 20 }}
            helperText="영문 대문자, 숫자, 하이픈만 입력 (예: TMS-001)"
            error={!!error?.includes("code")}
          />
          <TextField
            margin="dense"
            label="이름"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            required
            inputProps={{ maxLength: 50 }}
          />
          <TextField
            margin="dense"
            label="설명"
            name="description"
            value={form.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={3}
            inputProps={{ maxLength: 200 }}
          />
          <TextField
            margin="dense"
            label="순서"
            name="displayOrder"
            type="number"
            value={form.displayOrder}
            onChange={handleChange}
            fullWidth
            inputProps={{ min: 1, max: 100 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>취소</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!form.name || !form.code}>
            저장
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

ProjectManager.propTypes = {
  onSelectProject: PropTypes.func.isRequired,
};

export default ProjectManager;
