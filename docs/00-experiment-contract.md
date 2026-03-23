# Experiment Contract

This document is the canonical reference for the experiment protocol, naming decisions, artifact semantics, and execution model. All scripts, templates, docs, and tooling in this repository must conform to this contract.

---

## Experiment Purpose

This repository supports a 10-iteration code kata experiment designed to compare:

1. **Unstructured Context** — AI-assisted development guided only by transient chat/session context
2. **Structured Context** — AI-assisted development guided by persisted, externalized artifacts

The thesis is that structured context architecture (SCA) produces more stable, higher-quality software outcomes than unstructured prompting under the same constraints.

This is not just a naming preference. The folder structure, docs, and scripts must reflect the experimental protocol clearly enough that someone else could rerun the experiment and audit the results.

---

## Experiment Arms

### Unstructured Context

- Formerly called `prompt-only`
- All context lives inside prompts
- No persistent structure — behavior is recreated each interaction
- There is no persisted structured-context artifact package guiding the run

### Structured Context

- Formerly called `lattice`
- The run is guided by persisted externalized artifacts
- Those artifacts are part of the frozen inputs to the run
- Context is externalized into reusable artifacts: rules, workflows, skills, triggers, descriptions

The comparison is between unstructured vs structured cognition/orchestration, not just between two folder names.

---

## Run Protocol

Each run is part of a 10-iteration code kata experiment.

Core protocol:

