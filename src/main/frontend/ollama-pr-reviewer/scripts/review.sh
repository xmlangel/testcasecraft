#!/bin/bash

# ollama-pr-reviewer: Local AI PR Review Script
# Dependencies: gh (GitHub CLI), ollama, git

# 1. Check dependencies
if ! command -v gh &> /dev/null; then
  echo "❌ Error: GitHub CLI (gh) is not installed."
  echo "💡 Install it from: https://cli.github.com/"
  exit 1
fi

if ! command -v ollama &> /dev/null; then
  echo "❌ Error: Ollama is not installed."
  echo "💡 Install it from: https://ollama.com/"
  exit 1
fi

# 2. Check Ollama model
MODEL="qwen2.5-coder:7b"
if ! ollama list | grep -q "$MODEL"; then
  echo "⚠️ Warning: Model '$MODEL' is not found in Ollama."
  echo "⏳ Attempting to pull the model..."
  ollama pull "$MODEL"
fi

# 3. Check GitHub Authentication
if ! gh auth status &> /dev/null; then
  echo "❌ Error: Not logged in to GitHub CLI."
  echo "💡 Run 'gh auth login' to authenticate."
  exit 1
fi

# 4. Get the current PR number
PR_NUMBER=$(gh pr view --json number -q .number 2>/dev/null)

if [ -z "$PR_NUMBER" ]; then
  echo "❌ Error: No active GitHub Pull Request found for the current branch."
  echo "💡 Make sure you have pushed your branch and created a PR."
  exit 1
fi

# 5. Detect base branch (master or main)
if git show-ref --verify --quiet refs/heads/master; then
  BASE_BRANCH="master"
elif git show-ref --verify --quiet refs/heads/main; then
  BASE_BRANCH="main"
else
  # Check origin/master if local branch doesn't exist
  if git rev-parse --verify origin/master >/dev/null 2>&1; then
    BASE_BRANCH="origin/master"
  else
    echo "⚠️ Warning: Could not detect master or main branch. Using 'HEAD^' as fallback."
    BASE_BRANCH="HEAD^"
  fi
fi

echo "🔍 Reviewing PR #$PR_NUMBER (diff against $BASE_BRANCH) using $MODEL..."

# 6. Run the review process
# We use a temporary file to ensure the content is captured correctly
DIFF_CONTENT=$(git diff "$BASE_BRANCH...HEAD")

if [ -z "$DIFF_CONTENT" ]; then
  echo "ℹ️ No changes detected against $BASE_BRANCH."
  exit 0
fi

echo "$DIFF_CONTENT" | ollama run "$MODEL" "당신은 시니어 프론트엔드 엔지니어이자 코드 리뷰어입니다. 제공된 git diff 내용을 바탕으로 다음 기준에 따라 코드 리뷰를 진행하고 결과를 한국어로 출력해주세요. 마크다운 형식을 잘 지켜주세요:
1. 코드의 가독성 및 유지보수성 평가
2. React 및 MUI 베스트 프랙티스 준수 여부
3. i18n(다국어) 키 사용의 일관성 확인
4. 잠재적인 버그나 성능 이슈 식별
5. 개선 제안 및 칭찬할 점" | gh pr comment "$PR_NUMBER" --body-file -

if [ ${PIPESTATUS[2]} -eq 0 ]; then
  echo "✅ Review successfully posted to PR #$PR_NUMBER!"
  echo "🔗 View it at: $(gh pr view "$PR_NUMBER" --json url -q .url)"
else
  echo "❌ Error: Failed to post the review comment."
  exit 1
fi
