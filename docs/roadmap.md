# Roadmap

Roadmap status is intentionally conservative. A checkbox is complete only when the decision or artifact is present in the repository and reviewed.

## Milestone 0 — Identity and repository foundation

- [x] Choose the project name: Archeon.
- [x] Prefer `defineOperation()` as the public definition vocabulary.
- [x] Establish `main`, `dev`, and `testing` branches.
- [ ] Review and accept the initial architecture documents.
- [ ] Add repository contribution and pull-request conventions.

## Milestone 1 — Freeze the minimal architecture

- [ ] Specify the operation definition and invocation contracts.
- [ ] Specify module registration and duplicate-name behavior.
- [ ] Specify execution context and service resolution.
- [ ] Specify execution plan shape and compiler responsibilities.
- [ ] Specify result/error semantics and lifecycle order.
- [ ] Specify plugin contracts and registration timing.
- [ ] Decide the minimum package layout based on the vertical slice.

## Milestone 2 — Minimal end-to-end implementation

- [ ] Implement the smallest framework-neutral core.
- [ ] Register a module containing one operation.
- [ ] Build a plan for that operation.
- [ ] Execute it through the runtime.
- [ ] Add unit tests for contracts, registration, planning, and execution.
- [ ] Provide one runnable example and validate its types/build.

## Milestone 3 — Adapter and integration proof

- [ ] Add a thin Next.js adapter only after the core invocation contract is stable.
- [ ] Prove error and HTTP response mapping.
- [ ] Add validation/auth integrations only through agreed interfaces.
- [ ] Evaluate whether React hooks or other client helpers are needed for v0.

## Milestone 4 — Documentation and quality

- [ ] Getting started guide.
- [ ] Operation/module guide.
- [ ] Execution context and service guide.
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
