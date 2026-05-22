#!/bin/bash

# frontend-lint/scripts/lint.sh
# Usage: ./lint.sh [files...]

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/../../../../" && pwd )"
FRONTEND_DIR="$PROJECT_ROOT/src/main/frontend"
CONFIG_FILE="$SCRIPT_DIR/../resources/eslintrc_basic.json"

cd "$FRONTEND_DIR"

if [ -z "$1" ]; then
  # No files specified, lint all src
  FILES="src"
else
  # Files specified, strip 'src/main/frontend/' prefix if present
  FILES=""
  for arg in "$@"; do
    CLEANED_ARG=${arg#src/main/frontend/}
    FILES="$FILES $CLEANED_ARG"
  done
fi

echo "Running ESLint on: $FILES"
npx -y eslint@8.57.1 --no-eslintrc -c "$CONFIG_FILE" $FILES
