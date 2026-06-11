"""Configuration: how commits map to sections, and what counts as noise.

Defaults follow the Conventional Commits / Angular convention but degrade
gracefully for repos that don't use it. Everything here can be overridden by a
``relnotes.toml`` / ``[tool.relnotes]`` table (see :func:`load_config`).
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from typing import Dict, List, Optional

try:  # Python 3.11+
    import tomllib
except ModuleNotFoundError:  # pragma: no cover
    tomllib = None  # type: ignore


@dataclass
class Section:
    """A rendered group of changes."""

    key: str          # stable identifier
    title: str        # heading shown in the markdown
    types: List[str]  # conventional types routed here


# Ordered: this is also the order sections appear in the output.
DEFAULT_SECTIONS: List[Section] = [
    Section("features", "✨ Features", ["feat", "feature"]),
    Section("fixes", "🐛 Bug Fixes", ["fix", "bugfix", "hotfix"]),
    Section("perf", "⚡ Performance", ["perf"]),
    Section("refactor", "♻️ Refactoring", ["refactor"]),
    Section("docs", "📝 Documentation", ["docs", "doc"]),
    Section("deps", "📦 Dependencies", ["deps", "build", "chore-deps"]),
    Section("other", "🔧 Other Changes", []),  # catch-all
]

# Conventional types we drop entirely unless they carry a breaking change.
DEFAULT_NOISE_TYPES: List[str] = ["chore", "style", "test", "tests", "ci"]

# Subject patterns (case-insensitive, matched against the raw subject) that are
# treated as noise regardless of type — merge commits, version bumps, reverts of
# trivia, "wip", etc.
DEFAULT_NOISE_PATTERNS: List[str] = [
    r"^merge branch",
    r"^merge pull request",
    r"^merge remote-tracking",
    r"^bump version",
    r"^(chore: )?release v?\d",
    r"^v?\d+\.\d+\.\d+$",
    r"^wip\b",
    r"^fixup!",
    r"^squash!",
    r"^\s*$",
]

# Heuristic keyword → section routing for commits that don't follow the
# convention. First match wins; order matters.
DEFAULT_HEURISTICS: List[tuple] = [
    ("features", r"\b(add|added|adds|introduce|implement|support)\b"),
    ("fixes", r"\b(fix|fixed|fixes|bug|patch|resolve|correct)\b"),
    ("perf", r"\b(perf|performance|optimi[sz]e|faster|speed ?up)\b"),
    ("docs", r"\b(docs?|documentation|readme|changelog)\b"),
    ("refactor", r"\b(refactor|cleanup|clean up|tidy|rename|reorganize)\b"),
    ("deps", r"\b(bump|upgrade|update)\b.*\b(dep|dependency|dependencies|version)\b"),
]


@dataclass
class Config:
    sections: List[Section] = field(default_factory=lambda: list(DEFAULT_SECTIONS))
    noise_types: List[str] = field(default_factory=lambda: list(DEFAULT_NOISE_TYPES))
    noise_patterns: List[str] = field(default_factory=lambda: list(DEFAULT_NOISE_PATTERNS))
    heuristics: List[tuple] = field(default_factory=lambda: list(DEFAULT_HEURISTICS))

    def compiled_noise(self) -> List[re.Pattern]:
        return [re.compile(p, re.IGNORECASE) for p in self.noise_patterns]

    def compiled_heuristics(self) -> List[tuple]:
        return [(k, re.compile(p, re.IGNORECASE)) for k, p in self.heuristics]

    def section_for_key(self, key: str) -> Optional[Section]:
        for s in self.sections:
            if s.key == key:
                return s
        return None

    def type_to_section(self) -> Dict[str, str]:
        mapping: Dict[str, str] = {}
        for s in self.sections:
            for t in s.types:
                mapping[t] = s.key
        return mapping


def load_config(path: Optional[str]) -> Config:
    """Load configuration, merging any user overrides onto the defaults.

    Recognized keys in ``[tool.relnotes]`` (or top-level in ``relnotes.toml``):
    ``noise_types``, ``noise_patterns``, and ``sections`` (a list of tables with
    ``key``/``title``/``types``). Unspecified keys keep their defaults.
    """
    cfg = Config()
    if not path:
        return cfg
    if tomllib is None:  # pragma: no cover
        raise RuntimeError("TOML config requires Python 3.11+ (tomllib).")

    with open(path, "rb") as fh:
        data = tomllib.load(fh)

    table = data.get("tool", {}).get("relnotes", data.get("relnotes", data))

    if "noise_types" in table:
        cfg.noise_types = list(table["noise_types"])
    if "noise_patterns" in table:
        cfg.noise_patterns = list(table["noise_patterns"])
    if "sections" in table:
        cfg.sections = [
            Section(s["key"], s["title"], list(s.get("types", [])))
            for s in table["sections"]
        ]
    return cfg
