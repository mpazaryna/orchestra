"""Render grouped notes as Markdown."""

from __future__ import annotations

from typing import List, Optional

from .categorize import GroupedNotes
from .commit import Commit
from .config import Config


def _commit_line(commit: Commit, repo_url: Optional[str]) -> str:
    """Format one bullet. Includes scope, sha, and a breaking marker."""
    parts: List[str] = []
    if commit.breaking:
        parts.append("**BREAKING**")
    if commit.scope:
        parts.append(f"**{commit.scope}:**")
    parts.append(commit.summary)

    sha = commit.short_sha
    if repo_url:
        link = f"[`{sha}`]({repo_url.rstrip('/')}/commit/{commit.sha})"
    else:
        link = f"`{sha}`"

    return f"- {' '.join(parts)} ({link})"


def render(
    notes: GroupedNotes,
    config: Config,
    *,
    version: str,
    previous: Optional[str] = None,
    date: Optional[str] = None,
    repo_url: Optional[str] = None,
    include_dropped_summary: bool = True,
) -> str:
    lines: List[str] = []

    # --- Title -----------------------------------------------------------
    header = f"## {version}"
    if date:
        header += f" ({date})"
    lines.append(header)
    lines.append("")

    if previous and repo_url:
        lines.append(
            f"[Full changelog]({repo_url.rstrip('/')}/compare/{previous}...{version})"
        )
        lines.append("")

    if notes.total_kept == 0:
        lines.append("_No notable changes._")
        lines.append("")
        return "\n".join(lines).rstrip() + "\n"

    # --- Breaking changes first, prominently -----------------------------
    if notes.breaking:
        lines.append("### ⚠️ Breaking Changes")
        lines.append("")
        for commit in notes.breaking:
            if commit.breaking_description:
                lines.append(
                    f"- {commit.summary} — {commit.breaking_description} "
                    f"(`{commit.short_sha}`)"
                )
            else:
                lines.append(_commit_line(commit, repo_url))
        lines.append("")

    # --- Configured sections, in order -----------------------------------
    for section in config.sections:
        commits = notes.sections.get(section.key, [])
        if not commits:
            continue
        lines.append(f"### {section.title}")
        lines.append("")
        for commit in commits:
            lines.append(_commit_line(commit, repo_url))
        lines.append("")

    if include_dropped_summary and notes.dropped:
        lines.append(
            f"<sub>{len(notes.dropped)} noise commit(s) "
            f"(chore/style/test/merge/etc.) omitted.</sub>"
        )
        lines.append("")

    return "\n".join(lines).rstrip() + "\n"
