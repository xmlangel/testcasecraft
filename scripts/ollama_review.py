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
# 사용자가 요청한 두 모델 및 허용 목록
MODELS = ["deepseek-coder", "qwen2.5-coder:7b"]
ALLOWED_MODELS = MODELS + ["qwen2.5-coder"]

def get_git_diff():
    result = subprocess.run(
        ["git", "diff", "--cached"],
        capture_output=True,
        text=True
    )
    return result.stdout

def translate_to_korean(text, model="qwen2.5-coder:7b"):
    # 보안: 허용된 모델인지 확인
    if model not in ALLOWED_MODELS:
        return f"번역 실패: 허용되지 않는 모델({model})입니다."

    # Qwen을 사용하여 영어 리뷰를 한국어로 번역
    system_instruction = "당신은 전문 번역가입니다. IT 기술 리뷰 내용을 한국어로 자연스럽고 정확하게 번역하세요. 번역 결과만 출력하세요."
    prompt = f"다음 영문 코드 리뷰를 한국어로 번역해 주세요:\n\n{text}"
    
    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": model,
                "system": system_instruction,
                "prompt": prompt,
                "stream": False,
                "options": {"temperature": 0.3}
            },
            timeout=180
        )
        response.raise_for_status()
        return response.json()["response"]
    except requests.exceptions.RequestException as e:
        return f"번역 실패: {str(e)}"

def ask_ollama(diff, model):
    system_instruction = "당신은 시니어 코드 리뷰어입니다. 변경사항을 분석하여 상세히 리뷰해 주세요."
    prompt = f"""
아래의 코드 변경사항을 버그, 성능, 보안, 스타일 관점에서 리뷰해 주세요.
가능한 경우 구체적인 수정 코드 예시를 포함해 주세요.

{diff}
"""

    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": model,
                "system": system_instruction,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": 0.2
                }
            },
            timeout=240
        )
        response.raise_for_status()
        return response.json()["response"]
    except requests.exceptions.RequestException as e:
        return f"{RED}리뷰 실패 ({model}): {str(e)}{RESET}"


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
        # 모델별 색상 구분
        color = BLUE if "deepseek" in model else GREEN
        
        print(f"\n{color}{BOLD}▶ [Model: {model.upper()}]{RESET}")
        print(f"{color}{'━' * 60}{RESET}")
        
        review = ask_ollama(diff, model)
        print(review)
        
        # DeepSeek인 경우 Qwen으로 번역 서비스 제공
        if "deepseek" in model:
            print(f"\n{BOLD}{YELLOW}🌐 [번역본: Qwen2.5-Coder에 의한 한글 번역]{RESET}")
            print(f"{YELLOW}{'┈' * 60}{RESET}")
            translation = translate_to_korean(review)
            print(translation)
        
        print(f"\n{color}{'━' * 60}{RESET}")
        
        # 주요 이슈 키워드 체크
        if any(kw in review.lower() for kw in ["버그", "심각한 문제", "bug", "vulnerability"]):
            has_issue = True

    if has_issue:
        print(f"\n{BOLD}{YELLOW}⚠️  잠재적인 이슈가 보고되었습니다. 확인 후 진행해 주세요.{RESET}")
        # return 1  # 커밋을 강제로 막으려면 1을 반환하도록 설정 가능

    return 0


if __name__ == "__main__":
    sys.exit(main())
