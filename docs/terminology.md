# Terminology

This document records the vocabulary currently preferred for Archeon. It is a design baseline, not a claim that all concepts are already implemented.

## Operation

A named application capability. An operation declares a globally unique, stable name, an optional framework-neutral input parser, and execution behavior. Its handler receives one object containing `input` and `context`.

Examples include `users.create`, `orders.checkout`, and `payments.verify`.

The intended public definition helper is `defineOperation()`.

## Module

A named organizational grouping of operation definitions. A module does not imply a database model, transport, or runtime namespace. Module membership does not alter an operation's declared name.

Module names and operation names must be unique within their respective application registry scopes. Duplicate registrations fail; no implicit replacement or merge occurs.

## Execution plan

A small, in-memory runtime representation derived from an operation definition during application construction. V0 builds one plan per registered operation and resolves plans by operation name at invocation time. Plans are not serialized artifacts or a public extension point in v0.

## Application construction

The setup phase that validates registered modules and operation identities, builds the operation plans, and produces the runtime-ready application. The v0 registry is immutable after construction; dynamic registration and hot replacement are out of scope.

## Runtime / executor

The runtime is the execution boundary: it resolves a plan, applies the optional input parser, invokes the handler with explicit context, returns successful values, and propagates parser/handler failures. The exact split between runtime and executor is an implementation detail unless a concrete public need emerges.

## Execution context

An explicit object supplied by the runtime to the operation handler. It provides typed, application-supplied services. Core does not own a general-purpose dependency-injection container or assume a database, auth provider, request object, or logger.

## Input parser

An optional framework-neutral contract that accepts unknown input and returns parsed, typed input, synchronously or asynchronously if the final contract supports both. TypeScript annotations alone do not validate untrusted runtime input.

## Plugin

A possible explicit extension mechanism for capabilities such as validation, authentication/authorization integration, rate limiting, caching, or database integration. A dedicated plugin API is not yet committed for v0; integrations may initially be ordinary application-provided services or adapter behavior.

## Adapter

An integration that translates an external environment into an Archeon invocation and translates its outcome back. For example, a Next.js adapter can map requests to operation invocations and map successful values or errors to HTTP responses.

## Error propagation

Operation handlers may throw or reject. Core propagates failures to its caller; transport adapters catch them at the external boundary and map them to a safe transport-specific representation. Core does not map errors to HTTP status codes.

## Action

“Action” may describe an internal execution step in a future design, but it is not the preferred public primitive. Avoid mixing “action” and “operation” casually in APIs and documentation.
