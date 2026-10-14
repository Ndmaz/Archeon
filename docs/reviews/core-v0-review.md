# Code review: Archeon core v0

- **Review branch:** `testing`
- **Reviewed baseline:** `dev` at `f6f878848f2016b84fbc77afded3a764e340e79b`
- **Scope:** `packages/core/src`, package/workspace configuration, current tests, and CI
- **Status:** Initial review fixes implemented on `testing`; latest full CI validation passed

## Summary

The core is small and readable, and its first vertical slice has CI coverage. The current test suite is a useful starting point, but the public contract still needs adversarial runtime and type-level tests before the API should be treated as stable. This review adds regression tests on `testing`; it deliberately avoids silently changing runtime behavior during the review pass.

## Findings

### R1 — High: enforce the service contract at the application boundary

**Location:** `packages/core/src/application.ts`, `packages/core/src/module.ts`

Operations declare their context service type, while `createApplication()` infers its own `TServices` from a combination of the options object and module constraint. The intended contract is that every operation's required services must be satisfied by the single application-bound services object. This needs an explicit compile-time regression test, particularly because `defineModule()` derives its service type through conditional types and `any`-based constraints.

**Resolved for this review pass:** `createApplication()` now derives required services from registered modules. `tsconfig.test.json` includes the tests in type-checking, and the intentionally incomplete service object is rejected at compile time. The latest CI run passes.

### R2 — Medium: validate module definitions at the runtime registration boundary

**Location:** `packages/core/src/module.ts`, `packages/core/src/application.ts`

`defineModule()` validates module names, but JavaScript callers or TypeScript callers using assertions can construct objects without using that helper. `createApplication()` rechecks operation names but does not independently validate module names or the structural shape of each module.

**Risk:** The helpers provide good ergonomics, but should not be mistaken for runtime guarantees when untrusted or untyped code can call the public API.

**Resolved for this review pass:** `createApplication()` validates module shape/name and operation shape/handler/parser before registration, using `InvalidModuleDefinitionError`. Regression tests cover malformed module names, missing operations objects, and non-function handlers.

### R3 — Medium: operation-name grammar should have focused edge-case tests

**Location:** `packages/core/src/operation.ts`, `packages/core/src/application.ts`

The definition helper currently checks that names are non-empty and trimmed, while application construction applies a stricter regular expression. That split can be intentional—definitions may be composed before registration—but it means a definition can be created successfully and later fail during application construction.

**Resolved for this review pass:** `defineOperation()` and application registration now use the same grammar. Tests cover valid dot/hyphen-separated names plus uppercase, whitespace, leading/trailing, and repeated separators. Invalid names now fail early with `InvalidOperationNameError`.

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

**Resolved:** Added `tsconfig.test.json` and changed the core typecheck script to include test files. This caught the service-contract typing issue and ensured the `@ts-expect-error` assertion itself is validated.

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
- malformed module/operation object rejection;
- consistent operation-name grammar and edge cases;
- registration snapshot behavior when the source operations map is later mutated;
- compile-time rejection of an incomplete service object.

## Validation and disposition

Latest CI run: https://github.com/Ndmaz/Archeon/actions/runs/38645114276

The latest run passed core type-checking (including test files), all 21 runtime tests, the core build, and the basic example type-check. The nested npm lockfile was removed; pnpm remains the workspace package manager. This is a review-fix baseline suitable for a pull request into `dev`; it is not yet a stable-release claim.
