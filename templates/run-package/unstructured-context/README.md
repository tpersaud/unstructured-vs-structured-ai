# Unstructured Context Template

Template for **unstructured context** experiment runs.

## Mode Description

In unstructured-context mode:

- AI receives task specification as raw prompts
- No pre-structured context or frozen seed material
- AI must organize information on its own
- Tests pure prompt-based development

## Folder Structure

```
unstructured-context/
├── app/                    ← generated application under test
├── run-package/            ← frozen inputs (empty for unstructured mode)
├── prompts/
│   └── README.md           - Instructions for logging prompts
├── logs/
│   ├── timing.json         - Timing data (empty seed)
│   └── notes.md            - Observation notes (empty seed)
├── results/
│   ├── raw/                - Raw evaluation results
│   └── scored/             - Scored evaluation results
├── media/                  - Screenshots and recordings
└── run.config.json         - Configuration (mode: "unstructured-context")
```

## Key Configuration

In `run.config.json`:

- `mode: "unstructured-context"`
- `run-package/` is empty (no frozen seed)
- Standard model assignments
- Pass gate thresholds

## Creating a New Run

```bash
./scripts/new-run.sh unstructured-context 01
```

This creates: `experiments/unstructured-context/run-01/`

## During the Run

1. Log all prompts to `prompts/*.jsonl`
2. Record timing data in `logs/timing.json`
3. Take screenshots to `media/`
4. Write observations to `logs/notes.md`
5. Raw results go to `results/raw/`

## After the Run

Run evaluation:

```bash
./scripts/evaluate-run.sh experiments/unstructured-context/run-01
```

See `docs/06-run-template-specs.md` for complete specification.
