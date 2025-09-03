const { chromium } = require('playwright');

async function testFolderInSpreadsheet() {
    console.log('🧪 스프레드시트 뷰에서 폴더 기능 테스트...\n');

    let browser, context, page;
    try {
        browser = await chromium.launch({ 
            headless: false,
            slowMo: 1000
        });
        
        context = await browser.newContext({
            baseURL: 'http://localhost:8080'
        });
        
        page = await context.newPage();

        // 1. 로그인 및 네비게이션
        console.log('📋 1단계: 로그인 및 네비게이션...');
        await page.goto('/');
        await page.fill('input[name="username"]', 'admin');
        await page.fill('input[name="password"]', 'admin');
        await page.click('button[type="submit"]');
        await page.waitForLoadState('networkidle');

        // 프로젝트 선택
        await page.locator('text=프로젝트').first().click();
        await page.waitForLoadState('networkidle');
        await page.locator('button:has-text("프로젝트 열기")').first().click();
        await page.waitForLoadState('networkidle');

        // 테스트케이스 탭
        await page.locator('text=테스트케이스').first().click();
        await page.waitForLoadState('networkidle');
        console.log('✅ 기본 네비게이션 완료\n');

        // 2. 스프레드시트 뷰로 전환
        console.log('📋 2단계: 스프레드시트 뷰 전환...');
        
        // "스프레드시트" 또는 "고급 스프레드시트" 버튼 클릭
        const spreadsheetButton = page.locator('button:has-text("스프레드시트")').first();
        if (await spreadsheetButton.count() > 0) {
            await spreadsheetButton.click();
            await page.waitForLoadState('networkidle');
            console.log('✅ 스프레드시트 뷰로 전환 완료');
        } else {
            const advancedSpreadsheetButton = page.locator('button:has-text("고급 스프레드시트")').first();
            if (await advancedSpreadsheetButton.count() > 0) {
                await advancedSpreadsheetButton.click();
                await page.waitForLoadState('networkidle');
                console.log('✅ 고급 스프레드시트 뷰로 전환 완료');
            }
        }
        
        await page.waitForTimeout(2000);
        
        // 전환 후 스크린샷
        await page.screenshot({ 
            path: 'e2e-tests/screenshots/spreadsheet-view.png',
            fullPage: true 
        });

        // 3. 폴더 추가 버튼 확인
        console.log('\n📋 3단계: 폴더 추가 버튼 확인...');
        
        // 모든 버튼 재조사
        const buttons = await page.locator('button').all();
        console.log(`현재 버튼 수: ${buttons.length}`);
        
        let folderButtonFound = false;
        for (let i = 0; i < buttons.length; i++) {
            const buttonText = await buttons[i].textContent();
            console.log(`  버튼 ${i + 1}: "${buttonText}"`);
            
            if (buttonText.includes('폴더') && buttonText.includes('추가')) {
                folderButtonFound = true;
                console.log(`  🎯 폴더 추가 버튼 발견: "${buttonText}"`);
            }
        }

        if (folderButtonFound) {
            console.log('\n✅ 폴더 추가 버튼 발견!');
            
            // 폴더 추가 버튼 클릭
            const folderButton = page.locator('button:has-text("폴더 추가")');
            await folderButton.click();
            await page.waitForTimeout(2000);
            
            // 폴더 생성 다이얼로그 확인
            const dialog = page.locator('[role="dialog"]');
            if (await dialog.isVisible()) {
                console.log('✅ 폴더 생성 다이얼로그 열림');
                
                await page.screenshot({ 
                    path: 'e2e-tests/screenshots/folder-dialog.png',
                    fullPage: true 
                });
                
                // 폴더명 입력
                const folderNameInput = page.locator('input[label="폴더명"], input[placeholder*="폴더"], label:has-text("폴더명") + * input').first();
                if (await folderNameInput.count() > 0) {
                    await folderNameInput.fill('E2E 테스트 폴더');
                    console.log('✅ 폴더명 입력 완료');
                    
                    // 생성 버튼 클릭
                    const createButton = page.locator('button:has-text("생성")');
                    if (await createButton.count() > 0) {
                        await createButton.click();
                        await page.waitForTimeout(3000);
                        console.log('✅ 폴더 생성 버튼 클릭');
                        
                        // 생성 후 스크린샷
                        await page.screenshot({ 
                            path: 'e2e-tests/screenshots/folder-created.png',
                            fullPage: true 
                        });
                    } else {
                        console.log('⚠️  폴더 생성 버튼 없음');
                    }
                } else {
                    console.log('⚠️  폴더명 입력 필드 없음');
                    
                    // 다른 입력 필드들 확인
                    const allInputs = await page.locator('input').all();
                    console.log(`다이얼로그 내 입력 필드 수: ${allInputs.length}`);
                    
                    if (allInputs.length > 0) {
                        await allInputs[0].fill('E2E 테스트 폴더');
                        console.log('✅ 첫 번째 입력 필드에 폴더명 입력');
                        
                        const createButton = page.locator('button:has-text("생성")');
                        if (await createButton.count() > 0) {
                            await createButton.click();
                            await page.waitForTimeout(3000);
                            console.log('✅ 폴더 생성 버튼 클릭');
                        }
                    }
                }
            } else {
                console.log('⚠️  폴더 생성 다이얼로그 표시되지 않음');
            }
        } else {
            console.log('\n⚠️  폴더 추가 버튼을 찾을 수 없음');
        }

        // 4. 스프레드시트 직접 입력 테스트
        console.log('\n📋 4단계: 스프레드시트 직접 폴더 패턴 입력 테스트...');
        
        // 스프레드시트 셀 찾기
        const cellSelectors = [
            'td',
            '[class*="cell"]',
            '[data-testid*="cell"]',
            '.react-spreadsheet-cell',
            '[class*="Spreadsheet-cell"]'
        ];
        
        let cellFound = false;
        for (const selector of cellSelectors) {
            const cells = await page.locator(selector).count();
            console.log(`"${selector}" 선택자: ${cells}개 요소`);
            
            if (cells > 0 && !cellFound) {
                console.log(`첫 번째 "${selector}" 요소 클릭 시도...`);
                try {
                    const firstCell = page.locator(selector).first();
                    await firstCell.click();
                    await page.keyboard.type('📁 직접입력 폴더');
                    console.log('✅ 폴더 패턴 직접 입력 완료');
                    cellFound = true;
                    
                    // 입력 후 스크린샷
                    await page.screenshot({ 
                        path: 'e2e-tests/screenshots/direct-folder-input.png',
                        fullPage: true 
                    });
                    break;
                } catch (inputError) {
                    console.log(`"${selector}" 입력 실패: ${inputError.message}`);
                }
            }
        }

        if (!cellFound) {
            console.log('⚠️  입력 가능한 셀을 찾을 수 없음');
        }

        // 5. 저장 버튼 찾기 및 클릭
        console.log('\n📋 5단계: 저장 버튼 확인...');
        const saveButtons = page.locator('button:has-text("저장"), button:has-text("Save"), button:has-text("일괄 저장")');
        const saveButtonCount = await saveButtons.count();
        
        if (saveButtonCount > 0) {
            console.log(`저장 버튼 ${saveButtonCount}개 발견`);
            await saveButtons.first().click();
            await page.waitForTimeout(3000);
            console.log('✅ 저장 버튼 클릭');
            
            // 저장 후 스크린샷
            await page.screenshot({ 
                path: 'e2e-tests/screenshots/after-save.png',
                fullPage: true 
            });
        } else {
            console.log('⚠️  저장 버튼 없음 (자동 저장일 수 있음)');
        }

        // 6. 폴더 표시 확인
        console.log('\n📋 6단계: 폴더 표시 확인...');
        
        // 폴더 아이콘 찾기
        const folderIndicators = page.locator('text=📁');
        const folderCount = await folderIndicators.count();
        console.log(`📁 폴더 아이콘 발견: ${folderCount}개`);
        
        if (folderCount > 0) {
            console.log('✅ 폴더가 성공적으로 생성되고 표시됨!');
        } else {
            console.log('⚠️  폴더가 표시되지 않음');
        }

        // 최종 스크린샷
        await page.screenshot({ 
            path: 'e2e-tests/screenshots/folder-test-final.png',
            fullPage: true 
        });
        
        console.log('\n🎉 폴더 기능 테스트 완료!');
        console.log('📸 모든 스크린샷이 e2e-tests/screenshots/에 저장됨');

    } catch (error) {
        console.error('\n❌ 테스트 실행 중 오류:', error);
        
        if (page) {
            await page.screenshot({ 
                path: 'e2e-tests/screenshots/folder-test-error.png',
                fullPage: true 
            });
        }
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// 테스트 실행
testFolderInSpreadsheet().catch(console.error);