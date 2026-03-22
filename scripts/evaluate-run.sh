#!/usr/bin/env bash
set -euo pipefail

# evaluate-run.sh
# Orchestration script: dotnet build/test + select raw JSON by SCENARIO + invoke evaluator CLI
#
# Usage:
#   SCENARIO=pass ./scripts/evaluate-run.sh <run-dir>
#   SCENARIO=fail ./scripts/evaluate-run.sh <run-dir>

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# --- Validate args ---

RUN_DIR="${1:-}"
if [[ -z "$RUN_DIR" ]]; then
  echo "ERROR: run directory argument is required"
  echo "Usage: SCENARIO=pass|fail $0 <run-dir>"
  exit 1
fi

if [[ ! -d "$RUN_DIR" ]]; then
  echo "ERROR: run directory does not exist: $RUN_DIR"
  exit 1
fi

# --- Validate SCENARIO ---

SCENARIO="${SCENARIO:-pass}"

if [[ "$SCENARIO" != "pass" && "$SCENARIO" != "fail" ]]; then
  echo "ERROR: Invalid SCENARIO. Must be 'pass' or 'fail'. Got: '$SCENARIO'"
  exit 1
fi

echo "========================================"
echo "Running evaluation scenario: $SCENARIO"
echo "Run directory: $RUN_DIR"
echo "========================================"

# --- Read run.config.json ---

RUN_CONFIG="$RUN_DIR/run.config.json"
if [[ ! -f "$RUN_CONFIG" ]]; then
  echo "ERROR: run.config.json not found at: $RUN_CONFIG"
  exit 1
fi

# Extract sampleMode from config (if present)
SAMPLE_MODE=$(python3 -c "import json; print(json.load(open('$RUN_CONFIG')).get('sampleMode', False))" 2>/dev/null || echo "False")

# --- Run dotnet build + test (if solution exists) ---

SOLUTION_FILE=$(python3 -c "import json; print(json.load(open('$RUN_CONFIG'))['paths'].get('solutionFile', ''))" 2>/dev/null || echo "")

if [[ -n "$SOLUTION_FILE" && -f "$RUN_DIR/$SOLUTION_FILE" ]]; then
  echo ""
  echo "--- dotnet build ---"
  dotnet build "$RUN_DIR/$SOLUTION_FILE" --configuration Release || true

  echo ""
  echo "--- dotnet test ---"
  dotnet test "$RUN_DIR/$SOLUTION_FILE" --configuration Release --no-build || true
else
  echo "No solution file found at $RUN_DIR/$SOLUTION_FILE — skipping dotnet build/test"
fi

# --- Select and copy raw JSON template ---

echo ""
echo "--- Generating raw results (scenario: $SCENARIO) ---"

RAW_RESULTS_DIR="$RUN_DIR/results/raw"
mkdir -p "$RAW_RESULTS_DIR"

if [[ "$SCENARIO" == "pass" ]]; then
  TEMPLATE="$SCRIPT_DIR/raw-pass-template.json"
elif [[ "$SCENARIO" == "fail" ]]; then
  TEMPLATE="$SCRIPT_DIR/raw-fail-template.json"
fi

if [[ ! -f "$TEMPLATE" ]]; then
  echo "ERROR: Template not found: $TEMPLATE"
  exit 1
fi

cp "$TEMPLATE" "$RAW_RESULTS_DIR/iteration-01.json"
echo "Copied $TEMPLATE -> $RAW_RESULTS_DIR/iteration-01.json"

# --- Invoke evaluator CLI ---

echo ""
echo "--- Running evaluator ---"

CONFIG_DIR="${CONFIG_DIR:-$REPO_ROOT/config}"
EVALUATOR_DIR="$REPO_ROOT/evaluator"

if [[ -f "$EVALUATOR_DIR/dist/cli.js" ]]; then
  node "$EVALUATOR_DIR/dist/cli.js" --run-dir "$RUN_DIR" --config-dir "$CONFIG_DIR"
else
  echo "Compiled CLI not found. Trying tsx..."
  npx --prefix "$EVALUATOR_DIR" tsx "$EVALUATOR_DIR/src/cli.ts" --run-dir "$RUN_DIR" --config-dir "$CONFIG_DIR"
fi
