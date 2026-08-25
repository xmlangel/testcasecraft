import { useCallback, useEffect, useRef, useState } from "react";

// 소수점 높이 오차와 마지막 문단의 여백 때문에 1~3px 차이가 늘 생긴다. 이 여유를
// 두지 않으면 넘치지 않는 내용에도 표시가 붙는다.
const SLACK = 4;

/**
 * 이 내용을 실제로 잘라내는 스크롤 상자를 찾는다.
 *
 * 호출부가 높이 상한을 자기 자신에게 주기도 하고(JiraHistoryDialog 는 style 로
 * maxHeight 를 준다) 감싸는 Box 에 주기도 한다(DocumentChunks). 그래서 자신부터
 * 위로 훑는데, 조건 없이 올라가면 페이지 스크롤까지 집어온다. 실측에서 스텝 표의
 * 짧은 편집기에 표시가 붙었고, 원인은 편집기가 아니라 표 전체가 스크롤한 것이었다.
 *
 * 그래서 둘을 함께 요구한다.
 * - 그 상자가 실제로 넘친다
 * - 우리 내용이 그 상자의 보이는 높이보다 크다 (= 우리가 잘리는 쪽이다)
 *
 * 조상 탐색은 세 단계까지만 한다. 더 올라가면 화면 전체 스크롤을 우리 것으로 읽는다.
 */
const MAX_ANCESTOR_DEPTH = 3;

const findScroller = (contentEl) => {
  const contentHeight = contentEl.scrollHeight;
  let el = contentEl;
  let depth = 0;
  while (el && el !== document.body && depth <= MAX_ANCESTOR_DEPTH) {
    const style = window.getComputedStyle(el);
    const scrollable = /auto|scroll|overlay/.test(
      `${style.overflowY} ${style.overflow}`,
    );
    if (scrollable && el.scrollHeight - el.clientHeight > SLACK) {
      const clipsUs =
        el === contentEl || contentHeight - el.clientHeight > SLACK;
      if (clipsUs) return el;
    }
    el = el.parentElement;
    depth += 1;
  }
  return null;
};

/**
 * 스크롤 영역에서 "가려진 내용이 있다"는 사실을 알려 주는 훅.
 *
 * 편집기와 뷰어 모두 높이 상한을 두고 넘치면 안에서 스크롤한다. 넘쳤다는 표시가
 * 없으면 잘린 자리에서 글이 끝난 것처럼 보인다.
 *
 * ResizeObserver 가 없는 환경(jsdom 시험 등)에서는 관찰을 건너뛰고 스크롤 이벤트만
 * 본다. 표시가 안 뜰 뿐 화면이 깨지지는 않는다.
 */
export const useScrollOverflow = () => {
  const ref = useRef(null);
  const [state, setState] = useState({
    overflowing: false,
    atTop: true,
    atBottom: true,
  });

  const measure = useCallback(() => {
    const start = ref.current;
    if (!start) return;
    const el = findScroller(start);
    if (!el) {
      setState((prev) =>
        prev.overflowing
          ? { overflowing: false, atTop: true, atBottom: true }
          : prev,
      );
      return;
    }
    const atTop = el.scrollTop <= SLACK;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - SLACK;
    setState((prev) =>
      prev.overflowing && prev.atTop === atTop && prev.atBottom === atBottom
        ? prev
        : { overflowing: true, atTop, atBottom },
    );
  }, []);

  useEffect(() => {
    const start = ref.current;
    if (!start) return undefined;

    measure();

    // 스크롤 주체가 조상일 수 있어 캡처 단계에서 듣는다. 조상의 스크롤 이벤트는
    // 이 요소로 버블링하지 않는다.
    document.addEventListener("scroll", measure, {
      passive: true,
      capture: true,
    });

    let observer;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(measure);
      observer.observe(start);
      if (start.parentElement) observer.observe(start.parentElement);
    }

    return () => {
      document.removeEventListener("scroll", measure, { capture: true });
      if (observer) observer.disconnect();
    };
  }, [measure]);

  return { ref, ...state, measure };
};
