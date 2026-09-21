// ARIA Reader
// Clique sur un élément : calcule son nom accessible, son rôle et ses états ARIA visibles, et
// construit une "annonce approximative" à la façon d'ANDI (SSA, domaine public) — modelé sur le
// concept, pas sur son code. Le calcul est une approximation documentée du nom accessible
// (implémentation maison), volontairement indépendante des internes non publiques d'axe-core
// (axe._tree), pour rester fiable d'une version d'axe-core à l'autre. Le résultat est étiqueté
// "approximatif" partout : l'annonce réelle varie selon lecteur d'écran / navigateur / verbosité.
(function () {
  'use strict';
  try {
    var existing = document.getElementById('vl-accname-panel');
    if (existing) existing.remove();

    var INTERACTIVE_ROLES = ['button', 'link', 'textbox', 'checkbox', 'radio', 'combobox',
      'listbox', 'slider', 'spinbutton', 'searchbox', 'switch'];

    function norm(str) {
      return (str || '').trim().replace(/\s+/g, ' ');
    }

    function textFromIdRefs(ids) {
      return norm(ids.split(/\s+/).map(function (id) {
        var ref = document.getElementById(id);
        return ref ? (ref.textContent || '') : '';
      }).join(' '));
    }

    function implicitRole(el) {
      var tag = el.tagName.toLowerCase();
      var type = (el.getAttribute('type') || '').toLowerCase();
      switch (tag) {
        case 'a': return el.hasAttribute('href') ? 'link' : 'generic';
        case 'button': return 'button';
        case 'input':
          if (type === 'button' || type === 'submit' || type === 'reset' || type === 'image') return 'button';
          if (type === 'checkbox') return 'checkbox';
          if (type === 'radio') return 'radio';
          if (type === 'range') return 'slider';
          if (type === 'number') return 'spinbutton';
          if (type === 'search') return 'searchbox';
          if (type === 'hidden') return '(hidden — not exposed)';
          return 'textbox';
        case 'select': return el.multiple ? 'listbox' : 'combobox';
        case 'textarea': return 'textbox';
        case 'img': return el.getAttribute('alt') === '' ? 'presentation (empty alt)' : 'img';
        case 'h1': case 'h2': case 'h3': case 'h4': case 'h5': case 'h6': return 'heading';
        case 'nav': return 'navigation';
        case 'main': return 'main';
        case 'header': return 'banner';
        case 'footer': return 'contentinfo';
        case 'aside': return 'complementary';
        case 'form': return 'form';
        case 'table': return 'table';
        case 'ul': case 'ol': return 'list';
        case 'li': return 'listitem';
        case 'summary': return 'button (details)';
        case 'label': return '(label — not itself exposed as a widget)';
        default: return 'generic';
      }
    }

    function role(el) {
      return el.getAttribute('role') || implicitRole(el);
    }

    function accessibleName(el) {
      var labelledby = el.getAttribute('aria-labelledby');
      if (labelledby) {
        var t = textFromIdRefs(labelledby);
        if (t) return { name: t, source: 'aria-labelledby' };
      }
      var ariaLabel = el.getAttribute('aria-label');
      if (ariaLabel && norm(ariaLabel)) return { name: norm(ariaLabel), source: 'aria-label' };

      var tag = el.tagName.toLowerCase();
      if (tag === 'img') {
        var alt = el.getAttribute('alt');
        if (alt !== null) return { name: norm(alt), source: 'alt' };
      }
      if (tag === 'input' || tag === 'textarea' || tag === 'select') {
        if (el.id) {
          var lbl = null;
          try { lbl = document.querySelector('label[for="' + CSS.escape(el.id) + '"]'); } catch (err) {}
          if (lbl) return { name: norm(lbl.textContent), source: '<label for>' };
        }
        var wrapLabel = el.closest ? el.closest('label') : null;
        if (wrapLabel) return { name: norm(wrapLabel.textContent), source: 'wrapping <label>' };
        var type = (el.getAttribute('type') || '').toLowerCase();
        if ((type === 'submit' || type === 'button' || type === 'reset') && el.value) {
          return { name: el.value, source: 'value' };
        }
        if (el.placeholder) {
          return { name: el.placeholder, source: 'placeholder (weak — do not rely on this alone, criterion 3.3.2)' };
        }
      }
      if (tag === 'fieldset') {
        var legend = el.querySelector('legend');
        if (legend) return { name: norm(legend.textContent), source: '<legend>' };
      }
      if (tag === 'table') {
        var caption = el.querySelector('caption');
        if (caption) return { name: norm(caption.textContent), source: '<caption>' };
      }
      var text = norm(el.textContent);
      if (text) return { name: text, source: 'text content' };

      var title = el.getAttribute('title');
      if (title && norm(title)) return { name: norm(title), source: 'title (last resort)' };

      return { name: '', source: 'none found' };
    }

    function states(el) {
      var out = [];
      var ariaBool = ['expanded', 'checked', 'selected', 'pressed', 'disabled', 'required', 'invalid', 'readonly', 'current'];
      ariaBool.forEach(function (attr) {
        var v = el.getAttribute('aria-' + attr);
        if (v !== null) out.push('aria-' + attr + '="' + v + '"');
      });
      if (el.disabled && out.indexOf('aria-disabled="true"') === -1) out.push('disabled');
      if (el.required && out.indexOf('aria-required="true"') === -1) out.push('required');
      if (el.readOnly) out.push('readonly');
      return out;
    }

    function announce(name, roleStr, stateList) {
      var parts = [];
      if (name) parts.push(name);
      parts.push(roleStr);
      if (stateList.length) parts.push(stateList.join(', '));
      return parts.join(', ');
    }

    function buildPanel(el) {
      var r = role(el);
      var nameInfo = accessibleName(el);
      var stateList = states(el);
      var warnEmpty = !nameInfo.name && INTERACTIVE_ROLES.indexOf(r) !== -1;

      var panel = document.createElement('div');
      panel.id = 'vl-accname-panel';
      panel.setAttribute('role', 'dialog');
      panel.setAttribute('aria-label', 'ARIA Reader');
      panel.style.cssText = 'position:fixed;top:24px;right:24px;width:min(420px,92vw);' +
        'max-height:86vh;z-index:2147483647;background:#100F0D;border:1px solid #A6CA93;' +
        'border-radius:12px;box-shadow:0 18px 48px rgba(0,0,0,.55);display:flex;flex-direction:column;' +
        'overflow:hidden;font:14px/1.5 system-ui,Arial,sans-serif;color:#EDE7DA';

      var bar = document.createElement('div');
      bar.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:12px;' +
        'padding:8px 10px;background:#191714;border-bottom:1px solid rgba(237,231,218,.16)';
      bar.innerHTML = '<span style="font-weight:700;letter-spacing:.04em">ARIA READER</span>';
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

      body.appendChild(row('Element', '&lt;' + el.tagName.toLowerCase() + '&gt;'));
      body.appendChild(row('Role', r));
      body.appendChild(row('Accessible name', (nameInfo.name ? esc(nameInfo.name) : '<em style="opacity:.6">(none)</em>') +
        '<span style="opacity:.55"> — source: ' + nameInfo.source + '</span>'));
      if (warnEmpty) {
        var warn = document.createElement('div');
        warn.style.cssText = 'color:#F0A9A2;font-size:.85rem;margin:-4px 0 10px';
        warn.textContent = '⚠ No accessible name for an interactive role — likely fails criterion 4.1.2.';
        body.appendChild(warn);
      }
      body.appendChild(row('States / properties', stateList.length ? esc(stateList.join(' · ')) : '<em style="opacity:.6">(none)</em>'));

      var approxBox = document.createElement('div');
      approxBox.style.cssText = 'margin-top:4px;padding:10px 12px;background:#191714;border-radius:8px;' +
        'border:1px solid rgba(237,231,218,.14)';
      approxBox.innerHTML = '<div style="font-size:.74rem;text-transform:uppercase;letter-spacing:.07em;' +
        'color:#C6B2ED;margin-bottom:4px">Approximate announcement</div>' +
        '<div style="font-size:.92rem">“' + esc(announce(nameInfo.name, r, stateList)) + '”</div>' +
        '<div style="font-size:.78rem;opacity:.6;margin-top:4px">Approximate only — the real announcement ' +
        'varies by screen reader, browser and verbosity setting. Criteria 4.1.2 / 2.5.3 / 1.1.1.</div>';
      body.appendChild(approxBox);

      var pickAgain = document.createElement('button');
      pickAgain.type = 'button';
      pickAgain.textContent = 'Pick another element';
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

    function esc(str) {
      var d = document.createElement('div');
      d.textContent = str;
      return d.innerHTML;
    }

    function startPicking() {
      if (window.__vlPicking) return;
      window.__vlPicking = true;

      var overlay = document.createElement('div');
      overlay.style.cssText = 'position:fixed;pointer-events:none;z-index:2147483647;' +
        'border:2px solid #A6CA93;background:rgba(166,202,147,0.18);display:none;';
      document.body.appendChild(overlay);

      var badge = document.createElement('div');
      badge.style.cssText = 'position:fixed;pointer-events:none;z-index:2147483647;' +
        'background:#100F0D;color:#EDE7DA;font:12px monospace;padding:4px 8px;border-radius:4px;' +
        'display:none;max-width:80vw;white-space:nowrap;';
      badge.textContent = 'Click an element to inspect its accessible name';
      document.body.appendChild(badge);

      var prevCursor = document.documentElement.style.cursor;
      document.documentElement.style.cursor = 'crosshair';

      function onMove(e) {
        var el = e.target;
        if (el === overlay || el === badge) return;
        var r = el.getBoundingClientRect();
        overlay.style.display = 'block';
        overlay.style.left = r.left + 'px';
        overlay.style.top = r.top + 'px';
        overlay.style.width = r.width + 'px';
        overlay.style.height = r.height + 'px';
        badge.style.display = 'block';
        badge.style.left = Math.max(0, r.left) + 'px';
        badge.style.top = Math.max(0, r.top - 24) + 'px';
      }

      function cleanup() {
        document.removeEventListener('mousemove', onMove, true);
        document.removeEventListener('click', onClick, true);
        document.removeEventListener('keydown', onKey, true);
        overlay.remove();
        badge.remove();
        document.documentElement.style.cursor = prevCursor;
        window.__vlPicking = false;
      }

      function onClick(e) {
        e.preventDefault();
        e.stopPropagation();
        var el = e.target;
        cleanup();
        buildPanel(el);
      }

      function onKey(e) {
        if (e.key === 'Escape') cleanup();
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
