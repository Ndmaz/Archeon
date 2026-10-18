# ADR-0004: Execution plan and compiler boundary

- **Status:** Proposed
- **Date:** 2026-10-09

## Context

Operation definitions may need to be normalized with application configuration before execution. A plan can make that transformation explicit and provide a stable input to the runtime.

## Proposal

The compiler/planner derives a small execution plan from registered definitions and configuration. The runtime executes that plan.

```text
Operation definition + application configuration
                    |
                plan builder
                    |
              Execution Plan
                    |
                  Runtime
```

The first plan should be a thin, inspectable structure. Do not build a generalized compiler or elaborate intermediate representation until a concrete requirement demonstrates the need.

## Questions to resolve

- Which fields belong in a plan versus remain on the operation definition?
- Is planning synchronous and deterministic?
- Is a plan built once per application or per invocation?
- What is the error model for invalid definitions?
- Does the plan represent only one operation or a sequence of lifecycle stages?

## Consequences

“Compiler” is a design direction, not permission to over-engineer v0. The first implementation should prove operation → plan → runtime with tests.
