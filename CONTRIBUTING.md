# Contributing to Archeon

Archeon is in its architecture-foundation phase. Contributions should favor small, reviewable changes and explicit reasoning over speculative abstraction.

## Workflow

1. Start from an up-to-date `dev` branch.
2. Create a focused branch: `feature/<topic>`, `docs/<topic>`, or `fix/<topic>`.
3. Keep changes scoped and include tests when behavior is implemented.
4. Open a pull request into `dev`; explain the problem, the decision, and trade-offs.
5. Use `testing` for integration validation and promote only reviewed, validated changes to `main`.

Do not commit directly to `main`. Avoid force-pushing shared branches.

## Architecture changes

- Read the relevant ADRs before changing an established decision.
- If a change alters an accepted decision, add or update an ADR in the same pull request.
- Distinguish current behavior from proposals and future possibilities.
- Prefer the smallest design that supports a demonstrated requirement.
- Keep core independent of framework-specific HTTP, database, validation, and authentication libraries.

## Current phase

The next objective is to freeze minimal contracts for operations, modules, execution plans, runtime execution, and plugin boundaries before building out packages.
