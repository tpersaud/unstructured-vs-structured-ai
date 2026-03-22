# Repo Bootstrap Spec

## Goal

Create the initial repository scaffold.

## Root Structure

- docs/
- config/
- scripts/
- evaluator/
  - src/
  - tests/
  - fixtures/
- templates/
  - prompt-only/
  - lattice/
- experiments/
  - prompt-only/
  - lattice/
- docker/
- .github/workflows/

## Required Files

- README.md
- package.json (for evaluator)
- tsconfig.json
- vitest config
- config/scorecard-rules.json

## Constraint

Do NOT generate all run folders yet.
Main should only contain reusable infrastructure.
