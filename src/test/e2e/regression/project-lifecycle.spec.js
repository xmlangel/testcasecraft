/**
 * 프로젝트 생명주기 E2E 테스트 절차:
 * 1. 로그인 (admin/admin123)
 * 2. 새 프로젝트 생성 버튼 클릭
 * 3. 프로젝트 정보 입력 (이름, 코드, 조직, 설명)
 * 4. 생성 버튼 클릭
 * 5. 리스트에서 생성된 프로젝트 확인
 * 6. 생성한 프로젝트 삭제
 * 7. 리스트에서 삭제 확인
 */

const { test, expect } = require("../fixtures/test-fixtures.js");
const { ADMIN_USERNAME, ADMIN_PASSWORD } = require("../config/credentials.js");

test.describe("프로젝트 관리", () => {
  test.setTimeout(60000);

  test("독립 프로젝트를 생성하고 삭제할 수 있어야 한다", async ({
    page,
    loginPage,
    projectListPage,
  }, testInfo) => {
    const workerIndex = testInfo.workerIndex;
    const timestamp = Date.now();
    const projectName = `Independent_W${workerIndex}_${timestamp}`;
    const projectCode = `IND${workerIndex}${timestamp.toString().slice(-4)}`;
    const description = `독립 E2E 테스트 프로젝트`;

    console.log(
      `🚀 [Worker ${workerIndex}] 독립 프로젝트 생성 테스트 시작: ${projectName}`,
    );

    // 로그인
    await loginPage.goto();
    await loginPage.login(ADMIN_USERNAME, ADMIN_PASSWORD);
    await projectListPage.waitForLoad();

    // 📋 생성: 조직 없이 생성
    await projectListPage.createProject(
      projectName,
      projectCode,
      "",
      description,
    );

    // 📋 확인
    const isCreated = await projectListPage.isProjectInList(projectName);
    expect(isCreated).toBeTruthy();
    console.log(`✅ 프로젝트 생성 확인: ${projectName}`);

    // 📋 삭제
    await projectListPage.deleteProject(projectName);

    // 📋 최종 확인
    const isStillThere = await projectListPage.isProjectInList(projectName);
    expect(isStillThere).toBeFalsy();
    console.log(`🎉 프로젝트 삭제 확인: ${projectName}`);
  });

  test("조직 프로젝트를 생성하고 삭제할 수 있어야 한다", async ({
    page,
    loginPage,
    projectListPage,
  }, testInfo) => {
    const workerIndex = testInfo.workerIndex;
    const timestamp = Date.now();
    const projectName = `OrgProject_W${workerIndex}_${timestamp}`;
    const projectCode = `ORG${workerIndex}${timestamp.toString().slice(-4)}`;
    const description = `조직 E2E 테스트 프로젝트`;

    console.log(
      `🚀 [Worker ${workerIndex}] 조직 프로젝트 생성 테스트 시작: ${projectName}`,
    );

    // 로그인
    await loginPage.goto();
    await loginPage.login(ADMIN_USERNAME, ADMIN_PASSWORD);
    await projectListPage.waitForLoad();

    // 📋 다이얼로그 열고 조작
    await projectListPage.clickNewProject();
    await projectListPage.projectNameInput.fill(projectName);
    await projectListPage.projectCodeInput.fill(projectCode);
    await projectListPage.projectDescriptionInput.fill(description);

    // 조직 Select 클릭
    await projectListPage.projectOrgSelect.click();

    // 옵션 목록 대기
    const options = page.locator("role=option");
    const count = await options.count();

    if (count > 1) {
      // "독립 프로젝트" 외의 첫 번째 조직 선택
      await options.nth(1).click();
      console.log("✅ 조직 선택 완료");
    } else {
      await options.first().click();
    }

    await projectListPage.saveButton.click();

    // 📋 생성 확인
    await projectListPage.selectTab(2);
    await page.waitForSelector(
      `[data-testid="project-name"]:has-text("${projectName}")`,
      { timeout: 10000 },
    );
    console.log(`✅ 프로젝트 생성 확인: ${projectName}`);

    // 📋 삭제
    await projectListPage.deleteProject(projectName);

    // 📋 최종 확인
    const isStillThere = await projectListPage.isProjectInList(projectName);
    expect(isStillThere).toBeFalsy();
    console.log(`🎉 프로젝트 삭제 확인: ${projectName}`);
  });
});
