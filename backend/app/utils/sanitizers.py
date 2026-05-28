import html
import re


def sanitize_string(value: str, max_length: int = 1000) -> str:
    value = html.escape(value.strip())
    value = re.sub(r"[<>\"'`;]", "", value)
    return value[:max_length]


def sanitize_url(url: str) -> str:
    url = url.strip()
    url = re.sub(r"[\x00-\x1f\x7f-\x9f]", "", url)
    url = re.sub(r"\s+", "", url)
    if not url.startswith(("http://", "https://")):
        url = "http://" + url
    return url[:2048]
