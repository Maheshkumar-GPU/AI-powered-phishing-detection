import re
from urllib.parse import urlparse


URL_REGEX = re.compile(
    r"^(?:https?://)?"
    r"(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|"
    r"localhost|"
    r"\d{1,3}(?:\.\d{1,3}){3})"
    r"(?::\d+)?"
    r"(?:/?|[/?]\S+)$",
    re.IGNORECASE,
)


def is_valid_url(url: str) -> bool:
    if not url or len(url) > 2048:
        return False
    url = url.strip()
    if not url.startswith(("http://", "https://")):
        url = "http://" + url
    return bool(URL_REGEX.match(url))


def sanitize_url(url: str) -> str:
    url = url.strip()
    url = re.sub(r"[\x00-\x1f\x7f-\x9f]", "", url)
    if not url.startswith(("http://", "https://")):
        url = "http://" + url
    return url
