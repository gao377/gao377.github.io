# Agentic Embodied System developer handbook

Public documentation: https://gao377.github.io/

This repository contains reviewed static documentation only. Runtime source stays
in the private `gao377/agentic-embodied-system` repository. Edit its
`docs/web/*.md`, follow `docs/AUTHORING.md`, and build using
`python3 tools/docs/build.py`. Copy only the generated `site/` contents here.
The pinned renderer is answer-me-with-html 0.4.14 (MIT).

The Pages workflow validates the page inventory and local links, then deploys
`site/`. `site/release.json` records source checksums and the implementation
fingerprint. Documentation distinguishes software checks, mock execution,
physical simulation, and hardware evidence.

## Restore the previous website

The complete previous tree is preserved at
`archive/site-before-aes-docs-20261008` (commit
`b6eec2a35ea965691d5525b30c1f704573a0e2e3`). In a clean checkout:

```bash
git restore --source=archive/site-before-aes-docs-20261008 --staged --worktree -- .
git commit -m "Restore previous website"
git push origin main
```

No force push is required.
