"""Thin wrapper around the ``git`` command-line tool.

We deliberately shell out to git rather than depend on a library: git is
already required to have a repository at all, its CLI is stable, and this keeps
relnotes dependency-free.
"""

from __future__ import annotations

import subprocess
from typing import List, Optional

from .commit import Commit, parse

# A record/field separator unlikely to appear in commit text. Using control
# characters lets us parse multi-line bodies unambiguously from one git call.
_FIELD_SEP = "\x1f"   # ASCII Unit Separator
_RECORD_SEP = "\x1e"  # ASCII Record Separator


class GitError(RuntimeError):
    """Raised when a git invocation fails or the repo is unusable."""


def _run(args: List[str], cwd: str) -> str:
    try:
        proc = subprocess.run(
            ["git", *args],
            cwd=cwd,
            capture_output=True,
            text=True,
        )
    except FileNotFoundError as exc:  # git not installed
        raise GitError("git executable not found on PATH") from exc
    if proc.returncode != 0:
        raise GitError(
            f"git {' '.join(args)} failed (exit {proc.returncode}): "
            f"{proc.stderr.strip()}"
        )
    return proc.stdout


def is_git_repo(cwd: str) -> bool:
    try:
        out = _run(["rev-parse", "--is-inside-work-tree"], cwd)
    except GitError:
        return False
    return out.strip() == "true"


def list_tags(cwd: str) -> List[str]:
    """Return tags ordered newest-first by the commit/tag date."""
    out = _run(
        ["tag", "--sort=-creatordate", "--format=%(refname:short)"],
        cwd,
    )
    return [line for line in out.splitlines() if line.strip()]


def rev_exists(rev: str, cwd: str) -> bool:
    try:
        _run(["rev-parse", "--verify", "--quiet", f"{rev}^{{commit}}"], cwd)
    except GitError:
        return False
    return True


def latest_tag(cwd: str) -> Optional[str]:
    tags = list_tags(cwd)
    return tags[0] if tags else None


def previous_tag(tag: str, cwd: str) -> Optional[str]:
    """Return the tag immediately preceding ``tag`` chronologically."""
    tags = list_tags(cwd)
    if tag in tags:
        idx = tags.index(tag)
        if idx + 1 < len(tags):
            return tags[idx + 1]
    return None


def get_commits(
    from_ref: Optional[str],
    to_ref: str,
    cwd: str,
    *,
    merges: bool = False,
) -> List[Commit]:
    """Return parsed commits reachable from ``to_ref`` but not ``from_ref``.

    If ``from_ref`` is ``None``, all ancestors of ``to_ref`` are returned
    (useful for a project's first release).
    """
    pretty = _FIELD_SEP.join(
        ["%H", "%h", "%s", "%b", "%an", "%ae", "%aI"]
    ) + _RECORD_SEP

    rev_range = f"{from_ref}..{to_ref}" if from_ref else to_ref
    args = ["log", f"--pretty=format:{pretty}", rev_range]
    if not merges:
        args.insert(1, "--no-merges")

    out = _run(args, cwd)

    commits: List[Commit] = []
    for raw in out.split(_RECORD_SEP):
        raw = raw.strip("\n")
        if not raw.strip():
            continue
        fields = raw.split(_FIELD_SEP)
        if len(fields) < 7:
            continue
        sha, short_sha, subject, body, an, ae, date = fields[:7]
        commit = Commit(
            sha=sha,
            short_sha=short_sha,
            subject=subject,
            body=body,
            author_name=an,
            author_email=ae,
            date=date,
        )
        commits.append(parse(commit))
    return commits
