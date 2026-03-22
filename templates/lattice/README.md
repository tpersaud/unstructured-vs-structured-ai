# Lattice Template

Template for **structured** lattice-based experiment runs.

## Mode Description

In lattice mode:
- AI receives pre-structured context via lattice
- Context is organized in a knowledge graph structure
- AI works with structured information architecture
- Tests structured context-based development

## Folder Structure

```
lattice/
├── run.config.json       - Configuration (mode: "lattice")
├── logs/
│   ├── timing.json       - Timing data (empty seed)
│   └── notes.md          - Observation notes (empty seed)
├── prompts/
│   └── README.md         - Instructions for logging prompts
├── results/
│   ├── raw/              - Raw evaluation results
│   └── scored/           - Scored evaluation results
├── media/                - Screenshots and recordings
└── lattice/              - Structured context files (lattice seed)
```

## Key Configuration

In `run.config.json`:
- `mode: "lattice"`
- Includes lattice-specific paths
- Standard model assignments
- Pass gate thresholds

## Lattice Subfolder

The `lattice/` subfolder contains:
- Pre-structured context files
- Domain model definitions
- Architecture specifications
- Organized knowledge base

This is the key difference from prompt-only mode.

## Creating a New Run

```bash
./scripts/new-run.sh lattice 01
```

This creates: `experiments/lattice/lattice-run-01/`

## During the Run

1. Populate `lattice/` with structured context before starting
2. Log all prompts to `prompts/*.jsonl`
3. Record timing data in `logs/timing.json`
4. Take screenshots to `media/`
5. Write observations to `logs/notes.md`
6. Raw results go to `results/raw/`

## After the Run

Run evaluation:
```bash
./scripts/evaluate-run.sh experiments/lattice/lattice-run-01
```

See `docs/06-run-template-specs.md` and `docs/07-lattice-seed-spec.md` for complete specifications.
