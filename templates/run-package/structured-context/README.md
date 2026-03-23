# Structured Context Template

Template for **structured context** experiment runs.

## Mode Description

In structured-context mode:

- AI receives pre-structured context via a frozen run-package seed
- Context is organized into reusable artifacts
- AI works with structured information architecture
- Tests structured context-based development

## Folder Structure

```
structured-context/
├── app/                        ← generated application under test
├── run-package/                ← frozen inputs
│   └── structured-context/     ← structured context seed (populated before run)
├── prompts/
│   └── README.md               - Instructions for logging prompts
├── logs/
│   ├── timing.json             - Timing data (empty seed)
│   └── notes.md                - Observation notes (empty seed)
├── results/
│   ├── raw/                    - Raw evaluation results
│   └── scored/                 - Scored evaluation results
├── media/                      - Screenshots and recordings
└── run.config.json             - Configuration (mode: "structured-context")
```

## Key Configuration

In `run.config.json`:

- `mode: "structured-context"`
- Standard model assignments
- Pass gate thresholds

## Structured Context Seed

The `run-package/structured-context/` subfolder is a **frozen input** — seed material provided before the run starts, not generated output.

This is the key difference from unstructured-context mode. Populate this folder before starting the run with the structured context you want to provide to the AI.

## Creating a New Run

```bash
./scripts/new-run.sh structured-context 01
```

This creates: `experiments/structured-context/run-01/`

## During the Run

1. Populate `run-package/structured-context/` with structured context before starting
2. Log all prompts to `prompts/*.jsonl`
3. Record timing data in `logs/timing.json`
4. Take screenshots to `media/`
5. Write observations to `logs/notes.md`
6. Raw results go to `results/raw/`

## After the Run

Run evaluation:

```bash
./scripts/evaluate-run.sh experiments/structured-context/run-01
```

See `docs/06-run-template-specs.md` and `docs/07-structured-context-seed-spec.md` for complete specifications.
