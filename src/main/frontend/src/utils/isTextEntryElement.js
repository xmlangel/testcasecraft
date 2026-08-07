/**
 * 이 요소에 글자를 입력하고 있는 중인지 판별한다.
 *
 * 화면 전체(window)에 걸어 둔 단축키는 사용자가 글자를 치는 동안에는 물러나야 한다.
 * 그러지 않으면 태그나 이슈 키를 적다가 누른 글자가 단축키로 먹혀 입력이 사라진다.
 *
 * 글자를 받지 않는 입력(체크박스·라디오·버튼 등)은 단축키를 막지 않는다 — 그 위에
 * 포커스가 있을 때도 단축키는 쓸 수 있어야 한다.
 */

const NON_TEXT_INPUT_TYPES = new Set([
  "button",
  "checkbox",
  "color",
  "file",
  "image",
  "radio",
  "range",
  "reset",
  "submit",
]);

const TEXT_ENTRY_ROLES = new Set(["combobox", "textbox", "searchbox"]);

/**
 * @param {Element | null | undefined} element 검사할 요소 (보통 document.activeElement)
 * @returns {boolean} 글자 입력 중이면 true
 */
export function isTextEntryElement(element) {
  if (!element) return false;

  if (element.isContentEditable) return true;

  const tagName = element.tagName;
  if (tagName === "TEXTAREA" || tagName === "SELECT") return true;

  if (tagName === "INPUT") {
    const type = (element.getAttribute?.("type") || "text").toLowerCase();
    return !NON_TEXT_INPUT_TYPES.has(type);
  }

  // MUI Autocomplete·Select 처럼 div 가 콤보박스 역할을 맡는 경우
  const role = element.getAttribute?.("role");
  return TEXT_ENTRY_ROLES.has(role);
}

export default isTextEntryElement;
