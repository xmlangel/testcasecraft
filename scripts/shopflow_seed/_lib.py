"""ShopFlow seed - 공통 라이브러리 (HTTP 클라이언트 + 토큰 + 경로 + 로케일)."""

from __future__ import annotations
import json
import os
import time
import urllib.error
import urllib.request
from pathlib import Path

LOCALE = os.environ.get("SHOPFLOW_LOCALE", "ko").lower()
if LOCALE not in ("ko", "en"):
    raise SystemExit(f"SHOPFLOW_LOCALE must be 'ko' or 'en' (got {LOCALE!r})")

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data" / LOCALE
STATE = ROOT / "state" / LOCALE
TOKEN_FILE = STATE / "token.json"
BASE_URL = os.environ.get("SHOPFLOW_BASE_URL", "http://localhost:8080")
USERNAME = os.environ.get("SHOPFLOW_USER", "admin")
PASSWORD = os.environ.get("SHOPFLOW_PASS", "admin123")


def login() -> str:
    """관리자 로그인 후 토큰을 발급/저장하고 accessToken을 반환한다."""
    STATE.mkdir(parents=True, exist_ok=True)
    body = json.dumps({"username": USERNAME, "password": PASSWORD}).encode("utf-8")
    req = urllib.request.Request(
        BASE_URL + "/api/auth/login",
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=15) as r:
        data = json.loads(r.read())
    TOKEN_FILE.write_text(json.dumps(data, ensure_ascii=False))
    return data["accessToken"]


def get_token() -> str:
    """저장된 토큰을 반환하거나 없으면 새로 로그인."""
    if TOKEN_FILE.exists():
        try:
            return json.loads(TOKEN_FILE.read_text())["accessToken"]
        except Exception:
            pass
    return login()


def headers() -> dict:
    return {
        "Authorization": f"Bearer {get_token()}",
        "Content-Type": "application/json",
    }


def request(method: str, path: str, body=None, retry_on_401: bool = True):
    """fetch with auto re-login on 401."""
    data = (
        None if body is None else json.dumps(body, ensure_ascii=False).encode("utf-8")
    )
    req = urllib.request.Request(
        BASE_URL + path, data=data, headers=headers(), method=method
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            txt = r.read()
            return r.status, (json.loads(txt) if txt else None)
    except urllib.error.HTTPError as e:
        if e.code == 401 and retry_on_401:
            login()
            return request(method, path, body, retry_on_401=False)
        try:
            return e.code, json.loads(e.read())
        except Exception:
            return e.code, {"raw": e.read().decode("utf-8", "replace")}


def post(path, body):
    return request("POST", path, body)


def put(path, body):
    return request("PUT", path, body)


def get(path):
    return request("GET", path)


def load_state(name: str):
    f = STATE / f"{name}.json"
    return json.loads(f.read_text()) if f.exists() else None


def save_state(name: str, value):
    STATE.mkdir(parents=True, exist_ok=True)
    (STATE / f"{name}.json").write_text(json.dumps(value, ensure_ascii=False, indent=2))


def load_data(name: str):
    return json.loads((DATA / f"{name}.json").read_text())


def login_as(username: str, password: str) -> str:
    """임의 사용자로 로그인하여 accessToken만 반환 (token.json 갱신 X)."""
    body = json.dumps({"username": username, "password": password}).encode("utf-8")
    req = urllib.request.Request(
        BASE_URL + "/api/auth/login",
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=15) as r:
        data = json.loads(r.read())
    return data["accessToken"]


def post_as(token: str, path: str, body):
    """특정 토큰(사용자)으로 POST 요청. 결과 입력 시 executedBy 분포에 사용."""
    data = (
        json.dumps(body, ensure_ascii=False).encode("utf-8")
        if body is not None
        else None
    )
    req = urllib.request.Request(
        BASE_URL + path,
        data=data,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            txt = r.read()
            return r.status, (json.loads(txt) if txt else None)
    except urllib.error.HTTPError as e:
        try:
            return e.code, json.loads(e.read())
        except Exception:
            return e.code, {"raw": e.read().decode("utf-8", "replace")}


def upload_multipart(
    path: str,
    file_path: str,
    file_field: str = "file",
    form_fields: dict | None = None,
    content_type: str = "application/xml",
    retry_on_401: bool = True,
):
    """multipart/form-data 업로드. JUnit XML 등 파일 + 폼 필드 동시 전송."""
    import uuid
    from pathlib import Path

    boundary = "----shopflow" + uuid.uuid4().hex
    file_bytes = Path(file_path).read_bytes()
    filename = Path(file_path).name
    parts = []
    parts.append(f"--{boundary}\r\n".encode())
    parts.append(
        f'Content-Disposition: form-data; name="{file_field}"; filename="{filename}"\r\n'.encode()
    )
    parts.append(f"Content-Type: {content_type}\r\n\r\n".encode())
    parts.append(file_bytes)
    parts.append(b"\r\n")
    for k, v in (form_fields or {}).items():
        parts.append(f"--{boundary}\r\n".encode())
        parts.append(f'Content-Disposition: form-data; name="{k}"\r\n\r\n'.encode())
        parts.append(str(v).encode("utf-8"))
        parts.append(b"\r\n")
    parts.append(f"--{boundary}--\r\n".encode())
    body = b"".join(parts)

    req = urllib.request.Request(
        BASE_URL + path,
        data=body,
        headers={
            "Authorization": f"Bearer {get_token()}",
            "Content-Type": f"multipart/form-data; boundary={boundary}",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            txt = r.read()
            return r.status, (json.loads(txt) if txt else None)
    except urllib.error.HTTPError as e:
        if e.code == 401 and retry_on_401:
            login()
            return upload_multipart(
                path,
                file_path,
                file_field,
                form_fields,
                content_type,
                retry_on_401=False,
            )
        try:
            return e.code, json.loads(e.read())
        except Exception:
            return e.code, {"raw": e.read().decode("utf-8", "replace")}
