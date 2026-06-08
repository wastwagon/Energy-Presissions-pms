"""In-process per-IP rate limiting (per server worker). Use CDN/WAF for multi-instance scale."""
from __future__ import annotations

import time
from collections import defaultdict
from threading import Lock
from typing import DefaultDict, List

from fastapi import HTTPException, Request, status


def client_ip(request: Request) -> str:
    xf = request.headers.get("x-forwarded-for")
    if xf:
        return xf.split(",")[0].strip()[:80]
    if request.client:
        return request.client.host or "unknown"
    return "unknown"


def check_rate_limit(
    buckets: DefaultDict[str, List[float]],
    lock: Lock,
    request: Request,
    *,
    max_per_window: int,
    window_sec: int,
    detail: str = "Too many requests. Please try again later.",
) -> None:
    ip = client_ip(request)
    now = time.time()
    with lock:
        bucket = buckets[ip]
        bucket[:] = [t for t in bucket if now - t < window_sec]
        if len(bucket) >= max_per_window:
            raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=detail)
        bucket.append(now)
