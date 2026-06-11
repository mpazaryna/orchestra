# CLAUDE.md

## Orchestra SDLC — required workflow

This project follows the Orchestra SDLC, served by the `orchestra-sdlc` MCP server.
The `.orchestra/` directory is the agent knowledge base — read `roadmap.md` and
relevant ADRs before acting on any work item.

Before starting any non-trivial work:

1. Call `orchestra_list_skills` to see the available playbooks.
2. Call `orchestra_get_skill` for the relevant activity (PRD, spec, gherkin,
   implement, review, merge, …) and follow it as the playbook.
3. Respect the gates (`orchestra_get_gates`): every work item has a PRD before
   a spec, a spec before implementation. Nothing advances without explicit
   human approval at each gate.

Record sessions with `orchestra_devlog_entry` (write the returned file), and
record significant decisions as ADRs in `.orchestra/adr/`.
