---
name: ollama-pr-reviewer
description: Local AI PR review using Ollama and GitHub CLI. Use when you want to perform a code review on a GitHub Pull Request using a local LLM (qwen2.5-coder:7b) and post the results as a PR comment.
---

# Ollama PR Reviewer

이 스킬은 로컬에서 실행되는 Ollama(`qwen2.5-coder:7b`) 모델을 사용하여 GitHub Pull Request를 리뷰하고, 결과를 자동으로 PR 코멘트로 남기는 자동화 워크플로우를 제공합니다.

## 필수 구성 요소 (Prerequisites)

이 스킬을 사용하려면 다음 도구들이 로컬에 설치되어 있고 실행 중이어야 합니다:

1.  **Ollama**: `qwen2.5-coder:7b` 모델이 설치되어 있어야 합니다 (`ollama pull qwen2.5-coder:7b`).
2.  **GitHub CLI (gh)**: GitHub 계정에 로그인되어 있어야 합니다 (`gh auth login`).
3.  **Git**: 현재 작업 디렉토리가 Git 저장소여야 합니다.

## 사용 방법 (Usage)

사용자가 "PR 리뷰해줘", "Ollama로 코드 리뷰 남겨줘"와 같이 요청하면 이 스킬이 실행됩니다.

### 실행 절차

1.  **PR 상태 확인**: `gh pr view`를 통해 현재 브랜치에 연결된 PR이 있는지 확인합니다.
2.  **리뷰 스크립트 실행**: 제공된 `scripts/review.sh`를 실행합니다.
    ```bash
    bash scripts/review.sh
    ```
3.  **결과 확인**: GitHub PR 페이지에서 게시된 코멘트를 확인하도록 사용자에게 안내합니다.

## 주의 사항

- 대규모 변경 사항(2,000라인 이상)의 경우 로컬 LLM의 컨텍스트 제한으로 인해 리뷰 품질이 저하될 수 있습니다.
- 리뷰 결과는 항상 AI에 의해 생성되므로, 최종 결정은 사람이 직접 수행해야 합니다.
