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
- [x] Keep parser inference framework-neutral; unparsed input is `unknown` (ADR-0011 and implementation).
- [x] Define the initial framework-level registration/lookup error surface (ADR-0012 and implementation); revisit before stable release.
- [x] Confirm the minimal package layout and pnpm workspace toolchain (ADR-0013 and repository).
- [x] Type-check the public invocation signatures and infer outputs from operation names in CI.

## Milestone 2 — Minimal end-to-end implementation

- [x] Create and CI-validate the initial framework-neutral core.
- [x] Add a basic consumer example and validate its types in CI.
- [x] Build plans once during application construction.
- [x] Execute an operation by its stable name through the runtime.
- [x] Add unit tests for parser/handler failures, duplicate registrations, invalid names, unknown operations, and execution.
- [x] Add a basic consumer example and pass its TypeScript check in CI.

## Milestone 3 — Adapter and integration proof

- [x] Bind application services at construction and use `app.execute(name, input)` (ADR-0014).
- [x] Define a framework-neutral, per-invocation request context separate from application services (ADR-0015).

- [x] Implement the typed request-context contract from ADR-0015 with runtime and type tests.
- [ ] Add a thin Next.js adapter after request-context implementation is validated.
- [ ] Prove error and HTTP response mapping.
- [ ] Add validation/auth integrations only through agreed interfaces.
- [ ] Evaluate whether React hooks or other client helpers are needed for v0.

## Milestone 4 — Documentation and quality

- [ ] Getting-started guide.
- [ ] Operation/module guide.
- [x] Execution-context and service guide.
- [ ] Adapter and plugin guides.
- [x] CI validates type-checking, tests, build, and example types.

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
