// src/components/ProjectManager.jsx

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
  Stack,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Launch as LaunchIcon,
} from "@mui/icons-material";
import { useAppContext } from "../context/AppContext.jsx";

function sortByDisplayOrder(items) {
  return items.slice().sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
}

const PROJECTS_PER_ROW = 3;
const ROWS_PER_PAGE = 3;
const PROJECTS_PER_PAGE = PROJECTS_PER_ROW * ROWS_PER_PAGE;

function canEdit(role) {
  return role === "ADMIN" || role === "MANAGER";
}
function canDelete(role) {
  return role === "ADMIN";
}

function ProjectManager({ onSelectProject, userRole }) {
  const { projects, addProject, updateProject, deleteProject, fetchProjects } = useAppContext();
  const [loading, setLoading] = useState(false);
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
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        await fetchProjects();
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line
  }, []);

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
      [name]: name === "code"
        ? value.replace(/[^a-zA-Z0-9-]/g, "").toUpperCase()
        : value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.code.trim()) {
      setError("이름과 코드를 입력해주세요.");
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
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleDelete = async (project) => {
    if (!window.confirm(`[${project.name}] 정말 삭제하시겠습니까?`)) return;
    try {
      await deleteProject(project.id);
    } catch (err) {
      setError(`[${project.name} (ID: ${project.id})] 삭제 실패: ${err.message || "삭제 중 오류 발생"}`);
    }
  };

  const sortedProjects = sortByDisplayOrder(projects);
  const totalPages = Math.ceil(sortedProjects.length / PROJECTS_PER_PAGE);
  const paginatedProjects = sortedProjects.slice(
    (page - 1) * PROJECTS_PER_PAGE,
    page * PROJECTS_PER_PAGE
  );

  const renderProjectGrid = (
    <Grid container spacing={2}>
      {paginatedProjects.map((project) => (
        <Grid item xs={12} sm={6} md={4} key={project.id}>
          <Paper sx={{ p: 1, mb: 1, height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ wordBreak: "break-all" }}>
                {project.name} <span style={{fontSize: '0.85em', color: '#888'}}>(ID: {project.id})</span>
              </Typography>
              <Typography variant="subtitle2" color="text.secondary" sx={{ wordBreak: "break-all", mb: 0.5 }}>
                코드: {project.code}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, wordBreak: "break-all" }}>
                {project.description}
              </Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
                  TC <b>{project.testCaseCount ?? 0}</b>
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Order <b>{project.displayOrder}</b>
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Tooltip title="프로젝트 열기" arrow>
                  <IconButton
                    edge="end"
                    onClick={() => onSelectProject(project.id)}
                    aria-label="open"
                    sx={{
                      bgcolor: "#1976d2",
                      color: "#fff",
                      border: "2px solid #1565c0",
                      "&:hover": { bgcolor: "#1565c0", color: "#fff", transform: "scale(1.1)" },
                      transition: "all 0.2s",
                    }}
                  >
                    <LaunchIcon sx={{ fontSize: 22 }} />
                  </IconButton>
                </Tooltip>
                {canEdit(userRole) && (
                  <Tooltip title="수정" arrow>
                    <IconButton
                      edge="end"
                      onClick={() => handleOpenDialog(project)}
                      aria-label="edit"
                      sx={{
                        bgcolor: "#fff",
                        color: "#1976d2",
                        border: "1px solid #1976d2",
                        "&:hover": { bgcolor: "#e3f2fd", color: "#1565c0" },
                        transition: "all 0.2s",
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                )}
                {canDelete(userRole) && (
                  <Tooltip title="삭제" arrow>
                    <IconButton
                      edge="end"
                      onClick={() => handleDelete(project)}
                      aria-label="delete"
                      sx={{
                        bgcolor: "#f5f5f5",
                        color: "#757575",
                        border: "1px solid #bdbdbd",
                        "&:hover": { bgcolor: "#eeeeee", color: "#616161" },
                        transition: "all 0.2s",
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Stack>
            </Stack>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );

  const canCreateProject = userRole === "ADMIN" || userRole === "MANAGER";

  return (
    <Box sx={{ p: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Typography variant="h5" gutterBottom sx={{ flexGrow: 1 }}>
          프로젝트 목록
        </Typography>
        <Typography variant="body1" color="text.secondary">
          <b>{projects.length}</b>
        </Typography>
      </Box>
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary">
          <b>{userRole}</b>
        </Typography>
      </Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        {canCreateProject && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            새 프로젝트
          </Button>
        )}
      </Box>
      <Paper sx={{ maxWidth: "100%", width: "100%", p: 1 }}>
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
          renderProjectGrid
        )}
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
      </Paper>
      <Dialog open={dialogOpen} onClose={handleCloseDialog} closeAfterTransition={false}
        maxWidth="sm" fullWidth>
        <DialogTitle>{editingProject ? "프로젝트 수정" : "새 프로젝트"}</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              <b>{userRole}</b>
            </Typography>
          </Box>
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
            helperText="영대문자, 숫자, - 만 입력 (최대 20자)"
            error={!!error && error.includes("code")}
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
            label="정렬순서"
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
  userRole: PropTypes.string,
};

export default ProjectManager;
