import re
import math
import socket
from urllib.parse import urlparse, parse_qs
from collections import Counter
import tldextract


SUSPICIOUS_KEYWORDS = [
    "login", "signin", "sign-in", "verify", "secure", "account", "update",
    "banking", "paypal", "ebay", "amazon", "apple", "microsoft", "google",
    "facebook", "instagram", "netflix", "password", "credential", "confirm",
    "wallet", "bitcoin", "crypto", "free", "lucky", "winner", "prize",
    "urgent", "suspended", "limited", "click", "offer", "deal", "support",
    "helpdesk", "customer", "service", "security", "alert", "notification",
]

UNCOMMON_TLDS = {
    ".tk", ".ml", ".ga", ".cf", ".gq", ".xyz", ".top", ".club", ".online",
    ".site", ".website", ".info", ".biz", ".us", ".pw", ".cc", ".ru",
    ".cn", ".download", ".link", ".click", ".live", ".stream", ".win",
    ".loan", ".review", ".vip", ".work", ".party", ".gdn", ".men",
}

COMMON_TLDS = {".com", ".org", ".net", ".edu", ".gov", ".co", ".io"}


def calculate_entropy(string: str) -> float:
    if not string:
        return 0.0
    counter = Counter(string)
    length = len(string)
    entropy = -sum((count / length) * math.log2(count / length) for count in counter.values())
    return round(entropy, 4)


def calculate_char_continuation_rate(url: str) -> float:
    if len(url) < 2:
        return 0.0
    continuations = sum(1 for i in range(1, len(url)) if url[i] == url[i - 1])
    return round(continuations / (len(url) - 1), 4)


def calculate_url_similarity_index(url: str) -> float:
    brand_patterns = [
        r"paypa[^l]", r"g[o0]{2}gle", r"faceb[o0]{2}k", r"micr[o0]soft",
        r"app[l1]e", r"amaz[o0]n", r"netfl[i1]x", r"[il1]nstagram",
    ]
    score = 0.0
    url_lower = url.lower()
    for pattern in brand_patterns:
        if re.search(pattern, url_lower):
            score += 0.25
    return min(round(score, 4), 1.0)


def is_ip_address(hostname: str) -> bool:
    try:
        socket.inet_aton(hostname)
        return True
    except socket.error:
        pass
    ipv6_pattern = re.compile(r"^[\da-fA-F:]+$")
    if ipv6_pattern.match(hostname) and ":" in hostname:
        return True
    ip_in_url = re.compile(r"\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b")
    return bool(ip_in_url.search(hostname))


def extract_features(url: str) -> dict:
    parsed = urlparse(url)
    ext = tldextract.extract(url)

    full_domain = parsed.netloc or ""
    hostname = ext.domain or ""
    subdomain = ext.subdomain or ""
    suffix = ext.suffix or ""
    path = parsed.path or ""
    query = parsed.query or ""
    scheme = parsed.scheme or ""

    url_lower = url.lower()

    url_length = len(url)
    domain_length = len(full_domain)
    is_https = scheme == "https"
    subdomain_count = len([s for s in subdomain.split(".") if s]) if subdomain else 0
    has_ip_address = is_ip_address(full_domain)
    has_at_symbol = "@" in url
    dash_count = url.count("-")
    dot_count = url.count(".")
    has_suspicious_keywords = any(kw in url_lower for kw in SUSPICIOUS_KEYWORDS)
    entropy = calculate_entropy(url)
    special_chars = re.findall(r"[!#$%&'*+/=?^`{|}~]", url)
    special_char_count = len(special_chars)
    digit_count_in_hostname = sum(c.isdigit() for c in full_domain)
    query_params = parse_qs(query)
    query_param_count = len(query_params)
    has_port = bool(parsed.port)

    tld_with_dot = f".{suffix}" if suffix else ""
    has_uncommon_tld = tld_with_dot.lower() in UNCOMMON_TLDS
    double_slash_redirect = url.count("//") > 1
    tld_length = len(suffix)

    url_similarity_index = calculate_url_similarity_index(url)
    char_continuation_rate = calculate_char_continuation_rate(url)

    return {
        "url_length": url_length,
        "domain_length": domain_length,
        "is_https": is_https,
        "subdomain_count": subdomain_count,
        "has_ip_address": has_ip_address,
        "has_at_symbol": has_at_symbol,
        "dash_count": dash_count,
        "dot_count": dot_count,
        "has_suspicious_keywords": has_suspicious_keywords,
        "entropy": entropy,
        "special_char_count": special_char_count,
        "digit_count_in_hostname": digit_count_in_hostname,
        "query_param_count": query_param_count,
        "has_port": has_port,
        "has_uncommon_tld": has_uncommon_tld,
        "double_slash_redirect": double_slash_redirect,
        "url_similarity_index": url_similarity_index,
        "char_continuation_rate": char_continuation_rate,
        "tld_length": tld_length,
    }


def features_to_vector(features: dict) -> list:
    return [
        features["url_length"],
        features["domain_length"],
        int(features["is_https"]),
        features["subdomain_count"],
        int(features["has_ip_address"]),
        int(features["has_at_symbol"]),
        features["dash_count"],
        features["dot_count"],
        int(features["has_suspicious_keywords"]),
        features["entropy"],
        features["special_char_count"],
        features["digit_count_in_hostname"],
        features["query_param_count"],
        int(features["has_port"]),
        int(features["has_uncommon_tld"]),
        int(features["double_slash_redirect"]),
        features["url_similarity_index"],
        features["char_continuation_rate"],
        features["tld_length"],
    ]
