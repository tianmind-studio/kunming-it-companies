#!/usr/bin/env python3
"""Small same-origin lead intake API for kunming.tianmind.com.

The public site remains static. This service only stores pending submissions in a
private JSONL file for maintainer review; it never publishes submissions.
"""

from __future__ import annotations

import json
import os
import secrets
from datetime import datetime, timedelta, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from typing import Any
from urllib.parse import urlparse


PORT = int(os.environ.get("KUNMING_LEADS_PORT", "3924"))
DATA_FILE = Path(os.environ.get("KUNMING_LEADS_FILE", "/opt/kunming-tech-radar/leads/leads.jsonl"))
MAX_BODY_BYTES = int(os.environ.get("KUNMING_LEADS_MAX_BODY_BYTES", "65536"))
CN_TZ = timezone(timedelta(hours=8), name="Asia/Shanghai")

ALLOWED_TYPES = {
    "company",
    "correction",
    "community",
    "government_project",
    "job_entry",
}

PUBLIC_FIELDS = {
    "lead_type",
    "title",
    "city",
    "district",
    "category",
    "source_url",
    "reason",
    "relationship",
    "contact",
    "notes",
}

REQUIRED_FIELDS = ("lead_type", "title", "city", "source_url", "reason")
ALLOWED_ORIGINS = {
    "https://kunming.tianmind.com",
    "https://tianmind-studio.github.io",
    "http://127.0.0.1:4178",
    "http://localhost:4178",
}


def now_cn() -> datetime:
    return datetime.now(CN_TZ)


def clean_text(value: Any, max_length: int = 1200) -> str:
    if not isinstance(value, str):
        return ""
    return " ".join(value.replace("\x00", "").split())[:max_length]


def is_public_url(value: str) -> bool:
    parsed = urlparse(value)
    return parsed.scheme in {"http", "https"} and bool(parsed.netloc)


def build_record(payload: dict[str, Any]) -> tuple[dict[str, Any] | None, str | None]:
    honeypot = clean_text(payload.get("website"))
    if honeypot:
        return None, "提交未通过校验。"

    cleaned = {field: clean_text(payload.get(field)) for field in PUBLIC_FIELDS}

    missing = [field for field in REQUIRED_FIELDS if not cleaned[field]]
    if missing:
        return None, f"缺少必填字段：{', '.join(missing)}"

    if cleaned["lead_type"] not in ALLOWED_TYPES:
        return None, "线索类型不在允许范围内。"

    if not is_public_url(cleaned["source_url"]):
        return None, "公开来源链接必须是 http 或 https 地址。"

    submitted_at = now_cn()
    lead_id = f"KMR-{submitted_at:%Y%m%d-%H%M%S}-{secrets.token_hex(3).upper()}"
    source_host = urlparse(cleaned["source_url"]).netloc.lower()

    return {
        "id": lead_id,
        "submitted_at": submitted_at.isoformat(),
        "status": "pending_review",
        "origin": "kunming.tianmind.com_submit_form",
        "source_host": source_host,
        "payload": cleaned,
    }, None


def append_record(record: dict[str, Any]) -> None:
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)
    with DATA_FILE.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(record, ensure_ascii=False, sort_keys=True))
        handle.write("\n")


class LeadHandler(BaseHTTPRequestHandler):
    server_version = "KunmingLeadAPI/1.0"

    def _cors_origin(self) -> str | None:
        origin = self.headers.get("Origin")
        if origin in ALLOWED_ORIGINS:
            return origin
        return None

    def _send_cors_headers(self) -> None:
        origin = self._cors_origin()
        if not origin:
            return
        self.send_header("Access-Control-Allow-Origin", origin)
        self.send_header("Vary", "Origin")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def _send_json(self, status: int, body: dict[str, Any]) -> None:
        content = json.dumps(body, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self._send_cors_headers()
        self.send_header("Content-Length", str(len(content)))
        self.end_headers()
        self.wfile.write(content)

    def do_OPTIONS(self) -> None:  # noqa: N802
        self.send_response(204)
        self.send_header("Allow", "OPTIONS, GET, POST")
        self._send_cors_headers()
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_GET(self) -> None:  # noqa: N802
        if self.path in {"/health", "/api/health"}:
            self._send_json(200, {"ok": True})
            return
        self._send_json(404, {"error": "not_found"})

    def do_POST(self) -> None:  # noqa: N802
        if self.path not in {"/leads", "/api/leads"}:
            self._send_json(404, {"error": "not_found"})
            return

        try:
            content_length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            self._send_json(400, {"error": "请求长度无效。"})
            return

        if content_length <= 0 or content_length > MAX_BODY_BYTES:
            self._send_json(413, {"error": "提交内容过大或为空。"})
            return

        try:
            payload = json.loads(self.rfile.read(content_length).decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            self._send_json(400, {"error": "请求必须是有效 JSON。"})
            return

        if not isinstance(payload, dict):
            self._send_json(400, {"error": "请求必须是 JSON 对象。"})
            return

        record, error = build_record(payload)
        if error:
            self._send_json(400, {"error": error})
            return

        try:
            append_record(record)
        except OSError:
            self._send_json(500, {"error": "服务器暂时无法保存线索。"})
            return

        self._send_json(201, {"ok": True, "id": record["id"]})

    def log_message(self, format: str, *args: Any) -> None:
        timestamp = now_cn().isoformat(timespec="seconds")
        message = format % args
        print(f"{timestamp} {self.command} {self.path} {message}", flush=True)


def main() -> None:
    server = ThreadingHTTPServer(("127.0.0.1", PORT), LeadHandler)
    print(f"Kunming lead API listening on 127.0.0.1:{PORT}", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
