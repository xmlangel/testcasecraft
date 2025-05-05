// src/components/UserProfileDialog.js
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
} from "@mui/material";
import { useAppContext } from "../context/AppContext";

/**
 * 사용자 정보 변경 다이얼로그
 * 서버 호출 로직은 AppContext.js로 분리함
 */
function UserProfileDialog({ open, onClose, user, onUserUpdated }) {
  const { updateUserProfile } = useAppContext();

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // user prop이 변경될 때 form 값도 동기화
  useEffect(() => {
    setForm({
      name: user?.name || "",
      email: user?.email || "",
    });
    setError("");
    setSuccess("");
  }, [user, open]);

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
      const updated = await updateUserProfile({
        name: form.name,
        email: form.email,
      });
      setSuccess("정보가 성공적으로 변경되었습니다.");
      onUserUpdated?.(updated);
      setTimeout(onClose, 700);
    } catch (err) {
      setError(err.message || "정보 변경에 실패했습니다.");
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
