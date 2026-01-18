describe('Login Page', () => {
  it('should login with valid credentials', () => {
    cy.visit('http://localhost:3000');
    // 아이디 입력
    cy.get('input[name="username"]').type('admin');
    // 비밀번호 입력
    cy.get('input[name="password"]').type('admin123');
    // 로그인 버튼 클릭
    cy.contains('button', '로그인').click();
    // 로그인 성공 후 페이지에 admin 이름이 보이는지 등 추가 검증 가능
    cy.contains('로그인에 실패했습니다.').should('not.exist');
    cy.contains('TestCaseCraft').should('exist');
    cy.contains('프로젝트 선택').should('exist'); 
  });
});

describe('프로젝트 삭제', () => {
  before(() => {
    // 로그인 먼저 수행
    cy.visit('http://localhost:3000');
    cy.get('input[name="username"]').type('admin');
    cy.get('input[name="password"]').type('admin123');
    cy.contains('button', '로그인').click();
    cy.contains('TestCaseCraft').should('exist');
  });

  it('첫 번째 프로젝트를 삭제한다', () => {
    cy.contains('프로젝트 목록').should('exist');
    cy.get('button[aria-label="delete"]').first().click();
    cy.contains('정말 삭제하시겠습니까?').should('exist');
    cy.contains('button', '삭제').click();

    cy.get('div.MuiAlert-message', { timeout: 5000 }).then($alert => {
      const msg = $alert.text();
      if (msg.includes('테스트 플랜이 존재')) {
        // ... (기존 플랜 삭제 및 재시도 로직)
      } else if (msg.includes('삭제 실패')) {
        // 프로젝트 삭제 실패(다른 이유) - 테스트 종료
        throw new Error('프로젝트 삭제 실패: ' + msg);
      } else if (msg.includes('서버 내부 오류') || msg.includes('500')) {
        // 서버 내부 오류 발생 시, 해당 프로젝트 열기 → 테스트 플랜 삭제 → 다시 프로젝트 삭제
        cy.get('div.MuiAlert-message').invoke('text').then((msg2) => {
          const match = msg2.match(/\[(.*?)\]/);
          if (match && match[1]) {
            const projectName = match[1];
            // 해당 프로젝트 카드에서 '열기' 버튼 클릭
            cy.contains('span', projectName).parents('div.MuiPaper-root').within(() => {
              cy.contains('button', '열기').click();
            });
            // 테스트 플랜 탭 클릭
            cy.contains('테스트 플랜').click();
            // 테스트 플랜이 있을 때까지 반복 삭제
            cy.get('button[aria-label="삭제"]').then($btns => {
              if ($btns.length > 0) {
                cy.wrap($btns).each(($btn) => {
                  cy.wrap($btn).click();
                  cy.contains('정말로 이 테스트 플랜을 삭제하시겠습니까?').should('exist');
                  cy.contains('button', '삭제').click();
                  cy.wait(500);
                });
              }
            });
            // 다시 프로젝트 목록으로 이동
            cy.contains('프로젝트 목록').click();
            // 해당 프로젝트를 다시 삭제 시도
            cy.contains('span', projectName).parents('div.MuiPaper-root').within(() => {
              cy.get('button[aria-label="delete"]').click();
            });
            cy.contains('정말 삭제하시겠습니까?').should('exist');
            cy.contains('button', '삭제').click();
            cy.get('div.MuiAlert-message').should('not.exist');
          } else {
            throw new Error('서버 내부 오류로 삭제 불가: ' + msg2);
          }
        });
      } else {
        // 삭제 성공
        cy.get('div.MuiAlert-message').should('not.exist');
      }
    });
  });
}); 