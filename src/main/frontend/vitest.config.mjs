import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// 단위 테스트 전용 설정 (빌드 설정 vite.config.js 와 분리).
// jsdom 환경 + Testing Library matcher 셋업.
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup/vitest.setup.js"],
    include: ["src/**/*.{test,spec}.{js,jsx}"],
    css: false,
  },
});
