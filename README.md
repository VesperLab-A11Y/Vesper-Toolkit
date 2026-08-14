# Vesper Bookmarklets

Small, free accessibility-testing tools that live in your bookmarks bar. No extension, no account, no data leaving your browser. Built by [Vesper Lab](https://vesperlab.framer.website/).

**[Get the bookmarklets →](https://VesperLab-A11Y.github.io/vesper-bookmarklets/)**

## What's here

- **🦇 AC Scan / 🦇 AC Targeted Scan** — run [axe-core](https://github.com/dequelabs/axe-core) (Deque Systems) on a page or on one CSS selector, copy the JSON result.
- **🦇 CSS Selector** — click an element, copy its selector.
- **🦇 Finder** — find and highlight an element (even hidden or off-screen) from a selector or a code snippet.
- **🦇 Link / Image / Label Scan** — focused reports on links, images and form labels, each opening its own printable/exportable report tab.
- **🦇 Sonar** — search the 87 WCAG 2.2 success criteria in a movable panel over the page you're working on. Shows the official name, level, guideline and links to the W3C page — not Pauline's private audit notes, see *Status* below.
- **Axe-core Scan Viewer** (`scan-results.html`) — turns the JSON from AC Scan into a readable report, exportable to Word, Excel and print.

Full install instructions and a targeted-scan guide are on the directory page itself.

## Repo layout

```
vesper-bookmarklets/
├── index.html                  ← Bookmarklets Directory (install page)
├── scan-results.html           ← Axe-core Scan Viewer
├── sonar.html                  ← Sonar's own page, loaded in an iframe by scripts/sonar.js
├── assets/
│   ├── logo-cream.svg
│   ├── logo.b64.js             ← logo as base64, for the Word/Excel exports
│   └── wcag22-public.json      ← the 87 criteria, public fields only (see Status)
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

All 8 bookmarklets, the Directory, the Scan Viewer, and `sonar.html` are built and wired up.

**About Sonar and `wcag22-public.json`**: the full WCAG dataset Pauline uses for audits has three custom fields per criterion — `description`, `erreur_type`, `impact_client` — all written in French, the last two being her private audit notes. `assets/wcag22-public.json` is a filtered copy with only the official WCAG fields (name, level, guideline, the two W3C URLs…), which are already in English by nature. It does not contain `description`, `erreur_type` or `impact_client` at all — not hidden by CSS, genuinely absent from the file `sonar.html` fetches. Public Sonar therefore shows metadata + links to the official W3C pages instead of custom prose. If a translated `description` should be shown in the public tool too, that's a separate, bounded translation pass (87 short paragraphs) — flag it if wanted.

**Not yet verified end-to-end**: this was built and checked with syntax validation, visual comparison against Design's screenshots, and in-browser testing of the Directory, the Viewer and Sonar's search/filter/detail view. The three big scan bookmarklets (Link/Image/Label Scan) were translated with care from the original, working French versions but have not yet been run against a real page — try each one on a real site before trusting the results.

## Credits

Built on [axe-core](https://github.com/dequelabs/axe-core) (Deque Systems). Criteria based on [WCAG 2.2](https://www.w3.org/TR/WCAG22/).
