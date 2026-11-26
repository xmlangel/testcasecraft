// src/components/TestPlanForm.jsx

import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Grid,
  Paper,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useAppContext } from "../context/AppContext.jsx";
import { useI18n } from "../context/I18nContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import useProjectRole from "../hooks/useProjectRole.js";
import { canEditProjectContent } from "./TestCaseTree/utils/permissionUtils.js";
import TestCaseTree from "./TestCaseTree.jsx";
import { countRealTestCases } from "../utils/treeUtils";

// 읽기 화면에서는 케이스 선택 상자를 눌러도 아무것도 바뀌지 않는다.
const NOOP = () => {};

/**
 * 테스트 플랜 생성·수정 폼.
 *
 * ICT-513: `startInViewMode` 를 주면 기존 플랜을 읽기 화면으로 연다. 목록에서 플랜을
 * 눌렀는데 곧바로 수정 폼이 열리면, 보려고 들어왔다가 체크박스를 잘못 눌러 저장할 수
 * 있었다. 읽기 화면에서는 입력란과 케이스 선택이 잠기고, 「수정」 버튼을 눌러야
 * 편집 화면이 된다. 편집에서 취소하면 고친 값을 버리고 읽기 화면으로 돌아오며,
 * 저장하면 저장 결과를 알린 뒤 읽기 화면으로 돌아온다.
 */
