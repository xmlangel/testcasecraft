// src/main/frontend/src/services/googleConfigApi.js
import apiService from "./apiService";

/**
 * 사용자별 Google Sheets 설정 API 서비스
 */
const googleConfigApi = {
  /**
   * 내 Google 설정 조회
   */
  getMyConfig: async () => {
    try {
      const response = await apiService.get("/api/google-configs/my");
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return null; // 설정 없음
      }
      throw error;
    }
  },

  /**
   * Google 설정 저장/업데이트
   * @param {string} jsonKeyContent 구글 서비스 계정 JSON 문자열
   */
  saveConfig: async (jsonKeyContent) => {
    const response = await apiService.post("/api/google-configs", {
      jsonKeyContent,
    });
    return response.data;
  },

  /**
   * Google 설정 삭제 (연동 해제)
   */
  deleteMyConfig: async () => {
    const response = await apiService.delete("/api/google-configs/my");
    return response.data;
  },
};

export default googleConfigApi;
