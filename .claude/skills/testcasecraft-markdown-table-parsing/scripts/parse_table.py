"""Reusable functions for escape-aware markdown table parsing.

Usage:
    from parse_table import split_row, clean, detect_kind, is_plsql, maybe_attach

    with open('sheet.md') as f:
        for line in f:
            cells = split_row(line)
            if cells:
                cells = [clean(c) for c in cells]
                ...
"""

from __future__ import annotations
import os
import re

SENT = "\x01"


def split_row(line: str) -> list[str] | None:
    """Escape-aware split of a markdown table row.

    Honors `\\|` as a literal `|` inside a cell so SQL output (`col1 | col2`)
    and `||` operators are preserved. Returns None for non-table lines.

    Args:
        line: A single line from the markdown export.

    Returns:
        List of cells (strings, trimmed) or None.
    """
    s = line.strip()
    if not s.startswith("|"):
        return None
    tmp = s.replace("\\|", SENT)
    return [p.strip().replace(SENT, "|") for p in tmp.strip("|").split("|")]


def clean(cell: str) -> str:
    """Remove markdown escape sequences and decode common HTML entities."""
    if not cell:
        return ""
    for esc, raw in (
        ("\\!", "!"),
        ("\\#", "#"),
        ("\\_", "_"),
        ("\\*", "*"),
        ("\\(", "("),
        ("\\)", ")"),
        ("\\<", "<"),
        ("\\>", ">"),
        ("\\'", "'"),
        ('\\"', '"'),
        ("\\[", "["),
        ("\\]", "]"),
        ("\\$", "$"),
        ("\\^", "^"),
        ("\\&", "&"),
    ):
        cell = cell.replace(esc, raw)
    # `\\\\` -> `\\` must happen last so single-char escapes above stay consistent.
    cell = cell.replace("\\\\", "\\")
    cell = re.sub(r"&#13;|&#10;", "\n", cell)
    cell = re.sub(r"&#9;", "\t", cell)
    return cell.strip()


def is_plsql(text: str) -> bool:
    """Detect an anonymous PL/SQL block (DECLARE..BEGIN..END or BEGIN..END)."""
    u = text.upper()
    return ("DECLARE" in u and "BEGIN" in u) or u.lstrip().startswith("BEGIN")


_SQL_STARTS = (
    "SELECT",
    "INSERT",
    "UPDATE",
    "DELETE",
    "CREATE",
    "CALL",
    "ALTER",
    "DROP",
    "WITH",
    "TRUNCATE",
    "GRANT",
    "REVOKE",
)


def detect_kind(text: str) -> str:
    """Classify cell content: 'plsql' | 'sql' | 'html' | 'text'."""
    if not text:
        return "text"
    if is_plsql(text):
        return "plsql"
    head = text.lstrip().upper()
    if any(head.startswith(s) for s in _SQL_STARTS):
        return "sql"
    low = text.lower()
    if "<html" in low or "<!doctype" in low or "<meta" in low:
        return "html"
    return "text"


def verify_column_count(rows: list[list[str]], expected: int) -> list[tuple[int, int]]:
    """Return rows that deviate from the expected column count.

    Use after running split_row across all data lines. An empty list means the
    table is consistent.
    """
    bad = []
    for i, cells in enumerate(rows):
        if cells is None:
            continue
        if len(cells) != expected:
            bad.append((i, len(cells)))
    return bad


def maybe_attach(
    content: str,
    kind: str,
    naming: str,
    *,
    out_dir: str,
    threshold: int = 1000,
    preview_chars: int = 500,
) -> tuple[str, dict | None]:
    """Split oversize content into an attachment file; return (body, meta or None).

    Args:
        content: The full cell content.
        kind: One of 'plsql', 'sql', 'html', 'text' (used for extension).
        naming: Stem of the attachment filename (no extension), e.g.
                'UTL_HTTP-24-expected'.
        out_dir: Directory to write the attachment.
        threshold: Minimum length that triggers an attachment.
        preview_chars: Number of leading chars kept inline as preview.

    Returns:
        (body_markdown, meta_dict or None)
        - When content <= threshold: returns (content, None).
        - When content > threshold: writes the file and returns
          (preview + truncation marker, {'filename', 'size', 'kind', 'path'}).
    """
    if not content:
        return ("", None)
    if len(content) <= threshold:
        return (content, None)
    ext_map = {"plsql": "plsql", "sql": "sql", "html": "html", "text": "txt"}
    ext = ext_map.get(kind, "txt")
    fname = f"{naming}.{ext}"
    os.makedirs(out_dir, exist_ok=True)
    path = os.path.join(out_dir, fname)
    with open(path, "w") as fp:
        fp.write(content)
    preview = content[:preview_chars].rstrip()
    body = (
        preview + f"\n…(truncated; full {len(content):,} chars in attachment `{fname}`)"
    )
    meta = {"filename": fname, "path": path, "size": len(content), "kind": kind}
    return (body, meta)


# Backend whitelist workaround: rename non-whitelisted extensions to .txt while
# preserving the original kind in the filename.
ALLOWED_DEFAULT = {
    "txt",
    "csv",
    "json",
    "md",
    "pdf",
    "log",
    "png",
    "jpg",
    "jpeg",
    "gif",
    "xls",
    "xlsx",
    "doc",
    "docx",
}


def safe_attachment_name(filename: str, allowed: set[str] | None = None) -> str:
    """If the extension is not whitelisted, append .txt while keeping the original.

    Example: 'foo.sql' -> 'foo.sql.txt' when 'sql' is not allowed.
    """
    allowed = allowed or ALLOWED_DEFAULT
    parts = filename.rsplit(".", 1)
    if len(parts) != 2 or parts[1].lower() in allowed:
        return filename
    return f"{filename}.txt"
