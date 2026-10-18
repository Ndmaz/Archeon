# Release checklist

Use this checklist for the first public release. Do not publish directly from a local working tree without first validating the exact commit intended for release.

## Before release

- [ ] Confirm the release version and update both package versions consistently.
- [ ] Update `CHANGELOG.md` with the release date and user-facing changes.
- [ ] Confirm the root MIT license and both package-level license copies are present.
- [ ] Confirm both package manifests declare `license: MIT`, repository metadata, and `publishConfig.access: public`.
- [ ] Confirm `@archeon/next` depends on the exact released `@archeon/core` version.
- [ ] Run `pnpm install --frozen-lockfile`.
- [ ] Run `pnpm build`, `pnpm typecheck`, `pnpm test`, and `pnpm test:packages`.
- [ ] Confirm the Next.js example builds against the packed package artifacts.
- [ ] Inspect the packed tarballs and verify the generated manifests, exports, declarations, and license files.
- [ ] Review the Git diff and ensure no credentials, local environment files, or unrelated changes are included.

## Publish order

1. Publish `@archeon/core` with public access.
2. Verify the published core version and its metadata on npm.
3. Ensure `@archeon/next` declares that exact core version (not `workspace:*`) in its packed manifest.
4. Publish `@archeon/next` with public access.
5. Install both published packages into a clean consumer and run the basic example checks.
6. Create a GitHub release for the same version and commit, with release notes derived from the changelog.

## After release

- [ ] Confirm both npm package pages show the intended version and license.
- [ ] Confirm the GitHub release points to the matching tag.
- [ ] Announce the release only after the published-package consumer check succeeds.

## Safety rule

CI passing on `dev` is necessary but not sufficient to publish. Repeat the checks on the exact release commit and never publish until the package versions, dependency range, changelog, and tag agree.
