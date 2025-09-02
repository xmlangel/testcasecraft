// API Test: 새로운 사용자 등록 및 로그인 테스트
const fetch = require('node-fetch');

async function testUserRegistrationAPI() {
    const baseUrl = 'http://localhost:8080';
    
    // 고유한 테스트 사용자 생성
    const timestamp = Date.now();
    const testUser = {
        username: `testuser${timestamp}`,
        email: `testuser${timestamp}@example.com`,
        name: `Test User ${timestamp}`,
        password: 'testpass123'
    };

    console.log('🧪 API Test: User Registration & Login');
    console.log(`사용자: ${testUser.username}`);

    try {
        // Step 1: 새 사용자 등록
        console.log('\n📝 Step 1: 사용자 등록');
        const registerResponse = await fetch(`${baseUrl}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testUser)
        });

        const registerResult = await registerResponse.text();
        console.log('등록 응답 상태:', registerResponse.status);
        console.log('등록 응답:', registerResult);

        if (registerResponse.status !== 201) {
            throw new Error(`사용자 등록 실패: ${registerResponse.status} - ${registerResult}`);
        }

        console.log('✅ 사용자 등록 성공');

        // Step 2: 새 사용자로 로그인
        console.log('\n🔑 Step 2: 로그인 시도');
        const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: testUser.username,
                password: testUser.password
            })
        });

        console.log('로그인 응답 상태:', loginResponse.status);
        
        if (loginResponse.status === 200) {
            const loginResult = await loginResponse.json();
            console.log('✅ 로그인 성공');
            console.log('Access Token 존재:', !!loginResult.accessToken);
            console.log('Refresh Token 존재:', !!loginResult.refreshToken);
            
            // Step 3: 토큰으로 API 호출 테스트
            console.log('\n🌐 Step 3: API 접근 권한 테스트');
            const projectResponse = await fetch(`${baseUrl}/api/projects`, {
                headers: {
                    'Authorization': `Bearer ${loginResult.accessToken}`
                }
            });

            console.log('프로젝트 API 응답 상태:', projectResponse.status);
            
            if (projectResponse.status === 200) {
                console.log('✅ TESTER 역할로 프로젝트 API 접근 성공');
                const projects = await projectResponse.json();
                console.log('프로젝트 개수:', projects.length);
            } else {
                console.log('❌ 프로젝트 API 접근 실패');
                const errorText = await projectResponse.text();
                console.log('오류 응답:', errorText);
            }

        } else {
            const loginError = await loginResponse.text();
            console.log('❌ 로그인 실패');
            console.log('로그인 오류:', loginError);
            throw new Error(`로그인 실패: ${loginResponse.status} - ${loginError}`);
        }

        return {
            success: true,
            message: 'TESTER 역할 사용자 등록 및 로그인 성공',
            testUser: testUser
        };

    } catch (error) {
        console.error('\n💥 테스트 실패:', error.message);
        return {
            success: false,
            error: error.message,
            testUser: testUser
        };
    }
}

// 테스트 실행
if (require.main === module) {
    testUserRegistrationAPI()
        .then(result => {
            console.log('\n📊 최종 결과:', result);
            process.exit(result.success ? 0 : 1);
        })
        .catch(error => {
            console.error('테스트 실행 오류:', error);
            process.exit(1);
        });
}

module.exports = testUserRegistrationAPI;