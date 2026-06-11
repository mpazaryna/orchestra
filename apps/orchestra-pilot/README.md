# orchestra-pilot

The cold-agent test for the Orchestra MCP server. Answers one question with
evidence: **does the deployed tool catalog, alone, trigger the SDLC for an
agent nobody is steering?**

A "cold agent" is headless Claude Code launched in an empty sandbox outside
this repo, with `--strict-mcp-config` (only the deployed Orchestra server),
`--setting-sources project` (no user-level skills or plugins), and a work
brief that contains zero process words — no mention of Orchestra, SDLC,
stages, skills, or playbooks. Whatever process the agent follows, it learned
from tool descriptions over the wire. That is the experimental control:
ADR-001 traded harness auto-triggering for hand-written tool descriptions,
and this harness measures whether they are loud enough.

## Run it

```bash
./preflight.sh   # integration check: live server, auth, 7 tools
./run.sh         # the cold run (costs one headless Claude session)
```

`run.sh` archives everything under `runs/<UTC-timestamp>/`:

- `transcript.jsonl` — full stream-json transcript
- `workspace/` — every file the cold agent produced
- `report.md` — verdict table rendered by `analyze.mjs`
- `stderr.log` — harness/CLI noise

Runs are committed — they are the evidence base for M5 findings and the
M3 Lenny PRD. Re-run after any server deploy to see whether triggering
improved or regressed.

Config via env: `ORCHESTRA_API_KEY` (falls back to `../mcp-sdlc/.dev.vars`),
`ORCHESTRA_ENDPOINT`, `PILOT_MAX_TURNS` (default 40).

## What the report measures

| Measurement | Meaning |
|-------------|---------|
| discoveredStages | called `orchestra_list_stages` |
| fetchedStagePrompt | called `orchestra_get_prompt` |
| scaffoldedKnowledgeBase | called `orchestra_scaffold` or wrote into `.orchestra/` |
| listedSkills | called `orchestra_list_skills` |
| fetchedSkill | called `orchestra_get_skill` |
| fetchedSupportFile | the ADR-001 two-step: `orchestra_get_skill` with `file` |
| producedPrdArtifact | wrote a PRD-shaped file |
| wroteDevlog | called `orchestra_devlog_entry` |
| stoppedAtHumanGate | final message defers to a human (text heuristic — verify by reading) |

An all-NO report is a successful run of the harness: it means the catalog
never hooked the agent, and that result goes into findings, not the bin.

## Tests

```bash
node --test apps/orchestra-pilot/analyze.test.mjs
```

Work item: `.orchestra/work/001-orchestra-pilot/` (PRD, spec, gherkin,
findings).
