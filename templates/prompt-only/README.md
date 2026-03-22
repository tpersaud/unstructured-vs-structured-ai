# Prompt-Only Template

Template for **unstructured** prompt-only experiment runs.

## Mode Description

In prompt-only mode:
- AI receives task specification as raw prompts
- No pre-structured context or lattice
- AI must organize information on its own
- Tests pure prompt-based development

## Folder Structure

```
prompt-only/
├── run.config.json       - Configuration (mode: "prompt-only")
├── logs/
│   ├── timing.json       - Timing data (empty seed)
│   └── notes.md          - Observation notes (empty seed)
├── prompts/
│   └── README.md         - Instructions for logging prompts
├── results/
│   ├── raw/              - Raw evaluation results
│   └── scored/           - Scored evaluation results
└── media/                - Screenshots and recordings
```

## Key Configuration

In `run.config.json`:
- `mode: "prompt-only"`
- No lattice-specific paths
- Standard model assignments
- Pass gate thresholds

## Creating a New Run

```bash
./scripts/new-run.sh prompt-only 01
```

This creates: `experiments/prompt-only/prompt-only-run-01/`

## During the Run

1. Log all prompts to `prompts/*.jsonl`
2. Record timing data in `logs/timing.json`
3. Take screenshots to `media/`
4. Write observations to `logs/notes.md`
5. Raw results go to `results/raw/`

## After the Run

Run evaluation:
```bash
./scripts/evaluate-run.sh experiments/prompt-only/prompt-only-run-01
```

See `docs/06-run-template-specs.md` for complete specification.
