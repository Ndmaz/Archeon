# npm publishing and Trusted Publishing

Archeon publishes two public scoped packages:

- `@archeon-ts/core`
- `@archeon-ts/next`

The release workflow is `.github/workflows/publish.yml`. It uses npm Trusted Publishing with GitHub Actions OIDC; it does not use an `NPM_TOKEN` repository secret.

## Namespace prerequisite

The official npm scope is `@archeon-ts`, owned by the npm organization `archeon-ts`. Before the first publication, create that organization on npm and confirm your account can publish public packages under the scope. Do not attempt the bootstrap publication until this is confirmed.

## One-time bootstrap: create each package

npm requires a package to exist before its Trusted Publisher can be configured. Therefore the first publication of each package is a one-time, interactive bootstrap step. This is deliberately not automated in the GitHub workflow.

1. Confirm you can publish under `@archeon-ts` and that your npm account has two-factor authentication enabled.
2. On your own machine, from a clean checkout of the intended release commit, authenticate interactively with npm (for example, `npm login`). Never put an npm token in this repository or in chat.
3. Install the repository dependencies and run the same release checks used by CI:
   ```sh
   pnpm install --frozen-lockfile
   pnpm build
   pnpm typecheck
   pnpm test
   pnpm --filter @archeon-ts/example-basic typecheck
   pnpm test:packages
   ```
4. Publish the core package first, then the adapter. Run each command from its package directory:
   ```sh
   cd packages/core
   pnpm publish --access public
   cd ../next
   pnpm publish --access public
   ```
   pnpm rewrites the adapter's `workspace:*` dependency to the matching published core version when packing/publishing.
5. Complete the two first publications close together. As soon as each package exists, configure its Trusted Publisher on npmjs.com. A newly created trusted-publisher configuration must complete its first successful OIDC publish within two days or it expires.

This bootstrap is not part of the requested repository change and has not been performed.

## Configure Trusted Publishing on npmjs.com

Configure the following publisher separately in the settings of **each** package (`@archeon-ts/core` and `@archeon-ts/next`):

| npm Trusted Publisher field | Value |
| --- | --- |
| Provider | GitHub Actions |
| GitHub owner / organization | `Ndmaz` |
| Repository | `Archeon` |
| Workflow filename | `publish.yml` |
| Environment | Leave blank (the workflow does not use a GitHub environment) |
| Allowed action | Allow direct `npm publish` |

The workflow requests `id-token: write` only for its publish job. npm CLI exchanges the GitHub OIDC identity for short-lived publishing credentials. For public packages published from this public GitHub repository, npm automatically creates provenance attestations.

The npm organization scope is `@archeon-ts`. The GitHub publisher owner is `Ndmaz`, which is the GitHub repository owner; it is independent of the npm organization name.

## Running a later release

After both packages exist and both Trusted Publisher configurations are saved:

1. Merge the intended release commit into `main`.
2. Open **GitHub → Actions → Publish packages → Run workflow**.
3. Select the `main` branch and enter the exact version present in both package manifests (for the initial release this is `0.1.0`).
4. Review the validation run and published package pages.

The workflow validates the monorepo, checks whether each version is already present, packs each package with pnpm (so workspace protocol dependencies are rewritten), then invokes `npm publish` on the tarball. This keeps pnpm responsible for packaging and npm CLI responsible for OIDC authentication.

The workflow is retry-safe for the normal partial-release case: if core publishes but adapter publication fails, a rerun skips the existing core version and retries the adapter. npm does not allow overwriting an already published version.

## After OIDC is verified

Once a successful GitHub Actions OIDC publication has been confirmed, review each package's npm **Settings → Publishing access**. Consider enabling **Require two-factor authentication and disallow tokens** to prevent legacy token-based publishing. Do this only after confirming the trusted publisher works.

## References

- [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/)
- [pnpm workspace publishing behavior](https://pnpm.io/workspaces/)
