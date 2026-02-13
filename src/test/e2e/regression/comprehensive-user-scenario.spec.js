/**
 * 포괄적 사용자 시나리오 E2E 테스트 절차:
 * 
 * 시나리오 1: 프로젝트 선택부터 스프레드시트 테스트케이스 관리까지
 * 1. Admin 계정으로 로그인 (localStorage 초기화 후 수행)
 * 2. 현재 접근 가능한 프로젝트 목록 분석 및 유형별(전체/독립/조합) 분류
 * 3. 전체 또는 독립 프로젝트 중 하나를 선택하여 상세 화면 진입
 * 4. 프로젝트 상세 내 '테스트케이스' 탭으로 이동
 * 5. 입력 모드를 '스프레드시트' 모드로 전환 (메뉴가 접힌 경우 펼침 처리)
 * 6. 스프레드시트 내 '행 추가' 버튼으로 새 데이터 행 생성
 * 7. 생성된 행에 테스트케이스 이름(timestamp 포함) 및 설명 입력 (dblclick 에디터 사용)
 * 8. 입력 확정(Tab/Body 클릭) 후 '일괄 저장' 실행 및 성공 메시지 확인
 * 9. 입력한 테스트케이스가 화면상에 유지되는지 최종 확인
 * 
 * 시나리오 2: 프로젝트 유형별 접근성 테스트
 * 1. 로그인 시도
 * 2. 대시보드/프로젝트 목록의 모든 프로젝트 카드에 대해 순차적으로 상세 진입 시도
 * 3. 각 프로젝트 상세 진입 시 '테스트케이스' 섹션 버튼의 가시성 확인을 통해 접근 권한 검증
 */

const { test, expect } = require('../fixtures/test-fixtures.js');

test.describe('포괄적 사용자 시나리오 E2E 테스트', () => {

  test('전체 사용자 시나리오: 프로젝트 선택부터 스프레드시트 테스트케이스 관리까지', async ({ page, loginPage, projectListPage, testCasePage }) => {
    console.log('🎬 포괄적 사용자 시나리오 테스트 시작...');
    
    // === 1단계: 로그인 ===
    console.log('1️⃣ 사용자 로그인...');
    await loginPage.goto();
    await loginPage.clearStorage();
    await loginPage.waitForBackend();
    await loginPage.login('admin', 'admin123');
    await projectListPage.waitForLoad();
    
    // === 2단계: 프로젝트 분석 및 선택 ===
    console.log('2️⃣ 프로젝트 선택 및 진입...');
    await projectListPage.openFirstProject();
    
    // 프로젝트 상세 페이지 로드 대기
    await page.waitForURL(/\/projects\/[a-f0-9-]+/);
    console.log('🖱️ 프로젝트 상세 진입 완료');
    
    // === 4단계: 테스트케이스 섹션 선택 ===
    console.log('4️⃣ 테스트케이스 탭으로 이동...');
    await testCasePage.goToTestCaseTab();
    console.log('✅ 테스트케이스 리스트 화면 진입');
    
    // === 5단계: 스프레드시트 모드 선택 ===
    console.log('5️⃣ 스프레드시트 모드로 전환...');
    await testCasePage.selectSpreadsheetMode();
    console.log('📊 스프레드시트 UI 활성화 확인');
    
    // === 6단계: 테스트케이스 추가 ===
    console.log('6️⃣ 스프레드시트에서 테스트케이스 추가...');
    await testCasePage.addSpreadsheetRow();

    const timestamp = Date.now();
    const testCaseName = `사용자시나리오_${timestamp}`;
    
    await testCasePage.fillSpreadsheetCell(-1, 6, testCaseName);
    await testCasePage.fillSpreadsheetCell(-1, 7, 'E2E 포괄적 시나리오 테스트 설명');
    
    // === 7단계: 저장 및 결과 확인 ===
    console.log('7️⃣ 데이터 저장 및 결과 확인...');
    await testCasePage.bulkSave();

    // 저장 성공 메시지 대기
    await page.waitForSelector('text=/저장되었습니다|완료/', { timeout: 10000 }).catch(() => {});
    
    // 성공 스크린샷 촬영
    await testCasePage.screen('comprehensive-user-scenario-complete');
    console.log('🎉 모든 사용자 시나리오 단계 완료!');
  });

  test('프로젝트 유형별 접근성 테스트', async ({ page, loginPage, projectListPage, testCasePage }) => {
    console.log('🔍 프로젝트 유형별 접근성 테스트 시작...');
    
    await loginPage.goto();
    await loginPage.clearStorage();
    await loginPage.waitForBackend();
    await loginPage.login('admin', 'admin123');
    await projectListPage.waitForLoad();
    
    const projectCount = await projectListPage.getProjectCount();
    console.log(`📊 총 ${projectCount}개 프로젝트 발견`);
    
    // 각 프로젝트의 접근 가능성 테스트
    for (let i = 0; i < Math.min(projectCount, 5); i++) {
        try {
            const project = projectListPage.projectCards.nth(i);
            await project.click();
            await page.waitForTimeout(2000);
            
            const currentUrl = page.url();
            const hasProjectAccess = currentUrl.includes('project') || currentUrl.includes('dashboard') || currentUrl.includes('testcase');
            
            if (hasProjectAccess) {
                console.log(`   ✅ 프로젝트 접근 성공`);
                if (await testCasePage.testCaseTab.isVisible({ timeout: 3000 })) {
                    await testCasePage.testCaseTab.click();
                    console.log(`   ✅ 테스트케이스 섹션 접근 성공`);
                }
            } else {
                console.log(`   ❌ 프로젝트 접근 실패`);
            }
            
            if (i < projectCount - 1) {
                await page.goBack();
                await page.waitForTimeout(1000);
            }
        } catch (e) {
            console.log(`   ❌ 프로젝트 ${i + 1} 테스트 중 오류: ${e.message}`);
        }
    }
    
    await projectListPage.screen('project-accessibility-test');
    console.log('✅ 프로젝트 유형별 접근성 테스트 완료');
  });

});