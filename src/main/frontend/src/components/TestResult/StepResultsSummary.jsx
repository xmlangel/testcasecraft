// ICT-469: 저장된 스텝별 결과를 읽기 전용으로 보여 준다.
// compact: 결과별 개수와 PASS 가 아닌 스텝만 한 줄씩 (목록·이력 칸용)
// cards: 스텝마다 카드 한 장 (Step N + 결과 칩 + 실제 결과, 결과 상세 테이블 칸용, ICT-475)
// 기본: 스텝 전체 표 (No. / 스텝 / 기대 결과 / 결과 / 실제 결과)
import PropTypes from "prop-types";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import MarkdownViewer from "../common/MarkdownViewer.jsx";
import { preserveLineBreaks } from "../../utils/markdownLineBreaks.js";

const RESULT_COLOR = {
  PASS: "success",
  FAIL: "error",
  BLOCKED: "warning",
  NOT_RUN: "default",
};

const ORDER = ["PASS", "FAIL", "BLOCKED", "NOT_RUN"];

// t 는 호출하는 화면의 번역 함수를 받는다(화면마다 쓰는 i18n 훅이 달라서)
const StepResultsSummary = ({ steps, t, compact = false, cards = false }) => {
  if (!steps || steps.length === 0) return null;
  const sorted = [...steps].sort((a, b) => a.stepNumber - b.stepNumber);

  // ICT-475: 스텝 정보 칸의 카드와 같은 모양으로 맞춘다
  if (cards) {
    return (
      <Box data-testid="step-results-cards">
        {sorted.map((s, index) => {
          const result = s.result || "NOT_RUN";
          return (
            <Card
              key={s.stepNumber}
              variant="outlined"
              data-testid="step-result-card"
              sx={{
                mb: index < sorted.length - 1 ? 1 : 0,
                p: 1,
                backgroundColor: "rgba(0, 0, 0, 0.02)",
                border: "1px solid rgba(0, 0, 0, 0.1)",
              }}
            >
              <CardContent
                sx={{
                  p: "8px !important",
                  "&:last-child": { pb: "8px !important" },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: s.actualResult ? 0.5 : 0,
                  }}
                >
                  <Typography
                    variant="caption"
                    color="primary.main"
                    sx={{ fontWeight: 600 }}
                  >
                    Step {s.stepNumber}
                  </Typography>
                  <Chip
                    size="small"
                    color={RESULT_COLOR[result] || "default"}
                    label={result}
                    sx={{ height: 18, fontSize: "0.7rem" }}
                  />
                </Box>
                {s.actualResult && (
                  <Box sx={{ fontSize: "0.75rem", wordBreak: "break-word" }}>
                    <Typography
                      variant="caption"
                      component="div"
                      sx={{ fontWeight: 600 }}
                    >
                      {t("testResult.steps.actualResult", "실제 결과")}
                    </Typography>
                    {/* ICT-472: 실제 결과는 마크다운으로 입력받는다 */}
                    <MarkdownViewer
                      content={preserveLineBreaks(s.actualResult)}
                      style={{
                        fontSize: "0.75rem",
                        backgroundColor: "transparent",
                      }}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          );
        })}
      </Box>
    );
  }

  if (compact) {
    const counts = {};
    sorted.forEach((s) => {
      const r = s.result || "NOT_RUN";
      counts[r] = (counts[r] || 0) + 1;
    });
    const notPassed = sorted.filter((s) => s.result !== "PASS");
    return (
      <Box sx={{ mt: 0.5 }} data-testid="step-results-summary">
        <Box
          sx={{
            display: "flex",
            gap: 0.5,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {t("testResult.steps.title", "스텝 결과")}
          </Typography>
          {ORDER.filter((r) => counts[r]).map((r) => (
            <Chip
              key={r}
              size="small"
              variant="outlined"
              color={RESULT_COLOR[r]}
              label={`${r} ${counts[r]}`}
            />
          ))}
        </Box>
        {notPassed.map((s) => (
          <Typography
            key={s.stepNumber}
            variant="caption"
            component="div"
            sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
          >
            {`#${s.stepNumber} ${s.result}`}
            {s.actualResult ? ` · ${s.actualResult}` : ""}
          </Typography>
        ))}
      </Box>
    );
  }

  return (
    <Table size="small" data-testid="step-results-table">
      <TableHead>
        <TableRow>
          <TableCell width="6%">No.</TableCell>
          <TableCell width="30%">
            {t("testResult.steps.step", "스텝")}
          </TableCell>
          <TableCell width="24%">
            {t("testResult.steps.expectedResult", "예상결과")}
          </TableCell>
          <TableCell width="12%">
            {t("testResult.steps.result", "결과")}
          </TableCell>
          <TableCell width="28%">
            {t("testResult.steps.actualResult", "실제 결과")}
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {sorted.map((s) => (
          <TableRow key={s.stepNumber}>
            <TableCell>{s.stepNumber}</TableCell>
            <TableCell sx={{ whiteSpace: "pre-wrap" }}>
              {s.description || ""}
            </TableCell>
            <TableCell sx={{ whiteSpace: "pre-wrap" }}>
              {s.expectedResult || ""}
            </TableCell>
            <TableCell>
              <Chip
                size="small"
                color={RESULT_COLOR[s.result] || "default"}
                label={s.result || "NOT_RUN"}
              />
            </TableCell>
            <TableCell>
              {/* ICT-472: 실제 결과는 마크다운으로 입력받는다 */}
              <MarkdownViewer
                content={preserveLineBreaks(s.actualResult || "")}
                style={{
                  fontSize: "0.8rem",
                  backgroundColor: "transparent",
                }}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

StepResultsSummary.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      stepNumber: PropTypes.number,
      description: PropTypes.string,
      expectedResult: PropTypes.string,
      result: PropTypes.string,
      actualResult: PropTypes.string,
    }),
  ),
  t: PropTypes.func.isRequired,
  compact: PropTypes.bool,
  cards: PropTypes.bool,
};

export default StepResultsSummary;
