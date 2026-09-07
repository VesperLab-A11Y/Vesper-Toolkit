# Vesper Toolkit

Small, free accessibility-testing tools that live in your bookmarks bar. No extension, no account, no data leaving your browser. Built by [Vesper Lab](https://vesperlab.dev/).

**[Get the bookmarklets →](https://VesperLab-A11Y.github.io/Vesper-Toolkit/)**

## What's here

- **🦇 AC Scan / 🦇 AC Targeted Scan** : run [axe-core](https://github.com/dequelabs/axe-core) (Deque Systems) on a page or on one CSS selector, copy the JSON result.
- **🦇 CSS Selector** : click an element, copy its selector.
- **🦇 Finder** : find and highlight an element (even hidden or off-screen) from a selector or a code snippet.
- **🦇 Link / Image / Label Scan** : focused reports on links, images and form labels, each opening its own printable/exportable report tab. Each report also has a **Copy as JSON** button, in the same axe-core-shaped format AC Scan produces. You can paste it into Vesper Auditor the same way.
- **🦇 Sonar** : search the 87 WCAG 2.2 success criteria in a movable panel over the page you're working on. Shows the official name, level, guideline and links to the W3C page.
- **Axe-core Scan Viewer** (`scan-results.html`) — turns the JSON from AC Scan into a readable report, exportable to Word, Excel and print.

## Installation

Open the **[Vesper Toolkit](https://VesperLab-A11Y.github.io/Vesper-Toolkit/)** : that page has a draggable button and a "Clipboard" fallback for each tool below, plus a source link so you can read the code before you install it.

**By dragging**

1. Show your browser's bookmarks bar: `Cmd+Shift+B` (macOS) or `Ctrl+Shift+B` (Windows/Linux).
2. Drag the button for the tool you want straight onto that bar.
3. Go to the page you want to check, then click the bookmark.

**Without dragging** (keyboard, tremor, or simply preference)

1. Press **Clipboard** next to the tool you want.
2. In your browser's bookmark manager, create a new bookmark.
3. Give it a name, then paste the copied code into the *URL* field and save.

**If nothing happens**: open the console (`Cmd+Option+I` on macOS, `Ctrl+Shift+I` on Windows, Console tab) before clicking. A *"Content Security Policy"* message means the site forbids running external scripts : no bookmarklet can get around that. Report tabs can be blocked by pop-up blockers: allow pop-ups for the site you're checking if a report doesn't open.

**Sonar is the exception**: the other seven run entirely inside the page you're on. Sonar opens a panel that loads `sonar.html` over HTTPS in an iframe, so it won't work on a page served from `file://` or plain HTTP.

## Repo layout

```
Vesper-Toolkit/
├── index.html                  ← Vesper Toolkit (install page)
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

**About "Copy as JSON"**: Link/Image/Label Scan build a small internal rule table per scanner (`RULES` near the top of each `vlScan()`) so the JSON groups issues the way axe-core does : one entry per rule, with every affected element listed under it. Where a check has a real axe-core equivalent (`link-name`, `image-alt`, `label`, `button-name`, `autocomplete-valid`), the same id and impact level are reused; Vesper-only checks get a `vesper-*` id and a best-effort impact level. Verify the impact levels look right on a real report before relying on them for triage — some of these are judgment calls, not measured against axe-core's actual source.

## Deploying

This repo is fully static — GitHub Pages serves it as-is, no build step.


## Credits

Built on [axe-core](https://github.com/dequelabs/axe-core) (Deque Systems). Criteria based on [WCAG 2.2](https://www.w3.org/TR/WCAG22/).

## Contact
If you encounter an issue, accessibility barrier, or translation error, please contact contact@vesperlab.dev
If you enjoy my work, you can [Buy me a coffee](https://buymeacoffee.com/vesperlab).