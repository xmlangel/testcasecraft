import subprocess
import sys
import requests

# ANSI 色相 (Colors)
BLUE = "\033[94m"
CYAN = "\033[96m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
BOLD = "\033[1m"
RESET = "\033[0m"

OLLAMA_URL = "http://localhost:11434/api/generate"
# 사용자가 요청한 두 모델
MODELS = ["deepseek-coder", "qwen2.5-coder:7b"]


def get_git_diff():
    result = subprocess.run(
        ["git", "diff", "--cached"],
        capture_output=True,
        text=True
    )
    return result.stdout


def ask_ollama(diff, model):
    prompt = f"""
너는 {model}의 시각을 가진 시니어 코드 리뷰어다.
아래 변경사항을 분석하여 다음 기준에 따라 한국어로 상세히 리뷰해라.

1. 버그 가능성 (Bug Vulnerability)
2. 성능 및 효율성 (Performance & Efficiency)
3. 보안 (Security)
4. 코드 스타일 및 모범 사례 (Style & Best Practices)

각 항목별로 문제점을 지적하고, 개선된 코드 예시를 포함해라. 
답변은 읽기 좋게 구조화하여 작성해라.

{diff}
"""

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": model,
                "prompt": prompt,
                "stream": False
            },
            timeout=240  # 타임아웃을 넉넉히 설정
        )
        response.raise_for_status()
        return response.json()["response"]
    except Exception as e:
        return f"{RED}Error calling {model}: {str(e)}{RESET}"


def main():
    diff = get_git_diff()

    if not diff.strip():
        print(f"{YELLOW}No changes to review.{RESET}")
        return 0

    print(f"\n{BOLD}{CYAN}" + "━" * 60)
    print(" 🤖 Ollama Multi-Model Code Review (DeepSeek & Qwen)")
    print("━" * 60 + f"{RESET}")

    has_issue = False
    for model in MODELS:
        # 모델별 색상 구분 (DeepSeek: Blue, Qwen: Green)
        color = BLUE if "deepseek" in model else GREEN
        
        print(f"\n{color}{BOLD}▶ [Model: {model.upper()}]{RESET}")
        print(f"{color}{'━' * 60}{RESET}")
        
        review = ask_ollama(diff, model)
        print(review)
        
        print(f"{color}{'━' * 60}{RESET}")
        
        if "버그" in review or "심각한 문제" in review:
            has_issue = True

    if has_issue:
        print(f"\n{BOLD}{YELLOW}⚠️  일부 모델에서 잠재적인 이슈가 보고되었습니다. 확인 후 진행해 주세요.{RESET}")
        # return 1  # 커밋을 강제로 막으려면 1을 반환하도록 설정 가능

    return 0


if __name__ == "__main__":
    sys.exit(main())
