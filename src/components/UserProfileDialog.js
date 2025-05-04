// src/components/UserProfileDialog.js
import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
} from "@mui/material";

function UserProfileDialog({ open, onClose, user, onUserUpdated }) {
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setError("이름과 이메일을 모두 입력하세요.");
      return;
    }
    try {
      const token = localStorage.getItem("jwtToken");
      const res = await fetch("http://localhost:8080/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
        }),
      });
      if (!res.ok) {
        const msg = await res.text();
        setError(msg || "정보 변경에 실패했습니다.");
        return;
      }
      const updated = await res.json();
      setSuccess("정보가 성공적으로 변경되었습니다.");
      onUserUpdated?.(updated);
      setTimeout(onClose, 700);
    } catch (err) {
      setError("네트워크 오류가 발생했습니다.");
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>사용자정보변경</DialogTitle>
      <DialogContent>
        <TextField
          label="이름"
          name="name"
          value={form.name}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="이메일"
          name="email"
          value={form.email}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button variant="contained" onClick={handleSave}>
          저장
        </Button>
      </DialogActions>
    </Dialog>
  );
}

UserProfileDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.object,
  onUserUpdated: PropTypes.func,
};

export default UserProfileDialog;
