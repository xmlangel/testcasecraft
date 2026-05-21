---
name: testcasecraft-markdown-table-parsing
description: Google Sheets·Excel·Markdown 표 데이터를 파싱할 때 셀 경계(`|`)와 셀 내부의 escape된 `\|`(SQL `||` 연산자·psql 결과의 컬럼 구분자·HTML 등)를 구분하는 escape-aware 파서 패턴. 단순 `split('|')`는 SQL 출력이 포함된 셀을 잘못 분리한다. Google Drive/Sheets export 결과를 읽거나, CSV·TSV·Markdown 표를 임포트하거나, 시트의 셀이 "어쩐지 컬럼이 분리돼서 들어왔다"는 증상이 보이면 반드시 이 스킬을 사용한다. 1000자 이상의 대용량 셀을 첨부파일로 분리하는 패턴도 포함.
---

# Markdown / Sheet Table Parsing

Google Sheets·Excel을 마크다운 표로 export하면 셀 안의 `|`이 `\|`로 escape된다. 셀에 SQL 출력(`col1 | col2`)이나 `||` 연산자가 있으면 단순 `split('|')`은 셀을 중간에서 자른다. 1셀=1콘텐츠를 보존하려면 **escape-aware split**이 필요하다.

## 왜 단순 split이 실패하는가

마크다운 표 한 행:

```
| 29082024 | Done |  | Test ENCRYPT | CALL DBMS_CRYPTO.ENCRYPT('Morning!', 'AES_CBC', 'key'); | \xb096df... | ERROR: function decrypt_iv LINE 1: decrypt_iv(src, key_enc, iv, algo \|\| '-' \|\| algo_mode); |
```

이 행은 논리적으로 **7 컬럼**(date, status, ext, summary, steps, expected, actual)이지만, `s.split('|')`로 자르면 `\|\|` 부분이 4개의 빈 컬럼으로 쪼개져 **13 컬럼**으로 인식된다. 결과: Expected/Actual이 다른 컬럼으로 밀리고, 셀 내용 일부가 누락된다.

진단: 컬럼 수 분포를 보면 정상 행(7)과 비정상 행(9, 11, 13, …)이 섞여 있다.

```python
from collections import Counter
counts = Counter(len(line.strip('|').split('|')) for line in rows)
# 정상이면 단일 값, mismatch가 있으면 다중 분포
```

## Escape-aware split 알고리즘

1. **셀 안의 `\|`을 sentinel**(예: `\x01`)로 치환
2. **컬럼 경계 `|`로 split**
3. 각 셀에서 sentinel을 다시 `|`로 복원

```python
SENT = '\x01'

def split_row(line):
    s = line.strip()
    if not s.startswith('|'):
        return None
    tmp = s.replace('\\|', SENT)
    return [p.strip().replace(SENT, '|') for p in tmp.strip('|').split('|')]
```

이 한 함수로 셀이 쪼개지지 않는다. 검증:

```python
expected_cols = 7  # 헤더 기준
weird = [(i, len(p)) for i, line in enumerate(rows) if (p := split_row(line)) and len(p) != expected_cols]
assert not weird, f"Anomaly rows: {weird}"
```

> Phase 1 검증으로 **헤더의 컬럼 수**를 기준 삼아 모든 행이 동일한지 확인하라. mismatch 0가 되어야 한다.

## 셀 후처리 (escape 해제)

split 후 각 셀은 여전히 다른 markdown escape가 살아 있다. 일반적으로 unescape할 대상:

| 표 안에서 escape된 형태                           | 원본                                    |
| ------------------------------------------------- | --------------------------------------- |
| `\!` `\#` `\_` `\*` `\(` `\)` `\<` `\>` `\[` `\]` | `!` `#` `_` `*` `(` `)` `<` `>` `[` `]` |
| `\'` `\"` `\\`                                    | `'` `"` `\`                             |
| `\$` `\^` `\&`                                    | `$` `^` `&`                             |
| `&#13;` `&#10;`                                   | `\n` (CR/LF)                            |
| `&#9;`                                            | `\t`                                    |

```python
def clean(t):
    for esc, raw in [('\\!','!'),('\\#','#'),('\\_','_'),('\\*','*'),
                     ('\\(', '('),('\\)', ')'),('\\<','<'),('\\>','>'),
                     ("\\'","'"),('\\"','"'),('\\\\','\\'),
                     ('\\[','['),('\\]',']'),('\\$','$'),('\\^','^'),('\\&','&')]:
        t = t.replace(esc, raw)
    import re
    t = re.sub(r'&#13;|&#10;', '\n', t)
    t = re.sub(r'&#9;', '\t', t)
    return t.strip()
```

