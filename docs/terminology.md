# Terminology

This document records the vocabulary currently preferred for Archeon. It is a design baseline, not a claim that all concepts are already implemented.

## Operation

A named application capability. An operation may define identity, input/output types, metadata or policy configuration, and execution behavior. Examples include `users.create`, `orders.checkout`, and `payments.verify`.

The intended public definition helper is `defineOperation()`.

## Module

A named grouping of related operations. A module helps organize and register capabilities; it should not itself imply a particular transport or database.

## Execution plan

A runtime-oriented representation derived from an operation definition and application configuration. In the first version this should remain a small, explicit structure, not an elaborate general-purpose intermediate representation.

## Runtime / executor

The runtime is the public execution boundary and owns the execution lifecycle. An executor is an implementation detail that walks or interprets an execution plan. Whether these remain separate public concepts is not yet frozen.

## Plugin

An explicit extension mechanism for capabilities such as validation, authentication/authorization integration, rate limiting, caching, or database integration. Core should depend on contracts, not specific third-party libraries.

## Adapter

An integration that translates an external environment into Archeon execution. For example, a Next.js adapter may translate a request into an operation invocation and translate the result back into an HTTP response.

## Action

“Action” remains a possible internal term for a discrete execution step, but it is not the preferred public primitive. Avoid mixing “action” and “operation” casually in APIs and documentation.
