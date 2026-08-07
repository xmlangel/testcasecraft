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

// 콤보박스·텍스트칸 외에 열린 목록도 포함한다 — MUI Select 를 펼치면 포커스가
// 팝업 안의 option 으로 옮겨가고, 거기서 항목을 찾으려 치는 글자를 단축키가 먹는다.
const TEXT_ENTRY_ROLES = new Set([
  "combobox",
  "textbox",
  "searchbox",
  "listbox",
  "option",
  "menu",
  "menuitem",
]);

// Enter 로 활성화되는 요소 — Enter 를 이들에게 넘겨야 클릭이 먹는다
const ACTIVATABLE_TAGS = new Set(["BUTTON", "A", "SUMMARY"]);
const ACTIVATABLE_ROLES = new Set(["button", "link", "tab", "switch"]);

// 버튼 구실을 하는 input 타입만 넣는다. 체크박스·라디오는 Space 로 토글되고 Enter 로는
// 아무 일도 하지 않으므로 여기 넣으면 Enter 가 저장도 토글도 못 하는 구간이 생긴다.
const ACTIVATABLE_INPUT_TYPES = new Set(["button", "image", "reset", "submit"]);

/**
 * @param {Element | null | undefined} element 검사할 요소 (보통 document.activeElement)
 * @returns {boolean} 글자 입력 중이면 true
 */
export function isTextEntryElement(element) {
  if (!element) return false;

  // jsdom 은 isContentEditable 을 구현하지 않아 속성으로도 확인한다.
  // 조상까지 보는 이유는 편집 영역 안쪽 자식에 포커스가 갈 수 있어서다.
  if (element.isContentEditable) return true;
  const editableHost = element.closest?.("[contenteditable]");
  if (editableHost) {
    return editableHost.getAttribute("contenteditable") !== "false";
  }

  const tagName = element.tagName;
  if (tagName === "TEXTAREA") return true;

  // 네이티브 select 는 글자를 쳐서 항목을 찾는다(type-ahead). 그 글자를 단축키가 먹으면
  // 항목 선택이 안 되고 판정이 바뀌므로, 글자를 받는 쪽으로 다룬다.
  if (tagName === "SELECT") return true;

  if (tagName === "INPUT") {
    const type = (element.getAttribute?.("type") || "text").toLowerCase();
    return !NON_TEXT_INPUT_TYPES.has(type);
  }

  // MUI Autocomplete·Select 처럼 div 가 콤보박스 역할을 맡는 경우
  const role = element.getAttribute?.("role");
  return TEXT_ENTRY_ROLES.has(role);
}

/**
 * Enter 나 Space 로 활성화되는 요소인지 판별한다.
 *
 * 화면 전체에 걸린 Enter 단축키(저장)는 이런 요소 위에서 물러나야 한다. 그러지 않으면
 * 태그 삭제 버튼이나 닫기 버튼에 포커스를 두고 Enter 를 눌렀을 때 그 동작 대신 저장이 실행된다.
 *
 * @param {Element | null | undefined} element 검사할 요소 (보통 document.activeElement)
 * @returns {boolean} Enter 로 활성화되는 요소면 true
 */
export function isActivatableElement(element) {
  if (!element) return false;

  if (ACTIVATABLE_TAGS.has(element.tagName)) return true;

  if (element.tagName === "INPUT") {
    const type = (element.getAttribute?.("type") || "text").toLowerCase();
    return ACTIVATABLE_INPUT_TYPES.has(type);
  }

  const role = element.getAttribute?.("role");
  return ACTIVATABLE_ROLES.has(role);
}

export default isTextEntryElement;
