# ADR-0005: Optional capabilities enter through explicit boundaries

- **Status:** Proposed
- **Date:** 2026-10-09

## Context

The original application depended on concrete choices such as Prisma, NextAuth, and a specific rate limiter. A reusable framework should not force those choices on every consumer.

## Proposal

Core should expose framework-neutral contracts and allow optional integrations/plugins to provide capabilities such as:

- input validation;
- authentication and authorization resolution;
- rate limiting;
- persistence and other application services;
- caching, logging, and observability.

Core should not require Prisma, NextAuth, Zod, Redis, or Next.js.

## Constraints

- Plugins must not be a generic escape hatch that obscures the runtime contract.
- Each extension point needs a clear lifecycle, typing model, and failure behavior.
- Prefer application-provided services/interfaces where a plugin abstraction is not yet justified.

## Questions to resolve

- What is the minimum plugin interface?
- Are plugins registered at application creation or runtime?
- How are plugin conflicts and ordering handled?
- Which capabilities belong in core contracts versus separate integration packages?
