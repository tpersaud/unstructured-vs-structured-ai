#!/usr/bin/env bash
set -euo pipefail

# new-run.sh
# Create a new run folder from a template
#
# Usage:
#   ./scripts/new-run.sh <mode> <run-number>
#   ./scripts/new-run.sh unstructured-context 01
#   ./scripts/new-run.sh structured-context 02

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

MODE="${1:-}"
RUN_NUMBER="${2:-}"

if [[ -z "$MODE" || -z "$RUN_NUMBER" ]]; then
  echo "ERROR: mode and run number are required"
  echo "Usage: $0 <mode> <run-number>"
  echo "  mode: unstructured-context | structured-context"
  echo "  run-number: 01, 02, etc."
  exit 1
fi

if [[ "$MODE" != "unstructured-context" && "$MODE" != "structured-context" ]]; then
  echo "ERROR: Invalid mode. Must be 'unstructured-context' or 'structured-context'. Got: '$MODE'"
  exit 1
fi

TEMPLATE_DIR="$REPO_ROOT/templates/run-package/$MODE"
TARGET_DIR="$REPO_ROOT/experiments/$MODE/run-$RUN_NUMBER"

if [[ ! -d "$TEMPLATE_DIR" ]]; then
  echo "ERROR: Template directory not found: $TEMPLATE_DIR"
  exit 1
fi

if [[ -d "$TARGET_DIR" ]]; then
  echo "ERROR: Run directory already exists: $TARGET_DIR"
  exit 1
fi

echo "Creating run: $TARGET_DIR"
echo "From template: $TEMPLATE_DIR"

cp -r "$TEMPLATE_DIR" "$TARGET_DIR"

# Update runId in run.config.json
if command -v python3 &>/dev/null; then
  python3 -c "
import json
config_path = '$TARGET_DIR/run.config.json'
with open(config_path) as f:
    config = json.load(f)
config['runId'] = 'run-$RUN_NUMBER'
with open(config_path, 'w') as f:
    json.dump(config, f, indent=2)
"
  echo "Updated runId to: run-$RUN_NUMBER"
fi

echo ""
echo "Run created successfully at: $TARGET_DIR"
echo "Next steps:"
echo "  1. Add your app code to $TARGET_DIR/app/"
echo "  2. Record prompts in $TARGET_DIR/prompts/"
echo "  3. Update timing in $TARGET_DIR/logs/timing.json"
echo "  4. Run evaluation: SCENARIO=pass ./scripts/evaluate-run.sh $TARGET_DIR"
