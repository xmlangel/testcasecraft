E2E 테스트를 수행하는 방법은 다음과 같습니다. GEMINI.md의 3.3. E2E Testing (Playwright) 섹션을 기반으로 합니다.

⚠️ 전제 조건: 백엔드 재시작
   H2 인메모리 데이터베이스를 사용하므로, 테스트를 실행하기 전에 반드시 백엔드를 재시작하여 깨끗한 상태를 보장해야 합니다.

# 1. 기존 백엔드 프로세스 종료
```
pkill -f "bootRun"
```

# 2. Java 21 환경 설정 후 백엔드 재시작
```
export JAVA_HOME=/Users/dicky/Library/Java/JavaVirtualMachines/corretto-21.0.7/Contents/Home
SPRING_PROFILES_ACTIVE=local ./gradlew bootRun > app.log 2>&1 &
```
# 3. 백엔드가 완전히 시작될 때까지 대기 (약 20-25초 소요)
```
sleep 25
```

🚀 E2E 테스트 실행
  프로젝트 루트 디렉토리에서 다음 명령어를 실행하여 방금 생성한 회귀 테스트를 실행합니다.

# 프로젝트 루트 디렉토리로 이동 (현재 위치가 아니라면)
```
cd /Users/dicky/kmdata/git/testcase/test-case-manager-only-front-local-storage
e2e-tests/regression 디렉토리의 모든 테스트 실행
```

```
npx playwright test e2e-tests/regression/ --reporter=html
```

2. 📊 테스트 리포트 확인
   테스트 실행이 완료되면 다음 명령어를 사용하여 HTML 리포트를 확인할 수 있습니다.

```
npx playwright show-report
```

이 명령어를 실행하면 웹 브라우저에서 테스트 결과 리포트가 자동으로 열립니다.