const TestPlanForm = ({
  testPlanId,
  onCancel,
  onSave,
  inline = false,
  startInViewMode = false,
}) => {
  const {
    activeProject,
    testPlans = [],
    addTestPlan,
    updateTestPlan,
    testCases,
    activeTestPlan,
  } = useAppContext();

  const { t } = useI18n();
  const { user: currentUser } = useAuth();
  // 백엔드 TestPlanService 의 canEditProject 와 같은 기준으로 저장을 막는다.
  const { projectRole } = useProjectRole(activeProject?.id, currentUser);
  const canEdit = canEditProjectContent(projectRole);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    testCaseIds: [],
    projectId: activeProject?.id || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // 기존 플랜만 읽기 화면으로 연다. 새 플랜은 처음부터 편집 화면이다.
  const [viewMode, setViewMode] = useState(
    Boolean(startInViewMode && testPlanId),
  );

  // 저장된 플랜 값 — 처음 채울 때와 편집을 취소할 때 함께 쓴다
  const findSourcePlan = () => {
    if (activeTestPlan && activeTestPlan.id === testPlanId) {
      return activeTestPlan;
    }
    if (testPlanId) {
      return testPlans.find((p) => p.id === testPlanId) || null;
    }
    return null;
  };

  const resetFromSource = (plan) => {
    if (!plan) return;
    setFormData({
      name: plan.name,
      description: plan.description,
      testCaseIds: plan.testCaseIds,
      projectId: plan.projectId,
    });
  };

  // 기존 플랜 데이터 초기화
  useEffect(() => {
    resetFromSource(findSourcePlan());
    // findSourcePlan·resetFromSource 는 아래 세 값으로만 결과가 정해진다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testPlanId, testPlans, activeTestPlan]);

  const handleStartEdit = () => {
    setError(null);
    setViewMode(false);
  };

  // 읽기 화면에서 들어온 편집이면 취소는 고친 값을 버리고 읽기 화면으로 돌아간다.
  // 처음부터 편집 화면으로 연 경우는 예전처럼 호출한 쪽에 닫기를 맡긴다.
  const handleCancel = () => {
    if (startInViewMode && testPlanId) {
      resetFromSource(findSourcePlan());
      setError(null);
      setViewMode(true);
      return;
    }
    onCancel?.();
  };

  // 입력 핸들러
  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    setError(null);
  };

  // 테스트케이스 선택 핸들러
  const handleTestCaseSelect = (selectedIds) => {
    setFormData((prev) => ({ ...prev, testCaseIds: selectedIds }));
  };

  // 유효성 검사
  const validateForm = () => {
    if (!formData.name.trim()) {
      setError(
        t(
          "testPlan.validation.nameRequired",
          "테스트 플랜 이름은 필수 입력 항목입니다",
        ),
      );
      return false;
    }
    if (countRealTestCases(formData.testCaseIds, testCases) === 0) {
      setError(
        t(
          "testPlan.validation.testcaseRequired",
          "최소 한 개 이상의 테스트케이스를 선택해야 합니다",
        ),
      );
      return false;
    }
    return true;
  };

  // 저장 처리
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // 백엔드 전송 전 테스트케이스 타입이 아닌 것(폴더 등) 필터링 (UX를 위해 UI에서는 유지하되 DB에는 테스트케이스만 저장)
      const filteredTestCaseIds = formData.testCaseIds.filter((id) => {
        const tc = testCases.find((t) => t.id === id);
        return tc && tc.type === "testcase";
      });

      const payload = {
        ...formData,
        testCaseIds: filteredTestCaseIds,
        projectId: activeProject.id,
      };

      let savedId = testPlanId;
      if (testPlanId) {
        await updateTestPlan({ ...payload, id: testPlanId });
      } else {
        // 호출한 화면이 방금 만든 플랜을 곧바로 열 수 있도록 식별자를 넘긴다.
        // 지금 addTestPlan 은 id 문자열을 돌려주지만, 저장 결과 객체를 돌려주도록
        // 바뀌더라도 엉뚱한 값이 식별자로 흘러가지 않게 형태를 좁혀서 받는다.
        const created = await addTestPlan(payload);
        savedId = typeof created === "string" ? created : created?.id;
      }

      onSave?.(savedId ?? null);
      if (startInViewMode && testPlanId) setViewMode(true);
    } catch (err) {
      setError(
        t("testPlan.error.saveFailed", "저장 처리 중 오류가 발생했습니다: ") +
          err.message,
      );
    } finally {
      setLoading(false);
    }
  };

  // 실제 테스트케이스만 카운트
  const selectedTestCaseCount = countRealTestCases(
    formData.testCaseIds,
    testCases,
  );

  // inline: 3단 작업 화면의 상세 열에 그대로 놓인다 (팝업으로 화면을 덮지 않는다)
  const Wrapper = inline ? Box : Dialog;
  const wrapperProps = inline
    ? { sx: { p: 2 }, "data-testid": "testplan-form-inline" }
    : { open: true, maxWidth: "lg", fullWidth: true, onClose: onCancel };
  const Title = inline ? Box : DialogTitle;
  const Content = inline ? Box : DialogContent;
  const Actions = inline ? Box : DialogActions;

  return (
    <Wrapper {...wrapperProps}>
      <Title
        {...(inline
          ? {
              sx: { mb: 1, fontSize: "1rem", fontWeight: 700, lineHeight: 1.4 },
            }
          : {})}
      >
        {viewMode
          ? t("testPlan.form.title.view", "테스트 플랜")
          : testPlanId
            ? t("testPlan.form.title.edit", "테스트 플랜 수정")
            : t("testPlan.form.title.create", "새 테스트 플랜 생성")}
      </Title>

      <Content {...(inline ? {} : { dividers: true })}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* 기본 정보 입력 섹션 */}
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              label={t("testPlan.form.planName", "플랜 이름")}
              value={formData.name}
              onChange={handleChange("name")}
              fullWidth
              margin="normal"
              required={!viewMode}
              disabled={loading}
              slotProps={{
                input: { readOnly: viewMode },
                htmlInput: { "data-testid": "testplan-name-input" },
              }}
            />

            <TextField
              label={t("testPlan.form.description", "설명")}
              value={formData.description}
              onChange={handleChange("description")}
              fullWidth
              margin="normal"
              multiline
              rows={4}
              disabled={loading}
              slotProps={{
                input: { readOnly: viewMode },
                htmlInput: { "data-testid": "testplan-description-input" },
              }}
            />
          </Grid>

          {/* 테스트케이스 선택 섹션 */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper
              variant="outlined"
              data-testid="testplan-case-selection"
              data-readonly={viewMode ? "true" : undefined}
              sx={{
                p: 2,
                height: "400px",
                // 읽기 화면: 폴더는 펼쳐 볼 수 있지만 선택 상자는 눌리지 않는다
                ...(viewMode
                  ? { "& .MuiCheckbox-root": { pointerEvents: "none" } }
                  : null),
              }}
            >
              <Typography variant="subtitle1" gutterBottom>
                {t("testPlan.form.testcaseSelection", "테스트케이스 선택")} (
                {t("testPlan.form.selectedCount", "{count}개 선택됨", {
                  count: selectedTestCaseCount,
                })}
                )
              </Typography>

              {activeProject?.id ? (
                <TestCaseTree
                  projectId={activeProject.id}
                  selectable={true}
                  selectedIds={formData.testCaseIds}
                  onSelectionChange={viewMode ? NOOP : handleTestCaseSelect}
                  showMinimalToolbar={true}
                />
              ) : (
                <Typography color="textSecondary">
                  {t(
                    "testPlan.form.projectSelectFirst",
                    "프로젝트를 먼저 선택해주세요",
                  )}
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Content>

      <Actions
        {...(inline
          ? {
              sx: {
                display: "flex",
                justifyContent: "flex-end",
                gap: 1,
                mt: 2,
              },
            }
          : {})}
      >
        {viewMode ? (
          <>
            <Button
              onClick={onCancel}
              color="secondary"
              data-testid="testplan-close-button"
            >
              {t("common.close", "닫기")}
            </Button>
            {/* 조회 전용 역할에는 수정 입구를 내보내지 않는다 */}
            {canEdit && (
              <Button
                onClick={handleStartEdit}
                variant="contained"
                color="primary"
                data-testid="testplan-edit-button"
              >
                {t("common.edit", "수정")}
              </Button>
            )}
          </>
        ) : (
          <Button
            onClick={handleCancel}
            color="secondary"
            disabled={loading}
            data-testid="testplan-cancel-button"
          >
            {t("testPlan.form.button.cancel", "취소")}
          </Button>
        )}
        {/* 조회 전용 역할에는 저장 버튼을 내보내지 않는다. 비활성 버튼만 남기면
            왜 눌리지 않는지 알 수 없다. */}
        {canEdit && !viewMode && (
          <Button
            onClick={handleSave}
            variant="contained"
            color="primary"
            disabled={!formData.name || !activeProject || loading}
            startIcon={loading && <CircularProgress size={20} />}
            data-testid="testplan-save-button"
          >
            {loading
              ? t("testPlan.form.button.processing", "처리 중...")
              : t("testPlan.form.button.save", "저장")}
          </Button>
        )}
      </Actions>
    </Wrapper>
  );
};

TestPlanForm.propTypes = {
  inline: PropTypes.bool,
  startInViewMode: PropTypes.bool,
  testPlanId: PropTypes.string,
  onCancel: PropTypes.func.isRequired,
  onSave: PropTypes.func,
};

export default TestPlanForm;
