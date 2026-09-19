# 외부 QA 에이전트 연동

작성: 2026-09-09 01:10 KST

자연어로 쓴 테스트 케이스를 LLM 이 읽고 브라우저를 조작해 수행하는 에이전트를
제품에 붙이는 절차입니다. 에이전트는 **제품 밖에서 도는 별도 스택**이고, 제품의
공개 API 로 결과만 올립니다. 이 컨테이너가 없어도 제품은 그대로 돕니다.

## 켜는 순서

세 층이 모두 켜져야 에이전트를 쓸 수 있습니다.

| 층 | 어디에 | 기본 | 누가 바꾸나 |
|---|---|---|---|
| 전역 스위치 | 환경변수 `AGENT_INTEGRATION_ENABLED` | 켜짐 | 배포 담당 |
| 프로젝트 사용 | DB (프로젝트 설정 화면) | **꺼짐** | 프로젝트 관리자 |
| 에이전트 컨테이너 | 별도 스택 | 없음 | 배포 담당 |

전역 스위치를 끄면 프로젝트 설정에 탭이 뜨지 않고 관련 API 가 404 를 냅니다. 조직
차원에서 기능을 막을 때만 끕니다.

## 1. 에이전트를 띄운다

같은 `docker-compose.yml` 에 서비스를 하나 더합니다.

```yaml
  agent:
    image: xmlangel/testcasecraft-agent:${AGENT_IMAGE_TAG:-0.1.0}
    container_name: testcasecraft-agent
    restart: unless-stopped
    environment:
      AGENT_ENGINE: browser-use
      AGENT_BIND_ADDR: 0.0.0.0
      AGENT_PORT: 8090
      AGENT_STORE_PATH: /data/store/agent.db
      AGENT_PROFILE_DIR: /data/profiles
      AGENT_API_TOKEN: ${AGENT_API_TOKEN}
      AGENT_SECRET_KEY: ${AGENT_SECRET_KEY}
      TCC_BASE_URL: ${AGENT_TMS_BASE_URL:-http://app:8080}
      TCC_USERNAME: ${AGENT_TMS_USERNAME}
      TCC_PASSWORD: ${AGENT_TMS_PASSWORD}
      CODEX_HOME: /home/agent/.codex
    ports:
      - "${AGENT_EXPOSE_ADDR:-127.0.0.1}:${AGENT_PORT:-8090}:8090"
    volumes:
      - ./agent-data:/data
      - ${AGENT_CODEX_HOME:-/home/사용자/.codex}:/home/agent/.codex
    networks:
      - testcasecraft-network
    shm_size: "1gb"
    security_opt:
      - seccomp=unconfined
```

`.env` 에 넣을 값입니다.

```bash
AGENT_API_TOKEN=<길고 임의의 문자열>
AGENT_SECRET_KEY=<아래 명령으로 생성>
AGENT_TMS_USERNAME=qa-agent
AGENT_TMS_PASSWORD=<그 계정 비밀번호>
```

```bash
python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

데이터 폴더에는 컨테이너 안의 `agent` 사용자(uid 10001)가 기록합니다. 소유를 맞추지
않으면 `PermissionError: /data/store` 로 재시작을 반복합니다.

```bash
mkdir -p agent-data && sudo chown -R 10001:10001 agent-data
```

## 2. 봇 계정을 만든다

에이전트는 이 계정으로 제품에 로그인해 케이스를 읽고 결과를 올립니다.
`admin` 을 그대로 써도 되지만, 결과에 그 이름이 남고 권한이 전부 열립니다.
전용 계정을 만들어 필요한 프로젝트에만 넣는 편이 낫습니다.

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"username":"qa-agent","password":"<비밀번호>",
       "email":"qa-agent@example.com","name":"QA Agent"}'
```

그다음 대상 프로젝트에 **CONTRIBUTOR 이상**으로 넣습니다. 프로젝트 설정의 멤버
화면에서 추가합니다. `TESTER` 는 결과 기록만 되고 실행 생성이 막혀
`권한 없음 (403)` 이 납니다.

## 3. 프로젝트 설정에서 연결한다

프로젝트 설정 → 「에이전트 연동」 탭입니다.

| 칸 | 무엇을 넣나 |
|---|---|
| 에이전트 주소 | 제품 **서버**가 부를 주소 |
| 브라우저용 주소 | 실행 단추가 열 주소. 사람이 여는 주소입니다 |
| 인증 토큰 | 에이전트 `.env` 의 `AGENT_API_TOKEN` 과 같은 값 |
| 기본 프로필 | 에이전트에 등록한 프로필 이름 |

「연결 테스트」가 통과해야 자동화 화면에 에이전트 항목이 나타납니다.

## 주소를 어떻게 정하나

이 두 칸에서 가장 많이 틀립니다. **서로 다른 곳에서 보는 주소**이기 때문입니다.

