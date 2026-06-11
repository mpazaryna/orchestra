from relnotes.categorize import categorize
from relnotes.commit import Commit, parse
from relnotes.config import Config


def c(subject, body=""):
    return parse(
        Commit("0" * 40, "abc1234", subject, body, "A", "a@x.com", "2026-01-01")
    )


def test_routes_conventional_types_to_sections():
    notes = categorize(
        [c("feat: a"), c("fix: b"), c("perf: c"), c("docs: d")], Config()
    )
    assert [x.summary for x in notes.sections["features"]] == ["A"]
    assert [x.summary for x in notes.sections["fixes"]] == ["B"]
    assert [x.summary for x in notes.sections["perf"]] == ["C"]
    assert [x.summary for x in notes.sections["docs"]] == ["D"]


def test_noise_types_are_dropped():
    notes = categorize([c("chore: tidy"), c("test: add cases"), c("style: fmt")], Config())
    assert notes.total_kept == 0
    assert len(notes.dropped) == 3


def test_merge_and_version_bumps_dropped():
    notes = categorize(
        [c("Merge branch 'main'"), c("Bump version to 1.2.3"), c("v1.2.3")], Config()
    )
    assert notes.total_kept == 0
    assert len(notes.dropped) == 3


def test_breaking_chore_is_kept():
    notes = categorize(
        [c("chore!: drop python 3.7", body="BREAKING CHANGE: 3.7 unsupported")],
        Config(),
    )
    assert len(notes.breaking) == 1
    assert notes.total_kept >= 1


def test_non_conventional_heuristics():
    notes = categorize(
        [c("Add dark mode"), c("Fix crash on startup"), c("Update the docs")],
        Config(),
    )
    assert any(x.summary == "Add dark mode" for x in notes.sections["features"])
    assert any(x.summary == "Fix crash on startup" for x in notes.sections["fixes"])
    assert any(x.summary == "Update the docs" for x in notes.sections["docs"])


def test_unknown_lands_in_other():
    notes = categorize([c("Frobnicate the wibble")], Config())
    assert any(x.summary == "Frobnicate the wibble" for x in notes.sections["other"])
