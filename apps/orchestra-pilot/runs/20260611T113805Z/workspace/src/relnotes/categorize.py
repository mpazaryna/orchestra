"""Turn a flat list of commits into grouped, de-noised release notes data."""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import List

from .commit import Commit
from .config import Config


@dataclass
class GroupedNotes:
    """The structured result handed to the renderer."""

    breaking: List[Commit] = field(default_factory=list)
    # section key -> commits, preserving config section order
    sections: "dict[str, List[Commit]]" = field(default_factory=dict)
    dropped: List[Commit] = field(default_factory=list)

    @property
    def total_kept(self) -> int:
        return len(self.breaking) + sum(len(v) for v in self.sections.values())


def _is_noise(commit: Commit, config: Config) -> bool:
    """A commit is noise if its type is a noise type or its subject matches a
    noise pattern. Breaking changes are *never* noise."""
    if commit.breaking:
        return False
    if commit.is_conventional and commit.type in config.noise_types:
        return True
    for pat in config.compiled_noise():
        if pat.search(commit.subject):
            return True
    return False


def _route(commit: Commit, config: Config) -> str:
    """Return the section key a (non-noise) commit belongs to."""
    type_map = config.type_to_section()

    if commit.is_conventional and commit.type in type_map:
        return type_map[commit.type]

    if commit.is_conventional and commit.type:
        # A recognized-looking conventional type we don't have a section for.
        return "other"

    # Non-conventional: fall back to keyword heuristics on the subject.
    for key, pat in config.compiled_heuristics():
        if pat.search(commit.subject):
            return key

    return "other"


def categorize(commits: List[Commit], config: Config) -> GroupedNotes:
    notes = GroupedNotes()
    # Initialize section buckets in configured order so output is deterministic.
    for section in config.sections:
        notes.sections[section.key] = []

    for commit in commits:
        if _is_noise(commit, config):
            notes.dropped.append(commit)
            continue
        if commit.breaking:
            notes.breaking.append(commit)
            # Breaking changes are still listed in their normal section too,
            # so the section reads completely; the renderer marks them.
        key = _route(commit, config)
        notes.sections.setdefault(key, []).append(commit)

    return notes
