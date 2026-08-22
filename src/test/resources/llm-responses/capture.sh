#!/usr/bin/env bash
#
# 실제 제공자 상항을 잡아 이 폴더의 파일을 갱신한다.
#
# 이 파일들을 손으로 쓰지 않는 것이 요점이다. 손으로 쓴 상항은 실제 API 가 바뀌어도 시험이
# 계속 통과해 거짓 통지를 만든다. 이번 작업에서 실측으로만 알아낸 것이 여럿이다.
#   - NVIDIA /v1/models 에 가격 정보가 없다
#   - NVIDIA 목록의 3분의 2가 계정에 없어 404 를 낸다
#   - 429 에 두 종류가 있다 (limit_source)
#   - 정상 상항 헤더에 한도 정보가 없다
#
# 상항 형태가 바뀌었다고 의심되면 이 스크립트를 다시 돌리고, 달라진 부분을 보고 판단한다.
#
# 사용법
#   NVIDIA_API_KEY=nvapi-… OPENROUTER_API_KEY=sk-or-v1-… bash capture.sh
#
# 잡은 파일에서 계정 식별자·사용자 ID·요청 ID 는 가린다. 판정 로직은 상태코드와
# limit_source·detail 문구만 보므로 가려도 시험이 성립한다.

set -uo pipefail
cd "$(dirname "$0")"

NV="${NVIDIA_API_KEY:-}"
OR="${OPENROUTER_API_KEY:-}"

save() {
  local name="$1"; shift
  echo "── $name"
  if ! "$@" | python3 -m json.tool > "$name.tmp" 2>/dev/null; then
    echo "   실패. 건너뛴다 (기존 파일 유지)"
    rm -f "$name.tmp"
    return
  fi
  mv "$name.tmp" "$name"
  echo "   저장"
}

nv_chat() {
  curl -s -X POST "https://integrate.api.nvidia.com/v1/chat/completions" \
    -H "Authorization: Bearer ${2:-$NV}" -H "Content-Type: application/json" \
    -d "{\"model\":\"$1\",\"messages\":[{\"role\":\"user\",\"content\":\"say ok\"}],\"max_tokens\":5}" \
    --max-time 60
}

or_chat() {
  curl -s -X POST "https://openrouter.ai/api/v1/chat/completions" \
    -H "Authorization: Bearer ${2:-$OR}" -H "Content-Type: application/json" \
    -d "{\"model\":\"$1\",\"messages\":[{\"role\":\"user\",\"content\":\"say ok\"}],\"max_tokens\":5}" \
    --max-time 60
}

if [ -n "$NV" ]; then
  save nvidia-chat-200.json          nv_chat "meta/llama-3.1-8b-instruct"
  save nvidia-chat-404-account.json  nv_chat "01-ai/yi-large"
  save nvidia-chat-403-auth.json     nv_chat "meta/llama-3.1-8b-instruct" "nvapi-invalid"
else
  echo "NVIDIA_API_KEY 가 없어 NVIDIA 상항을 건너뛴다"
fi

if [ -n "$OR" ]; then
  # 한도가 남아 있으면 200 이, 소진됐으면 429 가 잡힌다. 상태코드에 따라 파일을 갈라 저장하므로
  # 어느 쪽이 잡혀도 기존 파일을 덮어 잃지 않는다.
  body=$(or_chat "nvidia/nemotron-nano-9b-v2:free")
  if echo "$body" | grep -q '"choices"'; then
    echo "── openrouter-chat-200.json"
    echo "$body" | python3 -m json.tool > openrouter-chat-200.json && echo "   저장"
  elif echo "$body" | grep -q 'free_tier_daily'; then
    echo "── openrouter-chat-429-account.json"
    echo "$body" | python3 -m json.tool > openrouter-chat-429-account.json && echo "   저장"
  else
    echo "── OpenRouter: 분류하지 못한 상항. 건너뛴다"
    echo "$body" | head -c 200
  fi
else
  echo "OPENROUTER_API_KEY 가 없어 OpenRouter 상항을 건너뛴다"
fi

echo
echo "── 식별자 가리기"
python3 - <<'PY'
import pathlib, re, json
subs = [
    (re.compile(r"account '[A-Za-z0-9_\-]{12,}'"), "account 'ACCOUNT_ID_REDACTED'"),
    (re.compile(r'"user_id"\s*:\s*"[^"]+"'), '"user_id": "USER_ID_REDACTED"'),
    (re.compile(r"Function '[0-9a-f\-]{20,}'"), "Function 'FUNCTION_ID_REDACTED'"),
    (re.compile(r'"id"\s*:\s*"chatcmpl-[^"]+"'), '"id": "chatcmpl-REDACTED"'),
]
for f in sorted(pathlib.Path(".").glob("*.json")):
    s = f.read_text()
    for pat, rep in subs:
        s = pat.sub(rep, s)
    json.loads(s)
    f.write_text(s)
    print(f"   {f.name}")
PY
echo
echo "완료. git diff 로 달라진 부분을 확인한다."
