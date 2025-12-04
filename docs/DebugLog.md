// 브라우저 콘솔에서 실행:

// 1. HybridForm 모듈만 활성화
localStorage.setItem('debug', 'HybridForm');

// 2. 모든 디버그 로그 활성화
localStorage.setItem('debug', 'true');

// 3. 여러 모듈 동시 활성화
localStorage.setItem('debug', 'HybridForm,Spreadsheet,DatasheetGrid');

// 4. 디버그 모드 비활성화
localStorage.removeItem('debug');