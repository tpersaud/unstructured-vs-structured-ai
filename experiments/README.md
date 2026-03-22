# Experiments

Experiment runs comparing unstructured (prompt-only) vs structured (lattice-based) AI-assisted development.

## Overview

This directory contains iteration folders for two experimental modes:

- **`prompt-only/`** — Unstructured approach: AI receives task specification as raw prompts
- **`lattice/`** — Structured approach: AI receives pre-organized context via lattice

Each mode has multiple iterations (e.g., `prompt-only-run-01/`, `lattice-run-01/`) that are created from templates using `scripts/new-run.sh`.

## Creating a New Run

### Prompt-Only Mode

```bash
./scripts/new-run.sh prompt-only 01
```

Creates: `experiments/prompt-only/prompt-only-run-01/`

### Lattice Mode

```bash
./scripts/new-run.sh lattice 01
```

Creates: `experiments/lattice/lattice-run-01/`

## Run Structure

Each run contains:

```
<mode>-run-<number>/
├── run.config.json       - Configuration (purpose: "experiment")
├── logs/
│   ├── timing.json       - Duration tracking
│   └── notes.md          - Observations
├── prompts/
│   └── *.jsonl           - Prompt logs
├── results/
│   ├── raw/              - Raw evaluation results
│   └── scored/           - Scored evaluation results
├── media/                - Screenshots and recordings
└── lattice/              - (lattice mode only) Structured context
```

## Evaluating a Run

```bash
SCENARIO=pass ./scripts/evaluate-run.sh experiments/prompt-only/prompt-only-run-01
```

Or for real experiment runs (without SCENARIO override):

```bash
./scripts/evaluate-run.sh experiments/prompt-only/prompt-only-run-01
```

See `scripts/README.md` for details.

## Key Differences

| Aspect | Prompt-Only | Lattice |
|--------|-------------|---------|
| **Context** | Raw prompts only | Pre-structured context |
| **Organization** | AI-driven | Pre-defined lattice |
| **Folder** | No lattice/ subfolder | Includes lattice/ subfolder |
| **Complexity** | Simpler setup | More preparation |

See `docs/06-run-template-specs.md` and `docs/07-lattice-seed-spec.md` for complete specifications.
