#!/usr/bin/env python3
"""
Validation script for test_api_comprehensive.py
서비스 실행 없이 테스트 파일의 유효성을 검증합니다.

This script validates:
- Python syntax
- Import statements
- Function definitions
- Test coverage
- API endpoint coverage
"""

import ast
import sys
import importlib.util
from pathlib import Path

# Colors
GREEN = '\033[92m'
RED = '\033[91m'
YELLOW = '\033[93m'
BLUE = '\033[94m'
RESET = '\033[0m'
BOLD = '\033[1m'


def print_header(msg):
    print(f"\n{BOLD}{BLUE}{'='*70}{RESET}")
    print(f"{BOLD}{BLUE}{msg}{RESET}")
    print(f"{BOLD}{BLUE}{'='*70}{RESET}\n")


def print_success(msg):
    print(f"{GREEN}✓{RESET} {msg}")


def print_error(msg):
    print(f"{RED}✗{RESET} {msg}")


def print_info(msg):
    print(f"{YELLOW}ℹ{RESET} {msg}")


def validate_syntax(file_path):
    """Validate Python syntax"""
    print_header("1. Syntax Validation")
    try:
        with open(file_path, 'r') as f:
            code = f.read()
        compile(code, file_path, 'exec')
        print_success("Python syntax is valid")
        return True
    except SyntaxError as e:
        print_error(f"Syntax error: {e}")
        return False


def validate_imports(file_path):
    """Validate required imports"""
    print_header("2. Import Validation")

    required_imports = {
        'requests': 'HTTP client for API calls',
        'json': 'JSON handling',
        'os': 'File operations',
        'sys': 'System operations',
        'uuid': 'UUID generation',
    }

    try:
        with open(file_path, 'r') as f:
            code = f.read()

        tree = ast.parse(code)
        imports = set()

        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    imports.add(alias.name)
            elif isinstance(node, ast.ImportFrom):
                if node.module:
                    imports.add(node.module)

        all_valid = True
        for package, description in required_imports.items():
            if package in imports:
                print_success(f"Import '{package}' found - {description}")
            else:
                print_error(f"Import '{package}' missing - {description}")
                all_valid = False

        return all_valid

    except Exception as e:
        print_error(f"Import validation error: {e}")
        return False


def analyze_test_functions(file_path):
    """Analyze test functions"""
    print_header("3. Test Function Analysis")

    try:
        with open(file_path, 'r') as f:
            code = f.read()

        tree = ast.parse(code)

        # Find all functions
        functions = [node for node in ast.walk(tree) if isinstance(node, ast.FunctionDef)]
        test_functions = [f for f in functions if f.name.startswith('test_')]

        print_success(f"Total functions: {len(functions)}")
        print_success(f"Test functions: {len(test_functions)}")

        # Categorize tests
        categories = {
            'Documents API': [],
            'Embeddings API': [],
            'Conversations API': [],
            'Search API': [],
            'Other': []
        }

        for func in test_functions:
            name = func.name
            if 'document' in name or 'upload' in name or 'download' in name or 'chunk' in name or 'analyze' in name:
                categories['Documents API'].append(name)
            elif 'embedding' in name:
                categories['Embeddings API'].append(name)
            elif 'conversation' in name or 'message' in name:
                categories['Conversations API'].append(name)
            elif 'search' in name:
                categories['Search API'].append(name)
            else:
                categories['Other'].append(name)

        print_info("\nTest coverage by API:")
        for category, tests in categories.items():
            if tests:
                print(f"\n  {BOLD}{category}:{RESET} ({len(tests)} tests)")
                for test in tests:
                    print(f"    - {test}")

        return True

    except Exception as e:
        print_error(f"Function analysis error: {e}")
        return False


