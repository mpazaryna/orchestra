"""End-to-end test driving a throwaway git repository.

Skipped automatically if the git binary isn't available.
"""

import shutil
import subprocess

import pytest

from relnotes import git
from relnotes.cli import main

pytestmark = pytest.mark.skipif(
    shutil.which("git") is None, reason="git not installed"
)


def _run(args, cwd):
    env = {
        "GIT_AUTHOR_NAME": "Test",
        "GIT_AUTHOR_EMAIL": "t@x.com",
        "GIT_COMMITTER_NAME": "Test",
        "GIT_COMMITTER_EMAIL": "t@x.com",
        "GIT_CONFIG_GLOBAL": "/dev/null",
        "GIT_CONFIG_SYSTEM": "/dev/null",
    }
    subprocess.run(["git", *args], cwd=cwd, check=True, env=env,
                   capture_output=True, text=True)


def _commit(msg, cwd):
    (cwd / "f.txt").write_text(msg)
    _run(["add", "-A"], cwd)
    _run(["commit", "-m", msg], cwd)


@pytest.fixture
def repo(tmp_path):
    _run(["init", "-q", "-b", "main"], tmp_path)
    _commit("chore: init", tmp_path)
    _run(["tag", "v1.0.0"], tmp_path)
    _commit("feat(api): add widgets endpoint", tmp_path)
    _commit("fix: handle empty payloads", tmp_path)
    _commit("chore: bump dev deps", tmp_path)
    _commit("Merge branch 'topic'", tmp_path)
    _run(["tag", "v1.1.0"], tmp_path)
    return tmp_path


def test_get_commits_excludes_merges_by_default(repo):
    commits = git.get_commits("v1.0.0", "v1.1.0", str(repo))
    subjects = [c.subject for c in commits]
    assert "feat(api): add widgets endpoint" in subjects
    assert not any(s.startswith("Merge branch") for s in subjects)


def test_cli_generates_notes(repo, capsys):
    rc = main(["--repo", str(repo), "--from", "v1.0.0", "--to", "v1.1.0"])
    assert rc == 0
    out = capsys.readouterr().out
    assert "## v1.1.0" in out
    assert "✨ Features" in out
    assert "**api:** Add widgets endpoint" in out
    assert "🐛 Bug Fixes" in out
    assert "Handle empty payloads" in out
    # chore + merge dropped
    assert "bump dev deps" not in out


def test_cli_autodetects_range(repo, capsys):
    rc = main(["--repo", str(repo)])
    assert rc == 0
    out = capsys.readouterr().out
    assert "## v1.1.0" in out


def test_cli_errors_on_bad_ref(repo, capsys):
    rc = main(["--repo", str(repo), "--from", "v1.0.0", "--to", "nope"])
    assert rc == 2
