# Experiments

Experiment runs comparing unstructured context vs structured context in AI-assisted development.

## Overview

This directory contains iteration folders for two experimental modes:

- **`unstructured-context/`** — AI receives task specification as raw prompts with no persistent structure
- **`structured-context/`** — AI receives pre-organized context via a frozen run-package seed

Each mode has multiple runs (e.g., `run-01`, `run-02`) created from templates using `scripts/new-run.sh`. The parent folder defines the mode; run folders are always named `run-XX`.

## Creating a New Run

### Unstructured Context

```bash
./scripts/new-run.sh unstructured-context 01
```

Creates: `experiments/unstructured-context/run-01/`

### Structured Context

```bash
./scripts/new-run.sh structured-context 01
```

Creates: `experiments/structured-context/run-01/`

## Run Structure

Each run contains:

```
run-XX/
├── app/                    ← generated application under test
├── run-package/            ← frozen inputs (seed material provided before the run)
│   └── structured-context/ ← (structured-context mode only)
├── prompts/                ← generated evidence: prompt logs (*.jsonl)
├── logs/                   ← generated evidence: timing + notes
│   ├── timing.json
│   └── notes.md
├── results/                ← generated evidence: evaluation results
│   ├── raw/
│   └── scored/
├── media/                  ← generated evidence: screenshots + recordings
└── run.config.json         ← run configuration (purpose: "experiment")
```

### Artifact Semantics

- **`run-package/`** = frozen inputs provided before the run starts
- **`app/`** = generated application under test
- **`prompts/`, `logs/`, `results/`, `media/`** = generated evidence produced during/after the run

## Evaluating a Run

```bash
SCENARIO=pass ./scripts/evaluate-run.sh experiments/unstructured-context/run-01
```

Or for real experiment runs (without SCENARIO override):

```bash
./scripts/evaluate-run.sh experiments/unstructured-context/run-01
```

See `scripts/README.md` for details.

## Key Differences

| Aspect           | Unstructured Context | Structured Context                          |
| ---------------- | -------------------- | ------------------------------------------- |
| **Context**      | Raw prompts only     | Pre-structured frozen context               |
| **Organization** | AI-driven            | Pre-defined run-package seed                |
| **Folder**       | `run-package/` empty | `run-package/structured-context/` populated |
| **Complexity**   | Simpler setup        | More preparation                            |

See `docs/06-run-template-specs.md` and `docs/07-structured-context-seed-spec.md` for complete specifications.
