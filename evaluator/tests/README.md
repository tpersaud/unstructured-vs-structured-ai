# Evaluator Test Suite

Comprehensive test suite for the evaluator with 100% code coverage using TDD (AAA pattern) and BDD (Feature/Scenario) approaches.

## Test Organization

### Unit Tests (AAA Format)
Unit tests follow the **Arrange-Act-Assert (AAA)** pattern for clarity and maintainability.

- **`scoring.test.ts`** - Tests for all scoring functions (58 tests)
  - `scoreCompletionSuccess` - Ratio-based scoring
  - `scoreBuildAndTests` - Boolean scoring
  - `scoreCoverage` - Threshold-based scoring
  - `scoreArchitecture` - Penalty-based scoring
  - `scorePromptEfficiency` - Inverse scoring
  - `scoreTimeEfficiency` - Inverse scoring
  - `scoreRun` - Integration scoring
  - `totalScore` - Score aggregation
  - Edge cases for boundary conditions

- **`gate.test.ts`** - Tests for pass gate evaluation (14 tests)
  - Pass/fail scenarios
  - Threshold boundaries
  - Multiple failure conditions
  - Edge cases for custom thresholds

- **`io.test.ts`** - Tests for file I/O operations (16 tests)
  - Reading run configurations
  - Reading raw results
  - Reading scorecard rules
  - Counting prompts
  - Reading timing data
  - Writing scored results
  - Error handling for missing/malformed files

### Integration Tests (AAA Format)

- **`cli.test.ts`** - CLI integration tests (3 tests)
  - Full evaluation pipeline for PASS scenarios
  - Full evaluation pipeline for FAIL scenarios
  - Score verification

### End-to-End Tests (BDD Format)

- **`e2e.test.ts`** - BDD-style end-to-end tests (10 tests)
  - **Feature: CLI Evaluation Workflow**
    - Scenario: Evaluate passing fixture via CLI
    - Scenario: Evaluate failing fixture via CLI
    - Scenario: Handle missing run directory
    - Scenario: Handle invalid run configuration
    - Scenario: Handle missing raw results
    - Scenario: Handle corrupted scorecard rules
  - **Feature: Purpose Field Validation**
    - Scenario: Pipeline verification run produces correct purpose
    - Scenario: Experiment run produces correct purpose
    - Scenario: Missing purpose field defaults correctly
  - **Feature: Complete Evaluation Pipeline**
    - Scenario: Full pipeline from raw results to scored output

## AAA Pattern Structure

All unit and integration tests follow the Arrange-Act-Assert pattern:

```typescript
it('should return expected result when condition is met', () => {
  // Arrange
  const input = setupTestData();
  const expectedValue = 5;

  // Act
  const result = functionUnderTest(input);

  // Assert
  expect(result).toBe(expectedValue);
});
```

### Benefits of AAA Pattern
- **Clear separation** of test phases
- **Easy to read** and understand test intent
- **Maintainable** - changes are localized to specific phases
- **Consistent** across all unit tests

## BDD Format Structure

End-to-end tests use BDD-style Feature/Scenario organization:

```typescript
describe('Feature: CLI Evaluation Workflow', () => {
  describe('Scenario: Evaluate passing fixture via CLI', () => {
    it('should complete full evaluation and produce passing result', () => {
      // Given a valid run configuration for a passing scenario
      // ... setup code ...

      // When the evaluation runs
      // ... execution code ...

      // Then the evaluation should pass
      // ... assertions ...
    });
  });
});
```

### Benefits of BDD Format
- **User-focused** - tests describe behavior from user perspective
- **Documentation** - tests serve as living documentation
- **Traceability** - easy to map tests to requirements
- **Collaboration** - non-technical stakeholders can understand tests

## Running Tests

### All Tests
```bash
npm test              # Run all tests once
npm run test:all      # Explicit all tests
npm run test:watch    # Run tests in watch mode
```

### By Category
```bash
npm run test:unit         # Run unit tests only (scoring, gate, io)
npm run test:integration  # Run integration tests only (cli)
npm run test:e2e          # Run end-to-end tests only
```

