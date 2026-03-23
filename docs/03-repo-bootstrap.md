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
  - run-package/
    - base/
    - unstructured-context/
    - structured-context/
- experiments/
  - unstructured-context/
  - structured-context/
- docker/
- sample-app/ → minimal ASP.NET Core MVC app used for Docker pipeline verification
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
