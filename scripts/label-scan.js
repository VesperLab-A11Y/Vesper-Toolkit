// Label Scan — Vesper Toolkit
// Scans form fields, buttons, and radio/checkbox groups, opens a standalone report in a new tab:
// where each field gets its accessible name, required fields, linked error messages, missing autocomplete.
// The report is a fully self-contained HTML string (own CSS, own logo, own export logic) —
// it doesn't depend on this repo being reachable, so it still works if the tab is opened offline.
(function () {
  'use strict';
  try {

    // --- Styles for the report page itself (opened in its own tab) ---
    var VL_CSS = ":root{--bg:#100F0D;--surface:#191714;--surface-raised:#221F1A;--line:rgba(237,231,218,0.16);--line-soft:rgba(237,231,218,0.12);--ink:#EDE7DA;--muted:#A9A091;--accent:#A6CA93;--accent-dark:#5A7D46;--accent-ink:#100F0D;--accent-light:#F0A9A2;--focus:#C6B2ED;--ok-ink:#A6CA93;--ok-bg:#182317;--warn-ink:#E5BE7D;--warn-bg:#2A2113;--err-ink:#F0A9A2;--err-bg:#2B1614;--serif:'Noto Serif',Georgia,\"Iowan Old Style\",\"Palatino Linotype\",serif;--sans:'Noto Sans',-apple-system,\"Segoe UI\",Roboto,Helvetica,Arial,sans-serif;--mono:\"SFMono-Regular\",Consolas,\"Liberation Mono\",Menlo,monospace}\n" +
      "*{box-sizing:border-box}\n" +
      "body{margin:0;padding:0 20px 50px;font-family:var(--sans);color:var(--ink);background:var(--bg);line-height:1.55}\n" +
      "a{color:var(--accent-light)}\n" +
      ":focus-visible{outline:2px solid var(--focus);outline-offset:3px;border-radius:3px}\n" +
      "header.rep-header{max-width:1180px;margin:0 auto;padding:32px 0 10px;text-align:center}\n" +
      "header.rep-header .brand-link{display:inline-block;margin-bottom:10px;font-family:var(--serif);font-size:.8rem;letter-spacing:.14em;text-transform:uppercase;color:var(--accent-light);text-decoration:none}\n" +
      "header.rep-header .brand-link:hover{text-decoration:underline}\n" +
      "header.rep-header h1{font-family:var(--serif);font-size:1.6rem;margin:0 0 6px}\n" +
      "header.rep-header p.intro{color:var(--muted);font-size:.9rem;max-width:680px;margin:0 auto}\n" +
      "main{max-width:1180px;margin:0 auto}\n" +
      "#topControls{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin:20px 0 6px}\n" +
      "button.vl-btn{font-family:var(--sans);font-size:.85rem;font-weight:700;padding:9px 18px;border-radius:8px;border:1px solid var(--accent);background:var(--accent);color:var(--accent-ink);cursor:pointer}\n" +
      "button.vl-btn.secondary{background:transparent;color:var(--accent-light);border-color:rgba(237,231,218,0.22)}\n" +
      "button.vl-btn:hover{filter:brightness(1.12)}\n" +
      "button.vl-btn:disabled{opacity:.45;cursor:not-allowed}\n" +
      "button.vl-btn[aria-pressed=true]{background:var(--focus);color:#100F0D;border-color:var(--focus)}\n" +
      "label.chk{font-size:.86rem;display:inline-flex;align-items:center;gap:7px;color:var(--muted)}\n" +
      "details.vl-drop{border:1px solid var(--line-soft);border-radius:8px;margin-top:12px;background:var(--surface-raised)}\n" +
      "details.vl-drop>summary{cursor:pointer;padding:12px 16px;font-size:.86rem;font-weight:700;list-style:none;display:flex;align-items:center;gap:8px}\n" +
      "details>summary::-webkit-details-marker{display:none}\n" +
      "details.vl-drop>summary::before{content:\"\\25B8\";color:var(--accent-light)}\n" +
      "details.vl-drop[open]>summary::before{content:\"\\25BE\"}\n" +
      ".vl-drop-body{padding:12px 16px 16px;font-size:.86rem;color:var(--muted);border-top:1px solid var(--line-soft)}\n" +
      ".vl-drop-body p{margin:8px 0}\n" +
      ".vl-drop-body ul,.vl-drop-body ol{padding-left:22px;margin:8px 0}\n" +
      ".vl-drop-body li{margin-bottom:7px}\n" +
      ".vl-drop-body strong{color:var(--ink)}\n" +
      "table{border-collapse:collapse;width:100%;margin-top:18px}\n" +
      "caption{font-family:var(--serif);font-weight:700;text-align:left;margin:0 0 10px;font-size:1rem}\n" +
      "th,td{padding:10px;border:1px solid var(--line);vertical-align:top;text-align:left;font-size:.85rem}\n" +
      "th{background:var(--accent-dark);color:#F4EFE2;font-family:var(--serif);font-size:.9rem}\n" +
      "tr.err{background:var(--err-bg)}\n" +
      "tr.warn{background:var(--warn-bg)}\n" +
      ".sev{font-weight:700;white-space:nowrap}\n" +
      ".sev.err{color:var(--err-ink)}\n" +
      ".sev.warn{color:var(--warn-ink)}\n" +
      ".sev.ok{color:var(--ok-ink)}\n" +
      ".noname{color:var(--err-ink);font-weight:700}\n" +
      "code{font-family:var(--mono);font-size:.78rem;background:var(--bg);border:1px solid var(--line);border-radius:4px;padding:1px 5px;color:var(--ink);word-break:break-all}\n" +
      "td.thumb img{max-width:110px;max-height:90px;border:1px solid var(--line-soft);border-radius:4px}\n" +
      "textarea{width:100%;margin:6px 0;background:var(--bg);color:var(--ink);border:1px solid var(--line);font-family:var(--mono);font-size:.76rem;padding:6px;border-radius:4px}\n" +
      ".snippet{background:var(--surface);border:1px solid var(--line-soft);padding:8px;margin-top:6px;border-radius:6px}\n" +
      ".snippet label{font-weight:700;font-size:.75rem;display:block;margin-bottom:2px}\n" +
      "footer.rep-footer{max-width:1180px;margin:40px auto 0;padding:18px 0 0;text-align:center;font-size:.78rem;color:var(--muted);border-top:1px solid var(--line-soft);line-height:1.9}\n" +
      "footer.rep-footer a{color:var(--accent-light)}\n" +
      "#exportStatus{margin-top:8px;font-size:.84rem;color:var(--focus);font-weight:600}\n" +
      "@media print{\n" +
      "body{background:#fff;color:#000;max-width:100%;padding:0}\n" +
      ".no-print,#topControls,button{display:none!important}\n" +
      "details.vl-drop{display:none!important}\n" +
      "th{background:#5A7D46!important;color:#fff!important}\n" +
      "tr.err{background:#F7E0DC!important}\n" +
      "tr.warn{background:#F9EFD9!important}\n" +
      "a{color:#000;text-decoration:underline}\n" +
      "code{color:#000;background:#f4f0ec;border-color:#bbb}\n" +
      "tr{page-break-inside:avoid}\n" +
      "table{font-size:10px}\n" +
      "*{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}\n" +
      "}\n";

    // --- Script injected into the report page: filter checkbox, locate/highlight, snippet
    // toggles, print, and the Excel/Word exports. Runs inside the report's own tab, not here. ---
    var VL_PAGE_JS = "(function () {\n" +
      "  'use strict';\n\n" +
      "  var CFG = JSON.parse(document.getElementById('vl-data').textContent);\n" +
      "  var SEV_SYMBOL = { err: '\\u25C6', warn: '\\u25B2', ok: '\\u25CF' };\n" +
      "  var SEV_LABEL = { err: 'Issue', warn: 'To check', ok: 'OK' };\n" +
      "  var SEV_FILL = { err: 'FFF7E0DC', warn: 'FFF9EFD9', ok: 'FFE6F0DE' };\n" +
      "  var SEV_FONT = { err: 'FF7A2E24', warn: 'FF6B4A12', ok: 'FF33511F' };\n" +
      "  var SEV_HEX = { err: '7A2E24', warn: '6B4A12', ok: '33511F' };\n\n" +
      "  var status = document.getElementById('exportStatus');\n" +
      "  function say(msg) { if (status) status.textContent = msg || ''; }\n\n" +
      "  function loadScript(src) {\n" +
      "    return new Promise(function (resolve, reject) {\n" +
      "      var existing = document.querySelector('script[data-src=\"' + src + '\"]');\n" +
      "      if (existing) { if (existing.dataset.loaded === '1') { resolve(); } else { existing.addEventListener('load', function () { resolve(); }); existing.addEventListener('error', function () { reject(new Error('could not load')); }); } return; }\n" +
      "      var s = document.createElement('script');\n" +
      "      s.src = src;\n" +
      "      s.setAttribute('data-src', src);\n" +
      "      s.onload = function () { s.dataset.loaded = '1'; resolve(); };\n" +
      "      s.onerror = function () { reject(new Error('Could not load the export library (an internet connection is required for this export).')); };\n" +
      "      document.head.appendChild(s);\n" +
      "    });\n" +
      "  }\n\n" +
      "  function download(blob, filename) {\n" +
      "    var url = URL.createObjectURL(blob);\n" +
      "    var a = document.createElement('a');\n" +
      "    a.href = url;\n" +
      "    a.download = filename;\n" +
      "    document.body.appendChild(a);\n" +
      "    a.click();\n" +
      "    document.body.removeChild(a);\n" +
      "    URL.revokeObjectURL(url);\n" +
      "  }\n\n" +
      "  function stamp() { return new Date().toISOString().slice(0, 10); }\n\n" +
      "  /* ---------------- filter checkbox ---------------- */\n" +
      "  var chk = document.getElementById('showIssuesOnly');\n" +
      "  var okRows = document.querySelectorAll('tbody tr:not(.issue)');\n" +
      "  if (chk) {\n" +
      "    chk.addEventListener('change', function () {\n" +
      "      Array.prototype.forEach.call(okRows, function (tr) {\n" +
      "        if (chk.checked) { tr.setAttribute('hidden', 'hidden'); } else { tr.removeAttribute('hidden'); }\n" +
      "      });\n" +
      "      say(chk.checked ? 'Showing only the items to check.' : 'Showing all results.');\n" +
      "    });\n" +
      "  }\n\n" +
      "  /* ---------------- locate in the original tab ---------------- */\n" +
      "  var refWindow = window.opener;\n" +
      "  var hlButtons = document.querySelectorAll('.highlightButton');\n" +
      "  Array.prototype.forEach.call(hlButtons, function (btn) {\n" +
      "    btn.addEventListener('click', function () {\n" +
      "      var sel = '[data-vl-ref=\"' + btn.getAttribute('data-vl-ref') + '\"]';\n" +
      "      if (!refWindow || refWindow.closed) { say('The original tab was closed: can\\'t locate the element.'); return; }\n" +
      "      var target;\n" +
      "      try { target = refWindow.document.querySelector(sel); } catch (e) { target = null; }\n" +
      "      if (!target) { say('Element not found in the original page. See \\u201cI can\\'t find an element\\u201d above.'); return; }\n" +
      "      if (btn.getAttribute('aria-pressed') === 'false') {\n" +
      "        try { target.setAttribute('tabindex', '-1'); target.focus(); } catch (e) {}\n" +
      "        target.style.outline = '4px solid #C6B2ED';\n" +
      "        target.style.outlineOffset = '2px';\n" +
      "        btn.setAttribute('aria-pressed', 'true');\n" +
      "        say('Element highlighted in the original tab.');\n" +
      "      } else {\n" +
      "        target.style.outline = '';\n" +
      "        btn.setAttribute('aria-pressed', 'false');\n" +
      "        say('Highlight removed.');\n" +
      "      }\n" +
      "    });\n" +
      "  });\n\n" +
      "  var allBtn = document.getElementById('highlightAll');\n" +
      "  if (allBtn) {\n" +
      "    allBtn.addEventListener('click', function () {\n" +
      "      var turnOn = allBtn.getAttribute('aria-pressed') === 'false';\n" +
      "      Array.prototype.forEach.call(hlButtons, function (b) {\n" +
      "        b.setAttribute('aria-pressed', turnOn ? 'false' : 'true');\n" +
      "        b.click();\n" +
      "      });\n" +
      "      allBtn.setAttribute('aria-pressed', turnOn ? 'true' : 'false');\n" +
      "    });\n" +
      "  }\n\n" +
      "  /* ---------------- code snippets ---------------- */\n" +
      "  Array.prototype.forEach.call(document.querySelectorAll('.showSnippet'), function (btn) {\n" +
      "    btn.addEventListener('click', function () {\n" +
      "      var box = btn.nextElementSibling;\n" +
      "      var open = btn.getAttribute('aria-expanded') === 'true';\n" +
      "      if (open) { box.setAttribute('hidden', 'hidden'); btn.setAttribute('aria-expanded', 'false'); }\n" +
      "      else { box.removeAttribute('hidden'); btn.setAttribute('aria-expanded', 'true'); }\n" +
      "    });\n" +
      "  });\n\n" +
      "  /* ---------------- print ---------------- */\n" +
      "  var printBtn = document.getElementById('printBtn');\n" +
      "  if (printBtn) { printBtn.addEventListener('click', function () { window.print(); }); }\n\n" +
      "  /* ---------------- Excel export ---------------- */\n" +
      "  var excelBtn = document.getElementById('excelBtn');\n" +
      "  if (excelBtn) {\n" +
      "    excelBtn.addEventListener('click', function () {\n" +
      "      var orig = excelBtn.textContent;\n" +
      "      excelBtn.disabled = true;\n" +
      "      excelBtn.textContent = 'Generating\\u2026';\n" +
      "      say('Generating the Excel file\\u2026');\n" +
      "      loadScript('https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js')\n" +
      "        .then(function () { return buildExcel(); })\n" +
      "        .then(function () { say('Excel file downloaded.'); })\n" +
      "        .catch(function (err) { say('Excel export failed: ' + err.message); })\n" +
      "        .then(function () { excelBtn.disabled = false; excelBtn.textContent = orig; });\n" +
      "    });\n" +
      "  }\n\n" +
      "  function buildExcel() {\n" +
      "    var wb = new window.ExcelJS.Workbook();\n" +
      "    wb.creator = 'Vesper Lab';\n" +
      "    wb.title = CFG.title;\n" +
      "    var ws = wb.addWorksheet(CFG.sheetName || 'Results', { views: [{ showGridLines: false, state: 'frozen', ySplit: 4 }] });\n\n" +
      "    var cols = [{ name: 'Status', width: 14 }].concat(CFG.columns.map(function (c) { return { name: c.name, width: c.width || 30 }; }));\n" +
      "    ws.columns = cols.map(function (c) { return { width: c.width }; });\n\n" +
      "    ws.getCell('B1').value = { text: 'Vesper Lab \\u2013 ' + CFG.title, hyperlink: 'https://vesperlab.framer.website/' };\n" +
      "    ws.getCell('B1').style = { font: { name: 'Noto Serif', size: 16, bold: true, color: { argb: 'FF3F5A32' } }, alignment: { vertical: 'middle' } };\n" +
      "    ws.getRow(1).height = 30;\n" +
      "    ws.getCell('B2').value = CFG.intro;\n" +
      "    ws.getCell('B2').font = { name: 'Noto Serif', size: 10.5, italic: true, color: { argb: 'FF6B6459' } };\n" +
      "    ws.getCell('B2').alignment = { wrapText: true, vertical: 'middle' };\n" +
      "    ws.getRow(2).height = 34;\n\n" +
      "    var hIdx = 4;\n" +
      "    var hRow = ws.getRow(hIdx);\n" +
      "    cols.forEach(function (c, i) { hRow.getCell(i + 1).value = c.name; });\n" +
      "    hRow.height = 24;\n" +
      "    hRow.eachCell(function (cell) {\n" +
      "      cell.font = { name: 'Noto Serif', size: 12, bold: true, color: { argb: 'FFF4EFE2' } };\n" +
      "      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF5A7D46' } };\n" +
      "      cell.alignment = { vertical: 'middle', wrapText: true };\n" +
      "      cell.border = { top: { style: 'medium', color: { argb: 'FF3F5A32' } }, bottom: { style: 'medium', color: { argb: 'FF3F5A32' } }, left: { style: 'thin', color: { argb: 'FF3F5A32' } }, right: { style: 'thin', color: { argb: 'FF3F5A32' } } };\n" +
      "    });\n\n" +
      "    var thin = { style: 'thin', color: { argb: 'FFBFB9A8' } };\n" +
      "    var r = hIdx + 1;\n" +
      "    CFG.rows.forEach(function (row) {\n" +
      "      var xr = ws.getRow(r);\n" +
      "      if (row.thumb) { xr.height = 64; }\n" +
      "      xr.getCell(1).value = SEV_SYMBOL[row.sev] + ' ' + SEV_LABEL[row.sev];\n" +
      "      row.cells.forEach(function (cell, i) { xr.getCell(i + 2).value = cell.t; });\n" +
      "      if (row.thumb && CFG.thumbColumn != null) {\n" +
      "        try {\n" +
      "          var tid = wb.addImage({ base64: row.thumb.split(',')[1], extension: 'jpeg' });\n" +
      "          ws.addImage(tid, { tl: { col: CFG.thumbColumn + 1.05, row: r - 0.95 }, ext: { width: 96, height: 74 } });\n" +
      "          xr.getCell(CFG.thumbColumn + 2).value = '';\n" +
      "        } catch (e) { xr.getCell(CFG.thumbColumn + 2).value = '(image not embedded)'; }\n" +
      "      }\n" +
      "      var stripe = ((r - hIdx) % 2 === 0);\n" +
      "      for (var c = 1; c <= cols.length; c++) {\n" +
      "        var cell = xr.getCell(c);\n" +
      "        cell.border = { top: thin, bottom: thin, left: thin, right: thin };\n" +
      "        var colDef = c === 1 ? null : CFG.columns[c - 2];\n" +
      "        cell.alignment = { vertical: 'top', wrapText: c === 1 ? false : !!(colDef && colDef.wrap), horizontal: 'left' };\n" +
      "        if (c === 1) {\n" +
      "          cell.font = { name: 'Calibri', size: 10.5, bold: true, color: { argb: SEV_FONT[row.sev] } };\n" +
      "          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: SEV_FILL[row.sev] } };\n" +
      "        } else {\n" +
      "          cell.font = (colDef && colDef.code)\n" +
      "            ? { name: 'Courier New', size: 10, color: { argb: 'FF1A1815' } }\n" +
      "            : { name: 'Calibri', size: 10.5, color: { argb: 'FF1A1815' } };\n" +
      "          if (stripe) { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF6F3EA' } }; }\n" +
      "        }\n" +
      "      }\n" +
      "      r++;\n" +
      "    });\n\n" +
      "    ws.autoFilter = { from: { row: hIdx, column: 1 }, to: { row: hIdx, column: cols.length } };\n\n" +
      "    return wb.xlsx.writeBuffer().then(function (buf) {\n" +
      "      download(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), 'vesperlab-' + CFG.slug + '-' + stamp() + '.xlsx');\n" +
      "    });\n" +
      "  }\n\n" +
      "  /* ---------------- Word export ---------------- */\n" +
      "  var wordBtn = document.getElementById('wordBtn');\n" +
      "  if (wordBtn) {\n" +
      "    wordBtn.addEventListener('click', function () {\n" +
      "      var orig = wordBtn.textContent;\n" +
      "      wordBtn.disabled = true;\n" +
      "      wordBtn.textContent = 'Generating\\u2026';\n" +
      "      say('Generating the Word document\\u2026');\n" +
      "      loadScript('https://cdn.jsdelivr.net/npm/docx@9.7.1/dist/index.iife.js')\n" +
      "        .then(function () { return buildWord(); })\n" +
      "        .then(function () { say('Word document downloaded.'); })\n" +
      "        .catch(function (err) { say('Word export failed: ' + err.message); })\n" +
      "        .then(function () { wordBtn.disabled = false; wordBtn.textContent = orig; });\n" +
      "    });\n" +
      "  }\n\n" +
      "  function buildWord() {\n" +
      "    var d = window.docx;\n" +
      "    var cols = [{ name: 'Status', width: 12 }].concat(CFG.columns.map(function (c) { return { name: c.name }; }));\n\n" +
      "    function txt(t, opts) {\n" +
      "      opts = opts || {};\n" +
      "      return new d.TextRun({ text: t == null ? '' : String(t), bold: !!opts.bold, color: opts.color, font: opts.mono ? 'Courier New' : undefined, size: opts.size });\n" +
      "    }\n" +
      "    function cellPara(children) { return new d.Paragraph({ children: children }); }\n\n" +
      "    var headerCells = cols.map(function (c) {\n" +
      "      return new d.TableCell({\n" +
      "        shading: { type: d.ShadingType.SOLID, color: '5A7D46', fill: '5A7D46' },\n" +
      "        children: [cellPara([txt(c.name, { bold: true, color: 'FFFFFF' })])]\n" +
      "      });\n" +
      "    });\n\n" +
      "    var bodyRows = CFG.rows.map(function (row) {\n" +
      "      var cells = [];\n" +
      "      cells.push(new d.TableCell({\n" +
      "        shading: { type: d.ShadingType.SOLID, color: SEV_FILL[row.sev].slice(2), fill: SEV_FILL[row.sev].slice(2) },\n" +
      "        children: [cellPara([txt(SEV_SYMBOL[row.sev] + ' ' + SEV_LABEL[row.sev], { bold: true, color: SEV_HEX[row.sev] })])]\n" +
      "      }));\n" +
      "      CFG.columns.forEach(function (colDef, i) {\n" +
      "        var value = row.cells[i] ? row.cells[i].t : '';\n" +
      "        var children;\n" +
      "        if (CFG.thumbColumn === i && row.thumb) {\n" +
      "          try {\n" +
      "            children = [new d.ImageRun({\n" +
      "              type: 'jpg',\n" +
      "              data: row.thumb.split(',')[1],\n" +
      "              transformation: { width: 96, height: 74 },\n" +
      "              altText: { title: 'Thumbnail', description: row.thumbAlt || 'Preview of the audited image', name: 'thumb' }\n" +
      "            })];\n" +
      "          } catch (e) { children = [txt('(image not embedded)')]; }\n" +
      "        } else if (colDef.link && row.cells[i] && row.cells[i].url) {\n" +
      "          children = [new d.ExternalHyperlink({ children: [txt(value || row.cells[i].url, { color: 'A05C57' })], link: row.cells[i].url })];\n" +
      "        } else {\n" +
      "          children = [txt(value, { mono: !!colDef.code })];\n" +
      "        }\n" +
      "        cells.push(new d.TableCell({ children: [cellPara(children)] }));\n" +
      "      });\n" +
      "      return new d.TableRow({ children: cells });\n" +
      "    });\n\n" +
      "    var children = [];\n" +
      "    children.push(new d.Paragraph({\n" +
      "      heading: d.HeadingLevel.HEADING_1,\n" +
      "      children: [new d.ExternalHyperlink({ children: [txt('Vesper Lab \\u2013 ' + CFG.title, { color: '3F5A32' })], link: 'https://vesperlab.framer.website/' })]\n" +
      "    }));\n" +
      "    children.push(new d.Paragraph({ children: [txt(CFG.intro)] }));\n" +
      "    if (CFG.pageUrl) { children.push(new d.Paragraph({ children: [txt('Page scanned: ' + CFG.pageUrl)] })); }\n" +
      "    children.push(new d.Paragraph({ children: [txt('Report date: ' + stamp())] }));\n" +
      "    children.push(new d.Paragraph({ text: 'Results', heading: d.HeadingLevel.HEADING_2 }));\n" +
      "    children.push(new d.Table({\n" +
      "      width: { size: 100, type: d.WidthType.PERCENTAGE },\n" +
      "      rows: [new d.TableRow({ tableHeader: true, children: headerCells })].concat(bodyRows)\n" +
      "    }));\n" +
      "    children.push(new d.Paragraph({ text: '' }));\n" +
      "    children.push(new d.Paragraph({ children: [txt('Report generated with the Vesper Lab bookmarklets.')] }));\n\n" +
      "    var doc = new d.Document({\n" +
      "      title: 'Vesper Lab \\u2013 ' + CFG.title,\n" +
      "      creator: 'Vesper Lab',\n" +
      "      description: CFG.intro,\n" +
      "      styles: { default: { document: { run: { font: 'Calibri', size: 21, language: { value: 'en-CA' } } } } },\n" +
      "      sections: [{ children: children }]\n" +
      "    });\n\n" +
      "    return d.Packer.toBlob(doc).then(function (blob) {\n" +
      "      download(blob, 'vesperlab-' + CFG.slug + '-' + stamp() + '.docx');\n" +
      "    });\n" +
      "  }\n\n" +
      "  /* ---------------- copy as axe-core-shaped JSON, for Vesper Auditor ---------------- */\n" +
      "  function fallbackCopy(text, done, fail) {\n" +
      "    try {\n" +
      "      var ta = document.createElement('textarea');\n" +
      "      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';\n" +
      "      document.body.appendChild(ta); ta.focus(); ta.select();\n" +
      "      var ok = document.execCommand('copy');\n" +
      "      document.body.removeChild(ta);\n" +
      "      if (ok) { done(); } else { fail(); }\n" +
      "    } catch (e) { fail(); }\n" +
      "  }\n\n" +
      "  var jsonBtn = document.getElementById('jsonBtn');\n" +
      "  if (jsonBtn) {\n" +
      "    jsonBtn.addEventListener('click', function () {\n" +
      "      var byRule = {};\n" +
      "      CFG.rows.forEach(function (row) {\n" +
      "        (row.tags || []).forEach(function (t) {\n" +
      "          if (!byRule[t.id]) { byRule[t.id] = { id: t.id, impact: t.impact, description: t.description, help: t.help, helpUrl: t.helpUrl, tags: [], nodes: [] }; }\n" +
      "          byRule[t.id].nodes.push({ html: row.snippet || '', target: row.target ? [row.target] : [], failureSummary: 'Fix the following:\\n  ' + t.msg });\n" +
      "        });\n" +
      "      });\n" +
      "      var violations = Object.keys(byRule).map(function (k) { return byRule[k]; });\n" +
      "      var payload = { violations: violations, passes: [], url: CFG.pageUrl, timestamp: new Date().toISOString() };\n" +
      "      var text = JSON.stringify(payload);\n" +
      "      var done = function () { say('JSON copied. Paste it into Auditor the same way as an AC Scan result.'); };\n" +
      "      var fail = function () { say('Copy failed. Open the browser console and copy the result of copy(text) manually.'); };\n" +
      "      if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done, fail); }); }\n" +
      "      else { fallbackCopy(text, done, fail); }\n" +
      "    });\n" +
      "  }\n" +
      "})();\n";

    // --- Vesper Lab logo, base64 PNG. The report opens in a blank tab with nothing else loaded,
    // so it carries its own copy rather than referencing assets/logo-cream.svg. ---

    // --- "How do I get an accessible document" disclosure, shown in the report ---
    var VL_EXPORT_HELP =
      "<p><strong>PDF (via Print), a warning.</strong> Browser printing produces an <em>untagged</em> PDF: no heading structure, no table semantics, no reading order. A screen reader sees a flat text stream at best. Fine for a visual preview or an archive, not for a document that has to be accessible itself.</p>" +
      "<p>Acrobat Pro can auto-tag (<em>Accessibility &rsaquo; Autotag Document</em>), but the result is approximate: reading order often wrong, tables badly reconstructed, headings not hierarchical. It always needs a full manual pass, so avoid it as a default.</p>" +
      "<p><strong>Word (.docx), the accessible option.</strong> The export generates a genuinely structured document: native heading styles, a table with a marked, repeating header row, a declared document language, live links, alt text on images. To keep it accessible:</p>" +
      "<ul>" +
      "<li>Don't replace structure with formatting: never swap a heading style for enlarged bold text</li>" +
      "<li>If you add rows, stay inside the existing table rather than starting a new one without a header</li>" +
      "<li>Run the built-in <em>Accessibility Checker</em> (<em>Review &rsaquo; Check Accessibility</em>) before you share the file</li>" +
      "<li>For an accessible PDF: export from Word via <em>File &rsaquo; Save As &rsaquo; PDF</em> with <strong>&ldquo;Document structure tags for accessibility&rdquo;</strong> checked, never through browser printing</li>" +
      "</ul>" +
      "<p><strong>Excel (.xlsx), for tracking and sorting.</strong> The export produces a clean data range: one row per issue, no merged cells, a frozen and filterable header row, an explicit sheet name. To keep it accessible:</p>" +
      "<ul>" +
      "<li>Don't add merged cells: they break screen reader navigation</li>" +
      "<li>Don't rely on severity colour alone: the symbol (&#9670; &#9650; &#9679;) is there for that, keep it</li>" +
      "<li>If you add a tab, give it an explicit name rather than &ldquo;Sheet2&rdquo;</li>" +
      "</ul>";

    // --- "I can't find an element" disclosure, shown in the report ---
    var VL_FIND_HELP =
      "<p>The <strong>Locate</strong> button highlights the element in the original tab and moves focus to it. If nothing visible happens, the element exists in the code but isn't displayed on screen. Common causes:</p>" +
      "<ul>" +
      "<li><strong>Hidden by CSS</strong> (<code>display:none</code>, <code>visibility:hidden</code>, <code>opacity:0</code>, off-screen) &mdash; common for collapsed menus, inactive tabs, closed modal content</li>" +
      "<li><strong>In an unopened state</strong>: a closed accordion, an inactive tab panel, a collapsed nav drawer. Open the matching state on the page, then rerun the scan</li>" +
      "<li><strong>Loaded afterward</strong> by JavaScript (lazy content, infinite scroll) &mdash; it may have disappeared since the scan</li>" +
      "<li><strong>Inside an iframe</strong>: the scan doesn't cross into iframes, but an element there can look visually similar</li>" +
      "</ul>" +
      "<p><strong>How to find it anyway:</strong></p>" +
      "<ol>" +
      "<li>Expand the row's code snippet (the <code>&lt;/&gt;</code> button) and copy it</li>" +
      "<li>Use the <strong>&#x1F987; Finder</strong> bookmarklet from Vesper Toolkit: paste the snippet or a selector, it finds the element, temporarily reveals it if it was hidden, and highlights it</li>" +
      "<li>Otherwise, in the inspector: <code>Cmd+Option+I</code>, Elements tab, <code>Cmd+F</code>, paste a distinctive fragment of the snippet</li>" +
      "<li>In the console: <code>document.querySelector('YOUR_SELECTOR')</code> then right-click the result &rsaquo; <em>Reveal in Elements panel</em></li>" +
      "</ol>" +
      "<p>A hidden element isn't necessarily a problem: content deliberately hidden from assistive technology can be legitimate. What matters is that it's consistently hidden for everyone, or exposed for everyone.</p>";

    function vlEsc(s) {
      if (s == null) return '';
      return String(s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }

    function vlCssEsc(s) {
      try { return CSS.escape(s); } catch (e) { return s; }
    }

    // Builds the shortest stable CSS selector for an element: id if unique, otherwise walks up
    // the ancestors adding classes / :nth-of-type as needed, stopping as soon as the assembled
    // selector matches exactly one element. Same logic as the CSS Selector bookmarklet, reused
    // here so the "Copy as JSON" export's target field is a real selector, not the transient
    // data-vl-ref attribute (which only exists during this scan, not in the page's own markup).
    function vlBuildSelector(el) {
      if (!el || el.nodeType !== 1) return '';
      if (el.id) {
        var s = '#' + vlCssEsc(el.id);
        try { if (document.querySelectorAll(s).length === 1) return s; } catch (e) {}
      }
      var parts = [];
      var node = el;
      while (node && node.nodeType === 1 && node !== document.documentElement) {
        var part = node.tagName.toLowerCase();
        if (node.id) { part = '#' + vlCssEsc(node.id); parts.unshift(part); break; }
        var cls = (node.className && typeof node.className === 'string')
          ? node.className.trim().split(/\s+/).filter(Boolean).slice(0, 2)
          : [];
        if (cls.length) { part += '.' + cls.map(vlCssEsc).join('.'); }
        var parent = node.parentElement;
        if (parent) {
          var same = Array.prototype.filter.call(parent.children, function (c) { return c.tagName === node.tagName; });
          if (same.length > 1) { part += ':nth-of-type(' + (Array.prototype.indexOf.call(same, node) + 1) + ')'; }
        }
        parts.unshift(part);
        var candidate = parts.join(' > ');
        try { if (document.querySelectorAll(candidate).length === 1) return candidate; } catch (e) {}
        node = parent;
      }
      return parts.join(' > ');
    }

    // Assembles CFG (title, columns, rows, extra disclosures...) into the full report HTML
    // and opens it in a new tab via window.open + document.write.
    function vlBuildReport(CFG) {
      var SEV_SYMBOL = { err: '\u25C6', warn: '\u25B2', ok: '\u25CF' };
      var SEV_LABEL = { err: 'Issue', warn: 'To check', ok: 'OK' };

      CFG.pageUrl = location.href;

      var issueCount = 0;
      var rowsHtml = '';

      CFG.rows.forEach(function (row) {
        var isIssue = (row.sev === 'err' || row.sev === 'warn');
        if (isIssue) { issueCount++; }
        rowsHtml += '<tr' + (isIssue ? ' class="issue ' + row.sev + '"' : '') + '>';
        rowsHtml += '<td><span class="sev ' + row.sev + '">' + SEV_SYMBOL[row.sev] + ' ' + SEV_LABEL[row.sev] + '</span></td>';
        CFG.columns.forEach(function (colDef, i) {
          var cell = row.cells[i] || { h: '' };
          var cls = '';
          if (CFG.thumbColumn === i) { cls = ' class="thumb"'; }
          rowsHtml += '<td' + cls + '>' + (cell.h || '') + '</td>';
        });
        rowsHtml += '<td class="no-print">';
        rowsHtml += '<button type="button" class="vl-btn secondary highlightButton" data-vl-ref="' + row.ref + '" aria-pressed="false">Locate</button>';
        if (row.snippet) {
          rowsHtml += '<button type="button" class="vl-btn secondary showSnippet" aria-expanded="false" aria-label="Show the code snippet for row ' + row.ref + '" style="margin-top:6px;"><code>&lt;/&gt;</code></button>';
          rowsHtml += '<div class="snippet" hidden><label for="snip' + row.ref + '">Code snippet</label>';
          rowsHtml += '<textarea id="snip' + row.ref + '" rows="4" readonly>' + vlEsc(row.snippet) + '</textarea></div>';
        }
        rowsHtml += '</td></tr>';
      });

      var headHtml = '<tr><th scope="col">Status</th>';
      CFG.columns.forEach(function (c) { headHtml += '<th scope="col">' + vlEsc(c.name) + '</th>'; });
      headHtml += '<th scope="col" class="no-print">Actions</th></tr>';

      var drops = '';
      (CFG.extraDrops || []).forEach(function (dp) {
        drops += '<details class="vl-drop"><summary>' + dp.summary + '</summary><div class="vl-drop-body">' + dp.body + '</div></details>';
      });

      var s = '';
      s += '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8">';
      s += '<meta name="viewport" content="width=device-width, initial-scale=1">';
      s += '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>';
      s += '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;600;700&family=Noto+Sans:wght@400;600;700&display=swap">';
      s += '<title>\uD83E\uDD87 ' + vlEsc(CFG.tabTitle || CFG.title) + '</title>';
      s += '<style>' + VL_CSS + '</style></head><body>';

      s += '<header class="rep-header">';
      s += '<a href="https://vesperlab.framer.website/" target="_blank" rel="noopener" aria-label="Vesper Lab, visit the website (new tab)">';
      s += '<a href="https://vesperlab.framer.website/" target="_blank" rel="noopener" class="brand-link">Vesper Lab</a>';
      s += '</a>';
      s += '<h1>' + vlEsc(CFG.title) + '</h1>';
      s += '<p class="intro">' + vlEsc(CFG.intro) + '</p>';
      s += '</header>';

      s += '<main>';
      s += '<div id="topControls">';
      s += '<label class="chk"><input type="checkbox" id="showIssuesOnly"> Show only the items to check (' + issueCount + ')</label>';
      s += '<button type="button" class="vl-btn secondary" id="highlightAll" aria-pressed="false">Locate all</button>';
      s += '<button type="button" class="vl-btn secondary" id="printBtn">Print / PDF</button>';
      s += '<button type="button" class="vl-btn secondary" id="excelBtn">Export to Excel</button>';
      s += '<button type="button" class="vl-btn secondary" id="wordBtn">Export to Word</button>';
      s += '<button type="button" class="vl-btn secondary" id="jsonBtn">Copy as JSON</button>';
      s += '</div>';
      s += '<div id="exportStatus" role="status"></div>';

      s += '<details class="vl-drop"><summary>How do I get these results into an accessible document?</summary><div class="vl-drop-body">' + VL_EXPORT_HELP + '</div></details>';
      s += '<details class="vl-drop"><summary>I can\u2019t find an element with &ldquo;Locate&rdquo;</summary><div class="vl-drop-body">' + VL_FIND_HELP + '</div></details>';
      s += drops;

      s += '<table><caption>' + vlEsc(CFG.caption) + '</caption>';
      s += '<thead>' + headHtml + '</thead><tbody>' + rowsHtml + '</tbody></table>';
      s += '</main>';

      s += '<footer class="rep-footer">';
      s += '<div>' + vlEsc(CFG.title) + '</div>';
      s += '<div>Built by <a href="https://vesperlab.framer.website/" target="_blank" rel="noopener">Vesper Lab</a></div>';
      s += '<div>' + CFG.sourceLine + '</div>';
      s += '</footer>';

      s += '<script type="application/json" id="vl-data">' + JSON.stringify(CFG).split('<').join('\\u003c') + '<' + '/script>';
      s += '<script>' + VL_PAGE_JS + '<' + '/script>';
      s += '</body></html>';

      var w = window.open('', '_blank');
      if (!w) {
        alert('The browser blocked the new tab. Allow pop-ups for this site, then run the scan again.');
        return;
      }
      w.document.open();
      w.document.write(s);
      w.document.close();
    }

    // --- The label scan itself: runs on the audited page, builds one row per form control / button / group ---
    function vlScan() {
      function cssEsc(s) { try { return CSS.escape(s); } catch (e) { return s; } }

      function idsText(str) {
        var ids = (str || '').split(/\s+/).filter(Boolean);
        if (!ids.length) return { text: '', broken: false };
        var broken = false;
        var parts = ids.map(function (id) {
          var n = document.getElementById(id);
          if (!n) { broken = true; return ''; }
          return n.textContent.trim();
        });
        return { text: parts.filter(Boolean).join(' '), broken: broken };
      }

      function labelFor(el) {
        if (!el.id) return '';
        var lab = document.querySelector('label[for="' + cssEsc(el.id) + '"]');
        return lab ? lab.textContent.replace(/\s+/g, ' ').trim() : '';
      }

      function labelWrap(el) {
        var lab = el.closest('label');
        return lab ? lab.textContent.replace(/\s+/g, ' ').trim() : '';
      }

      // Bilingual on purpose: matches text ON THE AUDITED PAGE, which can be in any language.
      var REQ_HINT = /(\*|obligatoire|required|requis)/i;
      var AC = [
        { re: /email|courriel/i, token: 'email' },
        { re: /(tel|phone|mobile)/i, token: 'tel' },
        { re: /(prenom|pr[ée]nom|first.?name|given)/i, token: 'given-name' },
        { re: /(last.?name|family|nom de famille)/i, token: 'family-name' },
        { re: /(adresse|address)/i, token: 'street-address' },
        { re: /(postal|zip)/i, token: 'postal-code' },
        { re: /(ville|city)/i, token: 'address-level2' },
        { re: /(pays|country)/i, token: 'country' }
      ];
      // Guesses the right autocomplete token from the field's name/id/type/placeholder,
      // so we can flag recognisable fields (email, phone, name...) that are missing it (WCAG 1.3.5).
      function guessAC(el) {
        var probe = [el.name, el.id, el.type, el.getAttribute('placeholder')].filter(Boolean).join(' ');
        for (var k = 0; k < AC.length; k++) {
          if (AC[k].re.test(probe)) return AC[k].token;
        }
        return null;
      }

      // Rule metadata for the "Copy as JSON" export (axe-core-shaped, for Vesper Auditor).
      // Where a real axe-core rule covers the same check, we reuse its id/impact so the JSON
      // is not just axe-shaped but actually matches what AC Scan would report. Vesper-only
      // checks (no axe-core equivalent) get a "vesper-" id and a best-effort impact level —
      // tell me if a level looks wrong once you see this on a real audit.
      var RULES = {
        buttonNoName: { id: 'button-name', impact: 'critical', description: 'Buttons must have discernible text', help: 'Ensure buttons have discernible text', helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/button-name' },
        labelledbyBroken: { id: 'vesper-aria-labelledby-broken', impact: 'serious', description: 'aria-labelledby references an id that does not exist', help: 'Fix or remove the broken aria-labelledby reference', helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html' },
        placeholderOnly: { id: 'label', impact: 'critical', description: 'Form elements must have labels', help: 'Ensure every form element has a label', helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/label' },
        noName: { id: 'label', impact: 'critical', description: 'Form elements must have labels', help: 'Ensure every form element has a label', helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/label' },
        weakTitle: { id: 'vesper-label-weak-title-fallback', impact: 'moderate', description: 'Accessible name relies only on the title attribute', help: 'Provide a real, visible label rather than relying on title alone', helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/label' },
        requiredNoHint: { id: 'vesper-label-required-no-hint', impact: 'moderate', description: 'Field is required but has no textual hint of that', help: 'Give a visible textual cue ("*", "required") in addition to the required attribute', helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html' },
        hintNotRequired: { id: 'vesper-label-hint-not-required', impact: 'moderate', description: 'A visible "required" hint is present but the field is not marked required', help: 'Set required or aria-required="true" to match the visible hint', helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html' },
        invalidNoDescribedby: { id: 'vesper-aria-invalid-no-message', impact: 'moderate', description: 'aria-invalid="true" with no linked error message', help: 'Link the error message with aria-describedby', helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html' },
        describedbyBroken: { id: 'vesper-aria-describedby-broken', impact: 'moderate', description: 'aria-describedby references a missing or empty message', help: 'Ensure the referenced description element exists and has text', helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html' },
        missingAutocomplete: { id: 'autocomplete-valid', impact: 'serious', description: 'autocomplete attribute must be used correctly', help: 'Use a recognisable autocomplete value on fields that ask for known personal data', helpUrl: 'https://dequeuniversity.com/rules/axe/4.10/autocomplete-valid' },
        groupNoFieldset: { id: 'vesper-form-group-no-fieldset', impact: 'critical', description: 'Radio/checkbox group has no shared fieldset', help: 'Wrap the group in a fieldset so its context survives field-by-field navigation', helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html' },
        groupNoLegend: { id: 'vesper-form-group-no-legend', impact: 'serious', description: 'Radio/checkbox group has a fieldset but no legend', help: 'Add a legend describing the group', helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html' }
      };
      // Pushes a note for the on-page report AND, when the note maps to a rule, a matching
      // tag for the JSON export — single source of truth for the message text.
      function note(notes, tags, key, msg) {
        notes.push(msg);
        if (RULES[key]) { tags.push({ id: RULES[key].id, impact: RULES[key].impact, description: RULES[key].description, help: RULES[key].help, helpUrl: RULES[key].helpUrl, msg: msg }); }
      }

      var rows = [];
      var ref = 0;

      function push(el, type, name, source, notes, tags, sev, required) {
        ref++;
        if (el && el.setAttribute) { el.setAttribute('data-vl-ref', ref); }
        var target = vlBuildSelector(el);
        var snippet = '';
        if (el && el.cloneNode) {
          var w = document.createElement('div');
          w.appendChild(el.cloneNode(true));
          snippet = w.innerHTML;
        }
        var notesTxt = notes.join(' ');
        rows.push({
          ref: ref, sev: sev, snippet: snippet, tags: tags, target: target,
          cells: [
            { h: '<code>' + vlEsc(type) + '</code>', t: type },
            { h: name ? vlEsc(name) : '<span class="noname">(none)</span>', t: name || '(none)' },
            { h: vlEsc(source || ''), t: source || '' },
            { h: required ? 'Yes' : 'No', t: required ? 'Yes' : 'No' },
            { h: vlEsc(notesTxt), t: notesTxt }
          ]
        });
      }

      var controls = document.querySelectorAll('input:not([type="hidden"]), select, textarea, button');

      Array.prototype.forEach.call(controls, function (el) {
        var tag = el.tagName;
        var type = (tag === 'INPUT') ? (el.getAttribute('type') || 'text') : tag.toLowerCase();
        var notes = [];
        var tags = [];
        var sev = 'ok';

        if (tag === 'BUTTON' || (tag === 'INPUT' && ['submit', 'button', 'reset', 'image'].indexOf(type) !== -1)) {
          var btnText = (el.textContent || el.value || '').replace(/\s+/g, ' ').trim();
          var bAl = el.getAttribute('aria-label');
          var bLb = idsText(el.getAttribute('aria-labelledby'));
          var bName = bAl || bLb.text || btnText;
          if (!bName) { note(notes, tags, 'buttonNoName', 'Button with no text or accessible name (probably an icon-only button).'); sev = 'err'; }
          if (el.getAttribute('aria-labelledby') && bLb.broken) { note(notes, tags, 'labelledbyBroken', "aria-labelledby references an id that doesn't exist."); if (sev !== 'err') sev = 'warn'; }
          push(el, 'button', bName, bAl ? 'aria-label' : (bLb.text ? 'aria-labelledby' : 'text'), notes, tags, sev, false);
          return;
        }

        var al = el.getAttribute('aria-label');
        var lbRaw = el.getAttribute('aria-labelledby');
        var lb = idsText(lbRaw);
        var byFor = labelFor(el);
        var byWrap = labelWrap(el);
        var ph = el.getAttribute('placeholder') || '';
        var ti = el.getAttribute('title') || '';

        // Accessible name resolution order, matching how assistive tech actually computes it:
        // aria-labelledby > aria-label > label[for] > wrapping label > title (weak fallback).
        var name = '', source = '';
        if (lbRaw && lb.text) { name = lb.text; source = 'aria-labelledby'; }
        else if (al) { name = al; source = 'aria-label'; }
        else if (byFor) { name = byFor; source = 'label[for]'; }
        else if (byWrap) { name = byWrap; source = 'wrapping label'; }
        else if (ti) { name = ti; source = 'title (weak)'; }

        if (lbRaw && lb.broken) { note(notes, tags, 'labelledbyBroken', "aria-labelledby references one or more ids that don't exist."); sev = 'warn'; }

        if (!name) {
          if (ph) {
            note(notes, tags, 'placeholderOnly', 'No real label, only a placeholder (“' + ph + '”): disappears once typing starts, not reliable.');
            sev = 'err';
            name = '(placeholder only)';
            source = 'placeholder';
          } else {
            note(notes, tags, 'noName', 'No accessible name detected (no label, aria-label, aria-labelledby, or title).');
            sev = 'err';
          }
        } else if (source === 'title (weak)') {
          note(notes, tags, 'weakTitle', 'Accessible name provided only by title: a weak fallback, prefer a real label.');
          if (sev !== 'err') sev = 'warn';
        }

        var required = !!(el.required || el.getAttribute('aria-required') === 'true');
        var hint = REQ_HINT.test(name) || REQ_HINT.test(ph);
        if (required && !hint) { note(notes, tags, 'requiredNoHint', 'Marked required but no textual hint detected (“*”, “required”): check visually.'); if (sev !== 'err') sev = 'warn'; }
        if (!required && hint) { note(notes, tags, 'hintNotRequired', 'A visual "required" hint is present, but neither required nor aria-required="true" is set.'); if (sev !== 'err') sev = 'warn'; }

        if (el.getAttribute('aria-invalid') === 'true') {
          var db = el.getAttribute('aria-describedby');
          var desc = idsText(db);
          if (!db) { note(notes, tags, 'invalidNoDescribedby', "aria-invalid=\"true\" with no aria-describedby: the error message isn't linked to the field."); if (sev !== 'err') sev = 'warn'; }
          else if (desc.broken || !desc.text) { note(notes, tags, 'describedbyBroken', 'aria-describedby is present but the referenced message is missing or empty.'); if (sev !== 'err') sev = 'warn'; }
        }

        if (tag === 'INPUT' && !el.getAttribute('autocomplete')) {
          var g = guessAC(el);
          if (g) { note(notes, tags, 'missingAutocomplete', 'Recognizable field (“' + g + '”) with no autocomplete attribute (WCAG 1.3.5).'); if (sev !== 'err') sev = 'warn'; }
        }

        push(el, type, name, source, notes, tags, sev, required);
      });

      // Radio/checkbox groups: flag missing fieldset/legend, which is what announces the
      // group as a group when navigating field by field.
      var groups = {};
      Array.prototype.forEach.call(document.querySelectorAll('input[type="radio"][name], input[type="checkbox"][name]'), function (el) {
        if (!groups[el.name]) groups[el.name] = [];
        groups[el.name].push(el);
      });
      Object.keys(groups).forEach(function (nm) {
        var g = groups[nm];
        if (g.length < 2) return;
        var fs = g[0].closest('fieldset');
        var same = g.every(function (el) { return el.closest('fieldset') === fs; });
        var notes = [];
        var tags = [];
        var sev = 'ok';
        if (!fs || !same) {
          note(notes, tags, 'groupNoFieldset', 'Group of ' + g.length + ' options (name="' + nm + '") with no shared fieldset: loses context when navigating field by field.');
          sev = 'err';
        } else {
          var lg = fs.querySelector('legend');
          if (!lg || !lg.textContent.trim()) {
            note(notes, tags, 'groupNoLegend', 'fieldset present for the “' + nm + '” group but with no legend (or an empty one): the grouping isn’t announced.');
            sev = 'err';
          } else {
            notes.push('Group correctly structured: fieldset + legend “' + lg.textContent.trim() + '”.');
          }
        }
        push(g[0], 'group (' + g[0].type + ')', 'name="' + nm + '" – ' + g.length + ' options', 'fieldset/legend', notes, tags, sev, false);
      });

      vlBuildReport({
        title: 'Label Scan',
        tabTitle: 'Vesper, Label Scan',
        slug: 'label-scan',
        sheetName: 'Labels',
        caption: 'Form fields, buttons, and radio/checkbox groups on the scanned page',
        intro: 'An inventory of form fields: where the accessible name comes from, required fields, radio/checkbox groups, linked error messages, missing autocomplete.',
        sourceLine: 'Criteria based on <a href="https://www.w3.org/TR/WCAG22/" target="_blank" rel="noopener">WCAG 2.2</a> (1.3.1, 1.3.5, 3.3.1, 3.3.2, 4.1.2)',
        columns: [
          { name: 'Type', width: 14 },
          { name: 'Accessible name', width: 34, wrap: true },
          { name: 'Name source', width: 18 },
          { name: 'Required', width: 10 },
          { name: 'Notes', width: 52, wrap: true }
        ],
        rows: rows,
        extraDrops: [
          {
            summary: "What this scan can't check",
            body: "<p>These checks look at the code, not the real experience. Still to test with a screen reader and a keyboard:</p><ul><li><strong>The actual announced order</strong> of fields, which can differ from the code order</li><li><strong>The timing of error messages</strong>: announced as they appear, or only if the user comes back to the field?</li><li><strong>Floating labels</strong> that shrink or visually disappear without moving in the code</li><li><strong>The browser's autofill behaviour</strong></li><li><strong>The actual visibility of focus</strong> while navigating by keyboard</li></ul><p>This report helps prioritize which fields deserve a screen-reader pass — it doesn't replace one.</p>"
          }
        ]
      });
    }

    vlScan();

  } catch (e) {
    alert('The bookmarklet ran into an error: ' + e.message + '. Open the console for details. If nothing appears at all, the site is probably blocking external scripts (CSP).');
    if (window.console) { console.error('Vesper Lab:', e); }
  }
})();
