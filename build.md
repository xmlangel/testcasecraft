# 개발환경
pkill -f "java.*testcasemanagement" || true
lsof -ti:8080 | xargs kill -9 2>/dev/null || true)


# h2 데이터베이스를 사용한 개발환경을 실행합니다.
./gradlew clean build -x test
export SPRING_PROFILES_ACTIVE=dev && ./gradlew bootRun > app-h2.log 2>&1 &

# postgresql 데이터베이스를 사용한 개발환경을 실행합니다.
./gradlew clean build -x test
export SPRING_PROFILES_ACTIVE=dev-postgresql && ./gradlew bootRun --args="--spring.profiles.active=dev-postgresql" > app-dev.log 2>&1 &)