# Docker Evaluation Spec

## Goal

Create a consistent evaluation environment for scoring each kata run.

---

## Role

Docker is the **deterministic judge**.

It evaluates the output of a run but does not participate in development.

---

## Responsibilities

The container must:

- build the ASP.NET Core MVC application
- run .NET unit and integration tests
- collect coverage (if configured)
- run architecture checks (if configured)
- invoke the Node/TypeScript evaluator
- output raw and scored results

---

## Tech Stack Inside Container

- .NET SDK (for building and testing the application)
- Node.js (for running the evaluator)
- Bash (for orchestration scripts)

---

## Mounts

- run folder → `/run`
- config → `/config`
- evaluator → `/evaluator`

---

## Required Files

- `docker/Dockerfile`
- `scripts/evaluate-run.sh`

---

## Script Flow (`evaluate-run.sh`)

1. read `/run/run.config.json`
2. locate ASP.NET solution/project
3. run:

   ```bash
   dotnet build
   ```

4. run tests:

   ```bash
   dotnet test
   ```

5. optionally collect coverage
6. collect results and generate raw JSON
7. invoke evaluator CLI (Node/TypeScript)
8. write:
   - `/run/results/raw/*.json`
   - `/run/results/scored/*.json`

---

## Notes

- The application under evaluation is:

  ```text
  ASP.NET Core MVC / Razor Pages
  ```

- The evaluator is implemented in:

  ```text
  Node.js + TypeScript
  ```

---

## Sample Application

A minimal ASP.NET Core MVC application is included in `sample-app/` for verifying:

- dotnet build
- dotnet test
- Docker execution pipeline

This app is NOT part of the experiment runs.
It is only used to validate the evaluation system.

---

## Constraint

- Lighthouse / E2E support should be pluggable later
- Do NOT block initial version on browser automation
- Focus on reliable build + test + scoring pipeline first

---

## Guiding Principle

```text
Local development = flexible
Docker evaluation = authoritative
```
