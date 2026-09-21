// Contrast
// Clique sur un élément de texte, puis sur un élément de fond : calcule le ratio de contraste
// WCAG entre les deux et donne le verdict AA/AAA, en tenant compte de la taille détectée du texte.
(function () {
  'use strict';
  try {
    // Évite d'activer l'outil deux fois de suite si on reclique sur le favori pendant qu'il tourne déjà.
    if (window.__vlPicking) {
      return;
    }
    // Un second clic sur le favori pendant que le résultat est affiché referme le panneau.
    var existingPanel = document.getElementById('vl-contrast-panel');
    if (existingPanel) {
      existingPanel.remove();
      return;
    }

    var overlay, badge, prevCursor;

    // Parse un "rgb(r, g, b)" / "rgba(r, g, b, a)" tel que renvoyé par getComputedStyle.
    function parseColor(str) {
      var m = str && str.match(/rgba?\(([^)]+)\)/);
      if (!m) return null;
      var parts = m[1].split(',').map(function (p) { return parseFloat(p); });
      return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 };
    }

    // Le fond réel d'un élément n'est pas forcément le sien : s'il est transparent, il faut
    // composer avec les fonds de ses parents (en partant de la racine, blanc par défaut).
    function effectiveBackground(el) {
      var chain = [];
      var node = el;
      while (node) {
        var bg = parseColor(getComputedStyle(node).backgroundColor);
        if (bg && bg.a > 0) chain.unshift(bg);
        node = node.parentElement;
      }
      var result = { r: 255, g: 255, b: 255 };
      for (var i = 0; i < chain.length; i++) {
        var c = chain[i];
        result = {
          r: c.r * c.a + result.r * (1 - c.a),
          g: c.g * c.a + result.g * (1 - c.a),
          b: c.b * c.a + result.b * (1 - c.a)
        };
      }
      return result;
    }

    function luminance(rgb) {
      var chans = [rgb.r, rgb.g, rgb.b].map(function (c) {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      return 0.2126 * chans[0] + 0.7152 * chans[1] + 0.0722 * chans[2];
    }

    function contrastRatio(rgb1, rgb2) {
      var l1 = luminance(rgb1), l2 = luminance(rgb2);
      var lighter = Math.max(l1, l2), darker = Math.min(l1, l2);
      return (lighter + 0.05) / (darker + 0.05);
    }

    function verdictRow(label, pass) {
      return '<span style="color:' + (pass ? '#A6CA93' : '#F0A9A2') + '">' +
        (pass ? '✓ PASS' : '✗ FAIL') + '</span> ' + label;
    }

    // Panneau de résultat, sur le modèle visuel d'ARIA Reader / Headings.
    function buildPanel(textEl, bgEl) {
      var textColor = parseColor(getComputedStyle(textEl).color);
      var bgColor = effectiveBackground(bgEl);
      var ratio = contrastRatio(textColor, bgColor);

      var fontSizePx = parseFloat(getComputedStyle(textEl).fontSize) || 0;
      var weight = getComputedStyle(textEl).fontWeight;
      var isBold = weight === 'bold' || parseInt(weight, 10) >= 700;
      var isLarge = fontSizePx >= 24 || (isBold && fontSizePx >= 18.66);

      var aaNormal = ratio >= 4.5, aaaNormal = ratio >= 7;
      var aaLarge = ratio >= 3, aaaLarge = ratio >= 4.5;

      var panel = document.createElement('div');
      panel.id = 'vl-contrast-panel';
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-label', 'Contrast result');
      panel.style.cssText = 'position:fixed;top:24px;right:24px;width:min(400px,92vw);' +
        'max-height:86vh;z-index:2147483647;background:#100F0D;border:1px solid #A6CA93;' +
        'border-radius:12px;box-shadow:0 18px 48px rgba(0,0,0,.55);display:flex;flex-direction:column;' +
        'overflow:hidden;font:14px/1.5 system-ui,Arial,sans-serif;color:#EDE7DA';

      var bar = document.createElement('div');
      bar.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:12px;' +
        'padding:8px 10px;background:#191714;border-bottom:1px solid rgba(237,231,218,.16)';
      bar.innerHTML = '<span style="font-weight:700;letter-spacing:.04em">CONTRAST</span>';
      var closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.textContent = '×';
      closeBtn.setAttribute('aria-label', 'Close');
      closeBtn.style.cssText = 'background:transparent;border:1px solid rgba(237,231,218,.3);color:#F0A9A2;' +
        'border-radius:6px;width:28px;height:28px;font-size:16px;cursor:pointer';
      closeBtn.onclick = teardown;
      bar.appendChild(closeBtn);

      var body = document.createElement('div');
      body.style.cssText = 'padding:14px;overflow:auto';

      function row(label, value) {
        var d = document.createElement('div');
        d.style.cssText = 'margin-bottom:10px';
        d.innerHTML = '<div style="font-size:.74rem;text-transform:uppercase;letter-spacing:.07em;' +
          'color:#A6CA93;margin-bottom:2px">' + label + '</div><div style="font-size:.92rem">' + value + '</div>';
        return d;
      }

      var ratioBox = document.createElement('div');
      ratioBox.style.cssText = 'margin-bottom:12px;padding:10px 12px;background:#191714;border-radius:8px;' +
        'border:1px solid rgba(237,231,218,.14);text-align:center';
      ratioBox.innerHTML = '<div style="font-size:1.6rem;font-weight:700;color:#A6CA93">' +
        ratio.toFixed(2) + ':1</div><div style="font-size:.78rem;opacity:.7">contrast ratio</div>';
      body.appendChild(ratioBox);

      body.appendChild(row('Detected text size', fontSizePx.toFixed(1) + 'px' + (isBold ? ' bold' : '') +
        ' — treated as ' + (isLarge ? 'LARGE' : 'normal') + ' text'));

      body.appendChild(row('Normal text',
        verdictRow('AA (4.5:1)', aaNormal) + '<br>' + verdictRow('AAA (7:1)', aaaNormal)));
      body.appendChild(row('Large text',
        verdictRow('AA (3:1)', aaLarge) + '<br>' + verdictRow('AAA (4.5:1)', aaaLarge)));

      var note = document.createElement('div');
      note.style.cssText = 'font-size:.78rem;opacity:.6;margin-top:2px';
      note.textContent = 'Criteria 1.4.3 / 1.4.6. If what you picked was a UI component border or ' +
        'icon rather than text, the relevant threshold is 3:1 regardless of size (criterion 1.4.11).';
      body.appendChild(note);

      var pickAgain = document.createElement('button');
      pickAgain.type = 'button';
      pickAgain.textContent = 'Pick again';
      pickAgain.style.cssText = 'margin-top:12px;width:100%;background:transparent;border:1px solid #A6CA93;' +
        'color:#A6CA93;border-radius:8px;padding:9px;font:700 .85rem/1 system-ui,Arial,sans-serif;cursor:pointer';
      pickAgain.onclick = function () {
        panel.remove();
        startPicking();
      };
      body.appendChild(pickAgain);

      panel.appendChild(bar);
      panel.appendChild(body);
      document.body.appendChild(panel);
      closeBtn.focus();

      function onKey(e) {
        if (e.key === 'Escape') teardown();
      }
      document.addEventListener('keydown', onKey);
      function teardown() {
        panel.remove();
        document.removeEventListener('keydown', onKey);
      }
    }

    function startPicking() {
      window.__vlPicking = true;

      // step 1 = on attend le clic sur le texte, step 2 = on attend le clic sur le fond
      var step = 1;
      var textEl = null;

      overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;pointer-events:none;z-index:2147483647;' +
        'border:2px solid #A6CA93;background:rgba(166,202,147,0.18);display:none;';
      document.body.appendChild(overlay);

      badge = document.createElement('div');
      badge.style.cssText = 'position:fixed;pointer-events:none;z-index:2147483647;' +
        'background:#100F0D;color:#EDE7DA;font:12px monospace;padding:4px 8px;border-radius:4px;' +
        'display:none;max-width:80vw;white-space:nowrap;';
      document.body.appendChild(badge);

      // Bannière fixe, toujours visible dès l'activation : sans elle, tant que la souris n'a pas
      // bougé sur la page (ex. juste après un clic depuis la barre de favoris), rien à l'écran ne
      // montre que l'outil est armé — seul le curseur change, ce qui passe facilement inaperçu.
      var banner = document.createElement('div');
      banner.setAttribute('role', 'status');
      banner.style.cssText = 'position:fixed;top:16px;left:16px;z-index:2147483647;' +
        'background:#100F0D;color:#EDE7DA;border:1px solid #A6CA93;border-radius:10px;' +
        'padding:9px 14px;font:13px/1.4 system-ui,Arial,sans-serif;box-shadow:0 12px 32px rgba(0,0,0,.5);' +
        'max-width:280px';
      document.body.appendChild(banner);

      prevCursor = document.documentElement.style.cursor;
      document.documentElement.style.cursor = 'crosshair';

      function stepLabel() {
        return step === 1 ? 'Step 1/2 — click the TEXT' : 'Step 2/2 — click the BACKGROUND';
      }

      function renderBanner() {
        banner.innerHTML = '<strong style="color:#A6CA93">' + stepLabel() + '</strong><br>' +
          '<span style="opacity:.7">Esc to cancel</span>';
      }
      renderBanner();

      function cleanup() {
        document.removeEventListener('mousemove', onMove, true);
        document.removeEventListener('click', onClick, true);
        document.removeEventListener('keydown', onKey, true);
        overlay.remove();
        badge.remove();
        banner.remove();
        document.documentElement.style.cursor = prevCursor;
        window.__vlPicking = false;
      }

      function onMove(e) {
        var el = e.target;
        if (el === overlay || el === badge || el === banner) return;
        var r = el.getBoundingClientRect();
        overlay.style.display = 'block';
        overlay.style.left = r.left + 'px';
        overlay.style.top = r.top + 'px';
        overlay.style.width = r.width + 'px';
        overlay.style.height = r.height + 'px';
        badge.textContent = stepLabel() + ' — ' + el.tagName.toLowerCase();
        badge.style.display = 'block';
        badge.style.left = Math.max(0, r.left) + 'px';
        badge.style.top = Math.max(0, r.top - 24) + 'px';
      }

      function onClick(e) {
        if (e.target === banner || banner.contains(e.target)) return;
        e.preventDefault();
        e.stopPropagation();
        if (step === 1) {
          textEl = e.target;
          step = 2;
          renderBanner();
          return;
        }
        var bgEl = e.target;
        cleanup();
        buildPanel(textEl, bgEl);
      }

      function onKey(e) {
        if (e.key === 'Escape') {
          cleanup();
        }
      }

      document.addEventListener('mousemove', onMove, true);
      document.addEventListener('click', onClick, true);
      document.addEventListener('keydown', onKey, true);
    }

    startPicking();
  } catch (e) {
    alert('The bookmarklet ran into an error: ' + e.message + '. Open the console for details. If nothing appears at all, the site is probably blocking external scripts (CSP).');
    window.__vlPicking = false;
  }
})();
