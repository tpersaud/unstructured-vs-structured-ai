# Texas Hold'em Kata Task Spec

## Goal

Build a Texas Hold'em ASP.NET Core MVC / Razor Pages application.

## Required Features

- Player management
- Deck creation and shuffle
- Deal hole cards
- Flop, turn, river
- Game phase tracking
- Simplified betting (check, call, raise, fold)
- Hand evaluation
- Winner determination
- Basic UI

## Architecture Expectations

- Controllers/PageModels remain thin
- Business logic in services
- Clear domain models
- No business logic in views

## Testing Expectations

- Unit tests for core logic
- Integration tests where appropriate
- Coverage target: 80%

## Validation Expectations

- No runtime crashes in normal flow
- Invalid actions handled safely

## Non-Goals

- Authentication
- Database persistence
- Multiplayer networking
- UI polish

## Definition of Done

- Completion ≥ 4
- Build & Tests ≥ 4
- Architecture ≥ 4
- Core flow works end-to-end
