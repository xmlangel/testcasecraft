const { defineConfig } = require("vite");
const react = require("@vitejs/plugin-react");

/*
 * 청크 분할은 Vite 기본값에 맡긴다.
 *
 * 전에는 앱 전체가 한 덩어리(6.8MB)였다. 대시보드만 열어도 차트·PDF·엑셀·마크다운 에디터까지
 * 다 내려받은 뒤에 첫 화면이 그려졌다. 원인은 청크 설정이 아니라 App.jsx 가 모든 화면을 정적으로
 * import 한 것이었다 — 화면을 React.lazy 로 바꾸자 기본 분할이 화면별로 갈라 첫 요청이 733KB 로
 * 줄었다. manualChunks 로 손수 묶어 봤지만 엔트리가 특정 갈래를 끌고 오면서 오히려 3MB 로 늘었다.
 */

// https://vitejs.dev/config/
module.exports = defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: "build",
  },
  publicDir: "public", // public 폴더의 파일을 빌드 출력에 복사
});