순서가 중요하다. `\\\\` (escaped backslash) → `\\`은 모든 단일 backslash escape 처리 **후에** 한 번만 수행하면 의미 일치한다.

## 콘텐츠 분류 (셀 내용 기반)

셀 내용이 무엇인지 알면 후속 처리(코드 블록 언어 선택, 파일 확장자 등)가 깔끔해진다:

| 패턴                                   | 분류             | 활용                 |
| -------------------------------------- | ---------------- | -------------------- |
| `DECLARE` + `BEGIN` 또는 `BEGIN` 시작  | PL/SQL 익명 블록 | ` ```plsql `         |
| `SELECT`/`INSERT`/`CREATE`/`CALL` 시작 | 일반 SQL         | ` ```sql `           |
| `<html`, `<!doctype`, `<meta` 포함     | HTML             | `.html` 또는 `<pre>` |
| 그 외                                  | 일반 텍스트      | ` ``` ` (plain)      |

```python
def is_plsql(text):
    u = text.upper()
    return ('DECLARE' in u and 'BEGIN' in u) or u.lstrip().startswith('BEGIN')

def detect_kind(text):
    if is_plsql(text): return 'plsql'
    if text.lstrip().upper().startswith(('SELECT','INSERT','UPDATE','DELETE','CREATE','CALL','ALTER','DROP','WITH')): return 'sql'
    low = text.lower()
    if '<html' in low or '<!doctype' in low or '<meta' in low: return 'html'
    return 'text'
```

## 대용량 셀(>N자)을 첨부로 분리

시트의 한 셀에 HTTP 응답 HTML이나 긴 EXPLAIN 출력이 통째로 들어가는 경우가 흔하다. 이런 셀을 본문에 그대로 넣으면:

- 백엔드 필드 길이 제한(예: 10,000자)에 막힘
- UI 가독성 저하
- 검색·diff가 무의미

기준선은 도메인마다 다르지만 **1000자**가 흔한 임계값이다. 분리 패턴:

```python
ATTACH_THRESHOLD = 1000

def maybe_attach(content, kind, naming):
    if not content or len(content) <= ATTACH_THRESHOLD:
        return content, None
    ext = {'plsql':'plsql','sql':'sql','html':'html','text':'txt'}.get(kind,'txt')
    fname = f"{naming}.{ext}"
    write_file(fname, content)
    preview = content[:500].rstrip()
    body = preview + f"\n…(truncated; full {len(content):,} chars in attachment `{fname}`)"
    meta = {'filename': fname, 'size': len(content), 'kind': kind}
    return body, meta
```

본문에는 미리보기(처음 500자) + 첨부 참조 안내를 남기고, 원본은 별도 파일로 보존한다.

업로드 대상 시스템이 확장자 화이트리스트를 강제하면(예: `txt, csv, json, md, pdf, log, png, jpg, jpeg, gif, xls, xlsx, doc, docx`), `.sql`/`.plsql`/`.html`은 거부될 수 있다. 두 가지 우회:

1. **`.txt`로 통일** 후 파일명에 원래 종류 보존: `foo.sql.txt`, `oracle_response.html.txt`
2. 시스템 확장 추가 (백엔드 권한이 있다면 화이트리스트 자체 확장이 정공)

## 검증 체크리스트

파서를 작성하면 다음을 자동 점검한다:

- [ ] 헤더의 컬럼 수 = 본문 모든 행의 컬럼 수 (mismatch 0)
- [ ] split 후 각 셀의 `\|`가 제대로 `|`로 복원됨 (랜덤 셀 샘플링)
- [ ] escape 해제가 의도대로 됨 (`\\` → `\`, `\!` → `!`, `&#10;` → `\n`)
- [ ] 콘텐츠 분류가 합리적 (DECLARE 포함 → plsql 등)
- [ ] 임계 길이 초과 셀이 모두 첨부로 분리됨
- [ ] 첨부 파일명이 충돌하지 않음 (예: `{group}-{idx:02d}-{kind}.{ext}` 형식)

## 재사용 스크립트

반복 작업이라면 `scripts/parse_table.py`의 `split_row`, `clean`, `detect_kind`, `maybe_attach` 함수를 import해 사용한다. 시트마다 헤더 컬럼 수와 셀 의미만 다르므로, 도메인 로직은 호출자에서 정의한다.

## 참고

- 본 스킬은 markdown export(`mcp__claude_ai_Google_Drive__read_file_content` 결과 등) 파싱에 최적화돼 있다. raw `.xlsx`/`.csv` 파일은 `openpyxl`/`csv` 모듈을 우선 사용하라.
- 첨부 분리 임계값은 **대상 시스템의 필드 길이 한도와 가독성 트레이드오프**로 결정한다. 백엔드가 10,000자 한도면 임계는 2,000~5,000자가 합리적이다.
