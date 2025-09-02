#!/usr/bin/env node

/**
 * ICT-335: 대시보드 멤버 수 표시 문제 수정 검증 테스트
 */

const { chromium } = require('playwright');

async function verifyMemberCountFix() {
    console.log('🧪 ICT-335: 멤버 수 표시 수정 검증 테스트');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 500
    });
    
    try {
        const context = await browser.newContext({
            baseURL: 'http://localhost:8080'
        });
        
        const page = await context.newPage();
        
        // 콘솔 로그 캡처
        page.on('console', msg => {
            if (msg.text().includes('[OrganizationDashboard]')) {
                console.log('🖥️ Dashboard:', msg.text());
            }
        });
        
        console.log('📋 1. 로그인');
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        
        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'admin');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');
        
        console.log('📋 2. 대시보드 접근');
        await page.goto('/dashboard');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(5000); // 데이터 로딩 대기
        
        console.log('📋 3. 멤버 수 표시 확인');
        
        // 페이지에서 "멤버: X명" 패턴 찾기
        const memberElements = await page.locator('*:has-text("멤버:")').all();
        console.log(`"멤버:" 텍스트가 포함된 요소 ${memberElements.length}개 발견`);
        
        let foundNonZeroMember = false;
        let memberCounts = [];
        
        for (let i = 0; i < memberElements.length; i++) {
            try {
                const text = await memberElements[i].textContent();
                console.log(`  ${i + 1}. "${text}"`);
                
                // "멤버: X명" 패턴에서 숫자 추출
                const match = text.match(/멤버:\s*(\d+)명/);
                if (match) {
                    const count = parseInt(match[1]);
                    memberCounts.push(count);
                    console.log(`    추출된 멤버 수: ${count}`);
                    
                    if (count > 0) {
                        foundNonZeroMember = true;
                        console.log(`    ✅ 0이 아닌 멤버 수 발견: ${count}명`);
                    } else {
                        console.log(`    ⚠️ 0명으로 표시됨`);
                    }
                }
            } catch (e) {
                console.log(`    오류: ${e.message}`);
            }
        }
        
        console.log('📋 4. 결과 분석');
        console.log(`총 멤버 수 표시 항목: ${memberCounts.length}개`);
        console.log(`멤버 수 목록: [${memberCounts.join(', ')}]`);
        console.log(`총 멤버 수: ${memberCounts.reduce((sum, count) => sum + count, 0)}`);
        
        if (foundNonZeroMember) {
            console.log('✅ 성공: 0이 아닌 멤버 수가 표시됨!');
            console.log('🎉 ICT-335 문제가 해결되었습니다!');
            return true;
        } else {
            console.log('❌ 실패: 모든 멤버 수가 여전히 0으로 표시됨');
            return false;
        }
        
    } catch (error) {
        console.error('❌ 테스트 오류:', error);
        return false;
    } finally {
        console.log('📋 5. 5초 후 브라우저 종료');
        await page.waitForTimeout(5000);
        await browser.close();
    }
}

// 메인 실행
if (require.main === module) {
    verifyMemberCountFix()
        .then(success => {
            if (success) {
                console.log('\n🎊 테스트 성공! 멤버 수 표시가 정상적으로 수정되었습니다.');
                process.exit(0);
            } else {
                console.log('\n❌ 테스트 실패! 추가 수정이 필요합니다.');
                process.exit(1);
            }
        })
        .catch(console.error);
}

module.exports = { verifyMemberCountFix };