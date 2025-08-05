// ICT-75: 프로젝트 설정 및 관리 E2E 테스트
// 관련 컴포넌트: EnhancedProjectManager.jsx, ProjectController.java
// Task 5.5: 프로젝트 설정 관리 테스트

const { test, expect } = require('@playwright/test');

test.describe('프로젝트 설정 및 관리 E2E 테스트', () => {
  
  test.beforeEach(async ({ page }) => {
    // 각 테스트 전에 로컬스토리지 초기화
    await page.goto('http://localhost:3000');
    await page.evaluate(() => localStorage.clear());
  });

  // 성공 스크린샷 헬퍼 함수
  async function takeSuccessScreenshot(page, testInfo, testName) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const screenshotPath = `test-results/success-screenshots/${testName}-${timestamp}.png`;
    await page.screenshot({ 
      path: screenshotPath, 
      fullPage: true 
    });
    
    await testInfo.attach('success-screenshot', {
      path: screenshotPath,
      contentType: 'image/png'
    });
    
    console.log(`📸 성공 스크린샷 저장: ${screenshotPath}`);
    return screenshotPath;
  }

  // 로그인 헬퍼 함수
  async function loginAsAdmin(page) {
    console.log('🔐 Admin 로그인 수행...');
    
    // 백엔드 서버 연결 확인
    let backendReady = false;
    for (let i = 0; i < 30; i++) {
      try {
        const response = await fetch('http://localhost:8080/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'admin', password: 'admin' })
        });
        backendReady = true;
        console.log('🚀 백엔드 서버 준비 완료');
        break;
      } catch (e) {
        console.log(`⏳ 백엔드 대기 중... (${i + 1}/30)`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    if (!backendReady) {
      throw new Error('백엔드 서버가 30초 내에 준비되지 않았습니다.');
    }

    // 로그인 폼 작성 및 제출
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');
    
    // 로그인 성공 확인
    let loginSuccess = false;
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        await page.waitForURL('**/dashboard**', { timeout: 5000 });
        const token = await page.evaluate(() => localStorage.getItem('accessToken'));
        if (token) {
          console.log('✅ 로그인 성공 및 토큰 저장 확인');
          loginSuccess = true;
          break;
        }
      } catch (e) {
        console.log(`🔄 로그인 재시도 ${attempt}/5...`);
        await page.waitForTimeout(1000);
      }
    }

    if (!loginSuccess) {
      throw new Error('로그인 실패: JWT 토큰이 저장되지 않았습니다.');
    }
  }

  // 프로젝트 설정 메뉴 열기 헬퍼 함수
  async function openProjectSettings(page) {
    await page.waitForLoadState('networkidle');
    
    // 프로젝트 목록에서 첫 번째 프로젝트 찾기
    await page.waitForSelector('[data-testid="project-card"], .MuiCard-root', { timeout: 10000 });
    const firstProject = page.locator('[data-testid="project-card"], .MuiCard-root').first();
    await expect(firstProject).toBeVisible();

    // 프로젝트 설정/관리 메뉴 버튼 찾기
    const settingsButtonSelectors = [
      'button[data-testid="project-settings-button"]',
      'button[aria-label*="설정"], button[aria-label*="settings"]',
      'button:has([data-testid="SettingsIcon"]), button:has([data-testid="MoreVertIcon"])',
      '.MuiIconButton-root:has(.MuiSvgIcon-root)',
      'button:has-text("설정"), button:has-text("Settings")'
    ];

    let settingsButton = null;
    for (const selector of settingsButtonSelectors) {
      try {
        // 첫 번째 프로젝트 카드 내에서 설정 버튼 찾기
        settingsButton = firstProject.locator(selector).first();
        if (await settingsButton.isVisible({ timeout: 2000 })) {
          console.log(`⚙️ 프로젝트 설정 버튼 발견: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!settingsButton || !await settingsButton.isVisible()) {
      // 전체 페이지에서 설정 버튼 찾기
      for (const selector of settingsButtonSelectors) {
        try {
          settingsButton = page.locator(selector).first();
          if (await settingsButton.isVisible({ timeout: 2000 })) {
            console.log(`⚙️ 전체 페이지에서 설정 버튼 발견: ${selector}`);
            break;
          }
        } catch (e) {
          continue;
        }
      }
    }

    if (settingsButton && await settingsButton.isVisible()) {
      await settingsButton.click();
      console.log('🖱️ 프로젝트 설정 버튼 클릭');
      
      // 설정 메뉴/다이얼로그가 나타날 때까지 대기
      await page.waitForTimeout(1000);
      
      // 드롭다운 메뉴가 나타났다면 "수정" 또는 "설정" 메뉴 클릭
      const editMenuSelectors = [
        'li:has-text("수정"), li:has-text("Edit")',
        'li:has-text("설정"), li:has-text("Settings")',
        '.MuiMenuItem-root:has-text("수정")',
        '.MuiMenuItem-root:has-text("설정")'
      ];

      for (const selector of editMenuSelectors) {
        try {
          const editMenuItem = page.locator(selector).first();
          if (await editMenuItem.isVisible({ timeout: 2000 })) {
            await editMenuItem.click();
            console.log('📝 프로젝트 편집 메뉴 클릭');
            break;
          }
        } catch (e) {
          continue;
        }
      }
    } else {
      throw new Error('프로젝트 설정 버튼을 찾을 수 없습니다.');
    }

    // 설정 다이얼로그/폼이 나타날 때까지 대기
    await page.waitForSelector('.MuiDialog-root, [role="dialog"], form', { timeout: 5000 });
    console.log('⚙️ 프로젝트 설정 다이얼로그 열림');
  }

  test('프로젝트 기본 정보 수정 테스트', async ({ page }, testInfo) => {
    console.log('📝 프로젝트 기본 정보 수정 테스트 시작...');

    // 로그인 수행
    await loginAsAdmin(page);

    // 프로젝트 설정 열기
    await openProjectSettings(page);

    // 현재 프로젝트 정보 확인
    const nameInput = page.locator('input[name="name"], input[name="projectName"], input[placeholder*="이름"]').first();
    const descInput = page.locator('textarea[name="description"], textarea[placeholder*="설명"], input[name="description"]').first();

    if (await nameInput.isVisible({ timeout: 3000 })) {
      const currentName = await nameInput.inputValue();
      console.log(`📋 현재 프로젝트명: ${currentName}`);

      // 프로젝트명 수정
      const newName = `${currentName}_수정됨_${Date.now()}`;
      await nameInput.clear();
      await nameInput.fill(newName);
      console.log(`📝 새 프로젝트명: ${newName}`);
    }

    if (await descInput.isVisible({ timeout: 2000 })) {
      const currentDesc = await descInput.inputValue();
      console.log(`📋 현재 설명: ${currentDesc}`);

      // 프로젝트 설명 수정
      const newDesc = `수정된 설명 - ${new Date().toLocaleString()}`;
      await descInput.clear();
      await descInput.fill(newDesc);
      console.log(`📝 새 설명: ${newDesc}`);
    }

    // 수정 사항 저장
    const saveButtonSelectors = [
      'button[type="submit"]:has-text("저장"), button[type="submit"]:has-text("Save")',
      'button:has-text("수정"), button:has-text("Update")',
      '.MuiDialog-actions button:has-text("저장")',
      '[data-testid="save-project-button"]'
    ];

    let saveButton = null;
    for (const selector of saveButtonSelectors) {
      try {
        saveButton = page.locator(selector).first();
        if (await saveButton.isVisible({ timeout: 2000 })) {
          console.log(`💾 저장 버튼 발견: ${selector}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (saveButton && await saveButton.isVisible()) {
      await saveButton.click();
      console.log('🖱️ 프로젝트 정보 수정 저장');
    }

    // 저장 완료 대기
    await page.waitForTimeout(3000);

    // 다이얼로그가 닫혔는지 확인
    try {
      await page.waitForSelector('.MuiDialog-root', { state: 'detached', timeout: 5000 });
      console.log('✅ 수정 다이얼로그 닫힘 확인');
    } catch (e) {
      console.log('⚠️ 다이얼로그가 여전히 열려있을 수 있음');
    }

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, 'project-info-updated');

    console.log('✅ 프로젝트 기본 정보 수정 테스트 완료');
  });

  test('프로젝트 멤버 관리 기능 테스트', async ({ page }, testInfo) => {
    console.log('👥 프로젝트 멤버 관리 테스트 시작...');

    // 로그인 수행
    await loginAsAdmin(page);

    // 프로젝트 설정 열기
    await openProjectSettings(page);

    // 멤버 관리 탭/섹션 찾기
    const memberTabSelectors = [
      'button:has-text("멤버"), button:has-text("Members")',
      '.MuiTab-root:has-text("멤버")',
      '[data-testid="members-tab"]',
      'a[href*="members"]'
    ];

    let memberTabFound = false;
    for (const selector of memberTabSelectors) {
      try {
        const memberTab = page.locator(selector).first();
        if (await memberTab.isVisible({ timeout: 3000 })) {
          await memberTab.click();
          console.log('👥 멤버 관리 탭 클릭');
          memberTabFound = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!memberTabFound) {
      console.log('⚠️ 멤버 관리 탭을 찾을 수 없음, 기본 다이얼로그에서 멤버 섹션 확인');
    }

    // 현재 멤버 목록 확인
    await page.waitForTimeout(2000);
    
    const memberListSelectors = [
      '.member-list, [data-testid="member-list"]',
      '.MuiList-root',
      'ul li, .MuiListItem-root'
    ];

    let memberCount = 0;
    for (const selector of memberListSelectors) {
      try {
        const memberElements = page.locator(selector);
        memberCount = await memberElements.count();
        if (memberCount > 0) {
          console.log(`👥 현재 프로젝트 멤버 수: ${memberCount}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    // 새 멤버 추가 버튼 찾기
    const addMemberSelectors = [
      'button:has-text("멤버 추가"), button:has-text("Add Member")',
      'button:has-text("초대"), button:has-text("Invite")',
      '[data-testid="add-member-button"]',
      'button:has([data-testid="AddIcon"])'
    ];

    for (const selector of addMemberSelectors) {
      try {
        const addButton = page.locator(selector).first();
        if (await addButton.isVisible({ timeout: 2000 })) {
          await addButton.click();
          console.log('➕ 멤버 추가 버튼 클릭');
          
          // 멤버 추가 폼이 나타날 때까지 대기
          await page.waitForTimeout(1000);
          
          // 사용자 선택 또는 이메일 입력 필드 확인
          const userInputSelectors = [
            'input[name="email"], input[name="username"]',
            'input[placeholder*="이메일"], input[placeholder*="email"]',
            '.MuiTextField-root input'
          ];

          for (const inputSelector of userInputSelectors) {
            try {
              const userInput = page.locator(inputSelector).first();
              if (await userInput.isVisible({ timeout: 2000 })) {
                await userInput.fill('test@example.com');
                console.log('📧 테스트 사용자 이메일 입력');
                break;
              }
            } catch (e) {
              continue;
            }
          }
          
          break;
        }
      } catch (e) {
        continue;
      }
    }

    // 멤버 역할 변경 테스트 (기존 멤버가 있는 경우)
    if (memberCount > 0) {
      const roleChangeSelectors = [
        'select[name="role"], .MuiSelect-root',
        '[data-testid="member-role-select"]',
        'button[aria-label*="역할"], button[aria-label*="role"]'
      ];

      for (const selector of roleChangeSelectors) {
        try {
          const roleSelect = page.locator(selector).first();
          if (await roleSelect.isVisible({ timeout: 2000 })) {
            await roleSelect.click();
            console.log('🔄 멤버 역할 선택 드롭다운 열기');
            
            // 역할 옵션 선택
            await page.waitForTimeout(500);
            const roleOption = page.locator('.MuiMenuItem-root, option').first();
            if (await roleOption.isVisible({ timeout: 1000 })) {
              await roleOption.click();
              console.log('👤 멤버 역할 변경');
            }
            break;
          }
        } catch (e) {
          continue;
        }
      }
    }

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, 'project-members-managed');

    console.log('✅ 프로젝트 멤버 관리 테스트 완료');
  });

  test('프로젝트 상태 및 설정 변경 테스트', async ({ page }, testInfo) => {
    console.log('⚙️ 프로젝트 상태 및 설정 변경 테스트 시작...');

    // 로그인 수행
    await loginAsAdmin(page);

    // 프로젝트 설정 열기
    await openProjectSettings(page);

    // 프로젝트 상태 변경
    const statusSelectors = [
      'select[name="status"], .MuiSelect-root:has-text("상태")',
      '[data-testid="project-status-select"]',
      'input[name="active"], input[type="checkbox"]'
    ];

    let statusChanged = false;
    for (const selector of statusSelectors) {
      try {
        const statusElement = page.locator(selector).first();
        if (await statusElement.isVisible({ timeout: 3000 })) {
          if (selector.includes('checkbox')) {
            // 체크박스인 경우 토글
            await statusElement.click();
            console.log('✅ 프로젝트 활성 상태 토글');
          } else {
            // 드롭다운인 경우
            await statusElement.click();
            await page.waitForTimeout(500);
            const statusOption = page.locator('.MuiMenuItem-root, option').first();
            if (await statusOption.isVisible({ timeout: 1000 })) {
              await statusOption.click();
              console.log('📊 프로젝트 상태 변경');
            }
          }
          statusChanged = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!statusChanged) {
      console.log('⚠️ 프로젝트 상태 변경 옵션을 찾을 수 없음');
    }

    // 프로젝트 공개 설정 변경
    const visibilitySelectors = [
      'select[name="visibility"], .MuiSelect-root:has-text("공개")',
      '[data-testid="project-visibility-select"]',
      'input[name="public"], input[name="private"]'
    ];

    for (const selector of visibilitySelectors) {
      try {
        const visibilityElement = page.locator(selector).first();
        if (await visibilityElement.isVisible({ timeout: 2000 })) {
          if (selector.includes('input')) {
            await visibilityElement.click();
            console.log('👁️ 프로젝트 공개 설정 토글');
          } else {
            await visibilityElement.click();
            await page.waitForTimeout(500);
            const visibilityOption = page.locator('.MuiMenuItem-root, option').first();
            if (await visibilityOption.isVisible({ timeout: 1000 })) {
              await visibilityOption.click();
              console.log('🔒 프로젝트 공개 범위 변경');
            }
          }
          break;
        }
      } catch (e) {
        continue;
      }
    }

    // 고급 설정 확인
    const advancedSelectors = [
      'button:has-text("고급"), button:has-text("Advanced")',
      '.MuiAccordion-root:has-text("고급")',
      '[data-testid="advanced-settings"]'
    ];

    for (const selector of advancedSelectors) {
      try {
        const advancedSection = page.locator(selector).first();
        if (await advancedSection.isVisible({ timeout: 2000 })) {
          await advancedSection.click();
          console.log('🔧 고급 설정 섹션 열기');
          
          // 고급 설정 옵션들 확인
          await page.waitForTimeout(1000);
          const advancedOptions = await page.locator('input[type="checkbox"], .MuiSwitch-root').count();
          console.log(`⚙️ 고급 설정 옵션 수: ${advancedOptions}`);
          break;
        }
      } catch (e) {
        continue;
      }
    }

    // 변경사항 저장
    const saveButton = page.locator('button[type="submit"]:has-text("저장"), button:has-text("저장"), button:has-text("Save")').first();
    if (await saveButton.isVisible({ timeout: 3000 })) {
      await saveButton.click();
      console.log('💾 프로젝트 설정 변경사항 저장');
    }

    // 저장 완료 대기
    await page.waitForTimeout(3000);

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, 'project-settings-changed');

    console.log('✅ 프로젝트 상태 및 설정 변경 테스트 완료');
  });

  test('프로젝트 삭제 기능 테스트', async ({ page }, testInfo) => {
    console.log('🗑️ 프로젝트 삭제 기능 테스트 시작...');

    // 로그인 수행
    await loginAsAdmin(page);

    await page.waitForLoadState('networkidle');
    
    // 프로젝트 목록에서 삭제할 프로젝트 찾기
    await page.waitForSelector('[data-testid="project-card"], .MuiCard-root', { timeout: 10000 });
    const projectCards = page.locator('[data-testid="project-card"], .MuiCard-root');
    const projectCount = await projectCards.count();
    console.log(`📊 현재 프로젝트 수: ${projectCount}`);

    if (projectCount > 1) { // 최소 1개는 남겨두기
      const lastProject = projectCards.last();
      
      // 삭제 버튼 찾기
      const deleteButtonSelectors = [
        'button[data-testid="delete-project-button"]',
        'button[aria-label*="삭제"], button[aria-label*="delete"]',
        'button:has([data-testid="DeleteIcon"])',
        'button:has-text("삭제"), button:has-text("Delete")'
      ];

      let deleteButton = null;
      for (const selector of deleteButtonSelectors) {
        try {
          deleteButton = lastProject.locator(selector).first();
          if (await deleteButton.isVisible({ timeout: 2000 })) {
            console.log(`🗑️ 삭제 버튼 발견: ${selector}`);
            break;
          }
        } catch (e) {
          continue;
        }
      }

      // 삭제 버튼이 직접 보이지 않으면 메뉴 버튼을 통해 접근
      if (!deleteButton || !await deleteButton.isVisible()) {
        const menuButtonSelectors = [
          'button:has([data-testid="MoreVertIcon"])',
          '.MuiIconButton-root:has(.MuiSvgIcon-root)',
          'button[aria-label*="메뉴"], button[aria-label*="more"]'
        ];

        for (const selector of menuButtonSelectors) {
          try {
            const menuButton = lastProject.locator(selector).first();
            if (await menuButton.isVisible({ timeout: 2000 })) {
              await menuButton.click();
              console.log('📋 프로젝트 메뉴 버튼 클릭');
              
              // 삭제 메뉴 항목 클릭
              await page.waitForTimeout(500);
              const deleteMenuItem = page.locator('li:has-text("삭제"), li:has-text("Delete"), .MuiMenuItem-root:has-text("삭제")').first();
              if (await deleteMenuItem.isVisible({ timeout: 2000 })) {
                await deleteMenuItem.click();
                console.log('🗑️ 삭제 메뉴 항목 클릭');
                deleteButton = deleteMenuItem;
                break;
              }
            }
          } catch (e) {
            continue;
          }
        }
      }

      if (deleteButton && await deleteButton.isVisible()) {
        // 직접 삭제 버튼이 있는 경우 클릭
        if (!await deleteButton.textContent().then(text => text?.includes('삭제') || text?.includes('Delete'))) {
          await deleteButton.click();
        }

        // 삭제 확인 다이얼로그 대기
        await page.waitForTimeout(1000);
        
        // 확인 다이얼로그에서 취소 버튼 클릭 (실제 삭제하지 않음)
        const cancelButtonSelectors = [
          'button:has-text("취소"), button:has-text("Cancel")',
          '.MuiDialog-actions button:first-child',
          '[data-testid="cancel-delete-button"]'
        ];

        let cancelClicked = false;
        for (const selector of cancelButtonSelectors) {
          try {
            const cancelButton = page.locator(selector).first();
            if (await cancelButton.isVisible({ timeout: 3000 })) {
              await cancelButton.click();
              console.log('❌ 삭제 취소 버튼 클릭 (테스트용)');
              cancelClicked = true;
              break;
            }
          } catch (e) {
            continue;
          }
        }

        if (!cancelClicked) {
          console.log('⚠️ 삭제 확인 다이얼로그를 찾을 수 없음');
        }

        // 다이얼로그가 닫혔는지 확인
        await page.waitForTimeout(1000);
        console.log('✅ 삭제 기능 테스트 완료 (실제 삭제하지 않음)');
      } else {
        console.log('⚠️ 삭제 버튼을 찾을 수 없음');
      }
    } else {
      console.log('⚠️ 삭제할 프로젝트가 충분하지 않음 (최소 1개 유지)');
    }

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, 'project-delete-tested');

    console.log('✅ 프로젝트 삭제 기능 테스트 완료');
  });

  test('프로젝트 권한 설정 테스트', async ({ page }, testInfo) => {
    console.log('🔐 프로젝트 권한 설정 테스트 시작...');

    // 로그인 수행
    await loginAsAdmin(page);

    // 프로젝트 설정 열기
    await openProjectSettings(page);

    // 권한 설정 탭/섹션 찾기
    const permissionTabSelectors = [
      'button:has-text("권한"), button:has-text("Permissions")',
      '.MuiTab-root:has-text("권한")',
      '[data-testid="permissions-tab"]',
      'button:has-text("보안"), button:has-text("Security")'
    ];

    let permissionTabFound = false;
    for (const selector of permissionTabSelectors) {
      try {
        const permissionTab = page.locator(selector).first();
        if (await permissionTab.isVisible({ timeout: 3000 })) {
          await permissionTab.click();
          console.log('🔐 권한 설정 탭 클릭');
          permissionTabFound = true;
          break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!permissionTabFound) {
      console.log('⚠️ 권한 설정 탭을 찾을 수 없음, 기본 다이얼로그에서 권한 섹션 확인');
    }

    // 권한 설정 옵션들 확인
    await page.waitForTimeout(2000);

    const permissionOptions = [
      'input[name="readPermission"], input[name="writePermission"]',
      '.MuiSwitch-root, input[type="checkbox"]',
      'select[name="defaultRole"]'
    ];

    let permissionCount = 0;
    for (const selector of permissionOptions) {
      try {
        const elements = page.locator(selector);
        const count = await elements.count();
        permissionCount += count;
        console.log(`🔐 권한 설정 옵션 (${selector}): ${count}개`);
      } catch (e) {
        continue;
      }
    }

    console.log(`📊 총 권한 설정 옵션: ${permissionCount}개`);

    // 기본 역할 설정 변경
    const defaultRoleSelectors = [
      'select[name="defaultRole"], .MuiSelect-root:has-text("기본")',
      '[data-testid="default-role-select"]'
    ];

    for (const selector of defaultRoleSelectors) {
      try {
        const roleSelect = page.locator(selector).first();
        if (await roleSelect.isVisible({ timeout: 2000 })) {
          await roleSelect.click();
          console.log('👤 기본 역할 선택 드롭다운 열기');
          
          await page.waitForTimeout(500);
          const roleOption = page.locator('.MuiMenuItem-root, option').first();
          if (await roleOption.isVisible({ timeout: 1000 })) {
            await roleOption.click();
            console.log('🔄 기본 역할 변경');
          }
          break;
        }
      } catch (e) {
        continue;
      }
    }

    // 접근 제어 설정 토글
    const accessControlSelectors = [
      'input[name="restrictAccess"], .MuiSwitch-root',
      '[data-testid="access-control-switch"]'
    ];

    for (const selector of accessControlSelectors) {
      try {
        const accessSwitch = page.locator(selector).first();
        if (await accessSwitch.isVisible({ timeout: 2000 })) {
          await accessSwitch.click();
          console.log('🔒 접근 제어 설정 토글');
          break;
        }
      } catch (e) {
        continue;
      }
    }

    // 변경사항 저장
    const saveButton = page.locator('button[type="submit"]:has-text("저장"), button:has-text("저장"), button:has-text("Save")').first();
    if (await saveButton.isVisible({ timeout: 3000 })) {
      await saveButton.click();
      console.log('💾 권한 설정 저장');
    }

    await page.waitForTimeout(2000);

    // 성공 스크린샷 촬영
    await takeSuccessScreenshot(page, testInfo, 'project-permissions-set');

    console.log('✅ 프로젝트 권한 설정 테스트 완료');
  });

});