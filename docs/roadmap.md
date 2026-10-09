# Roadmap

Roadmap status is intentionally conservative. A checkbox is complete only when the decision or artifact is present in the repository and reviewed.

## Milestone 0 — Identity and repository foundation

- [x] Choose the project name: Archeon.
- [x] Prefer `defineOperation()` as the public definition vocabulary.
- [x] Establish `main`, `dev`, and `testing` branches.
- [x] Add the initial README, contribution guide, and architecture-document baseline.
- [x] Record the initial core design decisions in ADRs.

## Milestone 1 — Freeze the minimal architecture

- [x] Decide the v0 handler argument style: `execute({ input, context })` (ADR-0007).
- [x] Decide that input parsing is optional and framework-neutral (ADR-0007).
- [x] Decide that handler errors throw/reject and propagate through core (ADR-0008).
- [x] Establish explicit application-provided services as the context starting point (ADR-0008).
- [x] Accept one in-memory execution plan per registered operation, built during application construction (ADR-0009).
- [x] Decide explicit globally unique operation names and organizational modules (ADR-0010).
- [x] Reject duplicate operation and module names; do not silently override (ADR-0010).
- [ ] Finalize parser type inference and whether unparsed input is typed as `unknown` (ADR-0011).
- [ ] Define the smallest stable framework-level error surface (ADR-0012).
- [ ] Confirm the minimal package layout and toolchain (ADR-0013).
- [ ] Define the public TypeScript signatures and prove them with type tests.

## Milestone 2 — Minimal end-to-end implementation

- [x] Create the initial framework-neutral core prototype (not yet locally build-verified).
- [x] Add a basic example registering a module containing one operation (not yet locally typecheck-verified).
- [ ] Build plans once during application construction.
- [ ] Execute an operation by its stable name through the runtime.
- [ ] Add unit and type tests for contracts, registration, planning, and execution.
- [ ] Provide one runnable example and validate its types/build.

## Milestone 3 — Adapter and integration proof

- [ ] Add a thin Next.js adapter only after the core invocation contract is stable.
- [ ] Prove error and HTTP response mapping.
- [ ] Add validation/auth integrations only through agreed interfaces.
- [ ] Evaluate whether React hooks or other client helpers are needed for v0.

## Milestone 4 — Documentation and quality

- [ ] Getting-started guide.
- [ ] Operation/module guide.
- [ ] Execution-context and service guide.
- [ ] Adapter and plugin guides.
- [ ] Tests, type checks, build, and example validation in CI.

## Milestone 5 — First release

- [ ] Decide package names, exports, license, and compatibility policy.
- [ ] Inspect build output and published package contents.
- [ ] Publish a version only after the end-to-end example and tests pass.
- [ ] Create a GitHub release and changelog.

## Post-v0 possibilities (not commitments)

- Richer intermediate representation and compiler optimization.
- More lifecycle stages and middleware.
- Events and observability.
- Advanced caching.
- Additional adapters and integrations.
- DevTools or a visual execution graph.

**Principle:** the post-v0 list is a set of hypotheses, not a promise. Every item must earn its place.
