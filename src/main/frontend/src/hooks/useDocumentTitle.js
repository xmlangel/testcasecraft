// src/hooks/useDocumentTitle.js
import { useEffect } from "react";
import { buildDocumentTitle } from "../utils/documentTitle";

/**
 * 화면 이름으로 브라우저 탭 제목을 맞춘다. 화면이 사라지면 제품명만 남긴다.
 * @param {string|null|undefined} screenName
 */
export default function useDocumentTitle(screenName) {
  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    document.title = buildDocumentTitle(screenName);
    return () => {
      document.title = buildDocumentTitle(null);
    };
  }, [screenName]);
}
