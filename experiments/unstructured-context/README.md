# Unstructured Context Experiments

Unstructured AI-assisted development runs.

## Mode Description

In unstructured-context mode:

- AI receives task specification as raw prompts
- No pre-structured context or frozen seed material
- AI must organize information on its own
- Tests pure prompt-based development effectiveness

## Run Structure

Each run is a separate folder:

```
unstructured-context/
├── run-01/
├── run-02/
├── run-03/
└── ...
```

Each run folder contains:

- `run.config.json` — Configuration (purpose: "experiment", mode: "unstructured-context")
- `app/` — Generated application under test
- `run-package/` — Frozen inputs (empty for unstructured mode)
- `prompts/` — Prompt logs (\*.jsonl)
- `logs/` — Timing and notes
- `results/raw/` — Raw evaluation results
- `results/scored/` — Scored evaluation results
- `media/` — Screenshots and recordings

## Creating a New Run

```bash
./scripts/new-run.sh unstructured-context 01
```

This copies the template from `templates/run-package/unstructured-context/` and sets `runId` to `run-01`.

## During the Run

1. Log all prompts to `prompts/*.jsonl`
2. Record timing data in `logs/timing.json`
3. Take screenshots to `media/`
4. Write observations to `logs/notes.md`
5. Raw results go to `results/raw/`

## After the Run

Evaluate:

```bash
./scripts/evaluate-run.sh experiments/unstructured-context/run-01
```

This produces:

- `results/scored/iteration-01.scored.json` — Scored results with purpose: "experiment"
- CLI summary showing scores and PASS/FAIL status

## Comparison

Compare unstructured-context runs with structured-context runs in `experiments/structured-context/` to measure the impact of structured context on development effectiveness.

See `docs/06-run-template-specs.md` for complete template specification.
