from relnotes.commit import Commit, parse


def make(subject, body=""):
    return parse(
        Commit(
            sha="0" * 40,
            short_sha="0000000",
            subject=subject,
            body=body,
            author_name="A",
            author_email="a@example.com",
            date="2026-01-01T00:00:00+00:00",
        )
    )


def test_parses_conventional_header():
    c = make("feat(parser): add streaming mode")
    assert c.is_conventional
    assert c.type == "feat"
    assert c.scope == "parser"
    assert c.summary == "Add streaming mode"
    assert not c.breaking


def test_bang_marks_breaking():
    c = make("feat(api)!: drop v1 endpoints")
    assert c.breaking
    assert c.type == "feat"
    assert c.scope == "api"


def test_breaking_footer_marks_breaking_with_description():
    c = make(
        "refactor: rework config loading",
        body="Body text.\n\nBREAKING CHANGE: config keys are now namespaced.",
    )
    assert c.breaking
    assert c.breaking_description == "Config keys are now namespaced"


def test_non_conventional_subject_falls_back():
    c = make("Fixed the thing that was broken.")
    assert not c.is_conventional
    assert c.type is None
    assert c.summary == "Fixed the thing that was broken"  # trailing period removed


def test_summary_capitalized_and_whitespace_collapsed():
    c = make("fix:    weird    spacing")
    assert c.summary == "Weird spacing"


def test_trailers_extracted():
    c = make("feat: x", body="Co-authored-by: Jane <j@x.com>\nReviewed-by: Bob")
    assert "co-authored-by" in c.trailers
    assert c.trailers["reviewed-by"] == ["Bob"]
