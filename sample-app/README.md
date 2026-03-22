# Sample App

Minimal ASP.NET Core MVC application for Docker pipeline verification.

## Purpose

**This app is NOT part of the experiment runs.**

It exists solely to validate the evaluation pipeline:
- .NET build execution
- .NET test execution
- Docker container functionality
- Script orchestration

## Structure

```
sample-app/
├── SampleApp.sln
├── src/
│   └── SampleApp.Web/        - Minimal MVC web app
└── tests/
    └── SampleApp.Tests/      - 2 unit tests
```

## Building and Testing

```bash
dotnet build SampleApp.sln
dotnet test SampleApp.sln
```

Both commands should succeed.

## Usage in Evaluation Pipeline

The `scripts/evaluate-run.sh` script uses this app to verify:
1. `dotnet build` works in Docker
2. `dotnet test` works in Docker
3. Raw JSON generation works
4. Evaluator can process results
5. Exit codes are correct

## Important

- Do NOT modify this app for experiment runs
- Do NOT use this app to test scoring logic
- Keep it minimal and stable
- It's a system test fixture, not experiment data

See `docs/05-docker-evaluation-spec.md` for how this integrates with Docker.