def validate_api_endpoints(file_path):
    """Validate API endpoint coverage"""
    print_header("4. API Endpoint Coverage")

    expected_endpoints = {
        'Documents API': [
            'POST /documents/upload',
            'POST /documents/',
            'GET /documents/{id}',
            'GET /documents/',
            'PATCH /documents/{id}',
            'DELETE /documents/{id}',
            'POST /documents/{id}/analyze',
            'GET /documents/{id}/chunks',
            'GET /documents/{id}/download',
        ],
        'Embeddings API': [
            'POST /embeddings/generate',
            'GET /embeddings/status/{id}',
        ],
        'Conversations API': [
            'POST /conversations/messages',
            'DELETE /conversations/messages/{id}',
        ],
        'Search API': [
            'POST /search/similar',
        ],
    }

    try:
        with open(file_path, 'r') as f:
            content = f.read()

        print_info("Checking endpoint coverage in test file:\n")

        total_endpoints = 0
        covered_endpoints = 0

        for api, endpoints in expected_endpoints.items():
            print(f"  {BOLD}{api}:{RESET}")
            for endpoint in endpoints:
                total_endpoints += 1
                method, path = endpoint.split(' ', 1)
                # Simple check: look for the path in the file
                # More flexible pattern matching
                base_path = path.replace('{id}', '').replace('{document_id}', '').split('?')[0]

                # Check multiple patterns
                patterns = [
                    f'/{base_path}',
                    path.replace('{id}', '{document_id}'),
                    path.replace('{id}', '{'),
                    base_path,
                ]

                found = any(pattern in content for pattern in patterns)

                if found:
                    print_success(f"    {endpoint}")
                    covered_endpoints += 1
                else:
                    print_error(f"    {endpoint} (not found)")

        coverage_percent = (covered_endpoints / total_endpoints * 100) if total_endpoints > 0 else 0
        print(f"\n{BOLD}Coverage:{RESET} {covered_endpoints}/{total_endpoints} ({coverage_percent:.1f}%)")

        return coverage_percent >= 90  # 90% coverage threshold

    except Exception as e:
        print_error(f"Endpoint validation error: {e}")
        return False


def check_test_structure(file_path):
    """Check test structure and best practices"""
    print_header("5. Test Structure & Best Practices")

    try:
        with open(file_path, 'r') as f:
            content = f.read()

        checks = {
            'Has main() function': 'def main():' in content,
            'Has test result tracking': 'test_results' in content,
            'Has error handling': 'try:' in content and 'except' in content,
            'Has cleanup function': 'cleanup' in content.lower(),
            'Has colored output': 'GREEN' in content or '\\033' in content,
            'Has timeout handling': 'timeout=' in content,
            'Has proper status codes': 'status_code ==' in content,
        }

        all_passed = True
        for check, passed in checks.items():
            if passed:
                print_success(check)
            else:
                print_error(check)
                all_passed = False

        return all_passed

    except Exception as e:
        print_error(f"Structure check error: {e}")
        return False


def main():
    """Run all validations"""
    print(f"{BOLD}RAG Service Test Validation{RESET}")
    print("=" * 70)

    test_file = Path(__file__).parent / "test_api_comprehensive.py"

    if not test_file.exists():
        print_error(f"Test file not found: {test_file}")
        sys.exit(1)

    results = {
        'Syntax': validate_syntax(test_file),
        'Imports': validate_imports(test_file),
        'Functions': analyze_test_functions(test_file),
        'Endpoints': validate_api_endpoints(test_file),
        'Structure': check_test_structure(test_file),
    }

    # Summary
    print_header("Validation Summary")

    passed = sum(1 for v in results.values() if v)
    total = len(results)

    for check, result in results.items():
        status = f"{GREEN}PASS{RESET}" if result else f"{RED}FAIL{RESET}"
        print(f"  {check}: {status}")

    print(f"\n{BOLD}Result:{RESET} {passed}/{total} checks passed")

    if passed == total:
        print(f"\n{GREEN}{BOLD}✓ All validations passed!{RESET}")
        print(f"\n{YELLOW}Note:{RESET} To run actual API tests, start the RAG service first:")
        print("  cd docker-compose-dev-spring")
        print("  docker-compose up -d postgres-rag minio rag-service")
        print("  cd ../rag-service")
        print("  python3 test_api_comprehensive.py")
        return 0
    else:
        print(f"\n{RED}{BOLD}✗ Some validations failed{RESET}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