### Coverage
```bash
npm run test:coverage     # Run tests with coverage report
npm run test:coverage:ui  # Run tests with interactive coverage UI
```

## Coverage Requirements

The evaluator maintains **100% code coverage** on all metrics:
- **Lines:** 100%
- **Functions:** 100%
- **Branches:** 100%
- **Statements:** 100%

Coverage excludes:
- `src/cli.ts` - Main entry point with process.exit calls
- Type definition files (`*.d.ts`)
- Test files
- Fixture directories

## Test Count Summary

| Category | File | Tests | Description |
|----------|------|-------|-------------|
| Unit | `scoring.test.ts` | 58 | Scoring functions + edge cases |
| Unit | `gate.test.ts` | 14 | Pass gate evaluation + edge cases |
| Unit | `io.test.ts` | 16 | File I/O operations |
| Integration | `cli.test.ts` | 3 | CLI integration |
| E2E | `e2e.test.ts` | 10 | BDD end-to-end scenarios |
| **Total** | | **101** | **All tests** |

## Edge Cases Covered

### Scoring Module
- Boundary values (0, max, exact thresholds)
- Very large inputs (999/1000 checks, 1000 prompts, 500 minutes)
- Fractional rounding scenarios
- Zero and negative edge cases

### Gate Module
- Custom minimum thresholds (1-5)
- Just-below-minimum failures
- Mixed pass/fail scenarios
- Maximum threshold values

### I/O Module
- Missing files and directories
- Malformed JSON
- Empty files
- Whitespace-only content

## Writing New Tests

### For Unit Tests (AAA Pattern)
1. Create test in appropriate file (`scoring.test.ts`, `gate.test.ts`, `io.test.ts`)
2. Use `describe` blocks to group related tests
3. Follow AAA pattern with explicit comments
4. Test both happy path and edge cases

### For Integration Tests (AAA Pattern)
1. Add to `cli.test.ts`
2. Use `setupTestRun` helper for fixture creation
3. Test complete workflows end-to-end
4. Verify file system side effects

### For E2E Tests (BDD Format)
1. Add to `e2e.test.ts`
2. Use Feature/Scenario structure
3. Write Given-When-Then style tests
4. Focus on user-facing behavior

## Continuous Integration

All tests must pass before merging:
```bash
npm run build         # 0 TypeScript errors
npm run lint          # 0 ESLint errors/warnings
npm run format:check  # All files formatted
npm test              # 100% test pass rate
npm run test:coverage # 100% code coverage
```

## Test Data Helpers

### Scoring Tests
- `makeRaw()` - Creates RawResult with defaults and overrides
- `defaultRules` - Standard ScorecardRules configuration

### Gate Tests
- `makeConfig()` - Creates RunConfig with defaults and overrides
- `makeScores()` - Creates Scores with defaults and overrides

### I/O Tests
- `TEST_DIR` - Temporary directory for file operations
- `beforeEach/afterEach` - Automatic cleanup

### E2E Tests
- `E2E_TEST_DIR` - Isolated temporary directory
- `setupTestRun()` - Complete fixture creation (in cli.test.ts)

## Debugging Tests

### Run specific test file
```bash
npx vitest run tests/scoring.test.ts
```

### Run specific test
```bash
npx vitest run -t "should return 5 when both pass"
```

### Debug with UI
```bash
npm run test:coverage:ui
```

### Watch mode for development
```bash
npm run test:watch
```

## Best Practices

1. **One assertion per concept** - Keep tests focused
2. **Descriptive test names** - Use "should X when Y" format
3. **Arrange phase completeness** - Set up all necessary data
4. **Act phase simplicity** - Single action under test
5. **Assert phase clarity** - Clear expected vs actual
6. **Test independence** - No shared state between tests
7. **Edge case coverage** - Test boundaries and extremes
8. **Error scenarios** - Test failure paths
9. **Cleanup** - Use beforeEach/afterEach for file operations
10. **Comments** - Explain complex setups or unusual scenarios
