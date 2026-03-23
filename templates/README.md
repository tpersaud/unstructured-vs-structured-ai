# Templates

Run-package templates for creating new experiment runs.

## Overview

Templates provide the canonical folder structure and seed files for new experiment runs. Each template is self-contained and corresponds to one experimental mode. Templates live under `run-package/`.

## Structure

```
templates/
  run-package/
    base/              ← documentation only; NOT consumed by new-run.sh
    unstructured-context/  ← self-contained template for unstructured mode
    structured-context/    ← self-contained template for structured mode
```

### `run-package/base/`

**Documentation only.** Documents the shared structure common to both modes. `new-run.sh` does **not** consume this directory. Merge-based scaffolding (base + overlay) is a future enhancement.

### `run-package/unstructured-context/`

Template for unstructured context runs. No frozen seed material — `run-package/` is empty.

### `run-package/structured-context/`

Template for structured context runs. Includes `run-package/structured-context/` as a placeholder for frozen context seed material.

## Stamped Run Skeleton

Both templates stamp the following directories when copied:

```
run-XX/
├── app/                    ← generated application under test
├── run-package/            ← frozen inputs (seed material before the run)
│   └── structured-context/ ← (structured-context mode only)
├── prompts/                ← generated evidence: prompt logs
├── logs/                   ← generated evidence: timing + notes
│   ├── timing.json
│   └── notes.md
├── results/                ← generated evidence: evaluation results
│   ├── raw/
│   └── scored/
├── media/                  ← generated evidence: screenshots + recordings
└── run.config.json
```

## Artifact Semantics

| Folder         | Type                   | Description                                     |
| -------------- | ---------------------- | ----------------------------------------------- |
| `run-package/` | **Frozen input**       | Seed material provided before the run starts    |
| `app/`         | **Generated**          | Application under test, produced during the run |
| `prompts/`     | **Generated evidence** | Prompt logs recorded during the run             |
| `logs/`        | **Generated evidence** | Timing data and observations                    |
| `results/`     | **Generated evidence** | Raw and scored evaluation results               |
| `media/`       | **Generated evidence** | Screenshots and recordings                      |

## Usage

Use `scripts/new-run.sh` to create a new run from a template:

```bash
./scripts/new-run.sh unstructured-context 01
./scripts/new-run.sh structured-context 02
```

This copies the template to `experiments/<mode>/run-XX/` with `runId` set to `run-XX`.

## Important

- **Do not modify templates directly** — they are the source of truth
- Templates are copied, not symlinked
- Each run gets its own independent copy
- `runId` is automatically set to `run-XX` (no mode prefix)
- Empty directories are preserved via `.gitkeep` files

See `docs/06-run-template-specs.md` for complete template specifications.
