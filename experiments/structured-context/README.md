# Structured Context Experiments

Structured AI-assisted development runs.

## Mode Description

In structured-context mode:

- AI receives pre-structured context via a frozen run-package seed
- Context is organized into reusable artifacts
- AI works with structured information architecture
- Tests structured context-based development effectiveness

## Run Structure

Each run is a separate folder:

```
structured-context/
├── run-01/
├── run-02/
├── run-03/
└── ...
```

Each run folder contains:

- `run.config.json` — Configuration (purpose: "experiment", mode: "structured-context")
- `app/` — Generated application under test
- `run-package/structured-context/` — **Frozen inputs** (the key difference — seed material provided before the run)
- `prompts/` — Prompt logs (\*.jsonl)
- `logs/` — Timing and notes
- `results/raw/` — Raw evaluation results
- `results/scored/` — Scored evaluation results
- `media/` — Screenshots and recordings

## Creating a New Run

```bash
./scripts/new-run.sh structured-context 01
```

This copies the template from `templates/run-package/structured-context/` and sets `runId` to `run-01`.

## Structured Context Seed

The `run-package/structured-context/` subfolder contains frozen input context. This is seed material provided **before** the run starts — not generated output.

Populate this folder before starting the run with the structured context you want to provide to the AI.

## During the Run

1. Populate `run-package/structured-context/` with structured context before starting
2. Log all prompts to `prompts/*.jsonl`
3. Record timing data in `logs/timing.json`
4. Take screenshots to `media/`
5. Write observations to `logs/notes.md`
6. Raw results go to `results/raw/`

## After the Run

Evaluate:

```bash
./scripts/evaluate-run.sh experiments/structured-context/run-01
```

This produces:

- `results/scored/iteration-01.scored.json` — Scored results with purpose: "experiment"
- CLI summary showing scores and PASS/FAIL status

## Comparison

Compare structured-context runs with unstructured-context runs in `experiments/unstructured-context/` to measure the impact of structured context on development effectiveness.

See `docs/06-run-template-specs.md` and `docs/07-structured-context-seed-spec.md` for complete specifications.
