# 탐색 세션 상태 다이어그램 (Exploratory Session Status Diagram)

탐색 세션(Exploratory Session)의 생명주기와 각 상태 간의 전이 과정을 나타낸 다이어그램입니다.

```mermaid
stateDiagram-v2
    [*] --> DRAFT : 세션 생성

    state "작성 중 (DRAFT)" as DRAFT
    state "수행 중 (RUNNING)" as RUNNING
    state "일시 정지 (PAUSED)" as PAUSED
    state "수행 완료 (COMPLETED)" as COMPLETED
    state "제출됨 (SUBMITTED)" as SUBMITTED
    state "보완 필요 (NEEDS_UPDATE)" as NEEDS_UPDATE
    state "승인됨 (APPROVED)" as APPROVED
    state "보관됨 (ARCHIVED)" as ARCHIVED

    DRAFT --> RUNNING : 타이머 시작 (Start)
    DRAFT --> ARCHIVED : 삭제/보관 (Archive)
    
    RUNNING --> PAUSED : 타이머 일시정지 (Pause)
    PAUSED --> RUNNING : 타이머 재개 (Resume)
    
    RUNNING --> COMPLETED : 타이머 종료 (End)
    PAUSED --> COMPLETED : 타이머 종료 (End)
    
    COMPLETED --> SUBMITTED : 디브리프 제출 (Submit)
    
    SUBMITTED --> APPROVED : 리드 승인 (Approve)
    SUBMITTED --> NEEDS_UPDATE : 수정 요청 (Request Changes)
    
    NEEDS_UPDATE --> SUBMITTED : 재제출 (Resubmit)
    
    APPROVED --> ARCHIVED : 아카이브 (Archive)
    
    ARCHIVED --> [*]

    note right of RUNNING
        실제 테스트 수행 중인 상태
    end note

    note right of SUBMITTED
        테스터가 작성을 마치고
        리뷰를 기다리는 상태
    end note
```

## 상태 정의 설명

| 상태 | 설명 |
| :--- | :--- |
| **작성 중 (DRAFT)** | 세션이 생성되었으나 아직 테스트 수행이 시작되지 않은 상태입니다. |
| **수행 중 (RUNNING)** | 테스터가 실제 테스트를 수행 중이며 타이머가 작동하고 있는 상태입니다. |
| **일시 정지 (PAUSED)** | 테스트 수행 중 잠시 중단된 상태입니다. (회의, 식사 등) |
| **수행 완료 (COMPLETED)** | 테스트 수행이 종료되어 타이머가 멈춘 상태입니다. 디브리프 내용을 정리할 수 있습니다. |
| **제출됨 (SUBMITTED)** | 테스터가 모든 기록을 마치고 리드(Lead)에게 승인을 요청한 상태입니다. |
| **보완 필요 (NEEDS_UPDATE)** | 리드가 검토 후 내용 보완이나 추가 조사를 요청한 상태입니다. |
| **승인됨 (APPROVED)** | 리드가 세션의 결과와 디브리프 내용을 최종 승인한 상태입니다. |
| **보관됨 (ARCHIVED)** | 모든 프로세스가 완료되어 보관 처리된 상태입니다. |
