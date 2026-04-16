// src/main/frontend/src/api/guidesApi.js
import axios from "axios";

const guidesApi = {
  /**
   * 지정된 이름의 가이드 문서 내용을 가져옵니다.
   * @param {string} fileName 파일 이름 (예: GOOGLE_SHEETS_SETUP_GUIDE.md)
   * @returns {Promise<string>} 마크다운 내용
   */
  getGuide: async (fileName) => {
    try {
      const response = await axios.get(`/api/guides/${fileName}`);
      return response.data;
    } catch (error) {
      console.error(`가이드 로딩 실패 (${fileName}):`, error);
      throw error;
    }
  },
};

export default guidesApi;
