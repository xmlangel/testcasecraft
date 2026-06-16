import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Chip,
  IconButton,
  Alert,
  LinearProgress,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Edit as EditIcon, Speed as SpeedIcon } from "@mui/icons-material";
import { useI18n } from "../../context/I18nContext.jsx";
import junitResultService from "../../services/junitResultService";

/**
 * 가장 느린 테스트 목록 탭. (JunitResultDetail 에서 추출)
 */
const SlowestTestsTab = ({
  testResultId,
  onEditTestCase,
  refreshTrigger = 0,
}) => {
  const { t } = useI18n();
  const theme = useTheme();
  const [slowestTests, setSlowestTests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSlowestTests = async () => {
      setLoading(true);
      try {
        const response = await junitResultService.getSlowestTestCases(
          testResultId,
          20,
        );
        setSlowestTests(response.slowestCases || []);
      } catch (err) {
        console.error("Failed to load slow tests:", err);
      } finally {
        setLoading(false);
      }
    };

    loadSlowestTests();
  }, [testResultId, refreshTrigger]);

  const formatDuration = (seconds) => {
    if (seconds < 1) return `${(seconds * 1000).toFixed(0)}ms`;
    if (seconds < 60) return `${seconds.toFixed(2)}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = (seconds % 60).toFixed(2);
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box sx={{ p: 1 }}>
      <List sx={{ p: 0 }}>
        {slowestTests.map((testCase, index) => (
          <ListItem
            key={testCase.id}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "8px",
              mb: 1.5,
              bgcolor:
                index < 3
                  ? alpha(theme.palette.warning.main, 0.05)
                  : "background.paper",
              boxShadow: "none",
              p: 1.5,
            }}
            secondaryAction={
              <IconButton
                edge="end"
                onClick={() => onEditTestCase(testCase)}
                color="primary"
                size="small"
              >
                <EditIcon fontSize="small" />
              </IconButton>
            }
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              <SpeedIcon
                color={index < 3 ? "warning" : "action"}
                fontSize="small"
              />
            </ListItemIcon>
            <ListItemText
              primary={
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    flexWrap: "wrap",
                  }}
                >
                  <Typography variant="body2" fontWeight="bold">
                    {testCase.userTitle || testCase.name}
                  </Typography>
                  <Chip
                    label={`#${index + 1}`}
                    size="small"
                    color={index < 3 ? "warning" : "default"}
                    variant="outlined"
                    sx={{ height: 18, fontSize: "0.65rem" }}
                  />
                  <Chip
                    label={formatDuration(testCase.time || 0)}
                    size="small"
                    color="primary"
                    sx={{ height: 18, fontSize: "0.65rem", fontWeight: "bold" }}
                  />
                </Box>
              }
              secondary={
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontFamily: "monospace", fontSize: "0.7rem" }}
                >
                  {testCase.className}
                </Typography>
              }
            />
          </ListItem>
        ))}
      </List>
      {slowestTests.length === 0 && (
        <Alert severity="info">{t("junit.detail.noExecutionTimeData")}</Alert>
      )}
    </Box>
  );
};

SlowestTestsTab.propTypes = {
  testResultId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onEditTestCase: PropTypes.func,
  refreshTrigger: PropTypes.number,
};

export default SlowestTestsTab;
