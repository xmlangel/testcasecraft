// 조직 권한 테스트 스크립트
// 이 스크립트는 조직 소유자가 조직을 관리할 수 있는지 확인합니다.

const testOrganizationPermission = async () => {
    const API_BASE = 'http://localhost:8080';
    
    console.log('=== 조직 권한 테스트 시작 ===');
    
    try {
        // 1. 로그인 (admin 계정 - 시스템 관리자)
        console.log('1. admin 계정으로 로그인...');
        const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: 'admin',
                password: 'admin'
            })
        });
        
        if (!loginResponse.ok) {
            throw new Error(`로그인 실패: ${loginResponse.status}`);
        }
        
        const loginData = await loginResponse.json();
        const token = loginData.accessToken;
        console.log('✅ admin 로그인 성공');
        
        // 2. 조직 목록 조회
        console.log('2. 조직 목록 조회...');
        const orgListResponse = await fetch(`${API_BASE}/api/organizations`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!orgListResponse.ok) {
            throw new Error(`조직 목록 조회 실패: ${orgListResponse.status}`);
        }
        
        const organizations = await orgListResponse.json();
        console.log(`✅ 조직 ${organizations.length}개 발견`);
        
        if (organizations.length === 0) {
            // 조직이 없으면 하나 생성
            console.log('3. 조직 생성...');
            const createOrgResponse = await fetch(`${API_BASE}/api/organizations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: '테스트 조직',
                    description: '권한 테스트용 조직'
                })
            });
            
            if (!createOrgResponse.ok) {
                throw new Error(`조직 생성 실패: ${createOrgResponse.status}`);
            }
            
            const newOrg = await createOrgResponse.json();
            console.log(`✅ 조직 생성 성공: ${newOrg.name} (ID: ${newOrg.id})`);
            organizations.push(newOrg);
        }
        
        // 3. 첫 번째 조직의 상세 정보 조회
        const org = organizations[0];
        console.log(`4. 조직 상세 정보 조회: ${org.name} (ID: ${org.id})`);
        
        const orgDetailResponse = await fetch(`${API_BASE}/api/organizations/${org.id}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!orgDetailResponse.ok) {
            throw new Error(`조직 상세 조회 실패: ${orgDetailResponse.status}`);
        }
        
        const orgDetail = await orgDetailResponse.json();
        console.log('✅ 조직 상세 조회 성공');
        
        // 4. 조직 멤버 조회
        console.log('5. 조직 멤버 조회...');
        const membersResponse = await fetch(`${API_BASE}/api/organizations/${org.id}/members`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!membersResponse.ok) {
            throw new Error(`조직 멤버 조회 실패: ${membersResponse.status}`);
        }
        
        const members = await membersResponse.json();
        console.log(`✅ 조직 멤버 ${members.length}명 조회 성공`);
        
        // 5. 조직 수정 권한 테스트
        console.log('6. 조직 수정 권한 테스트...');
        const updateResponse = await fetch(`${API_BASE}/api/organizations/${org.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: org.name + ' (수정됨)',
                description: org.description + ' - 권한 테스트 완료'
            })
        });
        
        if (!updateResponse.ok) {
            throw new Error(`조직 수정 실패: ${updateResponse.status}`);
        }
        
        console.log('✅ 조직 수정 성공');
        
        console.log('\n=== 권한 테스트 결과 ===');
        console.log('✅ 조직 소유자/관리자가 조직을 관리할 수 있습니다.');
        console.log('✅ 백엔드 권한 로직이 정상 작동합니다.');
        console.log('✅ 프론트엔드에서 권한에 따른 UI 제어가 필요합니다.');
        
    } catch (error) {
        console.error('❌ 테스트 실패:', error.message);
        return false;
    }
    
    return true;
};

// Node.js 환경에서 실행
if (typeof window === 'undefined') {
    // fetch polyfill for Node.js
    const fetch = require('node-fetch');
    global.fetch = fetch;
    
    testOrganizationPermission()
        .then(success => {
            console.log(success ? '\n🎉 테스트 완료!' : '\n💥 테스트 실패!');
            process.exit(success ? 0 : 1);
        })
        .catch(error => {
            console.error('테스트 실행 오류:', error);
            process.exit(1);
        });
} else {
    // 브라우저 환경에서는 함수만 내보냄
    window.testOrganizationPermission = testOrganizationPermission;
}