- Same task (Texas Hold'em ASP.NET Core MVC)
- Same model hierarchy (Opus for planning, Sonnet for execution)
- Same evaluator (Node/TypeScript deterministic scorer)
- Same Docker-based verification
- Same prompt budget (max 5 prompts per run)
- Branch-per-run / worktree-per-run isolation

Each run must be self-contained and archive-friendly.

A run must clearly distinguish:

1. **Frozen inputs** provided before the run
2. **Generated application** under test
3. **Generated evidence** collected during/after the run

That distinction is critical to the structure.

---

## Artifact Semantics

These meanings must be preserved consistently across scripts, docs, templates, and examples:

| Path | Meaning |
|------|---------|
| `run-package/` | Frozen inputs to the run (stamped before execution begins) |
| `app/` | Generated application under test |
| `prompts/` | Prompt history or prompt artifacts for the run |
| `logs/` | Passive telemetry, timestamps, build/test logs, execution logs |
| `results/raw/` | Raw evaluator outputs |
| `results/scored/` | Normalized/scored outputs |
| `media/` | Recordings/screenshots or other visual evidence |

For structured runs only:

| Path | Meaning |
|------|---------|
| `run-package/structured-context/` | Persisted structured artifacts used to guide the run (frozen input context, not generated output) |

This semantic boundary is one of the most important parts of the experiment design.

---

## Naming Decisions (Locked)

These decisions are final and must be applied consistently:

- `prompt-only` → `unstructured-context`
- `lattice` → `structured-context`
- Run folders: `run-01`, `run-02`, ..., `run-10`
- Do NOT use names like `prompt-only-run-01` or `lattice-run-01`
- Do NOT include the mode name inside the run folder name
- The parent folder defines the mode
- `runId` in `run.config.json` = `run-XX` (no mode prefix)

---

## Template Strategy (Locked)

Templates are self-contained per mode.

Do NOT implement a real `base + overlay merge` system.

- `templates/run-package/base/` exists only as documentation/reference for shared structure
- `new-run.sh` does NOT consume `base/`

Reason: the goal is reproducibility, auditability, and low-risk scaffolding — not clever abstraction.

---

## Target Structure

### Templates

```
templates/
  run-package/
    base/
      README.md
    unstructured-context/
      ...
    structured-context/
      ...
```

### Experiments

```
experiments/
  unstructured-context/
    run-01/
    run-02/
    ...
  structured-context/
    run-01/
    run-02/
    ...
```

---

## Exact Stamped Run Skeleton

The scaffolding script must stamp a run with this structure.

### Unstructured Context

```
experiments/unstructured-context/run-XX/
  app/
  run-package/
  prompts/
  logs/
  results/
    raw/
    scored/
  media/
  run.config.json
  README.md
```

### Structured Context

```
experiments/structured-context/run-XX/
  app/
  run-package/
    structured-context/
  prompts/
  logs/
  results/
    raw/
    scored/
  media/
  run.config.json
  README.md
```

Optional placeholder subfolders inside `run-package/structured-context/` may include:

- `requirements/`
- `architecture/`
- `domain-rules/`
- `ui-ux/`

Empty directories survive with `.gitkeep` where needed.

---

## Execution Model (Worktrees + Branches)

This experiment uses a strict branch-per-run and worktree-per-run strategy.

Each run must be:

- Isolated
- Reproducible
- Independently inspectable
- Mergeable back into main as an archive

### Branch Naming

Branch names include the mode for clarity:

- `unstructured-context-run-01` ... `unstructured-context-run-10`
- `structured-context-run-01` ... `structured-context-run-10`

This is different from folder naming (where the parent defines the mode).

### Worktree Strategy

Each branch is checked out into its own git worktree:

```
../worktrees/
  unstructured-context-run-01/
  structured-context-run-01/
  ...
```

Each worktree points to its corresponding branch and operates independently.

### Freeze Point

Before initialization, main must be tagged:

```
git tag experiment-freeze-v1
git push origin experiment-freeze-v1
```

Before tagging, verify:

- main has no uncommitted changes
- main has no untracked scaffold/test artifacts
- main is fully up to date with origin

All run branches must be created from this exact commit.

### Run Initialization Order (must follow exactly)

```
1. Ensure main is clean and synced:
   git checkout main
   git pull

2. Create branch from freeze point:
   git branch <mode>-run-<NN> experiment-freeze-v1

3. Ensure the worktree parent exists:
   mkdir -p ../worktrees

4. Create worktree:
   git worktree add ../worktrees/<mode>-run-<NN> <mode>-run-<NN>

5. Move into worktree:
   cd ../worktrees/<mode>-run-<NN>

6. Create run folder inside that worktree:
   ./scripts/new-run.sh <mode> <NN>
```

### Post-Run Flow

After a run is complete:

1. Commit results on the run branch
2. Do NOT squash or rewrite history
3. Optionally merge into main as an archive

The goal is to preserve every run exactly as it happened and allow comparison across runs.

---

## Prompt Budget

Each run is limited to a fixed number of prompts.

- A prompt = one send action
- All prompts must be recorded in `prompts/`
- No hidden prompts or retries outside the budget
- Max 5 prompts per run

This constraint is critical to the experiment.

---

## Run Execution Rules

Inside each worktree:

- Only operate within the corresponding run folder
- Do NOT modify other run folders
- Do NOT reuse artifacts from previous runs
- Do NOT copy outputs between runs

Each run must behave as if it is independent.

---

## Invariants

### No Mid-Experiment Changes

Once initialization begins:

- Do NOT modify templates
- Do NOT modify `new-run.sh`
- Do NOT modify evaluator logic
- Do NOT modify run structure

If a critical issue is found:

- Stop the experiment
- Fix the issue
- Restart all runs from scratch

### Cleanup Rule

After scaffold verification:

- Delete test run folders created during verification
- Ensure `experiments/` contains no partially initialized runs
- Ensure no test branches or worktrees remain
- Verify a clean state before proceeding to initialization

### Git Isolation

The experiment compares unstructured-context vs structured-context — NOT different git workflows, environments, or tooling. The git/worktree strategy must be identical across both modes.

---

## Out of Scope

- Redesigning the evaluator
- Redesigning scoring philosophy
- Introducing merge-based base/overlay scaffolding
- Changing the experiment thesis
- Adding new experimental rules
- Refactoring unrelated app logic
- Authentication, database persistence, multiplayer networking

---

## Definition of Done

The repository should be in a state where:

- All naming is consistent
- All example paths and commands are consistent
- All old mode references are removed
- The stamped run skeleton is correct
- `new-run.sh` matches the docs
- `run-package/` semantics are explicit
- Structured-context artifacts are clearly frozen inputs
- The repo is easy to audit and ready for experiment execution

Verification includes:

1. Build/test/lint checks
2. Stale-reference grep checks for old names
3. Positive grep checks for new names
4. Scaffold verification in a temporary throwaway branch/worktree (not on main)
5. Freeze tag creation from verified clean main
