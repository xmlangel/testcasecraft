#!/bin/bash
# scripts/deploy-options.sh
# 배포 옵션 선택 스크립트

set -e

# 색상 코드
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║                    배포 옵션 선택                              ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}배포 방식을 선택하세요:${NC}"
echo ""
echo -e "${GREEN}1) 🚀 빠른 재배포${NC} (권장)"
echo -e "   ${YELLOW}• 빌드 없음, 기존 이미지 사용${NC}"
echo -e "   ${YELLOW}• 롤링/완전 재시작 선택 가능${NC}"
echo -e "   ${YELLOW}• 소요시간: 30초~2분${NC}"
echo ""

echo -e "${GREEN}2) 🔨 전체 빌드 배포${NC}"
echo -e "   ${YELLOW}• 소스코드 변경 시 필요${NC}"
echo -e "   ${YELLOW}• 프론트엔드 + 백엔드 재빌드${NC}"
echo -e "   ${YELLOW}• 소요시간: 5~10분${NC}"
echo ""

echo -e "${GREEN}3) 🌐 HTTPS 전체 배포${NC}"
echo -e "   ${YELLOW}• 최초 배포 또는 SSL 갱신${NC}"
echo -e "   ${YELLOW}• Let's Encrypt 인증서 발급${NC}"
echo -e "   ${YELLOW}• 소요시간: 10~15분${NC}"
echo ""

echo -e "${GREEN}4) 🧪 개발환경 시작${NC}"
echo -e "   ${YELLOW}• H2 데이터베이스 사용${NC}"
echo -e "   ${YELLOW}• 개발/테스트 목적${NC}"
echo -e "   ${YELLOW}• 소요시간: 1~2분${NC}"
echo ""

echo -e "${GREEN}5) 📊 현재 상태 확인${NC}"
echo -e "   ${YELLOW}• 컨테이너 상태 및 로그 확인${NC}"
echo -e "   ${YELLOW}• 헬스 체크 및 테스트${NC}"
echo ""

echo -e "${RED}6) 🛑 서비스 중지${NC}"
echo ""

read -p "선택하세요 (1-6): " -n 1 -r
echo ""
echo ""

case $REPLY in
    1)
        echo -e "${BLUE}🚀 빠른 재배포를 시작합니다...${NC}"
        ./scripts/deploy-quick.sh
        ;;
    2)
        echo -e "${BLUE}🔨 전체 빌드 배포를 시작합니다...${NC}"
        echo -e "${YELLOW}주의: 이 작업은 5-10분 소요됩니다.${NC}"
        read -p "계속하시겠습니까? (y/N): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            ./deploy-http.sh
        else
            echo "작업을 취소했습니다."
        fi
        ;;
    3)
        echo -e "${BLUE}🌐 HTTPS 전체 배포를 시작합니다...${NC}"
        echo -e "${YELLOW}주의: 이 작업은 10-15분 소요됩니다.${NC}"
        echo -e "${YELLOW}도메인 DNS 설정이 완료되어야 합니다.${NC}"
        read -p "계속하시겠습니까? (y/N): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            ./deploy-https.sh
        else
            echo "작업을 취소했습니다."
        fi
        ;;
    4)
        echo -e "${BLUE}🧪 개발환경을 시작합니다...${NC}"
        ./start-dev.sh
        ;;
    5)
        echo -e "${BLUE}📊 현재 상태를 확인합니다...${NC}"
        
        echo ""
        echo -e "${CYAN}=== 컨테이너 상태 ===${NC}"
        docker-compose -f docker-compose.yml ps 2>/dev/null || echo "운영 컨테이너가 실행되지 않았습니다."
        
        echo ""
        echo -e "${CYAN}=== 헬스 체크 ===${NC}"
        
        # HTTP 헬스 체크
        if curl -f http://localhost/actuator/health >/dev/null 2>&1; then
            echo -e "${GREEN}✅ HTTP 서비스 정상${NC}"
        else
            echo -e "${RED}❌ HTTP 서비스 응답 없음${NC}"
        fi
        
        # 개발환경 헬스 체크
        if curl -f http://localhost:8080/actuator/health >/dev/null 2>&1; then
            echo -e "${GREEN}✅ 개발환경 서비스 정상${NC}"
        else
            echo -e "${YELLOW}⚠️ 개발환경 서비스 응답 없음${NC}"
        fi
        
        echo ""
        echo -e "${CYAN}=== 유용한 명령어 ===${NC}"
        echo "로그 확인: docker-compose -f docker-compose.prod.yml logs -f app"
        echo "개발환경 로그: ./gradlew bootRun"
        echo "JUnit 업로드 테스트: ./scripts/test-upload-setup.sh"
        ;;
    6)
        echo -e "${BLUE}🛑 서비스를 중지합니다...${NC}"
        
        echo "중지할 서비스를 선택하세요:"
        echo "1) 운영환경 서비스"
        echo "2) 개발환경 서비스"
        echo "3) 모든 서비스"
        read -p "선택 (1-3): " -n 1 -r
        echo ""
        
        case $REPLY in
            1)
                docker-compose -f docker-compose.yml down
                echo -e "${GREEN}운영환경 서비스가 중지되었습니다.${NC}"
                ;;
            2)
                pkill -f "gradle.*bootRun" 2>/dev/null || true
                pkill -f "java.*testcasemanagement" 2>/dev/null || true
                echo -e "${GREEN}개발환경 서비스가 중지되었습니다.${NC}"
                ;;
            3)
                docker-compose -f docker-compose.yml down
                pkill -f "gradle.*bootRun" 2>/dev/null || true
                pkill -f "java.*testcasemanagement" 2>/dev/null || true
                echo -e "${GREEN}모든 서비스가 중지되었습니다.${NC}"
                ;;
            *)
                echo "잘못된 선택입니다."
                ;;
        esac
        ;;
    *)
        echo -e "${RED}잘못된 선택입니다.${NC}"
        exit 1
        ;;
esac