import subprocess
import sys
import requests

OLLAMA_URL = "http://localhost:11434/api/generate"
# 사용자가 요청한 두 모델
MODELS = ["deepseek-coder", "qwen2.5-coder:7b"]


def get_git_diff():
    result = subprocess.run(["git", "diff", "--cached"], capture_output=True, text=True)
    return result.stdout


def ask_ollama(diff, model):
    prompt = f"""
너는 시니어 코드 리뷰어다.
아래 변경사항을 {model} 모델의 시각에서 리뷰해라:

- 버그 가능성
- 성능 문제
- 보안 이슈
- 코드 스타일 개선

문제 있으면 명확하게 지적해라. 답변은 한국어로 작성해라.

{diff}
"""

    try:
        response = requests.post(
            OLLAMA_URL,
            json={"model": model, "prompt": prompt, "stream": False},
            timeout=180,  # 모델 두 개를 돌리므로 타임아웃을 넉넉히 잡음
        )
        response.raise_for_status()
        return response.json()["response"]
    except Exception as e:
        return f"Error calling {model}: {str(e)}"


def main():
    diff = get_git_diff()

    if not diff.strip():
        print("No changes to review.")
        return 0

    print("\n" + "=" * 60)
    print("🤖 Ollama Multi-Model Code Review (DeepSeek & Qwen)")
    print("=" * 60)

    has_issue = False
    for model in MODELS:
        print(f"\n>>> [Model: {model}]")
        review = ask_ollama(diff, model)
        print(review)
        print("-" * 40)

        # 간단한 키워드 체크 (필요시 커밋 중단 로직 활성화)
        if "버그" in review or "심각한 문제" in review:
            has_issue = True

    if has_issue:
        print("\n⚠️ 일부 모델에서 잠재적인 이슈가 보고되었습니다. 내용을 확인해 주세요.")
        # return 1  # 커밋을 강제로 막으려면 1을 반환하도록 설정 가능

    return 0


if __name__ == "__main__":
    sys.exit(main())
