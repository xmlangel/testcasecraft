// e2e-tests/ict-285-ui-analysis.js
// ICT-285: 사용자 관리 화면 UI 요소 분석

const { chromium } = require('playwright');

async function analyzeUserManagementUI() {
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 2000
    });
    
    const context = await browser.newContext({
        baseURL: 'http://localhost:8080'
    });
    const page = await context.newPage();
    
    try {
        console.log('=== ICT-285: 사용자 관리 UI 요소 분석 ===');
        
        // 1. 로그인
        await page.goto('/');
        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'admin');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');
        console.log('✅ 로그인 완료');
        
        // 2. 사용자 관리 페이지로 이동
        await page.locator('text=사용자 관리').click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(3000);
        console.log('✅ 사용자 관리 페이지 접근');
        
        // 3. 사용자 테이블 분석
        const userRows = await page.locator('table tbody tr').count();
        console.log(`📊 사용자 테이블 행 수: ${userRows}`);
        
        if (userRows > 0) {
            // 첫 번째 행의 모든 버튼 확인
            const firstRow = page.locator('table tbody tr').first();
            const buttonsInRow = await firstRow.locator('button').count();
            console.log(`🔍 첫 번째 행의 버튼 수: ${buttonsInRow}`);
            
            // 각 버튼의 속성 확인
            for (let i = 0; i < buttonsInRow; i++) {
                const button = firstRow.locator('button').nth(i);
                const buttonText = await button.textContent();
                const buttonTitle = await button.getAttribute('title');
                const ariaLabel = await button.getAttribute('aria-label');
                const tooltip = await button.locator('..').locator('[title]').getAttribute('title');
                
                console.log(`  버튼 ${i + 1}:`);
                console.log(`    - 텍스트: "${buttonText}"`);
                console.log(`    - title: "${buttonTitle}"`);
                console.log(`    - aria-label: "${ariaLabel}"`);
                console.log(`    - 부모 tooltip: "${tooltip}"`);
            }
            
            // 상세보기 버튼 클릭 시도 (다양한 선택자로)
            console.log('\n🎯 상세보기 버튼 클릭 시도...');
            
            try {
                // 방법 1: Tooltip title 기반
                const viewButton1 = page.locator('table tbody tr').first().locator('button').locator('xpath=../..').locator('[title="상세 보기"]').locator('button');
                await viewButton1.click();
                console.log('✅ 방법 1 성공: Tooltip title 기반');
            } catch (e1) {
                console.log('❌ 방법 1 실패');
                
                try {
                    // 방법 2: 첫 번째 버튼
                    const viewButton2 = page.locator('table tbody tr').first().locator('button').first();
                    await viewButton2.click();
                    console.log('✅ 방법 2 성공: 첫 번째 버튼');
                } catch (e2) {
                    console.log('❌ 방법 2 실패');
                    
                    try {
                        // 방법 3: SVG 아이콘 기반
                        const viewButton3 = page.locator('table tbody tr').first().locator('button:has(svg)').first();
                        await viewButton3.click();
                        console.log('✅ 방법 3 성공: SVG 아이콘 기반');
                    } catch (e3) {
                        console.log('❌ 모든 방법 실패');
                        throw new Error('상세보기 버튼 클릭 불가');
                    }
                }
            }
            
            // 4. 다이얼로그 열기 대기 및 분석
            await page.waitForTimeout(2000);
            
            const dialogExists = await page.locator('[role="dialog"]').count();
            console.log(`🔍 다이얼로그 개수: ${dialogExists}`);
            
            if (dialogExists > 0) {
                console.log('✅ 다이얼로그 열림 성공');
                
                // 다이얼로그 내부 요소 분석
                const dialog = page.locator('[role="dialog"]').first();
                
                // 편집 버튼 찾기
                const editButtons = await dialog.locator('button').count();
                console.log(`🔍 다이얼로그 내 버튼 수: ${editButtons}`);
                
                for (let i = 0; i < editButtons; i++) {
                    const button = dialog.locator('button').nth(i);
                    const buttonText = await button.textContent();
                    const ariaLabel = await button.getAttribute('aria-label');
                    
                    console.log(`  다이얼로그 버튼 ${i + 1}:`);
                    console.log(`    - 텍스트: "${buttonText}"`);
                    console.log(`    - aria-label: "${ariaLabel}"`);
                }
                
                // 입력 필드 분석
                const inputFields = await dialog.locator('input').count();
                console.log(`🔍 다이얼로그 내 입력 필드 수: ${inputFields}`);
                
                for (let i = 0; i < inputFields; i++) {
                    const input = dialog.locator('input').nth(i);
                    const inputType = await input.getAttribute('type');
                    const inputName = await input.getAttribute('name');
                    const inputLabel = await input.getAttribute('label');
                    const placeholder = await input.getAttribute('placeholder');
                    
                    console.log(`  입력 필드 ${i + 1}:`);
                    console.log(`    - type: "${inputType}"`);
                    console.log(`    - name: "${inputName}"`);
                    console.log(`    - label: "${inputLabel}"`);
                    console.log(`    - placeholder: "${placeholder}"`);
                }
                
                // Select 요소 분석
                const selectFields = await dialog.locator('select, [role="combobox"]').count();
                console.log(`🔍 다이얼로그 내 Select 필드 수: ${selectFields}`);
                
            } else {
                console.log('❌ 다이얼로그가 열리지 않음');
            }
        }
        
        console.log('\n🎯 ICT-285 UI 분석 완료');
        
        // 브라우저를 닫지 않고 사용자가 직접 확인할 수 있도록 대기
        console.log('🔍 브라우저가 열려 있습니다. 수동으로 UI를 확인해보세요...');
        await page.waitForTimeout(30000); // 30초 대기
        
    } catch (error) {
        console.error('❌ UI 분석 실패:', error.message);
        throw error;
    } finally {
        await browser.close();
    }
}

// 테스트 실행
analyzeUserManagementUI().catch(error => {
    console.error('❌ ICT-285 UI 분석 실패:', error);
    process.exit(1);
});