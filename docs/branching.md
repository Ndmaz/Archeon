# Branching and promotion workflow

## Branch roles

- `main`: stable, reviewed, releasable history.
- `dev`: normal integration branch for active work.
- `testing`: integration-validation branch for a candidate state.

## Normal change

1. Branch from `dev` into a short-lived `feature/*`, `docs/*`, or `fix/*` branch.
2. Open a pull request into `dev`.
3. Review architecture impact, tests, type checks, and documentation.
4. Merge to `dev` only when the change is coherent.

## Integration and release promotion

1. Promote a chosen `dev` commit to `testing` through a pull request.
2. Run the full test/build/example checks on `testing`.
3. Fix issues on a short-lived branch and merge back to `dev`; then promote the corrected commit again.
4. Promote the validated `testing` state to `main` through a pull request.
5. Tag releases from `main`.

Keep branch history understandable. Do not use `testing` as a second development branch or commit directly to `main`.
