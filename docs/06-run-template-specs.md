# Run Template Spec

## Prompt-only

run-XX/

- app/
- prompts/
- logs/
- results/
- media/
- run.config.json

## Lattice

run-XX/

- app/
- prompts/
- lattice/
- logs/
- results/
- media/
- run.config.json

## Required Seed Files

- logs/timing.json
- logs/notes.md
- prompts/README.md
- empty results folders
- empty media folders

## run.config.json must include:

- runId
- mode
- models
- paths
- evaluation commands
- pass gate
