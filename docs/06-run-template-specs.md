# Run Template Spec

## Artifact Semantics

- `run-package/` = **frozen inputs** (seed material provided before the run)
- `app/` = **generated application** under test
- `prompts/`, `logs/`, `results/`, `media/` = **generated evidence** (produced during/after the run)

## Unstructured Context

run-XX/

- app/
- run-package/
- prompts/
- logs/
- results/raw/
- results/scored/
- media/
- run.config.json

## Structured Context

run-XX/

- app/
- run-package/structured-context/
- prompts/
- logs/
- results/raw/
- results/scored/
- media/
- run.config.json

## Required Seed Files

- logs/timing.json
- logs/notes.md
- prompts/README.md
- empty app/ folder
- empty run-package/ folder (with structured-context/ subfolder for structured mode)
- empty results/raw/ and results/scored/ folders
- empty media/ folder
- .gitkeep files to preserve empty directories

## run.config.json must include:

- runId (format: run-XX, no mode prefix)
- mode (unstructured-context or structured-context)
- models
- paths
- evaluation commands
- pass gate
