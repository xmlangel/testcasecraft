// ICT-245: 최종 완전한 자동화 테스트 네비게이션 수정 확인 테스트

const { chromium } = require('playwright');

const ICT_245_FINAL_CONFIG = {
  baseURL: 'http://localhost:8080',
  adminCredentials: { username: 'admin', password: 'admin' },
  timeout: 30000
};

async function runICT245FinalTest() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  try {
    const context = await browser.newContext({
      baseURL: ICT_245_FINAL_CONFIG.baseURL
    });
    const page = await context.newPage();
    
    console.log('🧪 ICT-245: 최종 완전한 네비게이션 수정 테스트');
    
    // 1단계: 로그인
    console.log('1️⃣ 로그인 진행...');
    await page.goto('/');
    
    await page.fill('input[name="username"]', ICT_245_FINAL_CONFIG.adminCredentials.username);
    await page.fill('input[name="password"]', ICT_245_FINAL_CONFIG.adminCredentials.password);
    await page.click('button[type="submit"]');
    
    // 대시보드 페이지 로딩 대기
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const dashboardUrl = page.url();
    console.log('로그인 후 URL:', dashboardUrl);
    
    if (!dashboardUrl.includes('/dashboard')) {
      console.log('❌ 대시보드로 이동하지 못했습니다');
      return false;
    }
    console.log('✅ 로그인 성공 - 대시보드 진입');
    
    // 2단계: 프로젝트 선택 페이지로 이동
    console.log('2️⃣ 프로젝트 선택 페이지로 이동...');
    
    // "프로젝트" 텍스트 클릭
    await page.locator('text=프로젝트').first().click();
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const projectsUrl = page.url();
    console.log('프로젝트 선택 페이지 URL:', projectsUrl);
    
    if (!projectsUrl.includes('/projects')) {
      console.log('❌ 프로젝트 선택 페이지로 이동하지 못했습니다');
      return false;
    }
    console.log('✅ 프로젝트 선택 페이지 진입');
    
    // 3단계: 첫 번째 프로젝트 선택
    console.log('3️⃣ 프로젝트 선택...');
    
    const projectOpenButtons = await page.locator('button:has-text("프로젝트 열기")');
    const projectCount = await projectOpenButtons.count();
    
    if (projectCount === 0) {
      console.log('❌ "프로젝트 열기" 버튼을 찾을 수 없습니다');
      return false;
    }
    
    console.log(`📋 ${projectCount}개 프로젝트 발견`);
    
    // 첫 번째 프로젝트 열기
    await projectOpenButtons.first().click();
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const projectUrl = page.url();
    console.log('선택된 프로젝트 URL:', projectUrl);
    
    if (!projectUrl.includes('/projects/') || projectUrl === projectsUrl) {
      console.log('❌ 개별 프로젝트 페이지로 이동하지 못했습니다');
      return false;
    }
    console.log('✅ 프로젝트 선택 완료');
    
    // 4단계: 자동화 테스트 탭으로 이동
    console.log('4️⃣ 자동화 테스트 탭으로 이동...');
    
    // 탭에서 "자동화 테스트" 클릭
    const automationTab = await page.locator('text=자동화 테스트');
    const automationTabCount = await automationTab.count();
    
    if (automationTabCount === 0) {
      console.log('❌ "자동화 테스트" 탭을 찾을 수 없습니다');
      return false;
    }
    
    await automationTab.first().click();
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const automationUrl = page.url();
    console.log('자동화 테스트 탭 URL:', automationUrl);
    
    // URL이 automation을 포함하거나, 페이지 내용으로 확인
    const isAutomationPage = automationUrl.includes('/automation') || 
                            (await page.textContent('body')).includes('자동화') ||
                            (await page.textContent('body')).includes('JUnit');
    
    if (!isAutomationPage) {
      console.log('❌ 자동화 테스트 페이지로 이동하지 못했습니다');
      return false;
    }
    console.log('✅ 자동화 테스트 탭 이동 성공');
    
    // 5단계: JUnit 결과 업로드 (테스트 결과가 없는 경우를 위해)
    console.log('5️⃣ 테스트 결과 확인/업로드...');
    
    // 먼저 기존 결과가 있는지 확인
    const existingResults = await page.locator('button:has-text("상세보기"), button:has-text("보기"), a:has-text("상세보기")').count();
    
    if (existingResults === 0) {
      console.log('📂 기존 테스트 결과 없음 - JUnit XML 업로드 시도...');
      
      // 파일 업로드 시도
      const fileInput = await page.locator('input[type="file"]').count();
      if (fileInput > 0) {
        try {
          // 간단한 테스트용 XML 생성
          const testXmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<testsuite name="ICT245Test" tests="2" failures="0" errors="0" time="1.0">
  <testcase classname="com.test.NavigationTest" name="testButtonText" time="0.5"/>
  <testcase classname="com.test.NavigationTest" name="testNavigation" time="0.5"/>
</testsuite>`;
          
          // 임시 파일 경로 (Node.js 환경에서)
          const fs = require('fs');
          const path = require('path');
          const tmpFilePath = path.join(__dirname, 'temp-test-result.xml');
          fs.writeFileSync(tmpFilePath, testXmlContent);
          
          await page.locator('input[type="file"]').first().setInputFiles(tmpFilePath);
          
          // 업로드 버튼 클릭 (있는 경우)
          const uploadButtons = await page.locator('button:has-text("업로드"), button:has-text("확인"), button[type="submit"]');
          const uploadButtonCount = await uploadButtons.count();
          
          if (uploadButtonCount > 0) {
            await uploadButtons.first().click();
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(5000);
            console.log('✅ JUnit XML 업로드 완료');
          }
          
          // 임시 파일 삭제
          fs.unlinkSync(tmpFilePath);
          
        } catch (uploadError) {
          console.log('⚠️ 파일 업로드 실패:', uploadError.message);
        }
      } else {
        console.log('⚠️ 파일 업로드 입력을 찾을 수 없음');
      }
    } else {
      console.log(`✅ 기존 테스트 결과 ${existingResults}개 발견`);
    }
    
    // 6단계: 상세보기 페이지로 이동
    console.log('6️⃣ 테스트 결과 상세보기로 이동...');
    
    await page.waitForTimeout(2000);
    
    // 상세보기 버튼 다시 찾기 (업로드 후)
    const detailButtons = await page.locator('button:has-text("상세보기"), button:has-text("보기"), a:has-text("상세보기"), a:has-text("보기")');
    const detailButtonCount = await detailButtons.count();
    
    if (detailButtonCount === 0) {
      console.log('❌ 상세보기 버튼을 찾을 수 없습니다');
      console.log('💡 JUnit XML 결과를 먼저 업로드해야 이 테스트를 완료할 수 있습니다');
      return false;
    }
    
    console.log(`🔍 ${detailButtonCount}개 상세보기 버튼 발견`);
    
    // 첫 번째 상세보기 클릭
    await detailButtons.first().click();
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const detailUrl = page.url();
    console.log('테스트 결과 상세보기 URL:', detailUrl);
    
    console.log('✅ 테스트 결과 상세보기 페이지 진입');
    
    // 7단계: ICT-245 핵심 테스트 - 버튼 텍스트 및 네비게이션 확인
    console.log('7️⃣ 🎯 ICT-245 핵심 테스트: "자동화 테스트로 돌아가기" 버튼 확인...');
    
    const newButtonText = '자동화 테스트로 돌아가기';
    const oldButtonText = 'JUnit 결과로 돌아가기';
    
    const newButtons = await page.locator(`text=${newButtonText}`);
    const oldButtons = await page.locator(`text=${oldButtonText}`);
    
    const newButtonCount = await newButtons.count();
    const oldButtonCount = await oldButtons.count();
    
    console.log(`📊 테스트 결과:`);
    console.log(`   - "${newButtonText}": ${newButtonCount}개`);
    console.log(`   - "${oldButtonText}": ${oldButtonCount}개`);
    
    // 버튼 텍스트 검증
    if (newButtonCount === 0) {
      if (oldButtonCount > 0) {
        console.log('❌ 버튼 텍스트가 아직 수정되지 않았습니다!');
        console.log('🔄 캐시 문제일 수 있습니다. 브라우저 새로고침이나 재빌드를 시도해보세요.');
        return false;
      } else {
        console.log('❌ 돌아가기 버튼을 전혀 찾을 수 없습니다');
        return false;
      }
    }
    
    console.log('✅ 1단계 완료: 버튼 텍스트가 "자동화 테스트로 돌아가기"로 수정됨!');
    
    // 8단계: 네비게이션 기능 테스트
    console.log('8️⃣ 🎯 네비게이션 기능 테스트...');
    
    const beforeClickUrl = page.url();
    console.log('클릭 전 URL:', beforeClickUrl);
    
    // "자동화 테스트로 돌아가기" 버튼 클릭
    await newButtons.first().click();
    
    // 네비게이션 완료 대기
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    const afterClickUrl = page.url();
    console.log('클릭 후 URL:', afterClickUrl);
    
    // 네비게이션 결과 분석
    let navigationSuccess = false;
    let successMessage = '';
    
    if (afterClickUrl.includes('/automation')) {
      navigationSuccess = true;
      successMessage = '자동화 테스트 페이지로 직접 이동 성공';
    } else if (afterClickUrl.includes('/projects/')) {
      // 프로젝트 페이지로 이동한 경우, 자동화 테스트 탭이 활성화되었는지 확인
      await page.waitForTimeout(1000);
      
      try {
        const activeTabText = await page.locator('.Mui-selected, [aria-selected="true"]').textContent();
        if (activeTabText && activeTabText.includes('자동화')) {
          navigationSuccess = true;
          successMessage = '프로젝트 페이지에서 자동화 테스트 탭이 정확히 활성화됨';
        }
      } catch (e) {
        // 탭 선택자로 확인 실패시 페이지 내용으로 확인
        const pageContent = await page.textContent('body');
        if (pageContent.includes('자동화') || pageContent.includes('JUnit')) {
          navigationSuccess = true;
          successMessage = '자동화 테스트 페이지 내용 확인됨';
        }
      }
    }
    
    if (navigationSuccess) {
      console.log(`✅ 2단계 완료: 네비게이션 성공 - ${successMessage}`);
    } else {
      console.log('❌ 네비게이션 실패');
      console.log('📍 예상: 자동화 테스트 페이지로 이동');
      console.log(`📍 실제: ${afterClickUrl}`);
      return false;
    }
    
    // 9단계: 최종 검증
    console.log('9️⃣ 최종 검증...');
    
    // 현재 페이지가 자동화 테스트 관련 페이지인지 확인
    const finalPageContent = await page.textContent('body');
    const isAutomationPageFinal = finalPageContent.includes('자동화') || 
                                  finalPageContent.includes('JUnit') ||
                                  finalPageContent.includes('테스트 결과');
    
    if (!isAutomationPageFinal) {
      console.log('❌ 최종 페이지가 자동화 테스트와 관련이 없습니다');
      return false;
    }
    
    console.log('✅ 최종 검증 완료: 자동화 테스트 페이지에 정상적으로 위치');
    
    return true;
    
  } catch (error) {
    console.error('❌ 테스트 실행 중 오류:', error.message);
    return false;
  } finally {
    await browser.close();
  }
}

// 테스트 실행
if (require.main === module) {
  runICT245FinalTest().then(success => {
    if (success) {
      console.log('\n🎉🎉🎉 ICT-245 최종 테스트 성공! 🎉🎉🎉');
      console.log('');
      console.log('✅ 해결된 문제:');
      console.log('   1. 버튼 텍스트: "JUnit 결과로 돌아가기" → "자동화 테스트로 돌아가기"');
      console.log('   2. 네비게이션: 프로젝트 root → 자동화 테스트 페이지');
      console.log('');
      console.log('🔧 수정된 파일:');
      console.log('   - src/main/frontend/src/components/JUnit/JunitResultDetail.jsx');
      console.log('');
      console.log('📝 수정 내용:');
      console.log('   - 모든 "JUnit 결과로 돌아가기" 텍스트 변경');
      console.log('   - navigate() 호출을 `/projects/{id}/automation`으로 직접 이동');
      console.log('   - state 기반 탭 활성화 제거하고 URL 기반 네비게이션으로 변경');
      console.log('');
      console.log('✨ ICT-245 작업 완료!');
      process.exit(0);
    } else {
      console.log('\n❌ ICT-245 최종 테스트 실패');
      console.log('🔍 추가 확인이 필요합니다:');
      console.log('   1. 브라우저 캐시 문제 (Ctrl+F5 시도)');
      console.log('   2. 빌드 반영 문제 (./gradlew clean build bootRun)');
      console.log('   3. JUnit 테스트 결과 부족 (XML 파일 업로드 필요)');
      process.exit(1);
    }
  });
}

module.exports = { runICT245FinalTest };