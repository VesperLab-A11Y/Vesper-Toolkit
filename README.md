# Vesper Bookmarklets

Small, free accessibility-testing tools that live in your bookmarks bar. No extension, no account, no data leaving your browser. Built by [Vesper Lab](https://vesperlab.framer.website/).

**[Get the bookmarklets →](https://VesperLab-A11Y.github.io/vesper-bookmarklets/)**

## What's here

- **🦇 AC Scan / 🦇 AC Targeted Scan** — run [axe-core](https://github.com/dequelabs/axe-core) (Deque Systems) on a page or on one CSS selector, copy the JSON result.
- **🦇 CSS Selector** — click an element, copy its selector.
- **🦇 Finder** — find and highlight an element (even hidden or off-screen) from a selector or a code snippet.
- **🦇 Link / Image / Label Scan** — focused reports on links, images and form labels. *English version in progress.*
- **🦇 Sonar** — search the 87 WCAG 2.2 success criteria in a movable panel over the page you're working on.
- **Axe-core Scan Viewer** (`scan-results.html`) — turns the JSON from AC Scan into a readable report, exportable to Word, Excel and print.

Full install instructions and a targeted-scan guide are on the directory page itself.

## Repo layout

```
vesper-bookmarklets/
├── index.html                  ← Bookmarklets Directory (install page)
├── scan-results.html           ← Axe-core Scan Viewer
├── sonar.html                  ← Sonar's own page (not built yet)
├── assets/
│   ├── logo-cream.svg
│   └── logo.b64.js             ← logo as base64, for the Word/Excel exports
├── scripts/                    ← readable, unminified source of every bookmarklet
├── tools/build-bookmarklets.mjs ← publication script, see below
└── README.md
```

## Publishing a change to a bookmarklet

Never edit the `javascript:` link on `index.html` by hand. Edit the readable source in `scripts/<name>.js`, then regenerate the links:

```bash
node tools/build-bookmarklets.mjs
```

This reads every file in `scripts/`, strips the comments, flattens it to one line, and writes the result into the matching `data-bookmarklet="<name>"` link in `index.html`. Commit both the script and the updated `index.html` together.

One rule to respect in `scripts/*.js`: a comment must always be alone on its own line, never after code on the same line — the build script's minifier is intentionally simple and relies on that.

## Status

Working and published: AC Scan, AC Targeted Scan, CSS Selector, Finder, the Directory page, the Scan Viewer.

Still to do: translate and restyle Link/Image/Label Scan (currently French-only, old colour palette), build `sonar.html` as a standalone page (currently depends on an internal design-tool runtime that isn't published).

## Credits

Built on [axe-core](https://github.com/dequelabs/axe-core) (Deque Systems). Criteria based on [WCAG 2.2](https://www.w3.org/TR/WCAG22/).
