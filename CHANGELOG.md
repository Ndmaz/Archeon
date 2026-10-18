# Changelog

All notable changes to Archeon will be documented here.

This project is pre-release software. Until a stable 1.0.0 release, public APIs may change between 0.x versions.

## 0.1.0 — Release candidate (unpublished)

Initial release candidate prepared for validation. This version has not been published to npm.

### Added
- Framework-neutral operation definitions, modules, application construction, and execution plans.
- Typed per-invocation request context separate from application-scoped services.
- Minimal Next.js App Router adapter with explicit request-input and error mapping.
- External-consumer smoke tests that inspect packed tarballs, compile public imports, execute the runtime, and build a real Next.js example.
- Basic and Next.js App Router examples.

### Quality
- CI validates package exports and required declaration/runtime files in generated tarballs.
- CI builds the Next.js example against the actual package tarballs rather than workspace aliases.
