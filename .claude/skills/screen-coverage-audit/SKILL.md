---
name: screen-coverage-audit
description: testcasecraft의 코드·실제 화면·사용자 매뉴얼·화면 기획 문서 4자를 대조해 누락을 찾는 오케스트레이터. 코드가 가진 라우트·영역·화면을 분모로 삼아, 그것이 기획 문서(docs/screen_spec)와 매뉴얼(docs/manual/new)과 캡처에 모두 있는지 검사하고, 실행 중인 앱을 Playwright로 돌며 화면이 열리는지와 화면 ID 배지가 문서와 맞는지 실측한다. 트리거 — "화면 커버리지 검증", "누락된 게 없는지 검증", "코드에 있는 것이 문서에 다 있나", "기획문서·매뉴얼·캡처 대조", "화면 감사", "화면 ID 배지 실측", "캡처 누락 확인", "커버리지 매트릭스", "감사 다시 실행", "재감사", "갭 리포트 갱신", "매뉴얼과 기획문서 차이", "문서화 안 된 라우트 찾아줘" 요청 시 반드시 이 스킬을 사용하라. 캡처를 새로 찍는 것은 `manual-capture`, 매뉴얼 본문 수정은 `manual-sync`, 기획 문서 자체의 규격 검사는 `docs/screen_spec/validate.py` 가 맡는다.
---

# 화면 커버리지 감사

코드가 가진 화면이 문서와 캡처에 빠짐없이 있는지, 문서가 말하는 화면이 실제로 그렇게 동작하는지 대조한다.

## 왜 4자인가

화면 하나가 온전히 관리되려면 네 곳에 있어야 한다.

| 축 | 무엇을 담는가 | 어디에 |
|---|---|---|
| **코드** | 라우트·영역·화면 컴포넌트 | `src/main/frontend/src/` |
| **기획 문서** | 영역·요건·상태·권한 | `docs/screen_spec/` |
| **매뉴얼** | 사용 절차·캡처 | `docs/manual/new/` |
| **실제 화면** | 열리는지·화면 ID가 맞는지 | 실행 중인 앱 |

한 축에만 있으면 드리프트가 시작된다. 코드에 라우트를 넣고 문서를 안 고치면 기획이 낡고, 문서에만 있으면 없는 기능을 약속한 셈이 된다.

**분모는 코드다.** 코드에 있는 것이 나머지 세 곳에 없으면 누락으로 본다. 반대로 문서에만 있는 것은 낡은 서술이거나 아직 안 만든 약속이다.

## 실행

```bash
# 전체 (앱이 떠 있으면 실측까지)
python3 .claude/skills/screen-coverage-audit/scripts/audit.py all

# 축별로
python3 .claude/skills/screen-coverage-audit/scripts/audit.py code     # 분모
python3 .claude/skills/screen-coverage-audit/scripts/audit.py spec
python3 .claude/skills/screen-coverage-audit/scripts/audit.py manual
python3 .claude/skills/screen-coverage-audit/scripts/audit.py app      # 앱 필요
python3 .claude/skills/screen-coverage-audit/scripts/audit.py matrix   # 대조·리포트
```

앱 주소·계정은 환경 변수로 바꾼다.

```bash
SCA_BASE=http://localhost:8080 SCA_USER=admin SCA_PASS=admin123 \
  python3 .claude/skills/screen-coverage-audit/scripts/audit.py all
```

산출물은 `.workspace/screen-coverage-audit/` 에 남는다. `REPORT.md` 가 사람이 읽는 결과이고, `04_matrix.json` 이 에이전트가 판정에 쓰는 원자료다.

## 워크플로

### Phase 0 — 컨텍스트 확인

`.workspace/screen-coverage-audit/` 가 있으면 이전 감사가 있다. 사용자 요청에 따라 갈린다.

| 상황 | 실행 |
|---|---|
| 처음 | `audit.py all` |
| 문서를 고친 뒤 다시 | `audit.py spec` + `matrix` (코드·매뉴얼·실측 재수집 생략) |
| 코드를 고친 뒤 다시 | `audit.py code` + `matrix` |
| 앱 동작만 다시 | `audit.py app` + `matrix` |
| 전부 다시 | `audit.py all` |

이전 리포트는 덮어쓴다. 비교가 필요하면 먼저 `REPORT.md` 를 다른 이름으로 옮긴다.

### Phase 1 — 수집

`audit.py` 가 결정적으로 모은다. 이 단계에 에이전트를 쓰지 않는다 — 세는 일에 판단이 끼면 매번 숫자가 달라진다.

앱이 안 떠 있으면 실측을 건너뛰고 문서 축만 대조한다. 리포트에 `미실측` 으로 남는다.

### Phase 2 — 판정 (에이전트)

리포트의 갭은 **사실**이지 결함 판정이 아니다. 둘을 가르는 것이 이 단계다. 두 에이전트를 병렬로 띄운다.

