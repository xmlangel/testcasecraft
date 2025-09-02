const http = require('http');

// 설정
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN || "ATATT3xFfGF0vWmkJ5xagZL9_mHgGn6S92gEPQbGCrJj6Q_kcQ8WkcpMlvdzFSCfnwkr3OL8jjyzzLf2x_HbTW4q3bz9vWPzu-pUhsJPXteRTJvt0LCa6Df_h879wVpl9EXoS1Cq8hnz-t_sEgw091QLjKfYHdy5myvg7ZqYE6MZVjD8XDRmvyo=60FE53E1";
const JIRA_USERNAME = process.env.JIRA_USERNAME || "kwangmyung.kim@gmail.com"; //Atlassian Account ID
const USER_ID = process.env.USER_ID || "admin"; // userId in your system
const JIRA_TEST_PROJECT_KEY = process.env.JIRA_TEST_PROJECT_KEY || "ICT";
const LOGIN_PASSWORD = process.env.LOGIN_PASSWORD || "admin"; // For the admin user in LOGIN_CREDENTIALS
const JIRA_SERVER_URL = process.env.JIRA_SERVER_URL || "https://kwangmyung.atlassian.net/"; // For the admin user in LOGIN_CREDENTIALS

// 설정
const BASE_URL = 'http://localhost:8080';
const LOGIN_CREDENTIALS = {
  username: USER_ID,
  password: LOGIN_PASSWORD
};

const JIRA_CONFIG = {
  "id": "jira-config-001",
  "userId": USER_ID,
  "serverUrl": JIRA_SERVER_URL,
  "username": JIRA_USERNAME,
  "apiToken": JIRA_API_TOKEN,
  "testProjectKey": JIRA_TEST_PROJECT_KEY,
  "isActive": true,
  "connectionVerified": true,
  "lastConnectionTest": new Date().toISOString(),
  "lastConnectionError": null,
  "createdAt": new Date().toISOString(),
  "updatedAt": new Date().toISOString()
};

// HTTP 요청 유틸리티 함수
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', reject);
    
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function main() {
  try {
    console.log('🚀 JIRA 설정 추가 프로세스 시작...\n');

    // 1단계: 로그인하여 JWT 토큰 획득
    console.log('🔐 1단계: 로그인 중...');
    const loginData = JSON.stringify(LOGIN_CREDENTIALS);
    const loginOptions = {
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      }
    };

    const loginResponse = await makeRequest(loginOptions, loginData);
    console.log(`📡 로그인 응답 상태: ${loginResponse.statusCode}`);
    
    if (loginResponse.statusCode !== 200) {
      console.log('❌ 로그인 실패');
      console.log('응답:', loginResponse.body);
      return;
    }

    // JWT 토큰 추출
    let authData;
    try {
      authData = JSON.parse(loginResponse.body);
      console.log('✅ 로그인 성공');
    } catch (e) {
      console.log('❌ 로그인 응답 파싱 실패');
      console.log('응답:', loginResponse.body);
      return;
    }

    const token = authData.accessToken || authData.token;
    if (!token) {
      console.log('❌ JWT 토큰을 찾을 수 없습니다');
      console.log('응답 데이터:', authData);
      return;
    }

    console.log('🎫 JWT 토큰 획득 완료\n');

    // 2단계: JIRA 설정 추가
    console.log('📝 2단계: JIRA 설정 추가 중...');
    const configData = JSON.stringify(JIRA_CONFIG);
    const configOptions = {
      hostname: 'localhost',
      port: 8080,
      path: '/api/jira/config',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(configData)
      }
    };

    console.log('📋 추가할 JIRA 설정:');
    console.log(JSON.stringify(JIRA_CONFIG, null, 2));

    const configResponse = await makeRequest(configOptions, configData);
    console.log(`\n📡 JIRA 설정 응답 상태: ${configResponse.statusCode}`);

    if (configResponse.statusCode === 200 || configResponse.statusCode === 201) {
      console.log('✅ JIRA 설정이 성공적으로 추가되었습니다!');
      try {
        const responseData = JSON.parse(configResponse.body);
        console.log('\n📋 생성된 설정:');
        console.log(JSON.stringify(responseData, null, 2));
      } catch (e) {
        console.log('\n📄 응답 데이터:', configResponse.body);
      }
    } else {
      console.log('❌ JIRA 설정 추가 실패');
      console.log('응답:', configResponse.body);
    }

  } catch (error) {
    console.error('🚨 오류 발생:', error.message);
  }
}

// 실행
main();