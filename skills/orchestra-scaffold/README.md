# scaffold

Scaffold the `.orchestra/` agent knowledge base in a project — creates folder structure, templates, README, and walks through initial roadmap setup.

## Quick Start

```
/scaffold
/scaffold /path/to/project
```

Run once per project. Stops if `.orchestra/` already exists.

## What It Does

Two phases:

### Phase 1: Create Structure

Creates the full `.orchestra/` directory tree:
- `README.md` — explains the folder to agents and humans
- `roadmap.md` — populated with vision and milestones (not empty)
- `adr/ADR-000-the-score.md` — the founding architectural decision
- `work/TEMPLATES/prd.md` and `spec.md` — templates for downstream work
- `uml/` — ready for Mermaid diagrams
- `devlog/{YYYY}-Q{N}/` — current quarter folder

### Phase 2: Set Up the Roadmap

Walks through three interactive steps:
1. Asks for project name, vision (1-2 sentences), and audience
2. Helps define 2-4 milestones with names and objectives — if the user is unsure, derives milestones from the vision
3. Generates `roadmap.md` as a PRD and stubs a milestone PRD for each milestone

Also writes a kickoff devlog entry.

Reports everything created and suggests the next step: run `/milestone` to review the first milestone.

## Rules

- Always asks for vision and milestones — never scaffolds with an empty roadmap
- If the user gives more than 6 milestones, suggests grouping
- Milestone slugs use kebab-case

## See Also

- `milestone` — first skill to run after scaffold
- `prd` — flesh out milestone PRDs
- `adr` — capture decisions as the project evolves
