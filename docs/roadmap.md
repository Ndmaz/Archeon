# Roadmap

Roadmap status is intentionally conservative. A checkbox is complete only when the decision or artifact is present in the repository and reviewed.

## Milestone 0 — Identity and repository foundation

- [x] Choose the project name: Archeon.
- [x] Prefer `defineOperation()` as the public definition vocabulary.
- [x] Establish `main`, `dev`, and `testing` branches.
- [x] Add the initial README, contribution guide, and architecture-document baseline.
- [ ] Review and accept the remaining initial architecture proposals.

## Milestone 1 — Freeze the minimal architecture

- [x] Decide the v0 handler argument style: `execute({ input, context })` (ADR-0007).
- [x] Decide that input parsing is optional and framework-neutral (ADR-0007).
- [x] Decide that handler errors throw/reject and propagate through core (ADR-0008).
- [x] Establish explicit application-provided services in execution context as the starting point (ADR-0008).
- [ ] Accept the minimal execution-plan and planner responsibilities (ADR-0009).
- [ ] Decide module registration, operation identity syntax, and duplicate handling (ADR-0010).
- [ ] Define exact parser types and sync/async behavior.
- [ ] Define framework-level runtime errors and parser-failure semantics.
- [ ] Define lifecycle/policy ordering only for features actually included in v0.
- [ ] Decide the minimum package layout based on the vertical slice.
- [ ] Review plugin boundaries and decide whether a plugin API is needed in the first vertical slice.

## Milestone 2 — Minimal end-to-end implementation

- [ ] Implement the smallest framework-neutral core.
- [ ] Register a module containing one operation.
- [ ] Build a plan for that operation.
- [ ] Execute it through the runtime.
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
