# ADR-0001: Project identity

- **Status:** Accepted
- **Date:** 2026-10-09

## Context

The project evolved from a CRUD-oriented request handler into a framework-neutral model for defining and executing application capabilities. A name tied to CRUD, a particular transport, or a workflow engine would constrain its identity.

## Decision

The project is named **Archeon**.

Working description:

> Archeon is an operation runtime for TypeScript applications.

The project explores defining application operations, deriving execution plans, and running them through an extensible runtime.

## Consequences

- Public documentation and repository references use “Archeon”.
- The primary concept is an operation.
- The name does not imply that all proposed compiler/runtime/plugin features already exist.
- The previous working name “ActionFlow” is retired for this project because of ecosystem/name-collision concerns.