| 에이전트 | 보는 것 |
|---|---|
| `screen-coverage-auditor` | 문서 축 — 코드에 있는데 문서·캡처에 없는 것이 진짜 누락인지, 의도된 미문서화인지 |
| `screen-behavior-prober` | 실측 축 — 열리지 않는 화면·배지 불일치·콘솔 오류의 원인이 제품인지 실측 방법인지 |

둘의 판정을 메인이 합쳐 조치 목록으로 만든다.

### Phase 3 — 조치

판정 결과를 종류별로 다른 곳에 반영한다.

| 판정 | 조치 |
|---|---|
| 기획 문서 누락 | 해당 화면 폴더 4문서를 고치고 `validate.py` 통과 확인 |
| 매뉴얼 누락 | `manual-sync` 로 본문, `manual-capture` 로 캡처 |
| 캡처 누락 | `manual-capture` 로 찍고 02 문서 머리말 캡처 목록에 추가 |
| 화면 ID 규칙 누락 | `constants/screenIds.js` 규칙 추가 + 단위 테스트 |
| 제품 결함 | 04 문서의 정정 대상에 기록하고 별도 수정 |
| 의도된 미문서화 | 이 스킬의 아래 판정 기준에 사유를 남긴다 |

## 판정 기준

되풀이해서 올라오는 갭은 여기에 판정을 적어 둔다. 같은 것을 매번 다시 판단하지 않기 위해서다.

| 갭 | 판정 | 사유 |
|---|---|---|
| 코드 라우트가 매뉴얼에 없다 | **보완 대상** | 매뉴얼 16-4절 「화면 주소 모음」에 전 라우트를 담기로 정했다. 짧은 별칭·경유 주소도 함께 적는다 |
| 매뉴얼의 자리표시자가 한글이다 | 정정 | `{문서이름}` 처럼 쓰면 코드의 `:guideName` 과 대조되지 않는다. `{guideName}` 형태로 적는다 |
| `/projects/{projectId}` 에서 배지가 S3 로 뜬다 | 정상 | 그 주소는 공통 레이아웃이 담는 자리이고 담긴 화면은 대시보드다 |
| `_full` 접미사 캡처가 어디에도 안 쓰인다 | 정상 | 전체 페이지 캡처는 보관용이다 |
| 구버전 접미사(`_v2`) 캡처가 안 쓰인다 | 정리 대상 | 새 캡처로 갈린 흔적이다. 지울지는 매뉴얼 담당이 정한다 |

## 함정

**로그아웃 상태에서만 제 모습이 나오는 화면이 있다.** 로그인한 채로 `/login` 을 열면 프로젝트 목록으로 넘어가 배지가 S1 로 뜬다. 실측기는 그런 라우트를 새 컨텍스트에서 따로 본다. 새 라우트를 그 목록에 넣어야 할지 확인한다.

**프로젝트 ID가 필요한 라우트는 실측기가 프로젝트 목록에서 하나를 집어 쓴다.** 프로젝트가 하나도 없는 환경에서는 그 라우트가 전부 건너뛰어진다. `shopflow-seed` 로 데모 데이터를 넣고 다시 돌린다.

**기획 문서의 라우트 줄이 축약형이면 코드와 안 맞는다.** `/testplans/new` 처럼 앞의 `/projects/{projectId}` 를 뺀 표기는 코드 축 대조에서 누락으로 잡힌다. 라우트는 전체 경로로 적는다.

**영역 표의 라벨 형태가 제각각이면 영역 수가 적게 잡힌다.** 수집기는 `A` · `A-1` · `좌측` · `영역 1` 형태를 읽는다. 다른 형태를 쓰면 수집기를 함께 고친다.

## 연계

| 스킬 | 관계 |
|---|---|
| `docs/screen_spec/validate.py` | 기획 문서 자체의 규격(머리말·표·링크·금지 항목)을 본다. 이 스킬은 문서 밖과의 대조를 본다 |
| `manual-capture` | 캡처를 찍고 매뉴얼 기준 라우트 커버리지를 본다. 이 스킬은 기획 문서 축을 더한다 |
| `manual-sync` | 매뉴얼 본문 수정 |
| `shopflow-seed` | 실측에 쓸 데모 데이터 |
| `docs/screen_spec/build_html.py` | 문서를 고친 뒤 HTML 뷰어 재생성 |

## 테스트 시나리오

**정상 흐름** — 앱을 띄우고 `audit.py all` 을 돌린다. 화면 12개 행이 나오고, 갭 목록과 캡처·라우트 절이 채워진다. 갭마다 두 에이전트가 판정을 붙이고, 진짜 누락만 조치 목록에 남는다.

**앱이 없을 때** — `audit.py all` 이 실측에서 실패하고 `03_app.json` 에 오류가 남는다. 리포트의 실측 열이 전부 `미실측` 이 되고 문서 축 대조는 정상으로 나온다. 이때 배지·화면 열림 갭이 0건인 것을 통과로 읽지 않는다.
