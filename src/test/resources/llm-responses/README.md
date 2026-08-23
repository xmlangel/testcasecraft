# 실제 제공자 상항 기록

이 폴더의 JSON 파일은 **실제 API 를 호출해 잡은 상항**입니다. 손으로 쓴 것이 아닙니다.

## 손으로 쓰면 거짓 통지가 생깁니다

손으로 적어 둔 상항은 실제 API 가 바뀌어도 시험이 계속 통지해 거짓 통지를 만듭니다. 이번
작업에서 추측으로는 알 수 없었던 것이 여럿입니다.

| 사실 | 알아낸 방법 |
|---|---|
| NVIDIA `/v1/models` 에 가격 정보가 없다 | 실제 호출 |
| NVIDIA 목록의 3분의 2가 계정에 없어 404 를 낸다 | 실제 호출 |
| 429 에 두 종류가 있다 (`limit_source`) | 실제 호출 |
| 정상 상항 헤더에 한도 정보가 없다 | 실제 호출 |

네 가지 모두 제공자 문서에는 적혀 있지 않아 추측으로는 알 수 없었습니다.

## 갱신 방법

```bash
NVIDIA_API_KEY=nvapi-… OPENROUTER_API_KEY=sk-or-v1-… bash capture.sh
git diff .   # 달라진 부분을 보고 판단한다
```

상항 형태가 바뀌었다고 의심되면 다시 잡고, `git diff` 로 무엇이 달라졌는지 봅니다. 시험이
깨지면 제품을 고칠지 시험을 고칠지 그 diff 를 보고 정합니다.

## 식별자를 가립니다

계정 식별자·사용자 ID·요청 ID 는 `ACCOUNT_ID_REDACTED` 같은 값으로 바꿉니다. `capture.sh`
가 잡은 직후 자동으로 처리합니다. 판정 로직은 상태코드와 `limit_source`·`detail` 문구만 보므로
가려도 시험이 성립합니다.

## 지금 있는 파일

| 파일 | 무엇 |
|---|---|
| `nvidia-chat-200.json` | NVIDIA 정상 채팅 상항 |
| `nvidia-chat-403-auth.json` | NVIDIA 키 거부 (`Authorization failed`) |
| `nvidia-chat-404-account.json` | NVIDIA 계정에 없는 모델 (`Not found for account`) |
| `openrouter-chat-429-account.json` | OpenRouter 계정 일일 한도 소진 (`free_tier_daily`) |

## 아직 없는 것

`openrouter-chat-200.json` 이 없습니다. 잡으려던 시점에 계정 일일 무료 한도가 소진돼
429 만 잡혔습니다. OpenRouter 정상 상항은 NVIDIA 것과 같은 OpenAI 형태이므로 파싱 검집은
`nvidia-chat-200.json` 으로 갈음하고 있습니다. 한도가 초기화된 뒤 `capture.sh` 를 다시
돌리면 채워집니다.

## 이 파일들을 쓰는 시험

| 시험 | 고정 대상 |
|---|---|
| `LlmClientRequestContractTest` | 클라이언트가 만드는 **요청** (URL·헤더·본문). 상항 파일을 쓰지 않는다 |
| `LlmClientResponseHandlingTest` | 클라이언트가 **상항을 해석하는 방식**. 이 파일들을 쓴다 |

두 시험은 클라이언트 6종을 기반 클래스로 합치는 리팩토링의 안전망입니다. 합친 뒤에도 같은
요청을 보내고 같은 상항에 같은 결과를 내야 합니다.
