// Link Scan — Vesper Bookmarklets
// Scans every link on the page and opens a standalone report in a new tab: accessible name,
// destination, new-window behaviour, generic or duplicate labels.
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
      "header.rep-header img.logo{width:96px;height:auto;display:block;margin:0 auto 12px;filter:brightness(0) invert(1) sepia(0.18) saturate(1.4) hue-rotate(340deg)}\n" +
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
      "header.rep-header img.logo{filter:none}\n" +
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
      "  var LOGO_B64 = document.getElementById('vl-logo').getAttribute('data-b64');\n\n" +
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
      "    try {\n" +
      "      var imgId = wb.addImage({ base64: LOGO_B64, extension: 'png' });\n" +
      "      ws.addImage(imgId, { tl: { col: cols.length - 0.7, row: 0.05 }, ext: { width: 58, height: 56 } });\n" +
      "    } catch (e) { /* report is usable without the logo */ }\n\n" +
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
      "    try {\n" +
      "      children.push(new d.Paragraph({\n" +
      "        children: [new d.ImageRun({\n" +
      "          type: 'png',\n" +
      "          data: LOGO_B64,\n" +
      "          transformation: { width: 74, height: 72 },\n" +
      "          altText: { title: 'Vesper Lab logo', description: 'Stylised bat, the Vesper Lab emblem', name: 'vesper-lab-logo' }\n" +
      "        })]\n" +
      "      }));\n" +
      "    } catch (e) { /* document is usable without the logo */ }\n\n" +
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
      "  }\n" +
      "})();\n";

    // --- Vesper Lab logo, base64 PNG. The report opens in a blank tab with nothing else loaded,
    // so it carries its own copy rather than referencing assets/logo-cream.svg. ---
    var VL_LOGO = "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";

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
      "<li>Use the <strong>&#x1F987; Finder</strong> bookmarklet from the Directory: paste the snippet or a selector, it finds the element, temporarily reveals it if it was hidden, and highlights it</li>" +
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
      s += '<img class="logo" id="vl-logo" data-b64="' + VL_LOGO + '" src="data:image/png;base64,' + VL_LOGO + '" alt="">';
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

    // --- The link scan itself: runs on the audited page, builds one row per <a href> / role="link" ---
    function vlScan() {
      function isHidden(el) {
        var st = getComputedStyle(el);
        return (st.display === 'none') || (parseFloat(st.opacity) === 0) ||
          ((st.clipPath === 'inset(100%)') && (st.clip === 'rect(1px, 1px, 1px, 1px)')) ||
          ((st.height === '1px') && (st.width === '1px') && (st.overflow === 'hidden'));
      }

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

      // Accessible name resolution order: aria-label > aria-labelledby > visible text > alt on an image inside > title.
      function accName(el) {
        var al = el.getAttribute('aria-label');
        if (al && al.trim()) return al.trim();
        var lb = idsText(el.getAttribute('aria-labelledby'));
        if (lb.text) return lb.text;
        var t = el.textContent.replace(/\s+/g, ' ').trim();
        if (t) return t;
        var img = el.querySelector('img[alt]');
        if (img && img.getAttribute('alt').trim()) return img.getAttribute('alt').trim();
        var ti = el.getAttribute('title');
        if (ti && ti.trim()) return ti.trim();
        return '';
      }

      function norm(s) { return (s || '').toLowerCase().replace(/[\u2019']/g, ' ').replace(/\s+/g, ' ').trim(); }

      // These patterns match text ON THE AUDITED PAGE, which can be in any language —
      // kept bilingual (FR/EN) on purpose, unlike the report's own UI strings above.
      var NEWWIN = /nouvelle fenetre|nouvel onglet|new window|new tab|opens in a new|s ouvre dans/i;
      var GENERIC = /^(cliquez ici|cliquer ici|ici|en savoir plus|lire la suite|voir plus|detail|details|plus d infos|plus d info|click here|read more|learn more|more|here|link)$/i;

      function warned(el, name) {
        if (NEWWIN.test(norm(name))) return true;
        var ti = el.getAttribute('title');
        if (ti && NEWWIN.test(norm(ti))) return true;
        var sp = el.querySelectorAll('.visually-hidden, .sr-only, .visuallyhidden, .sr-text, .a11y');
        for (var k = 0; k < sp.length; k++) {
          if (NEWWIN.test(norm(sp[k].textContent))) return true;
        }
        return false;
      }

      var links = document.querySelectorAll('a[href], [role="link"]');
      var data = [];
      var ref = 0;

      Array.prototype.forEach.call(links, function (link) {
        ref++;
        link.setAttribute('data-vl-ref', ref);
        var hrefRaw = link.getAttribute('href') || '';
        var resolved = link.href || hrefRaw;
        var name = accName(link);
        var blank = link.getAttribute('target') === '_blank';
        var isWarned = blank ? warned(link, name) : null;
        var hidden = isHidden(link);
        var wrap = document.createElement('div');
        wrap.appendChild(link.cloneNode(true));

        var notes = [];
        var sev = 'ok';
        if (!name) {
          notes.push('Link with no accessible name (no text, aria-label, or image alt).');
          sev = 'err';
        } else if (GENERIC.test(norm(name))) {
          notes.push('Generic or ambiguous label out of context: \u201c' + name + '\u201d.');
          sev = 'warn';
        }
        if (blank && isWarned === false) {
          notes.push('Opens in a new window with no perceivable warning detected.');
          if (sev !== 'err') sev = 'warn';
        } else if (blank && isWarned === true) {
          notes.push('Opens in a new window, a warning was detected. Check that it\u2019s perceivable both visually and to a screen reader.');
        }
        if (/^(#|javascript:void\(0\)|javascript:;?)$/i.test(hrefRaw.trim())) {
          notes.push('href="' + hrefRaw + '" used as a fake button: a real button would be more appropriate.');
          if (sev !== 'err') sev = 'warn';
        }
        if (hidden) {
          notes.push('Link hidden visually (display, opacity, or clip).');
        }

        data.push({ ref: ref, sev: sev, _name: name, _resolved: resolved, _notes: notes, hrefRaw: hrefRaw, blank: blank, isWarned: isWarned, snippet: wrap.innerHTML });
      });

      // Second pass: flag the same label pointing at different destinations.
      var byName = {};
      data.forEach(function (d) {
        var k = norm(d._name);
        if (!k) return;
        if (!byName[k]) byName[k] = {};
        byName[k][d._resolved] = 1;
      });
      data.forEach(function (d) {
        var k = norm(d._name);
        if (!k || !byName[k]) return;
        var n = Object.keys(byName[k]).length;
        if (n > 1 && d.sev !== 'err') {
          d._notes.push('Label \u201c' + d._name + '\u201d used for ' + n + ' different destinations: ambiguous out of context.');
          d.sev = 'warn';
        }
      });

      var rows = data.map(function (d) {
        var notesTxt = d._notes.join(' ');
        return {
          ref: d.ref, sev: d.sev, snippet: d.snippet,
          cells: [
            { h: '<code>' + vlEsc(d.hrefRaw || '(empty)') + '</code>', t: d.hrefRaw || '(empty)', url: d._resolved },
            { h: d._name ? vlEsc(d._name) : '<span class="noname">(no accessible name)</span>', t: d._name || '(no accessible name)' },
            { h: d.blank ? 'Yes' : 'No', t: d.blank ? 'Yes' : 'No' },
            { h: d.blank ? (d.isWarned ? 'Yes' : 'Not detected') : 'N/A', t: d.blank ? (d.isWarned ? 'Yes' : 'Not detected') : 'N/A' },
            { h: vlEsc(notesTxt), t: notesTxt }
          ]
        };
      });

      vlBuildReport({
        title: 'Link Scan',
        tabTitle: 'Vesper, Link Scan',
        slug: 'link-scan',
        sheetName: 'Links',
        caption: 'All links (a[href] or role="link") on the scanned page',
        intro: 'An inventory of the page\u2019s links: accessible name, destination, new-window behaviour and whether the warning is perceivable, ambiguous or duplicate labels.',
        sourceLine: 'Criteria based on <a href="https://www.w3.org/TR/WCAG22/" target="_blank" rel="noopener">WCAG 2.2</a> (2.4.4, 2.4.9, 3.2.5, 4.1.2)',
        columns: [
          { name: 'Destination (href)', width: 38, wrap: true, code: true, link: true },
          { name: 'Accessible name', width: 32, wrap: true },
          { name: 'New window', width: 15 },
          { name: 'Perceivable warning', width: 17 },
          { name: 'Notes', width: 50, wrap: true }
        ],
        rows: rows
      });
    }

    vlScan();

  } catch (e) {
    alert('The bookmarklet ran into an error: ' + e.message + '. Open the console for details. If nothing appears at all, the site is probably blocking external scripts (CSP).');
    if (window.console) { console.error('Vesper Lab:', e); }
  }
})();
