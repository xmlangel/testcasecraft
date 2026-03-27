import subprocess
import sys
import requests
import json
import argparse

# ANSI 색상 (Colors)
BLUE = "\033[94m"
CYAN = "\033[96m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
MAGENTA = "\033[95m"
RED = "\033[91m"
BOLD = "\033[1m"
RESET = "\033[0m"

OLLAMA_URL = "http://localhost:11434/api/generate"
# 리뷰에 사용할 모델 목록
MODELS = ["deepseek-coder", "qwen2.5-coder:7b", "glm-4.7-flash:latest"]
ALLOWED_MODELS = MODELS + ["qwen2.5-coder", "glm-4.7-flash"]

def get_git_diff(filenames=None):
    if filenames:
        # 특정 파일들에 대한 HEAD 대비 diff
        result = subprocess.run(
            ["git", "diff", "HEAD", "--"] + filenames,
            capture_output=True,
            text=True
        )
        return result.stdout
    else:
        # staged (이미 add된) 변경사항 diff
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
    
    full_response = ""
    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": model,
                "system": system_instruction,
                "prompt": prompt,
                "stream": True,
                "options": {"temperature": 0.3}
            },
            timeout=300,
            stream=True
        )
        response.raise_for_status()
        
        for line in response.iter_lines():
            if line:
                chunk = json.loads(line.decode('utf-8'))
                content = chunk.get("response", "")
                sys.stdout.write(content)
                sys.stdout.flush()
                full_response += content
        print() # 개행
        return full_response
    except requests.exceptions.RequestException as e:
        print(f"\n번역 실패: {str(e)}")
        return f"번역 실패: {str(e)}"

def ask_ollama(diff, model):
    system_instruction = "당신은 시니어 코드 리뷰어입니다. 변경사항을 분석하여 상세히 리뷰해 주세요."
    prompt = f"""
아래의 코드 변경사항을 버그, 성능, 보안, 스타일 관점에서 리뷰해 주세요.
가능한 경우 구체적인 수정 코드 예시를 포함해 주세요.

{diff}
"""

    full_response = ""
    try:
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": model,
                "system": system_instruction,
                "prompt": prompt,
                "stream": True,
                "options": {
                    "temperature": 0.2
                }
            },
            timeout=600,
            stream=True
        )
        response.raise_for_status()
        
        for line in response.iter_lines():
            if line:
                chunk = json.loads(line.decode('utf-8'))
                content = chunk.get("response", "")
                sys.stdout.write(content)
                sys.stdout.flush()
                full_response += content
        print() # 개행
        return full_response
    except requests.exceptions.RequestException as e:
        error_msg = f"\n{RED}리뷰 실패 ({model}): {str(e)}{RESET}"
        print(error_msg)
        return error_msg

def main():
    parser = argparse.ArgumentParser(description="Ollama Multi-Model Code Review")
    parser.add_argument("--file", "-f", nargs="+", help="Review specific files (HEAD vs current)")
    args = parser.parse_args()
    
    specified_files = args.file
    
    diff = get_git_diff(specified_files if specified_files else None)

    if not diff.strip():
        if specified_files:
            print(f"{YELLOW}No changes found in specified files: {', '.join(specified_files)}{RESET}")
        else:
            print(f"{YELLOW}No staged changes to review.{RESET}")
        return 0

    print(f"\n{BOLD}{CYAN}" + "━" * 60)
    print(" 🤖 Ollama Multi-Model Code Review")
    if specified_files:
        print(f" 📂 Target: {', '.join(specified_files)}")
    else:
        print(" 📂 Target: Staged Changes")
    print("━" * 60 + f"{RESET}")

    has_issue = False
    for model in MODELS:
        # 모델별 색상 구분
        if "deepseek" in model:
            color = BLUE
        elif "qwen" in model:
            color = GREEN
        elif "glm" in model:
            color = MAGENTA
        else:
            color = CYAN
        
        print(f"\n{color}{BOLD}▶ [Model: {model.upper()}]{RESET}")
        print(f"{color}{'━' * 60}{RESET}")
        
        review = ask_ollama(diff, model)
        
        # 한국어 출력이 불안정한 모델(DeepSeek)에 대해 Qwen 번역 제공
        if "deepseek" in model and "리뷰 실패" not in review:
            print(f"\n{BOLD}{YELLOW}🌐 [번역본: Qwen2.5-Coder에 의한 한글 번역]{RESET}")
            print(f"{YELLOW}{'┈' * 60}{RESET}")
            translation = translate_to_korean(review)
        
        print(f"\n{color}{'━' * 60}{RESET}")
        
        # 주요 이슈 키워드 체크
        if any(kw in review.lower() for kw in ["버그", "심각한 문제", "bug", "vulnerability"]):
            has_issue = True

    if has_issue:
        print(f"\n{BOLD}{YELLOW}⚠️  잠재적인 이슈가 보고되었습니다. 확인 후 진행해 주세요.{RESET}")

    return 0

if __name__ == "__main__":
    sys.exit(main())

