// ICT-427: 태그 입력이 Enter 없이도 확정되는지 고정하는 테스트.
// 회귀 지점 — freeSolo Autocomplete 는 확정하지 않은 입력 텍스트를 값으로 넘기지 않는다.
// 그래서 "수정필요" 를 타이핑하고 곧바로 저장을 누르면 태그가 조용히 사라졌다.

import React, { useState } from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TagsAutocomplete from "./TagsAutocomplete.jsx";

const renderTags = (props = {}) => {
  const onChange = props.onChange || vi.fn();
  render(
    <TagsAutocomplete
      value={props.value ?? []}
      onChange={onChange}
      options={props.options ?? ["로그인", "결제"]}
      label="태그"
      inputTestId="tags-input"
      {...props}
    />,
  );
  return { onChange, input: screen.getByTestId("tags-input") };
};

// 실제 화면처럼 값을 들고 있는 래퍼 (칩 렌더까지 확인)
const StatefulTags = ({ initial = [] }) => {
  const [tags, setTags] = useState(initial);
  return (
    <TagsAutocomplete
      value={tags}
      onChange={setTags}
      options={[]}
      label="태그"
      inputTestId="tags-input"
    />
  );
};

describe("TagsAutocomplete", () => {
  it("Enter 로 확정하면 태그가 추가된다", () => {
    const { onChange, input } = renderTags();

    fireEvent.change(input, { target: { value: "수정필요" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(onChange).toHaveBeenCalledWith(["수정필요"]);
  });

  it("Enter 를 누르지 않고 포커스가 빠져도 태그가 확정된다 (저장 클릭 시나리오)", () => {
    const { onChange, input } = renderTags();

    fireEvent.change(input, { target: { value: "수정필요" } });
    fireEvent.blur(input);

    expect(onChange).toHaveBeenCalledWith(["수정필요"]);
  });

  it("앞뒤 공백은 잘라서 확정한다", () => {
    const { onChange, input } = renderTags();

    fireEvent.change(input, { target: { value: "  수정필요  " } });
    fireEvent.blur(input);

    expect(onChange).toHaveBeenCalledWith(["수정필요"]);
  });

  it("기존 태그에 이어서 추가한다", () => {
    const { onChange, input } = renderTags({ value: ["로그인"] });

    fireEvent.change(input, { target: { value: "수정필요" } });
    fireEvent.blur(input);

    expect(onChange).toHaveBeenCalledWith(["로그인", "수정필요"]);
  });

  it("이미 있는 태그는 중복으로 넣지 않는다", () => {
    const { onChange, input } = renderTags({ value: ["수정필요"] });

    fireEvent.change(input, { target: { value: "수정필요" } });
    fireEvent.blur(input);

    expect(onChange).not.toHaveBeenCalled();
  });

  it("빈 입력으로 포커스가 빠지면 아무 일도 없다", () => {
    const { onChange, input } = renderTags();

    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.blur(input);

    expect(onChange).not.toHaveBeenCalled();
  });

  it("확정된 태그는 칩으로 보이고 입력창은 비워진다", () => {
    render(<StatefulTags />);
    const input = screen.getByTestId("tags-input");

    fireEvent.change(input, { target: { value: "수정필요" } });
    fireEvent.blur(input);

    expect(screen.getByText("수정필요")).toBeInTheDocument();
    expect(input).toHaveValue("");
  });
});
