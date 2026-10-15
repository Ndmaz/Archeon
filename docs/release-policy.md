# Release and compatibility policy

## Current status

Archeon is pre-release 0.x software. The current package manifests use version 0.0.1, but the packages have not been published. Do not treat the current API as stable.

## Compatibility currently exercised in CI

- Node.js 22.
- pnpm 10.18.3 for the repository workspace.
- TypeScript 5.9.x.
- The Next.js example uses Next.js 15.x and React 19.x.
- Package-consumer validation installs generated tarballs into a temporary project and checks declarations, exports, runtime execution, and a production Next.js build.

This describes the environment exercised by CI; it is not a promise that every version in these major ranges is supported.

## Pre-1.0 versioning

- Breaking API changes may occur in 0.x releases.
- Each published release should include a changelog entry and a GitHub release.
- Do not publish until the packed-package consumer test and Next.js example build pass.
- Both scoped packages declare `publishConfig.access: public`; CI verifies this metadata in the tarballs.
- Publish `@archeon/core` before `@archeon/next`, because the adapter depends on the core package. Verify the published core version satisfies the adapter dependency before publishing the adapter.
- Keep runtime dependencies minimal and avoid introducing framework dependencies into @archeon/core.

## License

Archeon is licensed under the MIT License. The repository root `LICENSE` file contains the license text, and both package directories include a copy so the license is present in each packed tarball. Both package manifests declare `"license": "MIT"`; CI checks the metadata and included license file. Keep this consistent across the repository and published artifacts.
