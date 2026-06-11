"""Commit model and Conventional Commits parsing.

A :class:`Commit` is the raw record pulled from ``git log``. :func:`parse`
layers a best-effort Conventional Commits interpretation on top of it, but the
tool never *requires* commits to follow that convention — un-conventional
commits simply fall back to heuristic categorization later on.
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Optional

# Conventional Commits header, e.g.  "feat(parser)!: add streaming mode"
#   type   = feat
#   scope  = parser   (optional)
#   bang   = !        (optional, marks a breaking change)
#   subject= add streaming mode
_HEADER_RE = re.compile(
    r"^(?P<type>[a-zA-Z]+)"
    r"(?:\((?P<scope>[^)]+)\))?"
    r"(?P<bang>!)?"
    r":\s*(?P<subject>.+)$"
)

# A "BREAKING CHANGE:" / "BREAKING-CHANGE:" footer (case-insensitive token,
# but the convention spells it in upper case).
_BREAKING_FOOTER_RE = re.compile(
    r"^BREAKING[ -]CHANGE:\s*(?P<desc>.+)$",
    re.IGNORECASE | re.MULTILINE,
)


@dataclass
class Commit:
    """A single commit as reported by git, plus parsed interpretation."""

    sha: str
    short_sha: str
    subject: str
    body: str
    author_name: str
    author_email: str
    date: str  # ISO-8601 string as produced by git

    # --- Filled in by parse() -------------------------------------------
    type: Optional[str] = None          # conventional type, lower-cased
    scope: Optional[str] = None
    breaking: bool = False
    breaking_description: Optional[str] = None
    # The human-facing summary (conventional subject if present, else the raw
    # commit subject), with a leading capital and no trailing period.
    summary: str = ""
    is_conventional: bool = False
    # Trailers like "Co-authored-by", "Reviewed-by", parsed from the body.
    trailers: dict = field(default_factory=dict)


def _clean_summary(text: str) -> str:
    """Normalize a summary line for display."""
    text = text.strip()
    text = re.sub(r"\s+", " ", text)
    if text:
        text = text[0].upper() + text[1:]
    # Drop a single trailing period (but keep "..." and "?!").
    if text.endswith(".") and not text.endswith(".."):
        text = text[:-1]
    return text


def _parse_trailers(body: str) -> dict:
    """Extract simple ``Key: value`` git trailers from the commit body."""
    trailers: dict = {}
    for line in body.splitlines():
        m = re.match(r"^([A-Za-z][A-Za-z-]+):\s*(.+)$", line.strip())
        if m:
            key = m.group(1).lower()
            trailers.setdefault(key, []).append(m.group(2).strip())
    return trailers


def parse(commit: Commit) -> Commit:
    """Populate the Conventional Commits / breaking-change fields in-place.

    Returns the same commit for convenience.
    """
    header = commit.subject.strip()
    m = _HEADER_RE.match(header)

    if m:
        commit.is_conventional = True
        commit.type = m.group("type").lower()
        commit.scope = m.group("scope")
        commit.summary = _clean_summary(m.group("subject"))
        if m.group("bang"):
            commit.breaking = True
    else:
        commit.is_conventional = False
        commit.summary = _clean_summary(header)

    # A "BREAKING CHANGE:" footer in the body also marks a breaking change and
    # carries a human description we want to surface prominently.
    fm = _BREAKING_FOOTER_RE.search(commit.body or "")
    if fm:
        commit.breaking = True
        commit.breaking_description = _clean_summary(fm.group("desc"))

    commit.trailers = _parse_trailers(commit.body or "")
    return commit
