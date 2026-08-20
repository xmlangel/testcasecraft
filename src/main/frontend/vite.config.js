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
    rollupOptions: {
      output: {
        /*
         * 너무 작은 청크는 부모에 합친다.
         *
         * 화면을 lazy 로 가른 뒤 청크가 127개가 됐고 그중 56개가 2kB 미만이었다. 파일 하나에
         * 요청 하나가 붙으므로 이 크기에서는 내용보다 요청 비용이 크다. 실측에서 0.8kB 청크
         * 하나가 4초를 썼다(CDN 이 캐시를 건너뛰던 조건, 2026-08-21).
         *
         * manualChunks 로 손수 묶는 방식은 쓰지 않는다. 전에 시도했다가 엔트리가 특정 갈래를
         * 끌고 오면서 첫 요청이 3MB 로 늘었다. 이 옵션은 의존 그래프를 바꾸지 않고 작은 조각만
         * 흡수하므로 그 위험이 없다.
         */
        experimentalMinChunkSize: 20000,

        /*
         * 아이콘만 한 덩어리로 묶는다.
         *
         * 위 옵션으로도 2kB 미만 청크 46개가 남았고 전부 여러 화면이 함께 쓰는 MUI 아이콘이었다.
         * 합쳐서 17kB 뿐이라 크기가 문제가 아니라 요청 46개가 문제다. 아이콘은 다른 코드를
         * 끌어오지 않는 잎 모듈이라 묶어도 그래프가 흔들리지 않는다.
         */
        manualChunks(id) {
          if (id.includes("node_modules/@mui/icons-material")) {
            return "mui-icons";
          }
          return undefined;
        },
      },
    },
  },
  publicDir: "public", // public 폴더의 파일을 빌드 출력에 복사
});
