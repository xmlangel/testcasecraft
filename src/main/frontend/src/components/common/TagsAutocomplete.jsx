// src/main/frontend/src/components/common/TagsAutocomplete.jsx
import React, { useState } from "react";
import { Autocomplete, TextField, Chip } from "@mui/material";

/**
 * 태그 입력(다중 선택 + 직접 입력) 공용 컴포넌트.
 *
 * 왜 별도 컴포넌트인가 — MUI Autocomplete 의 freeSolo 는 Enter 로 확정하지 않은 입력 텍스트를
 * 값으로 넘기지 않는다. 그래서 "수정필요" 를 타이핑한 뒤 곧바로 저장을 누르면 태그가 조용히
 * 사라졌다(결과 입력 화면·일괄 입력·실행 필터 세 곳에서 같은 코드가 반복돼 있었다).
 * 입력 중인 텍스트를 직접 들고 있다가 포커스가 빠질 때 커밋한다.
 *
 * @param {string[]} value 현재 태그 목록
 * @param {(tags: string[]) => void} onChange 태그 목록 변경 핸들러
 * @param {string[]} [options] 자동완성 후보(프로젝트에 이미 쓰인 태그)
 * @param {string} label 입력 라벨
 * @param {string} [placeholder] 입력 안내
 * @param {string} [helperText] 보조 설명
 * @param {boolean} [disabled]
 * @param {"small"|"medium"} [size]
 * @param {string} [id] TextField id
 * @param {string} [inputTestId] data-testid (테스트·E2E 용)
 * @param {object} [sx] Autocomplete 스타일
 * @param {"normal"|"dense"|"none"} [margin] TextField margin
 */
const TagsAutocomplete = ({
  value,
  onChange,
  options = [],
  label,
  placeholder,
  helperText,
  disabled = false,
  size = "medium",
  id,
  inputTestId,
  sx,
  margin,
}) => {
  const [inputValue, setInputValue] = useState("");
  const tags = Array.isArray(value) ? value : [];

  // 입력 중인 텍스트를 태그로 확정한다. 이미 있는 태그면 중복으로 넣지 않는다.
  const commitInputValue = () => {
    const candidate = inputValue.trim();
    if (!candidate) return;
    if (!tags.includes(candidate)) {
      onChange([...tags, candidate]);
    }
    setInputValue("");
  };

  return (
    <Autocomplete
      multiple
      freeSolo
      size={size}
      options={options}
      value={tags}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => setInputValue(newInputValue)}
      onChange={(event, newValue) => onChange(newValue)}
      disabled={disabled}
      sx={sx}
      renderTags={(selected, getTagProps) =>
        selected.map((option, index) => {
          const { key, ...tagProps } = getTagProps({ index });
          return (
            <Chip
              key={key}
              size="small"
              variant="outlined"
              label={option}
              {...tagProps}
              disabled={disabled}
            />
          );
        })
      }
      renderInput={(params) => (
        <TextField
          {...params}
          id={id}
          label={label}
          placeholder={placeholder}
          helperText={helperText}
          margin={margin}
          // 저장 버튼을 누르면 입력창에서 포커스가 빠진다. 그때 확정해야 타이핑한 태그가 살아남는다.
          onBlur={commitInputValue}
          slotProps={{
            htmlInput: {
              ...params.inputProps,
              ...(inputTestId ? { "data-testid": inputTestId } : {}),
            },
          }}
        />
      )}
    />
  );
};

export default TagsAutocomplete;
