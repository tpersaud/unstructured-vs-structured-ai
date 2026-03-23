---
description: Full experiment contract for the unstructured-vs-structured-ai code kata experiment
---

# Experiment Contract

Before making changes to this repo, understand the experiment itself. This repo is not a generic app scaffold. It is an experiment harness for a controlled comparison between two AI-assisted software delivery modes.

## Experiment Purpose

This repository supports a 10-iteration code kata experiment comparing:

1. **Unstructured Context** (`unstructured-context`) — AI-assisted development guided only by transient chat/session context
2. **Structured Context** (`structured-context`) — AI-assisted development guided by persisted, externalized artifacts

The thesis is that structured context architecture (SCA) produces more stable, higher-quality software outcomes than unstructured prompting under the same constraints.

## Naming Decisions (Locked)

- `prompt-only` → `unstructured-context`
- `lattice` → `structured-context`
- Run folders: `run-01`, `run-02`, ..., `run-10`
- Do NOT use `prompt-only-run-01` or `lattice-run-01`
- Do NOT include mode name inside run folder name — the parent folder defines the mode
- `runId` in `run.config.json` = `run-XX` (no mode prefix)

## Artifact Semantics

- `run-package/` = frozen inputs (stamped before execution begins)
- `app/` = generated application under test
- `prompts/`, `logs/`, `results/`, `media/` = generated evidence (produced during/after the run)
- `run-package/structured-context/` = persisted structured artifacts (frozen input, not generated output) — structured runs only

## Exact Stamped Run Skeleton

### Unstructured Context

```
experiments/unstructured-context/run-XX/
  app/
  run-package/
  prompts/
  logs/
  results/raw/
  results/scored/
  media/
  run.config.json
  README.md
```

### Structured Context

```
experiments/structured-context/run-XX/
  app/
  run-package/structured-context/
  prompts/
  logs/
  results/raw/
  results/scored/
  media/
  run.config.json
  README.md
```

## Template Strategy

Templates are self-contained per mode under `templates/run-package/`.

- `templates/run-package/base/` = documentation only, NOT consumed by `new-run.sh`
- Do NOT implement base + overlay merge logic

## Execution Model

- Branch-per-run, worktree-per-run isolation
- Branch names: `unstructured-context-run-01` ... `structured-context-run-10`
- Worktrees in `../worktrees/<branch-name>`
- All branches created from `experiment-freeze-v1` tag on main

### Run Initialization Order (must follow exactly)

```
1. git checkout main && git pull
2. git branch <mode>-run-<NN> experiment-freeze-v1
3. mkdir -p ../worktrees
4. git worktree add ../worktrees/<mode>-run-<NN> <mode>-run-<NN>
5. cd ../worktrees/<mode>-run-<NN>
6. ./scripts/new-run.sh <mode> <NN>
```

## Prompt Budget

Max 5 prompts per run. All must be recorded in `prompts/`. No hidden retries.

## Invariants

### No Mid-Experiment Changes

Once initialization begins, do NOT modify templates, `new-run.sh`, evaluator logic, or run structure. If a critical issue is found, stop and restart from scratch.

### Run Isolation

- Only operate within the corresponding run folder
- Do NOT modify other run folders
- Do NOT reuse artifacts from previous runs
- Do NOT copy outputs between runs

## Out of Scope

- Redesigning evaluator, scoring, or Docker
- Merge-based base/overlay scaffolding
- Changing experiment thesis or rules
- Refactoring unrelated app logic

## Readiness Gate (before experiment initialization)

Before creating run branches/worktrees, ALL must pass:

1. Mode names normalized everywhere
2. Actual directory tree has `experiments/{unstructured,structured}-context/` and `templates/run-package/{unstructured,structured}-context/`
3. `new-run.sh` accepts new modes and stamps correct skeleton
4. Docs, examples, and script behavior aligned
5. Stale-reference grep returns zero hits
6. Scaffold verification in a temporary throwaway branch/worktree (not on main)
7. Main confirmed clean before freeze tag

After creating the contract artifacts, do not create run folders, branches, or worktrees unless the repo passes an explicit readiness check against this contract. If readiness fails, stop and report the blockers instead of partially initializing the experiment.

## Reference

Full canonical version: `docs/00-experiment-contract.md`
