# Code review: Archeon core v0

- **Review branch:** `testing`
- **Reviewed baseline:** `dev` at `f6f878848f2016b84fbc77afded3a764e340e79b`
- **Scope:** `packages/core/src`, package/workspace configuration, current tests, and CI
- **Status:** Initial review; findings below are not all fixed in this branch

## Summary

The core is small and readable, and its first vertical slice has CI coverage. The current test suite is a useful starting point, but the public contract still needs adversarial runtime and type-level tests before the API should be treated as stable. This review adds regression tests on `testing`; it deliberately avoids silently changing runtime behavior during the review pass.

## Findings

### R1 — High: enforce the service contract at the application boundary

**Location:** `packages/core/src/application.ts`, `packages/core/src/module.ts`

Operations declare their context service type, while `createApplication()` infers its own `TServices` from a combination of the options object and module constraint. The intended contract is that every operation's required services must be satisfied by the single application-bound services object. This needs an explicit compile-time regression test, particularly because `defineModule()` derives its service type through conditional types and `any`-based constraints.

**Action:** A type-level regression case has been added to `core.review.test.ts`. CI must prove that it is rejected by TypeScript (the `@ts-expect-error` directive must be consumed). If CI reports an unused directive, treat it as a real type-safety defect.

### R2 — Medium: validate module definitions at the runtime registration boundary

**Location:** `packages/core/src/module.ts`, `packages/core/src/application.ts`

`defineModule()` validates module names, but JavaScript callers or TypeScript callers using assertions can construct objects without using that helper. `createApplication()` rechecks operation names but does not independently validate module names or the structural shape of each module.

**Risk:** The helpers provide good ergonomics, but should not be mistaken for runtime guarantees when untrusted or untyped code can call the public API.

**Action:** Add tests for malformed module objects and decide whether construction should reject them with a stable Archeon error or whether the API explicitly requires helper-created definitions. Prefer a small validation boundary over broad defensive programming.

### R3 — Medium: operation-name grammar should have focused edge-case tests

**Location:** `packages/core/src/operation.ts`, `packages/core/src/application.ts`

The definition helper currently checks that names are non-empty and trimmed, while application construction applies a stricter regular expression. That split can be intentional—definitions may be composed before registration—but it means a definition can be created successfully and later fail during application construction.

**Action:** Document this boundary and test valid dot/hyphen-separated names, uppercase names, spaces, leading/trailing separators, and repeated separators. Keep the accepted grammar consistent with the ADRs.

### R4 — Medium: protect the immutability and registration-snapshot contract

**Location:** `packages/core/src/module.ts`, `packages/core/src/application.ts`

The implementation freezes the operation definition, module wrapper, copied operations map, application wrapper, and public metadata arrays. It intentionally does not deep-freeze services. Tests should establish that mutation of the caller's original operations map after `defineModule()` cannot change the registered operations, and that two invocations receive separate context wrappers while reusing the same bound service object.

**Action:** The new review suite covers the visible frozen objects and per-invocation context identity. Add a specific source-map mutation regression if the contract remains that module definitions snapshot their operation map.

### R5 — Low: remove competing package-manager metadata

**Location:** `packages/core/package-lock.json`

The repository uses pnpm workspaces and a root `pnpm-lock.yaml`, but also contains an npm lockfile inside the core package. This can mislead contributors about the supported installation path and allow dependency metadata to drift.

**Action:** Remove the nested npm lockfile after confirming it is not intentionally used for a standalone package workflow. Keep the pnpm workspace lockfile authoritative.

### R6 — Low: separate runtime tests from type-contract tests as the suite grows

**Location:** `packages/core/src/core.test.ts`, `packages/core/src/core.review.test.ts`

Runtime tests and compile-time assertions serve different purposes. The current CI type-check step is important because Vitest alone does not prove all compile-time expectations unless the test files are included in the TypeScript program.

**Action:** Keep the test files included in `pnpm typecheck`. If the suite grows, split runtime tests and type tests into clear files or use dedicated type-test tooling, but do not add a dependency solely for a handful of assertions.

## Test coverage added on `testing`

The review regression suite covers:

- asynchronous parser success and parsed-input delivery;
- unparsed input passthrough;
- asynchronous parser rejection and handler non-execution;
- fresh execution-context wrapper per invocation with stable bound services;
- frozen public definitions and registration metadata;
- invalid module names;
- registry keys differing from stable operation names;
- duplicate operation names across modules;
- runtime protection against unknown names from dynamic callers;
- stable error codes;
- compile-time rejection of an incomplete service object.

## Review disposition

Do not merge `testing` into `dev` merely because the current baseline is green. First inspect the new CI run. Any unused `@ts-expect-error` is a failing type-safety assertion and must be resolved. Then address R1 and R2 before designing request-scoped execution context or adding the Next.js adapter.
