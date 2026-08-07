import { describe, it, expect } from "vitest";
import {
  isTextEntryElement,
  isActivatableElement,
} from "./isTextEntryElement.js";

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

  it("열린 목록 안에서도 글자 입력으로 본다 — MUI Select 를 펼친 상태의 type-ahead", () => {
    expect(isTextEntryElement(el('<ul role="listbox"></ul>'))).toBe(true);
    expect(isTextEntryElement(el('<li role="option"></li>'))).toBe(true);
    expect(isTextEntryElement(el('<ul role="menu"></ul>'))).toBe(true);
    expect(isTextEntryElement(el('<li role="menuitem"></li>'))).toBe(true);
  });

  it("contentEditable 요소도 글자 입력으로 본다 — 속성으로도 판별한다", () => {
    // jsdom 은 isContentEditable 를 구현하지 않으므로 속성 경로가 실제로 쓰인다
    expect(isTextEntryElement(el('<div contenteditable="true"></div>'))).toBe(
      true,
    );
    expect(isTextEntryElement(el("<div contenteditable></div>"))).toBe(true);
    expect(isTextEntryElement(el('<div contenteditable="false"></div>'))).toBe(
      false,
    );
    expect(
      isTextEntryElement(el('<div contenteditable="plaintext-only"></div>')),
    ).toBe(true);

    // 편집 영역 안쪽 자식에 포커스가 있어도 글자 입력 중이다
    const host = el('<div contenteditable="true"><span>글자</span></div>');
    expect(isTextEntryElement(host.querySelector("span"))).toBe(true);

    // 브라우저가 주는 isContentEditable 도 그대로 인정한다
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

describe("isActivatableElement", () => {
  it("Enter 로 활성화되는 요소를 알아본다 — 태그 삭제·닫기 버튼이 여기 해당한다", () => {
    expect(isActivatableElement(el("<button>삭제</button>"))).toBe(true);
    expect(isActivatableElement(el('<a href="#">이동</a>'))).toBe(true);
    expect(isActivatableElement(el('<div role="button"></div>'))).toBe(true);
    expect(isActivatableElement(el('<div role="link"></div>'))).toBe(true);
    expect(isActivatableElement(el('<div role="tab"></div>'))).toBe(true);
    expect(isActivatableElement(el('<div role="switch"></div>'))).toBe(true);
  });

  it("버튼 구실을 하는 input 만 활성화 요소로 본다", () => {
    expect(isActivatableElement(el('<input type="submit" />'))).toBe(true);
    expect(isActivatableElement(el('<input type="reset" />'))).toBe(true);
    expect(isActivatableElement(el('<input type="button" />'))).toBe(true);
    expect(isActivatableElement(el('<input type="image" />'))).toBe(true);
  });

  it("체크박스·라디오는 활성화 요소가 아니다 — Space 로 토글되고 Enter 로는 반응하지 않는다", () => {
    // 여기서 true 를 주면 Enter 가 저장도 토글도 못 하는 구간이 생긴다
    expect(isActivatableElement(el('<input type="checkbox" />'))).toBe(false);
    expect(isActivatableElement(el('<input type="radio" />'))).toBe(false);
  });

  it("글자 입력칸과 평범한 요소는 활성화 요소가 아니다", () => {
    expect(isActivatableElement(el('<input type="text" />'))).toBe(false);
    expect(isActivatableElement(el("<input />"))).toBe(false); // type 없으면 text
    expect(isActivatableElement(el("<textarea></textarea>"))).toBe(false);
    expect(isActivatableElement(el("<div>본문</div>"))).toBe(false);
    expect(isActivatableElement(null)).toBe(false);
  });
});
