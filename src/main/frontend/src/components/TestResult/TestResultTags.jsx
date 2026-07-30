import React from "react";
import TagsAutocomplete from "../common/TagsAutocomplete.jsx";

// 결과 입력 화면의 태그 입력. 입력 확정 규칙(Enter 없이 저장해도 살아남기)은
// 공용 TagsAutocomplete 에 있다 — 일괄 입력·실행 필터와 같은 동작을 쓴다.
const TestResultTags = ({ tags, setTags, availableTags, isViewer, t }) => (
  <TagsAutocomplete
    value={tags}
    onChange={setTags}
    options={availableTags || []}
    label={t("testResult.form.tags", "태그")}
    placeholder={t(
      "testResult.form.tagsPlaceholder",
      "태그를 입력하고 Enter를 누르세요",
    )}
    helperText={t("testResult.helper.tags", "여러 태그를 입력할 수 있습니다")}
    disabled={isViewer}
    inputTestId="result-tags-input"
    margin="normal"
    sx={{ mt: 2 }}
  />
);

export default TestResultTags;
