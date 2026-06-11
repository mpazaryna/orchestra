"""Command-line interface for relnotes."""

from __future__ import annotations

import argparse
import sys
from typing import List, Optional

from . import __version__
from . import git
from .categorize import categorize
from .config import load_config
from .render import render


def _build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="relnotes",
        description="Generate polished release notes from git commit history.",
    )
    p.add_argument(
        "--from",
        dest="from_ref",
        metavar="REF",
        help="Starting tag/ref (exclusive). Defaults to the tag before --to.",
    )
    p.add_argument(
        "--to",
        dest="to_ref",
        metavar="REF",
        help="Ending tag/ref (inclusive). Defaults to the latest tag, or HEAD.",
    )
    p.add_argument(
        "-C",
        "--repo",
        dest="repo",
        default=".",
        metavar="PATH",
        help="Path to the git repository (default: current directory).",
    )
    p.add_argument(
        "--version-label",
        dest="version_label",
        metavar="NAME",
        help="Heading to use for this release (default: the --to ref).",
    )
    p.add_argument(
        "--date",
        metavar="YYYY-MM-DD",
        help="Release date shown next to the heading.",
    )
    p.add_argument(
        "--repo-url",
        dest="repo_url",
        metavar="URL",
        help="Base repo URL (e.g. https://github.com/o/r) for commit links.",
    )
    p.add_argument(
        "--config",
        metavar="PATH",
        help="Path to a TOML config file overriding sections/noise rules.",
    )
    p.add_argument(
        "-o",
        "--output",
        metavar="PATH",
        help="Write notes to a file instead of stdout.",
    )
    p.add_argument(
        "--include-merges",
        action="store_true",
        help="Include merge commits (excluded by default).",
    )
    p.add_argument(
        "--no-dropped-summary",
        action="store_true",
        help="Omit the trailing '<n> noise commits omitted' note.",
    )
    p.add_argument(
        "--list-tags",
        action="store_true",
        help="List tags newest-first and exit.",
    )
    p.add_argument("-V", "--version", action="version", version=f"relnotes {__version__}")
    return p


def _resolve_range(args, repo: str) -> tuple:
    """Determine (from_ref, to_ref, version_label) applying the defaults."""
    to_ref = args.to_ref
    if not to_ref:
        to_ref = git.latest_tag(repo) or "HEAD"

    from_ref = args.from_ref
    if from_ref is None:
        # Default: the tag chronologically before to_ref. If to_ref isn't a
        # known tag (e.g. HEAD), use the latest tag as the start.
        prev = git.previous_tag(to_ref, repo)
        if prev is None and to_ref == "HEAD":
            prev = git.latest_tag(repo)
        from_ref = prev  # may stay None -> whole history

    version_label = args.version_label or to_ref
    return from_ref, to_ref, version_label


def main(argv: Optional[List[str]] = None) -> int:
    args = _build_parser().parse_args(argv)
    repo = args.repo

    if not git.is_git_repo(repo):
        print(f"error: '{repo}' is not a git repository.", file=sys.stderr)
        return 2

    if args.list_tags:
        tags = git.list_tags(repo)
        if not tags:
            print("(no tags found)", file=sys.stderr)
            return 1
        print("\n".join(tags))
        return 0

    try:
        config = load_config(args.config)
    except Exception as exc:  # config errors are user-facing
        print(f"error: failed to load config: {exc}", file=sys.stderr)
        return 2

    from_ref, to_ref, version_label = _resolve_range(args, repo)

    for ref in filter(None, [from_ref, to_ref]):
        if ref != "HEAD" and not git.rev_exists(ref, repo):
            print(f"error: ref '{ref}' does not exist in the repository.", file=sys.stderr)
            return 2

    try:
        commits = git.get_commits(
            from_ref, to_ref, repo, merges=args.include_merges
        )
    except git.GitError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2

    notes = categorize(commits, config)
    output = render(
        notes,
        config,
        version=version_label,
        previous=from_ref,
        date=args.date,
        repo_url=args.repo_url,
        include_dropped_summary=not args.no_dropped_summary,
    )

    if args.output:
        with open(args.output, "w", encoding="utf-8") as fh:
            fh.write(output)
        print(
            f"Wrote {notes.total_kept} change(s) to {args.output} "
            f"({len(notes.dropped)} omitted).",
            file=sys.stderr,
        )
    else:
        sys.stdout.write(output)

    return 0


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())
