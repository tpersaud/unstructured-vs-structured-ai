# Base Run Structure (Reference Only)

> **This directory is documentation only. `new-run.sh` does NOT consume `base/`.**

This folder documents the shared structure that both `unstructured-context` and `structured-context` templates include. It exists as a reference for understanding what is common across modes.

Merge-based scaffolding (where `new-run.sh` would compose `base/ + mode overlay`) is a future enhancement. For now, each mode template is fully self-contained.

## Shared Run Skeleton

Every run, regardless of mode, contains:

```
run-XX/
├── app/                    ← generated application under test
├── run-package/            ← frozen inputs (seed material provided before the run)
├── prompts/                ← generated evidence: prompt logs (*.jsonl)
├── logs/                   ← generated evidence: timing + notes
│   ├── timing.json
│   └── notes.md
├── results/                ← generated evidence: evaluation results
│   ├── raw/
│   └── scored/
├── media/                  ← generated evidence: screenshots + recordings
└── run.config.json         ← run configuration
```

## Artifact Semantics

| Folder | Type | Description |
|--------|------|-------------|
| `run-package/` | **Frozen input** | Seed material provided before the run starts |
| `app/` | **Generated** | Application under test, produced during the run |
| `prompts/` | **Generated evidence** | Prompt logs recorded during the run |
| `logs/` | **Generated evidence** | Timing data and observations |
| `results/` | **Generated evidence** | Raw and scored evaluation results |
| `media/` | **Generated evidence** | Screenshots and recordings |

## Mode-Specific Additions

- **Unstructured context:** `run-package/` contains only a `.gitkeep` (no structured seed)
- **Structured context:** `run-package/structured-context/` contains frozen context seed material
