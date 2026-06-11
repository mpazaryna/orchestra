from relnotes.categorize import categorize
from relnotes.commit import Commit, parse
from relnotes.config import Config
from relnotes.render import render


def c(subject, body=""):
    return parse(
        Commit("a" * 40, "abc1234", subject, body, "A", "a@x.com", "2026-01-01")
    )


def render_for(commits, **kw):
    notes = categorize(commits, Config())
    return render(notes, Config(), version="v1.0.0", **kw)


def test_heading_and_date():
    out = render_for([c("feat: a")], date="2026-06-11")
    assert out.startswith("## v1.0.0 (2026-06-11)")


def test_breaking_section_appears_first():
    out = render_for([c("feat!: big change"), c("fix: small")])
    assert "### ⚠️ Breaking Changes" in out
    assert out.index("Breaking Changes") < out.index("Bug Fixes")


def test_scope_and_sha_rendered():
    out = render_for([c("feat(ui): add button")])
    assert "**ui:**" in out
    assert "`abc1234`" in out


def test_commit_links_when_repo_url_given():
    out = render_for([c("feat: a")], repo_url="https://github.com/o/r")
    assert "https://github.com/o/r/commit/" + "a" * 40 in out


def test_empty_notes_message():
    out = render_for([c("chore: nothing")])
    assert "_No notable changes._" in out


def test_dropped_summary_present_and_suppressible():
    notes = categorize([c("feat: a"), c("chore: x")], Config())
    with_summary = render(notes, Config(), version="v1")
    assert "noise commit" in with_summary
    without = render(notes, Config(), version="v1", include_dropped_summary=False)
    assert "noise commit" not in without
