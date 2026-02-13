#!/usr/bin/env node

/**
 * Translation Data Updater Script
 *
 * 이 스크립트는 Spring Boot 애플리케이션을 재시작하지 않고
 * 새로운 번역 키를 데이터베이스에 직접 추가하는 도구입니다.
 *
 * Usage:
 *   node scripts/add-translations.js
 *   node scripts/add-translations.js --specific testcase.tree
 *   node scripts/add-translations.js --force
 */

const axios = require('axios');

// 애플리케이션 설정
const config = {
  baseURL: 'http://localhost:8080',
  adminCredentials: {
    username: 'admin',
    password: 'admin'
  }
};

// 추가할 번역 데이터 정의
const translationData = {
  testExecution: {
    'testExecution.table.executionId': { ko: '실행 ID', en: 'Execution ID' },
    'testExecution.table.executionName': { ko: '실행 이름', en: 'Execution Name' },
  },
  testCaseTree: {
    // 트리 제목 및 라벨
    'testcase.tree.title.select': { ko: '테스트케이스 선택', en: 'Select Test Cases' },
    'testcase.tree.title.manage': { ko: '테스트케이스', en: 'Test Cases' },
    'testcase.tree.selectAll': { ko: '전체 선택', en: 'Select All' },
    'testcase.tree.root': { ko: '루트', en: 'Root' },

    // 액션 메뉴
    'testcase.tree.action.addFolder': { ko: '폴더 추가', en: 'Add Folder' },
    'testcase.tree.action.addTestcase': { ko: '테스트케이스 추가', en: 'Add Test Case' },
    'testcase.tree.action.addSubFolder': { ko: '하위 폴더 추가', en: 'Add Sub Folder' },
    'testcase.tree.action.addSubTestcase': { ko: '하위 테스트케이스 추가', en: 'Add Sub Test Case' },
    'testcase.tree.action.rename': { ko: '이름 변경', en: 'Rename' },
    'testcase.tree.action.delete': { ko: '삭제', en: 'Delete' },
    'testcase.tree.action.versionHistory': { ko: '버전 히스토리', en: 'Version History' },

    // 버튼 라벨
    'testcase.tree.button.cancel': { ko: '취소', en: 'Cancel' },
    'testcase.tree.button.delete': { ko: '삭제', en: 'Delete' },
    'testcase.tree.button.close': { ko: '닫기', en: 'Close' },
    'testcase.tree.button.refresh': { ko: '리프레시', en: 'Refresh' },
    'testcase.tree.button.editOrder': { ko: '순서 편집', en: 'Edit Order' },
    'testcase.tree.button.saveOrder': { ko: '순서 저장', en: 'Save Order' },
    'testcase.tree.button.batchDelete': { ko: '선택 삭제', en: 'Batch Delete' },

    // 다이얼로그 메시지
    'testcase.tree.dialog.batchDelete.title': { ko: '선택 삭제', en: 'Batch Delete' },
    'testcase.tree.dialog.batchDelete.message': { ko: '{count}개 항목(하위 포함)을 삭제하시겠습니까?', en: 'Do you want to delete {count} items (including sub items)?' },
    'testcase.tree.dialog.deleteConfirm.title': { ko: '삭제 확인', en: 'Delete Confirmation' },
    'testcase.tree.dialog.deleteConfirm.message': { ko: '정말로 삭제하시겠습니까? (하위 항목 포함)', en: 'Are you sure you want to delete? (including sub items)' },
    'testcase.tree.dialog.error.title': { ko: '오류', en: 'Error' },

    // 메시지
    'testcase.tree.message.selectProject': { ko: '프로젝트를 선택하세요.', en: 'Please select a project.' },
    'testcase.tree.message.loading': { ko: '로딩 중...', en: 'Loading...' },
    'testcase.tree.message.noTestcases': { ko: '테스트케이스가 없습니다.', en: 'No test cases available.' },

    // 검증 및 오류 메시지
    'testcase.tree.validation.nameRequired': { ko: '이름을 입력하세요.', en: 'Please enter a name.' },
    'testcase.tree.error.renameFailed': { ko: '이름 변경에 실패했습니다: ', en: 'Failed to rename: ' },
    'testcase.tree.error.deleteFailed': { ko: '삭제 중 오류가 발생했습니다.', en: 'An error occurred while deleting.' }
  }
};

class TranslationUpdater {
  constructor() {
    this.authToken = null;
    this.languages = { ko: null, en: null };
  }

  async login() {
    try {
      console.log('🔐 Admin 계정으로 로그인 중...');
      const response = await axios.post(`${config.baseURL}/api/auth/login`, config.adminCredentials);
      this.authToken = response.data.accessToken || response.data.token;
      console.log('✅ 로그인 성공');
      return true;
    } catch (error) {
      console.error('❌ 로그인 실패:', error.response?.data || error.message);
      return false;
    }
  }

