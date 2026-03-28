import subprocess
import sys
import requests
import json
import argparse

# ANSI 색상 (Colors)
CYAN = "\033[96m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
BOLD = "\033[1m"
RESET = "\033[0m"

OLLAMA_URL = "http://localhost:11434/api/generate"
# 단일 리뷰 모델 설정
MODEL = "qwen2.5-coder:7b"


def get_git_diff(filenames=None):
    """
    지정된 파일 목록 또는 staged 변경사항에 대한 git diff를 가져옵니다.

    :param filenames: 리뷰할 파일 경로 목록. None인 경우 staged 변경사항을 리뷰합니다.
    :return: Git diff 결과 문자열.
    """
    if filenames:
        result = subprocess.run(
            ["git", "diff", "HEAD", "--"] + filenames, capture_output=True, text=True
        )
        return result.stdout
    else:
        result = subprocess.run(
            ["git", "diff", "--cached"], capture_output=True, text=True
        )
        return result.stdout


def ask_ollama(diff, model=MODEL):
    """
    Ollama API를 통해 코드 변경사항에 대한 리뷰를 요청합니다. (스트리밍 방식)

    :param diff: 리뷰할 코드 diff 문자열.
    :param model: 리뷰에 사용할 Ollama 모델명.
    :return: 모델의 리뷰 답변 전체 문자열.
    """
    system_instruction = "당신은 시니어 코드 리뷰어입니다. 모든 답변은 한국어로 작성해 주세요. 변경사항을 분석하여 버그, 성능, 보안, 스타일 관점에서 상세히 리뷰해 주세요. 구체적인 수정 코드 예시를 포함해 주세요."
    prompt = f"""
아래의 코드 변경사항을 리뷰해 주세요:

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
                "options": {"temperature": 0.2},
            },
            timeout=600,
            stream=True,
        )
        response.raise_for_status()

        for line in response.iter_lines():
            if line:
                chunk = json.loads(line.decode("utf-8"))
                content = chunk.get("response", "")
                sys.stdout.write(content)
                sys.stdout.flush()
                full_response += content
        print()
        return full_response
    except requests.exceptions.RequestException as e:
        error_msg = f"\n{RED}리뷰 실패: {str(e)}{RESET}"
        print(error_msg)
        return error_msg


def main():
    """
    스크립트의 메인 실행 로직입니다.
    """
    parser = argparse.ArgumentParser(description="Ollama Qwen2.5 Code Review")
    parser.add_argument(
        "--file", "-f", nargs="+", help="Review specific files (HEAD vs current)"
    )
    args = parser.parse_args()

    reviewed_files = args.file
    diff = get_git_diff(reviewed_files if reviewed_files else None)

    if not diff.strip():
        if reviewed_files:
            print(
                f"{YELLOW}No changes found in specified files: {', '.join(reviewed_files)}{RESET}"
            )
        else:
            print(f"{YELLOW}No staged changes to review.{RESET}")
        return 0

    print(f"\n{BOLD}{CYAN}" + "━" * 60)
    print(f" 🤖 Ollama Code Review [Model: {MODEL}]")
    if reviewed_files:
        print(f" 📂 Target: {', '.join(reviewed_files)}")
    else:
        print(" 📂 Target: Staged Changes")
    print("━" * 60 + f"{RESET}\n")

    review = ask_ollama(diff)

    # 주요 이슈 키워드 체크
    if any(
        kw in review.lower() for kw in ["버그", "심각한 문제", "bug", "vulnerability"]
    ):
        print(
            f"\n{BOLD}{YELLOW}⚠️  잠재적인 이슈가 발견되었습니다. 내용을 확인해 주세요.{RESET}"
        )

    return 0


if __name__ == "__main__":
    sys.exit(main())