| 무엇 | 누가 부르나 | 값 |
|---|---|---|
| 에이전트 주소 | 제품 **서버**(컨테이너 안) | 같은 compose 면 `http://agent:8090` |
| 브라우저용 주소 | 사람의 **브라우저** | `http://localhost:8090` 처럼 사람이 열 수 있는 주소 |

`localhost` 는 부르는 쪽 자신을 가리킵니다. 제품도 컨테이너이므로 에이전트 주소에
`localhost:8090` 을 넣으면 제품이 자기 자신을 부릅니다.

`host.docker.internal` 은 **맥·윈도우의 도커 데스크톱에서만** 풀립니다. 리눅스
서버에서는 이름이 없어 `연결할 수 없습니다` 가 납니다. 리눅스에서 제품이 도커
밖에 있으면 호스트 IP 를 넣습니다.

에이전트가 제품을 부르는 주소(`TCC_BASE_URL`)도 같은 이야기입니다. 컨테이너
안에서 보는 값이라 `localhost:8080` 은 에이전트 자기 자신입니다.

| 배치 | 에이전트 주소 | `TCC_BASE_URL` |
|---|---|---|
| 둘 다 같은 compose | `http://agent:8090` | `http://app:8080` |
| 제품이 도커 밖 · 맥/윈도우 | `http://host.docker.internal:8090` | `http://host.docker.internal:8080` |
| 제품이 도커 밖 · 리눅스 | 호스트 IP | 호스트 IP |

## 브라우저용 주소의 함정

에이전트를 `127.0.0.1:8090` 으로 열어 두면 **그 기계 안에서만** 보입니다. 원격
서버에 띄우고 브라우저용 주소를 `http://localhost:8090` 으로 두면, 실행 단추가
보는 사람의 컴퓨터를 가리킵니다. 그 자리에 다른 에이전트가 떠 있으면 엉뚱한
쪽으로 요청이 갑니다. 없는 프로젝트를 물어 `403` 이 납니다.

밖에서 열려면 아래 두 방법 가운데 하나를 고릅니다.

- `.env` 에 `AGENT_EXPOSE_ADDR=0.0.0.0` 을 넣고 브라우저용 주소에 그 기계 주소를 넣습니다.
  8090 이 그대로 열리므로 방화벽·터널을 함께 봅니다
- 브라우저용 주소를 비우고 SSH 터널로 엽니다.
  `ssh -L 8090:127.0.0.1:8090 <서버>`

## 4. LLM 을 정한다

기본은 codex CLI 이고 ChatGPT 계정으로 붙습니다. 그 서버에서 한 번 로그인하면
`~/.codex` 에 자격이 생기고 컨테이너가 그 파일을 읽습니다.

```bash
codex login
```

**이 자격은 호스트와 공유합니다.** 에이전트 화면에서 로그아웃하면 그 서버 터미널의
codex 도 함께 로그아웃됩니다.

Ollama 나 OpenAI 호환 주소를 쓰려면 에이전트 설정 화면에서 프로필의 LLM 을 바꾸고,
compose 의 `~/.codex` 마운트를 지웁니다.

## 결과가 어디에 남나

에이전트가 올린 결과는 자동화 테스트 결과로 들어갑니다. 사람이 만든 실행과 섞이지
않게 실행명에 `[AI]` 가 붙고, 태그가 `ai-agent` 이며, 총평 첫 줄에 초안이라고
적힙니다. 실패한 케이스에는 마지막 화면 세 장이 첨부됩니다.

**판정은 초안입니다.** 같은 케이스를 다시 돌려도 행동이 조금씩 달라지므로 확정은
사람이 합니다.

## 막혔을 때

| 증상 | 원인 |
|---|---|
| `연결할 수 없습니다` | 에이전트 주소가 제품 서버에서 풀리지 않습니다. 리눅스에서 `host.docker.internal` 을 넣은 경우가 흔합니다 |
| `권한 없음 (403)` | 봇 계정이 그 프로젝트의 CONTRIBUTOR 미만이거나, 요청한 프로젝트가 그 제품에 없습니다 |
| `제품에 접속할 수 없다 (Connection refused)` | `TCC_BASE_URL` 이 컨테이너 안에서 풀리지 않습니다. `localhost` 를 넣은 경우가 흔합니다 |
| `PermissionError: /data/store` | 데이터 폴더 소유가 uid 10001 이 아닙니다 |
| `codex CLI 가 설치되지 않았다` | 옛 이미지입니다. `0.1.0` 이상으로 올립니다 |
| 실행 화면이 계속 막힌다 | 프로필이 없거나 codex 로그인이 없습니다 |

에이전트 쪽 로그는 `docker logs testcasecraft-agent`, 실행별 상세는 에이전트 화면의
「시스템 로그」에 남습니다.
