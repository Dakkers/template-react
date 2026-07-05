# Changesets

This folder holds [changesets](https://github.com/changesets/changesets). Each
changeset is a markdown file describing an intended release (the semver bump and
a summary). Add one with:

```
pnpm exec changeset
```

On merge to `main`, the release workflow turns pending changesets into a
"Version Packages" PR; merging that PR publishes to npm.
