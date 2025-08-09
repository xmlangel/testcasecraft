const { chromium } = require('playwright');

async function openBrowser() {
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  await page.goto('http://localhost:3000');
  
  console.log('브라우저가 열렸습니다. 수동으로 테스트를 진행하세요:');
  console.log('1. admin/admin으로 로그인');
  console.log('2. 프로젝트 선택');
  console.log('3. 테스트케이스 -> 스프레드시트 모드');
  console.log('4. 설정 버튼 클릭 -> 스텝 추가');
  console.log('5. 스텝 수가 증가하는지 확인');
  
  await new Promise(() => {});
}

openBrowser().catch(console.error);
EOF < /dev/null