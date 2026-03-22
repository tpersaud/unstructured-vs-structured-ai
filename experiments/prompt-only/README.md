# Prompt-Only Experiments

Unstructured AI-assisted development runs.

## Mode Description

In prompt-only mode:
- AI receives task specification as raw prompts
- No pre-structured context or lattice
- AI must organize information on its own
- Tests pure prompt-based development effectiveness

## Iteration Structure

Each iteration is a separate run:

```
prompt-only/
├── prompt-only-run-01/
├── prompt-only-run-02/
├── prompt-only-run-03/
└── ...
```

Each run folder contains:
- `run.config.json` — Configuration (purpose: "experiment", mode: "prompt-only")
- `logs/` — Timing and notes
- `prompts/` — Prompt logs (*.jsonl)
- `results/` — Raw and scored evaluation results
- `media/` — Screenshots and recordings

## Creating a New Iteration

```bash
./scripts/new-run.sh prompt-only 01
```

This copies the template from `templates/prompt-only/` and updates `runId` to `prompt-only-run-01`.

## During the Run

1. Log all prompts to `prompts/*.jsonl`
2. Record timing data in `logs/timing.json`
3. Take screenshots to `media/`
4. Write observations to `logs/notes.md`
5. Raw results go to `results/raw/`

## After the Run

Evaluate:
```bash
./scripts/evaluate-run.sh experiments/prompt-only/prompt-only-run-01
```

This produces:
- `results/scored/iteration-01.scored.json` — Scored results with purpose: "experiment"
- CLI summary showing scores and PASS/FAIL status

## Comparison

Compare prompt-only iterations with lattice iterations in `experiments/lattice/` to measure the impact of structured context on development effectiveness.

See `docs/06-run-template-specs.md` for complete template specification.
