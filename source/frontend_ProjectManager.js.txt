// src/components/ProjectManager.js

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";

// 정렬 함수 분리
function sortByDisplayOrder(items) {
  return items.slice().sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
}

const API_URL = "http://localhost:8080/api/projects";

function ProjectManager() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [form, setForm] = useState({ name: "", description: "", displayOrder: 1 });
  const [error, setError] = useState(null);

  // 프로젝트 목록 조회 및 정렬
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setProjects(sortByDisplayOrder(data)); // 분리된 함수 사용
    } catch (err) {
      setError("프로젝트 목록을 가져올 수 없습니다.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // 다이얼로그 열기 (생성/수정)
  const handleOpenDialog = (project = null) => {
    if (project) {
      setEditingProject(project);
      setForm({
        name: project.name,
        description: project.description,
        displayOrder: project.displayOrder || 1,
      });
    } else {
      setEditingProject(null);
      setForm({ name: "", description: "", displayOrder: 1 });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingProject(null);
    setForm({ name: "", description: "", displayOrder: 1 });
    setError(null);
  };

  // 입력 변경 핸들러
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 생성/수정 요청
  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError("프로젝트명을 입력하세요.");
      return;
    }
    try {
      let res;
      if (editingProject) {
        res = await fetch(`${API_URL}/${editingProject.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }
      if (!res.ok) throw new Error("저장 실패");
      await fetchProjects();
      handleCloseDialog();
    } catch (err) {
      setError("저장 중 오류가 발생했습니다.");
    }
  };

  // 삭제 요청
  const handleDelete = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("삭제 실패");
      await fetchProjects();
    } catch (err) {
      setError("삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        프로젝트 관리 (정렬순서: {projects.length}개)
      </Typography>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => handleOpenDialog()}
        sx={{ mb: 2 }}
      >
        새 프로젝트 추가
      </Button>
      <Paper sx={{ maxWidth: 600, mb: 2 }}>
        {loading ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <CircularProgress />
          </Box>
        ) : (
          <List>
            {sortByDisplayOrder(projects).map((project) => (
              <ListItem key={project.id} divider>
                <ListItemText
                  primary={project.name}
                  secondary={
                    <>
                      {project.description && <span>{project.description}</span>}
                      <br />
                      <small>displayOrder: {project.displayOrder}</small>
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    aria-label="edit"
                    onClick={() => handleOpenDialog(project)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    onClick={() => handleDelete(project.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
            {projects.length === 0 && (
              <ListItem>
                <ListItemText primary="등록된 프로젝트가 없습니다." />
              </ListItem>
            )}
          </List>
        )}
      </Paper>

      {/* 생성/수정 다이얼로그 */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingProject ? "프로젝트 수정" : "새 프로젝트 추가"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="normal"
            label="프로젝트명"
            name="name"
            value={form.name}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            margin="normal"
            label="설명"
            name="description"
            value={form.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={2}
          />
          <TextField
            margin="normal"
            label="정렬순서(displayOrder)"
            name="displayOrder"
            type="number"
            value={form.displayOrder}
            onChange={handleChange}
            fullWidth
          />
          {error && (
            <Typography color="error" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>취소</Button>
          <Button variant="contained" onClick={handleSubmit}>
            저장
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ProjectManager;
