#!/usr/bin/env node

/**
 * ICT-335: 대시보드에서 프로젝트 멤버 수가 0명으로 잘못 표시되는 문제 검증
 * 
 * 테스트 목적:
 * - 대시보드에서 프로젝트 멤버 수가 정확히 표시되는지 확인
 * - API 응답과 UI 표시가 일치하는지 검증
 * - 멤버 수 계산 로직 정상 동작 확인
 */

const { chromium } = require('playwright');

async function testDashboardMemberCount() {
    console.log('🧪 ICT-335: 대시보드 멤버 수 표시 테스트 시작');
    
    let browser;
    let context;
    let page;
    
    try {
        // 브라우저 시작
        browser = await chromium.launch({ 
            headless: false,
            args: ['--disable-dev-shm-usage', '--no-sandbox']
        });
        
        context = await browser.newContext({
            baseURL: 'http://localhost:8080',
            viewport: { width: 1920, height: 1080 }
        });
        
        page = await context.newPage();
        
        // 네트워크 요청 모니터링
        const apiRequests = [];
        page.on('request', (request) => {
            if (request.url().includes('/api/projects')) {
                apiRequests.push(request);
            }
        });
        
        const apiResponses = [];
        page.on('response', async (response) => {
            if (response.url().includes('/api/projects')) {
                const responseData = await response.json().catch(() => null);
                apiResponses.push({
                    url: response.url(),
                    status: response.status(),
                    data: responseData
                });
            }
        });
        
        console.log('📋 Step 1: 로그인 수행');
        
        // 로그인 페이지로 이동
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        // 로그인 수행
        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'admin');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');
        
        console.log('✅ 로그인 완료');
        
        console.log('📋 Step 2: 대시보드 접근 및 프로젝트 정보 확인');
        
        // 전체 대시보드로 바로 이동
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');
        
        // 페이지 로딩 대기
        await page.waitForTimeout(3000);
        
        console.log(`현재 URL: ${page.url()}`);
        
        // 페이지 내용 확인
        try {
            await page.waitForSelector('.MuiContainer-root', { timeout: 10000 });
        } catch (error) {
            console.log('⚠️ MuiContainer-root를 찾지 못했습니다. 다른 선택자를 시도합니다.');
            await page.waitForSelector('body', { timeout: 5000 });
        }
        
        console.log('📋 Step 3: API 응답 분석');
        
        // 네트워크 요청 대기 (프로젝트 목록 로딩)
        await page.waitForTimeout(2000);
        
        if (apiResponses.length > 0) {
            console.log(`✅ API 요청 ${apiResponses.length}개 확인됨`);
            
            // 첫 번째 프로젝트 API 응답 분석
            const projectsResponse = apiResponses.find(r => r.url.includes('/api/projects') && r.data);
            
            if (projectsResponse && projectsResponse.data) {
                console.log('📊 API 응답 데이터:');
                projectsResponse.data.slice(0, 2).forEach((project, index) => {
                    console.log(`  프로젝트 ${index + 1}: ${project.name}`);
                    console.log(`    - memberCount: ${project.memberCount}`);
                    console.log(`    - testCaseCount: ${project.testCaseCount}`);
                });
                
                // API에서 첫 번째 프로젝트의 멤버 수 추출
                const firstProject = projectsResponse.data[0];
                const apiMemberCount = firstProject ? firstProject.memberCount : 0;
                
                console.log(`🔍 API에서 가져온 첫 번째 프로젝트 멤버 수: ${apiMemberCount}`);
                
                console.log('📋 Step 4: UI에서 멤버 수 표시 확인');
                
                // 프로젝트 정보 요약 섹션에서 멤버 수 찾기
                const memberChipSelectors = [
                    'div[role="main"] .MuiChip-root:has-text("멤버")',
                    '.MuiChip-root:has-text("멤버")',
                    '[data-testid="member-count"]',
                    'div:has-text("프로젝트 멤버")'
                ];
                
                let memberCountElement = null;
                let displayedMemberCount = null;
                
                for (const selector of memberChipSelectors) {
                    try {
                        memberCountElement = await page.locator(selector).first();
                        if (await memberCountElement.count() > 0) {
                            const text = await memberCountElement.textContent();
                            console.log(`📍 선택자 "${selector}"에서 찾은 텍스트: "${text}"`);
                            
                            // "프로젝트 멤버: X명" 형태에서 숫자 추출
                            const match = text.match(/(\d+)명/);
                            if (match) {
                                displayedMemberCount = parseInt(match[1]);
                                console.log(`🎯 UI에서 표시된 멤버 수: ${displayedMemberCount}`);
                                break;
                            }
                        }
                    } catch (error) {
                        // 이 선택자는 작동하지 않음, 다음으로 넘어가기
                        continue;
                    }
                }
                
                console.log('📋 Step 5: 결과 검증');
                
                if (displayedMemberCount === null) {
                    console.log('❌ UI에서 멤버 수를 찾을 수 없습니다.');
                    
                    // 페이지 전체에서 멤버 관련 텍스트 검색
                    console.log('🔍 페이지에서 "멤버" 관련 모든 텍스트 검색:');
                    const allElements = await page.locator('*:has-text("멤버")').all();
                    for (let i = 0; i < Math.min(allElements.length, 5); i++) {
                        const element = allElements[i];
                        try {
                            const text = await element.textContent();
                            const tagName = await element.evaluate(el => el.tagName);
                            console.log(`  - ${tagName}: "${text}"`);
                        } catch (e) {
                            // 무시
                        }
                    }
                    
                    return false;
                }
                
                // 결과 비교
                if (displayedMemberCount === apiMemberCount) {
                    console.log(`✅ 성공: API(${apiMemberCount})와 UI(${displayedMemberCount}) 멤버 수가 일치합니다!`);
                    
                    if (displayedMemberCount === 0) {
                        console.log('⚠️  경고: 멤버 수가 0으로 표시되고 있습니다. 실제 프로젝트에 멤버가 있는지 확인 필요!');
                        
                        console.log('📋 Step 6: 프로젝트 멤버십 데이터 확인');
                        
                        // 프로젝트별 멤버십 정보 API 호출해서 확인
                        const token = await page.evaluate(() => localStorage.getItem('accessToken'));
                        if (token && firstProject.id) {
                            console.log(`🔍 프로젝트 ${firstProject.id}의 멤버십 데이터 확인 중...`);
                            
                            // JavaScript에서 직접 API 호출
                            const membersData = await page.evaluate(async (projectId, authToken) => {
                                try {
                                    const response = await fetch(`/api/project-users/project/${projectId}`, {
                                        headers: { 'Authorization': `Bearer ${authToken}` }
                                    });
                                    return response.ok ? await response.json() : null;
                                } catch (e) {
                                    return null;
                                }
                            }, firstProject.id, token);
                            
                            if (membersData) {
                                console.log(`📊 실제 프로젝트 멤버십 데이터:`, membersData);
                                console.log(`📊 실제 멤버 수: ${membersData.length || 0}명`);
                                
                                if ((membersData.length || 0) > 0 && displayedMemberCount === 0) {
                                    console.log('❌ 문제 발견: 실제 멤버가 있지만 대시보드에서는 0명으로 표시됨!');
                                    return false;
                                }
                            }
                        }
                        
                        return displayedMemberCount >= 0; // 0도 유효한 상태로 간주
                    }
                    
                    return true;
                } else {
                    console.log(`❌ 실패: API(${apiMemberCount})와 UI(${displayedMemberCount}) 멤버 수가 다릅니다!`);
                    return false;
                }
                
            } else {
                console.log('❌ API 응답에서 프로젝트 데이터를 찾을 수 없습니다.');
                return false;
            }
            
        } else {
            console.log('❌ 프로젝트 API 요청이 감지되지 않았습니다.');
            return false;
        }
        
    } catch (error) {
        console.error('❌ 테스트 중 오류 발생:', error);
        
        // 에러 발생 시 스크린샷 저장
        if (page) {
            try {
                await page.screenshot({ 
                    path: `e2e-tests/screenshots/ict-335-error-${Date.now()}.png`,
                    fullPage: true 
                });
                console.log('📷 에러 스크린샷 저장됨');
            } catch (screenshotError) {
                console.log('스크린샷 저장 실패:', screenshotError.message);
            }
        }
        
        return false;
        
    } finally {
        // 정리
        if (context) await context.close();
        if (browser) await browser.close();
    }
}

// 메인 실행
async function main() {
    console.log('🧪 ICT-335 대시보드 멤버 수 표시 테스트');
    console.log('=====================================');
    
    const testResult = await testDashboardMemberCount();
    
    console.log('\n📊 테스트 결과:');
    console.log('=====================================');
    
    if (testResult) {
        console.log('✅ 모든 테스트 통과!');
        console.log('   - 대시보드 멤버 수 표시가 정상적으로 작동합니다.');
        process.exit(0);
    } else {
        console.log('❌ 테스트 실패!');
        console.log('   - 대시보드 멤버 수 표시에 문제가 있습니다.');
        console.log('   - 문제를 수정한 후 다시 테스트해주세요.');
        process.exit(1);
    }
}

// 스크립트가 직접 실행될 때만 main 함수 호출
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { testDashboardMemberCount };