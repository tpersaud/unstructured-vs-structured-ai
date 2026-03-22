# Config

Scoring configuration for the evaluator system.

## Files

### `scorecard-rules.json`

Defines the scoring rules for all evaluation categories.

**Structure:**
- Each category has a `type` (ratio, boolean, threshold, penalty, inverse)
- Each category has a `maxScore` (always 5 for this experiment)

**Categories:**
1. **completionSuccess** - Ratio of acceptance checks passed
2. **buildAndTests** - Boolean pass/fail for build and test execution
3. **coverage** - Threshold-based scoring (80% threshold)
4. **architecture** - Penalty-based scoring (violations reduce score)
5. **promptEfficiency** - Inverse scoring (fewer prompts = higher score)
6. **timeEfficiency** - Inverse scoring (faster completion = higher score)

## Usage

Referenced by:
- `evaluator/src/io.ts` - Reads rules during evaluation
- `run.config.json` files - Specify path to this file

See `docs/04-evaluator-spec.md` for detailed scoring logic.
