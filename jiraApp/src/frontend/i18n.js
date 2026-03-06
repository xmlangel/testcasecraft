// jiraApp/src/frontend/i18n.js
const translations = {
  ko: {
    'settings.title': 'Testcasecraft 서버 설정',
    'settings.error.load': '설정을 불러오는데 실패했습니다.',
    'settings.error.save': '설정 저장 중 오류가 발생했습니다.',
    'settings.success.save': '설정이 성공적으로 저장되었습니다!',
    'settings.label.url': 'Testcasecraft 서버 URL',
    'settings.placeholder.url': 'https://testcasecraft.xmlangel.uk',
    'settings.label.apiKey': '서비스 API Key',
    'settings.placeholder.apiKey': 'Token 을 입력하세요',
    'settings.button.save': '설정 저장하기',
    'settings.help.url': 'URL은 마지막 슬래시(/) 없이 입력해 주세요.',
    'settings.help.policy': '아틀라시안 정책때문에 https:// 만 입력가능합니다. 발급받은 API 키는 암호화되어 안전하게 저장됩니다.',
    'settings.help.howToGet': 'API 키는 사용자 프로필 > API 토큰에서 생성할 수 있습니다.',
    
    'index.title': '테스트 관리',
    'index.description': '현재 이슈({issueKey})와 연결된 테스트 케이스를 확인하거나 결과를 입력할 수 있습니다.',
    'index.loading': '이슈 정보 및 설정을 불러오는 중입니다...',
    'index.error.notConfigured': '앱 설정이 완료되지 않았습니다. 관리자에게 문의하여 Testcasecraft 앱 설정을 진행해주세요.',
    'index.error.redirect': '테스트 결과 페이지를 열 수 없습니다. 내부망 접근 문제일 수 있습니다.',
    'index.button.open': '테스트 결과 확인 및 입력 (바로가기)',
    'index.button.connecting': '연결 중...',
    'index.footer.hint': '이동 시 보안 임시 토큰을 통해 자동 인증됩니다.'
  },
  en: {
    'settings.title': 'Testcasecraft Server Settings',
    'settings.error.load': 'Failed to load settings.',
    'settings.error.save': 'Error occurred while saving settings.',
    'settings.success.save': 'Settings saved successfully!',
    'settings.label.url': 'Testcasecraft Server URL',
    'settings.placeholder.url': 'https://testcasecraft.xmlangel.uk',
    'settings.label.apiKey': 'Service API Key',
    'settings.placeholder.apiKey': 'Enter your token',
    'settings.button.save': 'Save Settings',
    'settings.help.url': 'Please enter the URL without the trailing slash (/).',
    'settings.help.policy': 'Due to Atlassian policy, only https:// is allowed. Your API key will be encrypted and stored safely.',
    'settings.help.howToGet': 'You can generate an API key in User Profile > API Token.',

    'index.title': 'Test Management',
    'index.description': 'You can check test cases connected to the current issue({issueKey}) or enter results.',
    'index.loading': 'Loading issue information and settings...',
    'index.error.notConfigured': 'App configuration is not complete. Please contact your administrator to configure the Testcasecraft app.',
    'index.error.redirect': 'Could not open the test result page. This might be an internal network access issue.',
    'index.button.open': 'Check and Enter Test Results (Shortcut)',
    'index.button.connecting': 'Connecting...',
    'index.footer.hint': 'You will be automatically authenticated via a temporary security token.'
  }
};

const getLanguage = () => {
  const lang = navigator.language || navigator.userLanguage;
  return lang.startsWith('ko') ? 'ko' : 'en';
};

const currentLang = getLanguage();

export const t = (key, params = {}) => {
  let translation = translations[currentLang][key] || translations['en'][key] || key;
  
  Object.keys(params).forEach(param => {
    translation = translation.replace(`{${param}}`, params[param]);
  });
  
  return translation;
};
