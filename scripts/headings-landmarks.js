// Headings
// Ouvre un panneau listant la hiérarchie des titres (h1-h6) avec les sauts de niveau signalés,
// et les landmarks ARIA/HTML5 de la page. Cliquer une entrée fait défiler jusqu'à l'élément et
// le met brièvement en surbrillance.
(function () {
  'use strict';
  try {
    // Si le panneau existe déjà, un second clic sur le favori le referme plutôt que d'en ouvrir un autre.
    var existing = document.getElementById('vl-outline-panel');
    if (existing) {
      existing.remove();
      return;
    }

    function text(el) {
      return (el.textContent || '').trim().replace(/\s+/g, ' ');
    }

    function computeHeadings() {
      var nodes = document.querySelectorAll('h1,h2,h3,h4,h5,h6,[role="heading"][aria-level]');
      var out = [];
      var prevLevel = 0;
      var sawH1 = false;
      for (var i = 0; i < nodes.length; i++) {
        var el = nodes[i];
        var level = el.hasAttribute('aria-level')
          ? parseInt(el.getAttribute('aria-level'), 10)
          : parseInt(el.tagName.substr(1), 10);
        var skip = prevLevel > 0 && level > prevLevel + 1;
        if (level === 1) sawH1 = true;
        out.push({ el: el, level: level, label: text(el) || '(empty heading)', skip: skip });
        prevLevel = level;
      }
      return { items: out, sawH1: sawH1 };
    }

    // Repère les landmarks sans dupliquer un même élément sous deux sélecteurs (ex: <header role="banner">).
    function computeLandmarks() {
      var defs = [
        ['header:not([role])', 'banner'],
        ['[role="banner"]', 'banner'],
        ['nav:not([role])', 'navigation'],
        ['[role="navigation"]', 'navigation'],
        ['main:not([role])', 'main'],
        ['[role="main"]', 'main'],
        ['aside:not([role])', 'complementary'],
        ['[role="complementary"]', 'complementary'],
        ['footer:not([role])', 'contentinfo'],
        ['[role="contentinfo"]', 'contentinfo'],
        ['form[aria-label], form[aria-labelledby]', 'form'],
        ['[role="form"]', 'form'],
        ['[role="search"]', 'search'],
        ['section[aria-label], section[aria-labelledby]', 'region'],
        ['[role="region"][aria-label], [role="region"][aria-labelledby]', 'region']
      ];
      var seen = [];
      var out = [];
      for (var i = 0; i < defs.length; i++) {
        var nodes = document.querySelectorAll(defs[i][0]);
        for (var j = 0; j < nodes.length; j++) {
          var el = nodes[j];
          if (seen.indexOf(el) !== -1) continue;
          seen.push(el);
          var labelledby = el.getAttribute('aria-labelledby');
          var label = el.getAttribute('aria-label') ||
            (labelledby && document.getElementById(labelledby) ? text(document.getElementById(labelledby)) : '');
          out.push({ el: el, role: defs[i][1], label: label });
        }
      }
      // Signale les rôles répétés sans étiquette qui les distingue.
      var byRole = {};
      out.forEach(function (lm) {
        byRole[lm.role] = (byRole[lm.role] || 0) + 1;
      });
      out.forEach(function (lm) {
        lm.ambiguous = byRole[lm.role] > 1 && !lm.label;
      });
      return out;
    }

    var panel = document.createElement('div');
    panel.id = 'vl-outline-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Headings outline');
    panel.style.cssText = 'position:fixed;top:24px;right:24px;width:min(420px,92vw);height:min(640px,86vh);' +
      'z-index:2147483647;background:#100F0D;border:1px solid #A6CA93;border-radius:12px;' +
      'box-shadow:0 18px 48px rgba(0,0,0,.55);display:flex;flex-direction:column;overflow:hidden;' +
      'font:14px/1.5 system-ui,Arial,sans-serif;color:#EDE7DA';

    var bar = document.createElement('div');
    bar.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:12px;' +
      'padding:8px 10px;background:#191714;border-bottom:1px solid rgba(237,231,218,.16)';
    bar.innerHTML = '<span style="font-weight:700;letter-spacing:.04em">HEADINGS</span>';

    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.textContent = '×';
    closeBtn.setAttribute('aria-label', 'Close outline');
    closeBtn.style.cssText = 'background:transparent;border:1px solid rgba(237,231,218,.3);color:#F0A9A2;' +
      'border-radius:6px;width:28px;height:28px;font-size:16px;cursor:pointer';
    closeBtn.onclick = function () {
      panel.remove();
      document.removeEventListener('keydown', onKey);
    };
    bar.appendChild(closeBtn);

    var body = document.createElement('div');
    body.style.cssText = 'flex:1;overflow:auto;padding:12px';

    function sectionTitle(str) {
      var h = document.createElement('div');
      h.style.cssText = 'font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;' +
        'color:#A6CA93;margin:14px 0 6px';
      h.textContent = str;
      return h;
    }

    function flash(el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(function () {
        var r = el.getBoundingClientRect();
        var box = document.createElement('div');
        box.style.cssText = 'position:fixed;pointer-events:none;z-index:2147483646;' +
          'border:3px solid #F0A9A2;border-radius:2px;left:' + r.left + 'px;top:' + r.top + 'px;' +
          'width:' + r.width + 'px;height:' + r.height + 'px;transition:opacity .3s';
        document.body.appendChild(box);
        setTimeout(function () { box.style.opacity = '0'; }, 1200);
        setTimeout(function () { box.remove(); }, 1600);
      }, 350);
    }

    function makeRow(labelHtml, warn, onClickEl) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.innerHTML = labelHtml;
      btn.style.cssText = 'display:block;width:100%;text-align:left;background:transparent;' +
        'border:1px solid rgba(237,231,218,.14);border-radius:6px;padding:7px 9px;margin-bottom:5px;' +
        'font:13px/1.4 system-ui,Arial,sans-serif;color:' + (warn ? '#F0A9A2' : '#EDE7DA') + ';cursor:pointer';
      btn.onclick = function () { flash(onClickEl); };
      return btn;
    }

    var headingData = computeHeadings();
    body.appendChild(sectionTitle('Headings (' + headingData.items.length + ')'));
    if (!headingData.sawH1) {
      var noH1 = document.createElement('div');
      noH1.style.cssText = 'color:#F0A9A2;font-size:.82rem;margin-bottom:8px';
      noH1.textContent = '⚠ No <h1> found on the page.';
      body.appendChild(noH1);
    }
    if (headingData.items.length === 0) {
      var none = document.createElement('div');
      none.style.cssText = 'color:rgba(237,231,218,.6);font-size:.85rem';
      none.textContent = 'No heading found.';
      body.appendChild(none);
    }
    headingData.items.forEach(function (h) {
      var indent = (h.level - 1) * 14;
      var html = '<span style="opacity:.6">H' + h.level + '</span> ' +
        '<span style="margin-left:' + indent + 'px">' + (h.skip ? '⚠ ' : '') + h.label + '</span>';
      body.appendChild(makeRow(html, h.skip, h.el));
    });

    var landmarks = computeLandmarks();
    body.appendChild(sectionTitle('Landmarks (' + landmarks.length + ')'));
    if (landmarks.length === 0) {
      var noneL = document.createElement('div');
      noneL.style.cssText = 'color:rgba(237,231,218,.6);font-size:.85rem';
      noneL.textContent = 'No landmark found.';
      body.appendChild(noneL);
    }
    landmarks.forEach(function (lm) {
      var html = '<span style="opacity:.6">' + lm.role + '</span> ' +
        (lm.label ? '— “' + lm.label + '”' : (lm.ambiguous ? '⚠ no label (ambiguous with others of the same role)' : ''));
      body.appendChild(makeRow(html, lm.ambiguous, lm.el));
    });

    panel.appendChild(bar);
    panel.appendChild(body);
    document.body.appendChild(panel);
    closeBtn.focus();

    function onKey(e) {
      if (e.key === 'Escape') {
        panel.remove();
        document.removeEventListener('keydown', onKey);
      }
    }
    document.addEventListener('keydown', onKey);
  } catch (e) {
    alert('The bookmarklet ran into an error: ' + e.message + '. Open the console for details. If nothing appears at all, the site is probably blocking external scripts (CSP).');
  }
})();
