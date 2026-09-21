// Tab Order
// Numérote les éléments focusables dans l'ordre réel de tabulation (tabindex positifs d'abord,
// triés par valeur, puis le reste dans l'ordre du DOM), trace le chemin entre eux, et signale
// les tabindex positifs (anti-pattern classique) ainsi que les éléments focusables invisibles.
// Bouton Export : ouvre la liste, dans l'ordre, en texte brut dans un nouvel onglet.
(function () {
  'use strict';
  try {
    var existing = document.getElementById('vl-taborder-root');
    if (existing) {
      existing.remove();
      return;
    }

    var SELECTOR = 'a[href], area[href], input:not([type="hidden"]):not([disabled]), ' +
      'select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, ' +
      '[tabindex], [contenteditable="true"], audio[controls], video[controls], summary';

    function computeOrder() {
      var candidates = Array.prototype.slice.call(document.querySelectorAll(SELECTOR));
      var reachable = candidates.filter(function (el) {
        var cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') return false;
        if (el.hasAttribute('tabindex') && parseInt(el.getAttribute('tabindex'), 10) < 0) return false;
        return true;
      });
      var positive = [], zero = [];
      reachable.forEach(function (el) {
        var ti = el.hasAttribute('tabindex') ? parseInt(el.getAttribute('tabindex'), 10) : 0;
        if (ti > 0) positive.push({ el: el, ti: ti }); else zero.push(el);
      });
      positive.sort(function (a, b) { return a.ti - b.ti; });
      var ordered = positive.map(function (o) { return o.el; }).concat(zero);
      var positiveSet = positive.map(function (o) { return o.el; });
      return ordered.map(function (el) {
        var r = el.getBoundingClientRect();
        return {
          el: el,
          positiveTabindex: positiveSet.indexOf(el) !== -1,
          invisible: r.width === 0 || r.height === 0
        };
      });
    }

    var root = document.createElement('div');
    root.id = 'vl-taborder-root';

    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', document.documentElement.scrollWidth);
    svg.setAttribute('height', document.documentElement.scrollHeight);
    svg.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none;z-index:2147483645';
    var polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    polyline.setAttribute('fill', 'none');
    polyline.setAttribute('stroke', '#A6CA93');
    polyline.setAttribute('stroke-width', '1.5');
    polyline.setAttribute('stroke-dasharray', '4 4');
    polyline.setAttribute('opacity', '.6');
    svg.appendChild(polyline);
    root.appendChild(svg);

    var items = computeOrder();
    var points = [];
    var positiveCount = 0, invisibleCount = 0;

    items.forEach(function (item, i) {
      var r = item.el.getBoundingClientRect();
      var cx = r.left + window.scrollX + r.width / 2;
      var cy = r.top + window.scrollY + r.height / 2;
      points.push(cx + ',' + cy);

      var badge = document.createElement('div');
      badge.textContent = String(i + 1);
      var bg = item.positiveTabindex || item.invisible ? '#A05C57' : '#5A7D46';
      badge.style.cssText = 'position:absolute;left:' + (cx - 10) + 'px;top:' + (cy - 10) + 'px;' +
        'width:20px;height:20px;border-radius:50%;background:' + bg + ';color:#EDE7DA;' +
        'font:700 11px/20px monospace;text-align:center;z-index:2147483646;pointer-events:none;' +
        'box-shadow:0 0 0 2px rgba(16,15,13,.7)';
      root.appendChild(badge);

      if (item.positiveTabindex) positiveCount++;
      if (item.invisible) invisibleCount++;
    });
    polyline.setAttribute('points', points.join(' '));

    // Étiquette courte pour une ligne d'export : texte visible, sinon nom accessible approximatif,
    // sinon id, pour qu'une ligne vide dans le fichier reste identifiable.
    function labelFor(el) {
      var t = (el.textContent || '').trim().replace(/\s+/g, ' ');
      if (t) return t.length > 60 ? t.slice(0, 57) + '…' : t;
      var ariaLabel = el.getAttribute('aria-label');
      if (ariaLabel) return ariaLabel.trim();
      if (el.value) return String(el.value).slice(0, 60);
      if (el.placeholder) return el.placeholder;
      if (el.id) return '#' + el.id;
      return '(no visible text)';
    }

    function buildExportText() {
      var lines = [];
      lines.push('Tab Order — ' + location.href);
      lines.push(new Date().toISOString());
      lines.push(items.length + ' focusable element(s), ' + positiveCount + ' positive tabindex, ' +
        invisibleCount + ' invisible.');
      lines.push('');
      items.forEach(function (item, i) {
        var flags = [];
        if (item.positiveTabindex) flags.push('positive tabindex');
        if (item.invisible) flags.push('invisible');
        lines.push((i + 1) + '. <' + item.el.tagName.toLowerCase() + '> ' + labelFor(item.el) +
          (flags.length ? '  [' + flags.join(', ') + ']' : ''));
      });
      return lines.join('\n');
    }

    function exportList() {
      var blob = new Blob([buildExportText()], { type: 'text/plain' });
      var url = URL.createObjectURL(blob);
      var win = window.open(url, '_blank');
      if (!win) {
        alert('The window was blocked by the browser. Allow pop-ups for this site and try again.');
      }
      // Laisse le temps à l'onglet de charger le contenu avant de libérer l'URL mémoire.
      setTimeout(function () { URL.revokeObjectURL(url); }, 30000);
    }

    var summary = document.createElement('div');
    summary.setAttribute('role', 'status');
    summary.style.cssText = 'position:fixed;bottom:20px;left:20px;z-index:2147483647;max-width:340px;' +
      'background:#100F0D;border:1px solid #A6CA93;border-radius:10px;padding:12px 14px;' +
      'font:13px/1.5 system-ui,Arial,sans-serif;color:#EDE7DA;box-shadow:0 12px 32px rgba(0,0,0,.5)';
    var html = '<strong style="color:#A6CA93">Tab order</strong> — ' + items.length + ' focusable element(s).';
    if (positiveCount > 0) {
      html += '<br>⚠ ' + positiveCount + ' with a positive <code>tabindex</code> (red) — ' +
        'reorders the DOM order, avoid it (criterion 2.4.3).';
    }
    if (invisibleCount > 0) {
      html += '<br>⚠ ' + invisibleCount + ' focusable but zero-size (red) — reachable by keyboard ' +
        'while invisible (criterion 2.1.1).';
    }
    html += '<br><div style="display:flex;gap:8px;margin-top:8px">' +
      '<button type="button" id="vl-taborder-export" style="background:transparent;' +
      'border:1px solid #A6CA93;color:#A6CA93;border-radius:6px;padding:5px 10px;' +
      'font:700 12px/1 system-ui,Arial,sans-serif;cursor:pointer">Export .txt</button>' +
      '<button type="button" id="vl-taborder-close" style="background:transparent;' +
      'border:1px solid rgba(237,231,218,.3);color:#F0A9A2;border-radius:6px;padding:5px 10px;' +
      'font:700 12px/1 system-ui,Arial,sans-serif;cursor:pointer">Close (Esc)</button></div>';
    summary.innerHTML = html;
    root.appendChild(summary);

    document.body.appendChild(root);

    function teardown() {
      root.remove();
      document.removeEventListener('keydown', onKey);
    }
    document.getElementById('vl-taborder-export').addEventListener('click', exportList);
    document.getElementById('vl-taborder-close').addEventListener('click', teardown);
    function onKey(e) {
      if (e.key === 'Escape') teardown();
    }
    document.addEventListener('keydown', onKey);
  } catch (e) {
    alert('The bookmarklet ran into an error: ' + e.message + '. Open the console for details. If nothing appears at all, the site is probably blocking external scripts (CSP).');
  }
})();
