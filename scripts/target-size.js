// Target Size
// Mesure la taille de tous les éléments interactifs visibles de la page et les entoure d'un
// cadre de couleur : rouge sous 24x24 px (échec du 2.5.8 AA, sauf exception d'espacement),
// ambre entre 24 et 43 px (passe l'AA, pas l'AAA 2.5.5 qui demande 44x44), vert à 44 px ou plus.
// Exception d'espacement du 2.5.8 : une cible trop petite passe si un cercle de 24 px centré sur
// elle ne touche aucune autre cible (ni le cercle d'une autre cible trop petite).
// Les liens en ligne dans une phrase sont exemptés (signalés « inline »).
(function () {
  'use strict';
  try {
    var existing = document.getElementById('vl-targetsize-root');
    if (existing) {
      existing.remove();
      return;
    }

    var SELECTOR = 'a[href],button,input:not([type="hidden"]),select,textarea,summary,' +
      '[role="button"],[role="link"],[role="checkbox"],[role="radio"],[role="switch"],[role="tab"],' +
      '[role="menuitem"],[role="option"],[tabindex]:not([tabindex="-1"]),[onclick]';

    function visible(el, rect) {
      if (rect.width === 0 || rect.height === 0) return false;
      var cs = getComputedStyle(el);
      return cs.visibility !== 'hidden' && cs.display !== 'none' && cs.opacity !== '0';
    }

    // Un lien en ligne : display inline et du texte voisin dans le même parent.
    function isInline(el) {
      if (el.tagName !== 'A') return false;
      if (getComputedStyle(el).display !== 'inline') return false;
      var parentText = (el.parentElement.textContent || '').replace(/\s+/g, ' ').trim();
      var ownText = (el.textContent || '').replace(/\s+/g, ' ').trim();
      return parentText.length > ownText.length;
    }

    function describe(el) {
      var name = el.getAttribute('aria-label') || (el.textContent || '').trim().replace(/\s+/g, ' ') ||
        el.getAttribute('title') || el.getAttribute('alt') || el.getAttribute('name') || '';
      if (name.length > 40) name = name.slice(0, 40) + '…';
      return '<' + el.tagName.toLowerCase() + '>' + (name ? ' ' + name : '');
    }

    function measure() {
      var nodes = document.querySelectorAll(SELECTOR);
      var items = [];
      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i];
        if (root.contains(el)) continue;
        var r = el.getBoundingClientRect();
        if (!visible(el, r)) continue;
        items.push({
          el: el,
          rect: r,
          w: Math.round(r.width),
          h: Math.round(r.height),
          cx: r.left + r.width / 2,
          cy: r.top + r.height / 2,
          small: r.width < 24 || r.height < 24,
          inline: isInline(el)
        });
      }

      // Distance entre un point et un rectangle, pour tester l'intersection avec un cercle de 24 px.
      function distToRect(px, py, r) {
        var dx = Math.max(r.left - px, 0, px - r.right);
        var dy = Math.max(r.top - py, 0, py - r.bottom);
        return Math.sqrt(dx * dx + dy * dy);
      }

      items.forEach(function (a) {
        a.spaced = false;
        if (!a.small || a.inline) return;
        var clear = true;
        for (var j = 0; j < items.length; j++) {
          var b = items[j];
          if (b === a || b.inline) continue;
          // On ignore les cibles imbriquées (ex: un icône dans un bouton).
          if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
          if (b.small) {
            var d = Math.sqrt(Math.pow(a.cx - b.cx, 2) + Math.pow(a.cy - b.cy, 2));
            if (d < 24) { clear = false; break; }
          } else if (distToRect(a.cx, a.cy, b.rect) < 12) {
            clear = false;
            break;
          }
        }
        a.spaced = clear;
      });

      items.forEach(function (it) {
        if (it.inline) it.status = 'inline';
        else if (it.small && it.spaced) it.status = 'spacing';
        else if (it.small) it.status = 'fail';
        else if (it.w < 44 || it.h < 44) it.status = 'aa';
        else it.status = 'ok';
      });
      return items;
    }

    var COLORS = { fail: '#F0A9A2', spacing: '#E5BE7D', aa: '#C6B2ED', ok: '#A6CA93', inline: '#8a8579' };
    var LABELS = {
      fail: 'Under 24 px, fails 2.5.8',
      spacing: 'Under 24 px but spaced, passes 2.5.8',
      aa: '24 to 43 px, passes AA, not AAA (2.5.5)',
      ok: '44 px or more',
      inline: 'Inline link, exempt'
    };

    var root = document.createElement('div');
    root.id = 'vl-targetsize-root';

    var layer = document.createElement('div');
    layer.style.cssText = 'position:absolute;top:0;left:0;width:0;height:0;z-index:2147483645;pointer-events:none';
    root.appendChild(layer);

    var panel = document.createElement('div');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Target size results');
    panel.style.cssText = 'position:fixed;top:24px;right:24px;width:min(400px,92vw);max-height:min(620px,86vh);' +
      'z-index:2147483647;background:#100F0D;border:1px solid #A6CA93;border-radius:12px;' +
      'box-shadow:0 18px 48px rgba(0,0,0,.55);display:flex;flex-direction:column;overflow:hidden;' +
      'font:14px/1.5 system-ui,Arial,sans-serif;color:#EDE7DA';
    root.appendChild(panel);

    var bar = document.createElement('div');
    bar.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:12px;' +
      'padding:8px 10px;background:#191714;border-bottom:1px solid rgba(237,231,218,.16)';
    bar.innerHTML = '<span style="font-weight:700;letter-spacing:.04em">TARGET SIZE</span>';
    var actions = document.createElement('div');
    actions.style.cssText = 'display:flex;align-items:center;gap:8px';

    function smallBtn(label, aria) {
      var b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      if (aria) b.setAttribute('aria-label', aria);
      b.style.cssText = 'background:transparent;border:1px solid #A6CA93;color:#A6CA93;border-radius:6px;' +
        'padding:0 10px;height:28px;font:700 12px/1 system-ui,Arial,sans-serif;cursor:pointer';
      return b;
    }
    var refreshBtn = smallBtn('Refresh');
    var closeBtn = smallBtn('×', 'Close target size panel');
    closeBtn.style.color = '#F0A9A2';
    closeBtn.style.borderColor = 'rgba(237,231,218,.3)';
    closeBtn.style.width = '28px';
    closeBtn.style.padding = '0';
    closeBtn.style.fontSize = '16px';
    actions.appendChild(refreshBtn);
    actions.appendChild(closeBtn);
    bar.appendChild(actions);
    panel.appendChild(bar);

    var body = document.createElement('div');
    body.style.cssText = 'flex:1;overflow:auto;padding:12px';
    panel.appendChild(body);

    var foot = document.createElement('div');
    foot.style.cssText = 'padding:8px 12px;border-top:1px solid rgba(237,231,218,.16);background:#191714';
    var footBtns = document.createElement('div');
    footBtns.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap';
    var jsonBtn = smallBtn('Copy as JSON');
    var annexBtn = smallBtn('Create as appendix');
    footBtns.appendChild(jsonBtn);
    footBtns.appendChild(annexBtn);
    var exportStatus = document.createElement('div');
    exportStatus.setAttribute('role', 'status');
    exportStatus.style.cssText = 'font-size:.8rem;color:#C6B2ED;margin-top:6px;min-height:1.2em';
    foot.appendChild(footBtns);
    foot.appendChild(exportStatus);
    panel.appendChild(foot);

    var lastItems = [];
    var lastCounts = {};

    function flash(el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    function render() {
      layer.innerHTML = '';
      body.innerHTML = '';
      var items = measure();
      var counts = { fail: 0, spacing: 0, aa: 0, ok: 0, inline: 0 };
      items.forEach(function (it) { counts[it.status]++; });
      lastItems = items;
      lastCounts = counts;

      // Les cadres sont posés en coordonnées de document pour suivre le défilement.
      var sx = window.pageXOffset;
      var sy = window.pageYOffset;
      items.forEach(function (it) {
        var box = document.createElement('div');
        box.style.cssText = 'position:absolute;box-sizing:border-box;border:2px solid ' + COLORS[it.status] +
          ';left:' + (it.rect.left + sx) + 'px;top:' + (it.rect.top + sy) + 'px;width:' + it.rect.width +
          'px;height:' + it.rect.height + 'px;pointer-events:none';
        layer.appendChild(box);
      });

      var legend = document.createElement('div');
      legend.style.cssText = 'margin-bottom:10px';
      ['fail', 'spacing', 'aa', 'ok', 'inline'].forEach(function (k) {
        var line = document.createElement('div');
        line.style.cssText = 'font-size:.82rem;display:flex;gap:8px;align-items:center;margin-bottom:3px';
        line.innerHTML = '<span style="flex:none;width:12px;height:12px;border:2px solid ' + COLORS[k] + '"></span>' +
          '<span><strong>' + counts[k] + '</strong> ' + LABELS[k] + '</span>';
        legend.appendChild(line);
      });
      body.appendChild(legend);

      var note = document.createElement('div');
      note.style.cssText = 'font-size:.78rem;opacity:.65;margin-bottom:10px';
      note.textContent = 'Native controls left at their default browser size are also exempt from 2.5.8. Check those by hand.';
      body.appendChild(note);

      // Les échecs d'abord, puis les cibles de 24 à 43 px, triées de la plus petite à la plus grande.
      var order = { fail: 0, spacing: 1, aa: 2, ok: 3, inline: 4 };
      items.filter(function (it) { return it.status !== 'ok' && it.status !== 'inline'; })
        .sort(function (a, b) {
          return order[a.status] - order[b.status] || Math.min(a.w, a.h) - Math.min(b.w, b.h);
        })
        .forEach(function (it) {
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.style.cssText = 'display:block;width:100%;text-align:left;background:transparent;' +
            'border:1px solid rgba(237,231,218,.14);border-left:4px solid ' + COLORS[it.status] + ';' +
            'border-radius:6px;padding:7px 9px;margin-bottom:5px;font:13px/1.4 system-ui,Arial,sans-serif;' +
            'color:#EDE7DA;cursor:pointer';
          var span = document.createElement('span');
          span.style.opacity = '.7';
          span.textContent = it.w + ' × ' + it.h + ' px ';
          btn.appendChild(span);
          btn.appendChild(document.createTextNode(describe(it.el)));
          btn.onclick = function () { flash(it.el); };
          body.appendChild(btn);
        });

      if (counts.fail + counts.spacing + counts.aa === 0) {
        var none = document.createElement('div');
        none.style.cssText = 'color:#A6CA93;font-size:.85rem';
        none.textContent = 'Every target measured is 44 px or more.';
        body.appendChild(none);
      }
    }


    function esc(v) {
      return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }

    // Sélecteur CSS lisible pour retrouver l'élément (id unique, sinon chemin avec nth-of-type).
    function selectorOf(el) {
      var parts = [];
      var node = el;
      while (node && node.nodeType === 1 && node !== document.documentElement) {
        if (node.id && document.querySelectorAll('#' + CSS.escape(node.id)).length === 1) {
          parts.unshift('#' + CSS.escape(node.id));
          break;
        }
        var part = node.tagName.toLowerCase();
        var sibs = Array.prototype.filter.call(node.parentElement.children, function (c) { return c.tagName === node.tagName; });
        if (sibs.length > 1) part += ':nth-of-type(' + (Array.prototype.indexOf.call(sibs, node) + 1) + ')';
        parts.unshift(part);
        node = node.parentElement;
      }
      return parts.join(' > ');
    }

    function snippetOf(el) {
      var html = el.outerHTML || '';
      return html.length > 300 ? html.slice(0, 300) + '…' : html;
    }

    // Seuls les échecs sont exportés : sous 24 px sans exception d'espacement (2.5.8, AA), et
    // de 24 à 43 px (2.5.5, AAA, signalé « minor » pour que l'Auditor le distingue).
    function buildJson() {
      var rules = {
        fail: { id: 'target-size-under-24', impact: 'serious', wcag: 'wcag258', help: 'Target is smaller than 24 by 24 CSS pixels and has no spacing exception (WCAG 2.5.8, AA)', helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html', msg: 'Make the target at least 24 by 24 CSS pixels, or space it so a 24 px circle centred on it touches no other target.' },
        aa: { id: 'target-size-under-44', impact: 'minor', wcag: 'wcag255', help: 'Target is smaller than 44 by 44 CSS pixels (WCAG 2.5.5, AAA)', helpUrl: 'https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html', msg: 'Make the target at least 44 by 44 CSS pixels.' }
      };
      var violations = [];
      ['fail', 'aa'].forEach(function (k) {
        var nodes = lastItems.filter(function (it) { return it.status === k; }).map(function (it) {
          return { html: snippetOf(it.el), target: [selectorOf(it.el)], failureSummary: 'Fix the following:\n  ' + it.w + ' x ' + it.h + ' px. ' + rules[k].msg };
        });
        if (nodes.length) {
          violations.push({ id: rules[k].id, impact: rules[k].impact, description: rules[k].help, help: rules[k].help, helpUrl: rules[k].helpUrl, tags: [rules[k].wcag], nodes: nodes });
        }
      });
      return JSON.stringify({ violations: violations, passes: [], url: location.href, timestamp: new Date().toISOString() });
    }

    function say(msg) { exportStatus.textContent = msg; }

    function fallbackCopy(text, done, fail) {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        var ok = document.execCommand('copy');
        document.body.removeChild(ta);
        if (ok) { done(); } else { fail(); }
      } catch (e) { fail(); }
    }

    jsonBtn.onclick = function () {
      var text = buildJson();
      var done = function () { say('JSON copied. Paste it into Auditor the same way as an AC Scan result.'); };
      var fail = function () { say('Copy failed. Use Create as appendix instead.'); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () { fallbackCopy(text, done, fail); });
      } else {
        fallbackCopy(text, done, fail);
      }
    };

    // Annexe HTML autonome : même gabarit et même bandeau de provenance que Link / Image / Label Scan,
    // pour que Vesper Auditor la reconnaisse (titre proposé, lien vers la page scannée).
    function buildAppendixHtml() {
      var when = new Date().toISOString().slice(0, 10);
      var symbols = { fail: '◆', spacing: '▲', aa: '▲' };
      var shown = lastItems.filter(function (it) { return it.status === 'fail' || it.status === 'spacing' || it.status === 'aa'; })
        .sort(function (a, b) {
          var order = { fail: 0, spacing: 1, aa: 2 };
          return order[a.status] - order[b.status] || Math.min(a.w, a.h) - Math.min(b.w, b.h);
        });
      var rows = shown.map(function (it) {
        return '<tr><td><span class="sev ' + it.status + '">' + symbols[it.status] + ' ' + esc(LABELS[it.status]) + '</span></td>' +
          '<td>' + it.w + ' × ' + it.h + ' px</td><td>' + esc(describe(it.el)) + '</td>' +
          '<td><code>' + esc(selectorOf(it.el)) + '</code>' +
          '<details class="vl-snip"><summary>Code snippet</summary><pre><code>' + esc(snippetOf(it.el)) + '</code></pre></details></td></tr>';
      }).join('');
      var legend = ['fail', 'spacing', 'aa', 'ok', 'inline'].map(function (k) {
        return '<li><strong>' + lastCounts[k] + '</strong> ' + esc(LABELS[k]) + '</li>';
      }).join('');
      var css = ':root{--bg:#FFFDF8;--surf:#F7F1E9;--ink:#1B1712;--muted:#4A4238;--line:#B9AF9F;--accent:#3E5230;--link:#3E5230}' +
        '@media (prefers-color-scheme:dark){:root{--bg:#100F0D;--surf:#191714;--ink:#EDE7DA;--muted:#A9A091;--line:rgba(237,231,218,.25);--accent:#A6CA93;--link:#A6CA93}}' +
        '*{box-sizing:border-box}body{margin:0;padding:0 20px 50px;font-family:"Noto Sans",Arial,sans-serif;color:var(--ink);background:var(--bg);line-height:1.55}' +
        'a{color:var(--link)}:focus-visible{outline:2px solid var(--accent);outline-offset:3px}' +
        'header,main,footer{max-width:1100px;margin:0 auto}header{padding:32px 0 10px;text-align:center}' +
        'h1{font-family:"Noto Serif",Georgia,serif;font-size:1.6rem;margin:0 0 6px}.intro,.vl-prov{color:var(--muted);font-size:.9rem;max-width:760px;margin:6px auto}' +
        'ul.legend{list-style:none;padding:0;margin:16px 0}ul.legend li{margin:4px 0}' +
        'table{border-collapse:collapse;width:100%;margin-top:14px}caption{font-weight:700;text-align:left;margin-bottom:8px}' +
        'th,td{padding:9px;border:1px solid var(--line);vertical-align:top;text-align:left;font-size:.85rem}th{background:#4E6C3B;color:#F4EFE2}' +
        '.sev{font-weight:700;white-space:nowrap}code{font-family:Menlo,Consolas,monospace;font-size:.78rem;word-break:break-all}' +
        '.vl-snip{margin-top:8px}.vl-snip>summary{cursor:pointer;font-size:.78rem;font-weight:700}.vl-snip pre{margin:6px 0 0;white-space:pre-wrap;word-break:break-word}' +
        'footer{margin-top:40px;padding-top:16px;border-top:1px solid var(--line);text-align:center;font-size:.78rem;color:var(--muted)}';
      var page = '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">' +
        '<title>Target Size, ' + esc(location.hostname) + '</title>' +
        '<meta name="generator" content="Vesper Toolkit, Target Size"><meta name="vesper-tool" content="target-size">' +
        '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Serif:wght@400;600;700&family=Noto+Sans:wght@400;600;700&display=swap">' +
        '<style>' + css + '</style></head><body>' +
        '<header><a href="https://vesperlab.dev/" target="_blank" rel="noopener">Vesper Lab <span style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">(opens in a new tab)</span></a>' +
        '<h1>Target Size</h1><p class="intro">Size of the interactive elements on the page, against WCAG 2.5.8 (24 by 24 CSS pixels, AA) and 2.5.5 (44 by 44, AAA).</p>' +
        '<p class="vl-prov">Generated by <a href="https://toolkit.vesperlab.dev/#tool-target-size" target="_blank" rel="noopener">Target Size</a>, a bookmarklet from the ' +
        '<a href="https://toolkit.vesperlab.dev/" target="_blank" rel="noopener">Vesper Toolkit</a> (free accessibility testing tools by Vesper Lab). Page scanned: ' +
        '<a href="' + esc(location.href) + '" target="_blank" rel="noopener">' + esc(location.href) + '</a>, ' + when + '.</p></header>' +
        '<main><h2>Summary</h2><ul class="legend">' + legend + '</ul>' +
        (rows ? '<table><caption>Targets to review (' + shown.length + ')</caption><thead><tr><th scope="col">Status</th><th scope="col">Size</th><th scope="col">Element</th><th scope="col">Selector and code</th></tr></thead><tbody>' + rows + '</tbody></table>'
          : '<p>Every target measured is 44 px or more.</p>') +
        '<p class="intro">Native controls left at their default browser size are also exempt from 2.5.8 and are not flagged here. Measures are taken at the window size used during the scan.</p></main>' +
        '<footer><div>Appendix from Target Size, <a href="https://toolkit.vesperlab.dev/" target="_blank" rel="noopener">Vesper Toolkit</a></div></footer></body></html>';
      return page;
    }

    annexBtn.onclick = function () {
      var url = URL.createObjectURL(new Blob([buildAppendixHtml()], { type: 'text/html;charset=utf-8' }));
      var a = document.createElement('a');
      a.href = url;
      a.download = 'annexe-target-size-' + location.hostname.replace(/[^a-z0-9.-]/gi, '-') + '-' + new Date().toISOString().slice(0, 10) + '.html';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 10000);
      say('Appendix file downloaded. Add it to your audit in Vesper Auditor (Annexes tab).');
    };

    function teardown() {
      root.remove();
      document.removeEventListener('keydown', onKey);
    }
    function onKey(e) {
      if (e.key === 'Escape') teardown();
    }
    refreshBtn.onclick = render;
    closeBtn.onclick = teardown;
    document.addEventListener('keydown', onKey);

    document.body.appendChild(root);
    render();
    closeBtn.focus();
  } catch (e) {
    alert('The bookmarklet ran into an error: ' + e.message + '. Open the console for details. If nothing appears at all, the site is probably blocking external scripts (CSP).');
  }
})();
