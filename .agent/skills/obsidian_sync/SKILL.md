# Obsidian Sync Skill (obsidian_sync)

이 스킬은 현재 프로젝트의 주요 작업 산출물을 작업 단위별 전용 폴더(`docs/obsidian/[날짜]-[작업명]`)로 모아 Obsidian Vault에서 체계적으로 관리합니다.

## Metadata

- **Name**: obsidian_sync
- **Description**: 작업 단위 전용 폴더 내에 YAML 메타데이터를 포함한 아티팩트들을 동기화합니다.
- **Target Directory**: `docs/obsidian`

## 사용 방법 (Usage)

사용자가 "Obsidian 동기화해줘" 또는 "작업 내용을 전용 폴더에 남겨줘"와 같이 요청할 때 이 스킬을 활성화합니다.

### 수행 절차 (Execution Steps)

1.  **작업 폴더 생성**: 현재 작업의 날짜, 시간 및 주제를 조합하여 폴더를 생성합니다.
    - 폴더명 규칙: `YYYY-MM-DD-HHMM-작업명` (예: `2026-04-07-0948-obsidian_sync_upgrade`)
2.  **아티팩트 식별**: 현재 세션의 `implementation_plan.md`, `walkthrough.md`, `task.md` 및 **`knowledge_note.md`**를 확인합니다.
    - **지식 추출**: 대화 중 오간 중요한 질문, AI의 통찰, 혹은 재사용 가능한 기술적 팁이 있다면 적극적으로 `knowledge_note.md`를 생성하여 포함시킵니다.
    - **원천 연결 (Context Linking)**: 지식 노트 하단 혹은 YAML 메타데이터에 해당 지식이 도출된 원천 작업 폴더(`Docs/Obsidian/[날짜]-[작업명]/`)에 대한 링크를 명시하여 맥락을 파악할 수 있게 합니다.
    - 기본 파일명: `implementation_plan.md`, `task.md`, `walkthrough.md`
    - **지식 노트(`knowledge_note.md`)**: 검색 편의성을 위해 별도 디렉토리에 관리합니다.
      - **저장 경로**: `docs/obsidian/Knowladge/[한글제목].md`
      - **파일명 추출**: YAML 상단의 `title` 필드에 작성된 한글 제목을 파일명으로 사용합니다.
    - **다중 파일 규칙**: 동일 유형의 파일이 여러 개일 경우 접미사(`_v2`, `_특정 주제`)를 붙여 구분합니다.
      - 예: `implementation_plan_api_design.md`
3.  **메타데이터 추가**: 각 문서 상단에 아래 양식의 YAML Frontmatter를 추가합니다.
    ```yaml
    ---
    title: [해당 문서의 구체적 제목]
    date: YYYY-MM-DD
    tags:
      - "project/auto_trading"
      - "topic/[주제1]"
      - "topic/[주제2]"
      - "type/[artifact_type]"
      - "level/[knowledge_depth]"
      - "knowledge" (지식 문서 등 참조 가치가 있는 경우 추가)
    - **source**: "Docs/Obsidian/[날짜]-[작업명]/" (원천 작업 경로)
    ---
    ```
    - **태그 범주 가이드 (4대 핵심 축)**:
      - **Project**: `#project/[프로젝트명]` - 검색 시 프로젝트별 필터링 용이성 확보 (예: `#project/auto_trading`)
      - **Topic**: 기술적/기능적 주제 - 슬래시(`/`)를 활용한 계층 구조(Hierarchy) 반영 (예: `#topic/api/binance`, `#topic/obsidian/sync`)
      - **Type**: 문서 성격 - 문서 유형별 분류 (예: `#type/plan`, `#type/manual`, `#type/troubleshooting`)
      - **Level**: 지식 깊이/상세도 - 지식의 중요도 및 숙성도 표현 (예: `#level/core`, `#level/experiment`, `#level/stable`)
    - **자동 추출 원칙 (Accuracy)**:
      - 현재 대화 맥락과 작업 내용에서 핵심 키워드("태그 시스템", "지식 체계화" 등)를 빠짐없이 추출하여 태그로 변환합니다.
      - 슬래시를 사용한 계층형 태그를 우선적으로 생성하여 Obsidian의 트리 구조 뷰 최적화를 도모합니다.
    - **지식 체계화 공통 태그**:
      - 나중에 다른 작업에서도 참조될 수 있도록 `#knowledge`, `#architecture`, `#refactoring` 등을 적절히 추가합니다.
4.  **저장**:
    - 일반 아티팩트: 생성된 작업 폴더(`Docs/Obsidian/[날짜]-[작업명]`) 내에 저장합니다.
    - 지식 노트: `Docs/Obsidian/Knowladge/` 폴더 내에 `[한글제목].md`로 저장하여 지식 베이스를 구축합니다.
5.  **외부 드라이브 동기화 (Google Drive)**: 로컬 저장 완료 후 전용 스크립트를 실행하여 외부 경로로 신규 파일을 동기화합니다.
    - 실행 명령어: `sh .agent/skills/obsidian_sync/scripts/sync_to_drive.sh`

## 규칙 (Rules)

- **작업명 파악**: 대화 흐름상 가장 핵심적인 작업명을 폴더 이름으로 사용합니다.
- **파일명 간소화**: 폴더로 이미 분류되어 있으므로, 파일명 자체에 날짜와 작업명을 중복 기입하지 않고 유형 중심으로 간결하게 유지합니다.
- **신규 파일 동기화**: 외부 드라이브(Google Drive) 동기화 시에는 `rsync --ignore-existing` 원칙을 준수하여 기존 파일을 덮어쓰지 않고 신규 추가된 작업물만 안전하게 복사합니다.
- **Obsidian 호환성**: 모든 경로는 Obsidian Vault 내에서 링크가 깨지지 않도록 상대 경로 또는 표준 형식을 준수합니다.
- **지식 연결 원칙**: 모든 지식 노트는 최소 하나 이상의 작업 폴더(`[[Docs/Obsidian/폴더명|작업명]]`)와 연결되어야 하며, 이를 통해 실무 적용 사례를 역추적할 수 있어야 합니다.
