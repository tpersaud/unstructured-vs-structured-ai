# Lattice Experiments

Structured AI-assisted development runs.

## Mode Description

In lattice mode:
- AI receives pre-structured context via lattice
- Context is organized in a knowledge graph structure
- AI works with structured information architecture
- Tests structured context-based development effectiveness

## Iteration Structure

Each iteration is a separate run:

```
lattice/
├── lattice-run-01/
├── lattice-run-02/
├── lattice-run-03/
└── ...
```

Each run folder contains:
- `run.config.json` — Configuration (purpose: "experiment", mode: "lattice")
- `logs/` — Timing and notes
- `prompts/` — Prompt logs (*.jsonl)
- `results/` — Raw and scored evaluation results
- `media/` — Screenshots and recordings
- `lattice/` — **Structured context files** (the key difference)

## Creating a New Iteration

```bash
./scripts/new-run.sh lattice 01
```

This copies the template from `templates/lattice/` and updates `runId` to `lattice-run-01`.

## Lattice Subfolder

The `lattice/` subfolder contains:
- Pre-structured context files
- Domain model definitions
- Architecture specifications
- Organized knowledge base

Populate this folder before starting the run with the structured context you want to provide to the AI.

## During the Run

1. Populate `lattice/` with structured context before starting
2. Log all prompts to `prompts/*.jsonl`
3. Record timing data in `logs/timing.json`
4. Take screenshots to `media/`
5. Write observations to `logs/notes.md`
6. Raw results go to `results/raw/`

## After the Run

Evaluate:
```bash
./scripts/evaluate-run.sh experiments/lattice/lattice-run-01
```

This produces:
- `results/scored/iteration-01.scored.json` — Scored results with purpose: "experiment"
- CLI summary showing scores and PASS/FAIL status

## Comparison

Compare lattice iterations with prompt-only iterations in `experiments/prompt-only/` to measure the impact of structured context on development effectiveness.

See `docs/06-run-template-specs.md` and `docs/07-lattice-seed-spec.md` for complete specifications.