  async getLanguages() {
    try {
      console.log('🌐 언어 정보 조회 중...');
      const response = await axios.get(`${config.baseURL}/api/admin/translations/languages`, {
        headers: { Authorization: `Bearer ${this.authToken}` }
      });

      const languages = response.data;
      this.languages.ko = languages.find(lang => lang.code === 'ko');
      this.languages.en = languages.find(lang => lang.code === 'en');

      if (!this.languages.ko || !this.languages.en) {
        throw new Error('한국어 또는 영어 언어 설정을 찾을 수 없습니다.');
      }

      console.log('✅ 언어 정보 조회 완료');
      return true;
    } catch (error) {
      console.error('❌ 언어 정보 조회 실패:', error.response?.data || error.message);
      return false;
    }
  }

  async addTranslationKey(key, category = 'testcase', description = '', defaultValue = '') {
    try {
      const response = await axios.post(`${config.baseURL}/api/admin/translations/keys`, {
        keyName: key,
        category,
        description,
        defaultValue
      }, {
        headers: { Authorization: `Bearer ${this.authToken}` }
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 409) {
        // 이미 존재하는 키 (무시)
        return null;
      }
      throw error;
    }
  }

  async addTranslation(keyName, languageCode, value) {
    try {
      const response = await axios.post(`${config.baseURL}/api/admin/translations`, {
        keyName: keyName,
        languageCode: languageCode,
        value: value
      }, {
        headers: { Authorization: `Bearer ${this.authToken}` }
      });
      return response.data;
    } catch (error) {
      if (error.response?.status === 409) {
        // 이미 존재하는 번역 (업데이트)
        console.log(`  🔄 번역 업데이트: ${keyName} (${languageCode})`);
        return { updated: true };
      }
      throw error;
    }
  }

  async processTranslations(specificCategory = null) {
    let successCount = 0;
    let errorCount = 0;

    for (const [categoryName, translations] of Object.entries(translationData)) {
      if (specificCategory && !categoryName.includes(specificCategory)) {
        continue;
      }

      console.log(`\n📁 ${categoryName} 카테고리 처리 중...`);

      for (const [key, values] of Object.entries(translations)) {
        try {
          // 번역 키 추가
          const keyResult = await this.addTranslationKey(key, 'testcase', `${key} 번역 키`, values.ko);

          // 한국어 번역 추가
          const koResult = await this.addTranslation(key, this.languages.ko.code, values.ko);
          if (koResult) {
            console.log(`  ✅ ${key} (ko): ${values.ko}`);
          }

          // 영어 번역 추가
          const enResult = await this.addTranslation(key, this.languages.en.code, values.en);
          if (enResult) {
            console.log(`  ✅ ${key} (en): ${values.en}`);
          }

          successCount++;

          // API 과부하 방지를 위한 딜레이
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
          console.error(`❌ ${key} 처리 중 오류:`, error.response?.data || error.message);
          errorCount++;
        }
      }
    }

    return { successCount, errorCount };
  }

  async getTranslationKeyId(key) {
    try {
      const response = await axios.get(`${config.baseURL}/api/admin/translations/keys`, {
        headers: { Authorization: `Bearer ${this.authToken}` }
      });
      const translationKey = response.data.find(k => k.key === key);
      return translationKey?.id;
    } catch (error) {
      console.error('번역 키 ID 조회 실패:', error.message);
      return null;
    }
  }

  async refreshTranslationCache() {
    try {
      console.log('🔄 번역 캐시 새로고침 중...');
      await axios.post(`${config.baseURL}/api/i18n/cache/clear`, {}, {
        headers: { Authorization: `Bearer ${this.authToken}` }
      });
      console.log('✅ 번역 캐시 새로고침 완료');
    } catch (error) {
      console.warn('⚠️ 번역 캐시 새로고침 실패 (무시):', error.message);
    }
  }

  async run(options = {}) {
    try {
      console.log('🚀 번역 데이터 업데이트 시작\n');

      // 1. 로그인
      if (!(await this.login())) {
        process.exit(1);
      }

      // 2. 언어 정보 조회
      if (!(await this.getLanguages())) {
        process.exit(1);
      }

      // 3. 번역 데이터 처리
      const { successCount, errorCount } = await this.processTranslations(options.specific);

      // 4. 캐시 새로고침
      await this.refreshTranslationCache();

      // 5. 결과 출력
      console.log('\n📊 처리 결과:');
      console.log(`✅ 성공: ${successCount}개`);
      console.log(`❌ 실패: ${errorCount}개`);

      if (errorCount === 0) {
        console.log('\n🎉 모든 번역 데이터가 성공적으로 추가되었습니다!');
        console.log('💡 브라우저에서 언어 전환을 통해 새로운 번역을 확인하세요.');
      } else {
        console.log('\n⚠️ 일부 번역 데이터 추가에 실패했습니다. 로그를 확인하세요.');
      }

    } catch (error) {
      console.error('💥 스크립트 실행 중 오류 발생:', error.message);
      process.exit(1);
    }
  }
}

// CLI 인자 처리
const args = process.argv.slice(2);
const options = {};

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--specific' && args[i + 1]) {
    options.specific = args[i + 1];
    i++;
  } else if (args[i] === '--force') {
    options.force = true;
  }
}

// 스크립트 실행
const updater = new TranslationUpdater();
updater.run(options);