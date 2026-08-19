// src/components/common/MemberSearchAutocomplete.jsx
//
// 멤버로 더할 사용자를 목록에서 골라 준다. 프로젝트 설정과 조직 관리가 같이 쓴다.
//
// 사용자명을 외워 손으로 적게 하면 오타 하나에 "사용자를 찾을 수 없습니다" 로 끝나고,
// 어떤 이름이 있는지 확인할 방법도 없다. 검색은 화면마다 다른 엔드포인트를 쓰므로
// 호출 함수를 `search` 로 받는다.
//
// 이미 멤버인 사람은 서버가 결과에서 빼므로 고른 뒤 중복으로 실패하지 않는다.
import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import {
  Autocomplete,
  Box,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import { useI18n } from "../../context/I18nContext.jsx";

/** 서버가 두 글자부터 찾는다. 그보다 짧으면 부르지 않는다. */
const MIN_QUERY_LENGTH = 2;
/** 타이핑이 멈춘 뒤 기다리는 시간(ms). 글자마다 부르면 목록이 계속 흔들린다. */
const DEBOUNCE_MS = 250;

function MemberSearchAutocomplete({
  value,
  onChange,
  search,
  disabled = false,
  size = "small",
  sx,
  testId = "member-search",
}) {
  const { t } = useI18n();
  const [input, setInput] = useState("");
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  // 늦게 도착한 앞선 요청이 최신 결과를 덮지 않게 회차를 센다.
  const requestRef = useRef(0);
  // 검색 함수는 ref 로 붙든다. 부모가 매 렌더 새 함수를 넘겨도 조회가 다시 돌면 안 된다.
  const searchRef = useRef(search);
  searchRef.current = search;

  useEffect(() => {
    const keyword = input.trim();
    if (keyword.length < MIN_QUERY_LENGTH) {
      setOptions([]);
      setLoading(false);
      return undefined;
    }

    const seq = ++requestRef.current;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const found = await searchRef.current(keyword);
        if (seq === requestRef.current) {
          setOptions(Array.isArray(found) ? found : []);
        }
      } catch (error) {
        if (seq === requestRef.current) {
          setOptions([]);
        }
      } finally {
        if (seq === requestRef.current) {
          setLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [input]);

  const shortQuery = input.trim().length < MIN_QUERY_LENGTH;

  return (
    <Autocomplete
      value={value}
      onChange={(_event, next) => onChange(next)}
      inputValue={input}
      onInputChange={(_event, next) => setInput(next)}
      options={options}
      filterOptions={(all) => all} // 서버가 이미 걸렀다. 여기서 또 거르면 이름·이메일 일치가 사라진다.
      getOptionLabel={(option) => option?.username ?? ""}
      isOptionEqualToValue={(option, selected) => option.id === selected.id}
      loading={loading}
      disabled={disabled}
      size={size}
      sx={sx}
      noOptionsText={
        shortQuery
          ? t("memberSearch.hint", "두 글자 이상 입력하면 찾습니다.")
          : t("memberSearch.noOptions", "일치하는 사용자가 없습니다.")
      }
      loadingText={t("memberSearch.loading", "찾는 중...")}
      data-testid={testId}
      renderOption={(props, option) => (
        <Box component="li" {...props} key={option.id}>
          <Box>
            <Typography variant="body2">{option.username}</Typography>
            <Typography variant="caption" color="text.secondary">
              {[option.name, option.email].filter(Boolean).join(" · ")}
            </Typography>
          </Box>
        </Box>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          label={t("memberSearch.label", "사용자 검색")}
          placeholder={t(
            "memberSearch.placeholder",
            "사용자명·이름·이메일 2자 이상",
          )}
          inputProps={{
            ...params.inputProps,
            "data-testid": `${testId}-input`,
          }}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress size={16} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}

MemberSearchAutocomplete.propTypes = {
  /** 고른 사용자 ({id, username, name, email}) 또는 null */
  value: PropTypes.object,
  onChange: PropTypes.func.isRequired,
  /** 검색어를 받아 사용자 배열을 돌려주는 함수 */
  search: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  size: PropTypes.string,
  sx: PropTypes.object,
  testId: PropTypes.string,
};

export default MemberSearchAutocomplete;
