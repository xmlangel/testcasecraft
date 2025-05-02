// src/components/ProjectManager.js
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
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
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Launch as LaunchIcon
} from '@mui/icons-material';
import { useAppContext } from '../context/AppContext';

function sortByDisplayOrder(items) {
  return items.slice().sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));
}

function ProjectManager({ onSelectProject }) {
  const { 
    projects, 
    addProject, 
    updateProject, 
    deleteProject,
    dispatch 
  } = useAppContext();
  
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [form, setForm] = useState({ 
    name: '', 
    description: '', 
    displayOrder: 1 
  });
  const [error, setError] = useState(null);

  // 프로젝트 데이터 로드
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('http://localhost:8080/api/projects');
        if (!res.ok) throw new Error('프로젝트 불러오기 실패');
        const data = await res.json();
        
        dispatch({
          type: 'SET_PROJECTS',
          payload: data
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, [dispatch]);

  const handleOpenDialog = (project = null) => {
    setEditingProject(project);
    setForm(project ? { 
      name: project.name,
      description: project.description,
      displayOrder: project.displayOrder
    } : {
      name: '',
      description: '',
      displayOrder: 1
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError('프로젝트 이름을 입력해주세요');
      return;
    }

    try {
      if (editingProject) {
        await updateProject({ ...editingProject, ...form });
      } else {
        await addProject(form);
      }
      setDialogOpen(false);
    } catch (err) {
      setError('저장 실패: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    
    try {
      await deleteProject(id);
    } catch (err) {
      setError('삭제 실패: ' + err.message);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {projects.length ? '프로젝트 목록' : '새 프로젝트를 생성하세요'}
      </Typography>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={() => handleOpenDialog()}
        sx={{ mb: 2 }}
      >
        새 프로젝트
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ maxWidth: 600 }}>
        {loading ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <CircularProgress />
            <Typography sx={{ mt: 1 }}>로딩 중...</Typography>
          </Box>
        ) : (
          <List>
            {sortByDisplayOrder(projects).map((project) => (
              <ListItem key={project.id} divider>
                <ListItemText
                  primary={project.name}
                  secondary={
                    <>
                      {project.description}
                      <br />
                      <small>순서: {project.displayOrder}</small>
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => onSelectProject(project.id)}
                  >
                    <LaunchIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={() => handleOpenDialog(project)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={() => handleDelete(project.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingProject ? '프로젝트 수정' : '새 프로젝트'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="프로젝트 이름"
            name="name"
            value={form.name}
            onChange={(e) => setForm({...form, name: e.target.value})}
            fullWidth
            required
          />
          <TextField
            margin="dense"
            label="설명"
            name="description"
            value={form.description}
            onChange={(e) => setForm({...form, description: e.target.value})}
            fullWidth
            multiline
            rows={3}
          />
          <TextField
            margin="dense"
            label="표시 순서"
            name="displayOrder"
            type="number"
            value={form.displayOrder}
            onChange={(e) => setForm({...form, displayOrder: e.target.value})}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>취소</Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
          >
            저장
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

ProjectManager.propTypes = {
  onSelectProject: PropTypes.func.isRequired
};

export default ProjectManager;
