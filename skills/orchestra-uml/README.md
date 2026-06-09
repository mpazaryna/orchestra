# uml

Generate UML diagrams as Mermaid code and save them to `.orchestra/uml/`.

## Quick Start

```
/uml sequence the SOAP note pipeline from voice input to storage
/uml class the data model for patient records
/uml deployment how the app and worker communicate
/uml state the ticket lifecycle
```

## What It Does

1. Determines the diagram type from the argument (or asks if unclear)
2. Globs relevant source files, skill definitions, or agent configs for context
3. Reads existing `.orchestra/uml/` diagrams to avoid duplication
4. Generates valid Mermaid syntax for the chosen type
5. Saves to `.orchestra/uml/{project}-{type}-{purpose}.md` with `created_on` frontmatter
6. Cross-references the related spec or ADR if applicable

## Diagram Types

| Type | Use When |
|------|----------|
| `sequence` | Agent-to-tool flows, API call chains, multi-step workflows |
| `class` | Data models, object relationships, schema structure |
| `deployment` | On-device vs cloud allocation, infrastructure topology |
| `component` | High-level system overview, major pieces and connections |
| `state` | Workflow states, agent decision logic, valid transitions |

## File Structure

- `examples/sequence.md` — reference diagram showing multi-phase agent workflow with parallel tool calls and retry logic

## Naming Convention

`{project}-{diagram-type}-{purpose}.md` — e.g., `chiropractic-sequence-soap-pipeline.md`

## See Also

- `adr` — documents why a topology was chosen; references the UML for the result
- `spec` — documents what to build; references the UML for how
