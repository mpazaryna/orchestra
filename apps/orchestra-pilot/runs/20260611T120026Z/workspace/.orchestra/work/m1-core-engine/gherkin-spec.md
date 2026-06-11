# Gherkin Scenarios: M1 — Core Engine (range → classified → rendered markdown)

> Source: ./spec.md
> Generated: 2026-06-11

```gherkin
Feature: M1 — Core Engine (range → classified → rendered markdown)
  Turn the commit range between two git refs into polished, grouped,
  deterministic markdown release notes with breaking changes highlighted.

  Background:
    Given a git repository on PATH with the relnotes command installed
    And the repository has tags "v0.1.0" and "v0.2.0"

  Scenario: Generate grouped notes for an explicit range
    Given commits between v0.1.0 and v0.2.0 include a feat, a fix, and a docs commit
    When I run "relnotes v0.1.0 v0.2.0"
    Then the output is valid markdown printed to stdout
    And it contains a "## Features" section listing the feat commit
    And it contains a "## Bug Fixes" section listing the fix commit
    And each bullet ends with the commit's short SHA

  Scenario: Default the upper bound to HEAD
    Given there are commits after v0.2.0 on the current branch
    When I run "relnotes v0.2.0"
    Then the range resolves to v0.2.0..HEAD
    And the notes include the commits made after v0.2.0

  Scenario: Default both bounds to the latest two tags
    Given v0.2.0 is the latest tag and v0.1.0 is the previous tag
    When I run "relnotes" with no arguments
    Then the range resolves to v0.1.0..v0.2.0
    And the notes match those for the explicit range

  Scenario: Surface breaking changes in a dedicated section
    Given a commit in the range has subject "feat!: drop Python 3.9 support"
    And another commit has "BREAKING CHANGE:" in its body
    When I run "relnotes v0.1.0 v0.2.0"
    Then a "## ⚠ Breaking Changes" section appears at the top of the document
    And it lists both breaking commits
    And each still appears under its normal group as well

  Scenario: Drop noise commits by default
    Given the range contains a merge commit, a "wip: scratch" commit, and a "chore(release): v0.2.0" commit
    When I run "relnotes v0.1.0 v0.2.0"
    Then none of those commits appear in the output
    And no section is emitted that would contain only dropped commits

  Scenario: Never silently drop a real commit
    Given the range contains a commit with subject "Tidy up the parser" that is not Conventional-Commits shaped
    When I run "relnotes v0.1.0 v0.2.0"
    Then the commit appears under the "## Other" section
    And it is not discarded

  Scenario: Produce deterministic output
    Given a fixture repository with fixed author and commit dates
    When I run "relnotes v0.1.0 v0.2.0" twice
    Then both runs produce byte-identical markdown
    And the output equals the committed golden file

  Scenario: Write notes to a file
    When I run "relnotes v0.1.0 v0.2.0 -o NOTES.md"
    Then NOTES.md contains exactly the bytes that would have gone to stdout
    And nothing is printed to stdout

  Scenario: Report an unknown ref clearly
    When I run "relnotes v9.9.9 HEAD"
    Then the command exits with status 1
    And stderr explains that the ref "v9.9.9" could not be found
    And no traceback is shown

  Scenario: Report an empty range clearly
    Given there are no commits between v0.2.0 and v0.2.0
    When I run "relnotes v0.2.0 v0.2.0"
    Then the command exits with status 1
    And stderr explains that the range contains no commits

  Scenario: Reject invalid usage
    When I run "relnotes --nonsense"
    Then the command exits with status 2
    And usage text is shown

  @wip @out-of-scope
  Scenario: Re-include internal commits via configuration
    Given a relnotes.toml that includes the "chore" group
    When I run "relnotes v0.1.0 v0.2.0"
    Then chore commits appear under their configured section
    # Deferred to M2 — Configuration & Customization

  @wip @out-of-scope
  Scenario: Link pull requests and authors
    Given author attribution and PR linking are enabled
    When I run "relnotes v0.1.0 v0.2.0"
    Then bullets include the author and a link for "(#123)" references
    # Deferred to M2 — Configuration & Customization
```
