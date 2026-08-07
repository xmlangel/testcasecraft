import { describe, it, expect } from "vitest";
import { isTextEntryElement } from "./isTextEntryElement.js";

const el = (html) => {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;
  return wrapper.firstElementChild;
};

describe("isTextEntryElement", () => {
  it("한 줄 입력에서 글자 입력 중으로 본다 — 태그·JIRA 이슈 키 입력이 여기 해당한다", () => {
    expect(isTextEntryElement(el('<input type="text" />'))).toBe(true);
    expect(isTextEntryElement(el("<input />"))).toBe(true);
    expect(isTextEntryElement(el('<input type="search" />'))).toBe(true);
    expect(isTextEntryElement(el('<input type="number" />'))).toBe(true);
    expect(isTextEntryElement(el('<input type="email" />'))).toBe(true);
  });

  it("여러 줄 입력과 선택 목록도 글자 입력으로 본다", () => {
    expect(isTextEntryElement(el("<textarea></textarea>"))).toBe(true);
    expect(isTextEntryElement(el("<select><option>a</option></select>"))).toBe(
      true,
    );
  });

  it("글자를 받지 않는 입력에서는 단축키를 막지 않는다", () => {
    expect(isTextEntryElement(el('<input type="checkbox" />'))).toBe(false);
    expect(isTextEntryElement(el('<input type="radio" />'))).toBe(false);
    expect(isTextEntryElement(el('<input type="button" />'))).toBe(false);
    expect(isTextEntryElement(el('<input type="submit" />'))).toBe(false);
    expect(isTextEntryElement(el('<input type="file" />'))).toBe(false);
    expect(isTextEntryElement(el('<input type="range" />'))).toBe(false);
  });

  it("대문자로 적은 type 도 같게 다룬다", () => {
    expect(isTextEntryElement(el('<input type="CHECKBOX" />'))).toBe(false);
    expect(isTextEntryElement(el('<input type="TEXT" />'))).toBe(true);
  });

  it("콤보박스 역할을 맡은 요소도 글자 입력으로 본다 — MUI Autocomplete", () => {
    expect(isTextEntryElement(el('<div role="combobox"></div>'))).toBe(true);
    expect(isTextEntryElement(el('<div role="textbox"></div>'))).toBe(true);
    expect(isTextEntryElement(el('<div role="searchbox"></div>'))).toBe(true);
  });

  it("contentEditable 요소도 글자 입력으로 본다", () => {
    const editable = el("<div></div>");
    Object.defineProperty(editable, "isContentEditable", { value: true });
    expect(isTextEntryElement(editable)).toBe(true);
  });

  it("버튼·본문 같은 평범한 요소에서는 단축키가 살아 있다", () => {
    expect(isTextEntryElement(el("<button>저장</button>"))).toBe(false);
    expect(isTextEntryElement(el("<div>본문</div>"))).toBe(false);
    expect(isTextEntryElement(el("<td>칸</td>"))).toBe(false);
  });

  it("포커스가 없을 때(null·undefined)는 단축키를 막지 않는다", () => {
    expect(isTextEntryElement(null)).toBe(false);
    expect(isTextEntryElement(undefined)).toBe(false);
  });
});
