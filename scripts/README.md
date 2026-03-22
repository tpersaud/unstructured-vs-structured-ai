# Scripts

Bash orchestration scripts for evaluation pipeline and run management.

## Files

### `evaluate-run.sh`

Main evaluation orchestration script.

**Usage:**
```bash
SCENARIO=pass ./scripts/evaluate-run.sh /path/to/run
SCENARIO=fail ./scripts/evaluate-run.sh /path/to/run
```

**What it does:**
1. Validates SCENARIO environment variable (must be `pass` or `fail`)
2. Runs `dotnet build` on the application
3. Runs `dotnet test` on the application
4. Selects appropriate raw template based on SCENARIO
5. Copies raw template to `results/raw/iteration-01.json`
6. Invokes evaluator CLI
7. Exits with evaluator's exit code

**SCENARIO modes:**
- `pass` - Uses `raw-pass-template.json` (all gates pass, exit 0)
- `fail` - Uses `raw-fail-template.json` (gates fail, exit 1)

### `new-run.sh`

Creates a new run directory from a template.

**Usage:**
```bash
./scripts/new-run.sh <mode> <run-number>
```

**Example:**
```bash
./scripts/new-run.sh prompt-only 01
./scripts/new-run.sh lattice 02
```

**What it does:**
1. Copies template from `templates/<mode>/` to `experiments/<mode>/<mode>-run-<number>/`
2. Updates `runId` in `run.config.json`
3. Creates empty result directories

### `raw-pass-template.json`

Deterministic raw result that meets all pass gate thresholds.

**Scores:**
- completionSuccess: 4/5 (80%)
- buildAndTests: Both pass
- coverage: 82%
- architecture: 1 violation
- timing: 15 minutes
- prompts: 5 (at budget)

**Expected:** PASS gate succeeds, exit 0

### `raw-fail-template.json`

Deterministic raw result that violates pass gate thresholds.

**Scores:**
- completionSuccess: 2/5 (40%) - **FAILS gate**
- buildAndTests: Both pass
- coverage: 65% - Below threshold
- architecture: 4 violations - **FAILS gate**
- timing: 35 minutes
- prompts: 8 (over budget)

**Expected:** FAIL gate fails, exit 1

## Purpose

These scripts provide:
- Controlled evaluation scenarios for testing
- Consistent run directory creation
- Docker pipeline verification
- Deterministic pass/fail validation

See `docs/05-docker-evaluation-spec.md` for integration details.
