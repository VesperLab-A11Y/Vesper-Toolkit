// Reflow
// Ouvre la même page dans une fenêtre redimensionnée à la largeur CSS choisie (320px = WCAG
// 1.4.10, 884px = smartphone pliable déplié, 1280px = équivalent d'un zoom à 400%, ou une
// largeur personnalisée), et repère automatiquement un éventuel défilement horizontal une fois
// la page chargée.
(function () {
  'use strict';
  try {
    var existing = document.getElementById('vl-reflow-panel');
    if (existing) {
      existing.remove();
      return;
    }

    function openAt(width) {
      if (!width || width < 50) {
        alert('Invalid width.');
        return;
      }

      var win = window.open(location.href, '_blank', 'width=' + width + ',height=' + Math.max(400, screen.height - 100) + ',left=40,top=40');
      if (!win) {
        alert('The window was blocked by the browser. Allow pop-ups for this site and try again.');
        return;
      }

      // Certains navigateurs ignorent width/height sur _blank et ouvrent un onglet normal :
      // dans ce cas la mesure ci-dessous reste juste (elle lit la vraie largeur de la fenêtre),
      // seule la taille visuelle de la fenêtre ne sera pas celle demandée.
      win.addEventListener('load', function () {
        setTimeout(function () {
          try {
            var doc = win.document.documentElement;
            var overflow = doc.scrollWidth - doc.clientWidth;
            var pass = overflow <= 2;
            var banner = win.document.createElement('div');
            banner.setAttribute('role', 'status');
            banner.style.cssText = 'position:fixed;top:12px;left:12px;right:12px;z-index:2147483647;' +
              'font:13px/1.5 system-ui,Arial,sans-serif;padding:10px 14px;color:#EDE7DA;' +
              'border-radius:10px;border:1px solid ' + (pass ? '#A6CA93' : '#F0A9A2') + ';' +
              'background:#100F0D;box-shadow:0 12px 32px rgba(0,0,0,.5);display:flex;' +
              'align-items:flex-start;justify-content:space-between;gap:10px';
            var text = document.createElement('div');
            text.innerHTML = '<strong style="color:' + (pass ? '#A6CA93' : '#F0A9A2') + '">Reflow @ ' + width +
              'px</strong> (actual window: ' + doc.clientWidth + 'px)<br>' +
              (pass ? 'No horizontal scroll detected.' : 'Horizontal scroll detected (~' + overflow + 'px overflow).') +
              ' Criterion 1.4.10.';
            banner.appendChild(text);
            var closeBtn = win.document.createElement('button');
            closeBtn.type = 'button';
            closeBtn.textContent = '×';
            closeBtn.setAttribute('aria-label', 'Dismiss');
            closeBtn.style.cssText = 'flex:none;background:transparent;border:1px solid rgba(237,231,218,.3);' +
              'color:#EDE7DA;border-radius:6px;width:24px;height:24px;font-size:14px;cursor:pointer';
            closeBtn.onclick = function () { banner.remove(); };
            banner.appendChild(closeBtn);
            win.document.body.insertBefore(banner, win.document.body.firstChild);
          } catch (e) {
            // Page cross-origin ou pas encore prête : rien à mesurer automatiquement, l'inspection
            // visuelle dans la fenêtre ouverte reste valable.
          }
        }, 500);
      });
    }

    // Panneau de choix de largeur, sur le modèle visuel d'ARIA Reader / Headings.
    var panel = document.createElement('div');
    panel.id = 'vl-reflow-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Reflow width');
    panel.style.cssText = 'position:fixed;top:24px;right:24px;width:min(340px,92vw);' +
      'z-index:2147483647;background:#100F0D;border:1px solid #A6CA93;border-radius:12px;' +
      'box-shadow:0 18px 48px rgba(0,0,0,.55);display:flex;flex-direction:column;overflow:hidden;' +
      'font:14px/1.5 system-ui,Arial,sans-serif;color:#EDE7DA';

    var bar = document.createElement('div');
    bar.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:12px;' +
      'padding:8px 10px;background:#191714;border-bottom:1px solid rgba(237,231,218,.16)';
    bar.innerHTML = '<span style="font-weight:700;letter-spacing:.04em">REFLOW</span>';
    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.textContent = '×';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.style.cssText = 'background:transparent;border:1px solid rgba(237,231,218,.3);color:#F0A9A2;' +
      'border-radius:6px;width:28px;height:28px;font-size:16px;cursor:pointer';
    closeBtn.onclick = teardown;
    bar.appendChild(closeBtn);

    var body = document.createElement('div');
    body.style.cssText = 'padding:14px';

    var intro = document.createElement('div');
    intro.style.cssText = 'font-size:.85rem;opacity:.75;margin-bottom:12px';
    intro.textContent = 'Open this page in a window resized to a CSS width, and check for horizontal scroll.';
    body.appendChild(intro);

    function presetButton(label, sub, width) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.style.cssText = 'display:block;width:100%;text-align:left;background:transparent;' +
        'border:1px solid #A6CA93;border-radius:8px;padding:9px 11px;margin-bottom:8px;' +
        'font:700 .88rem/1.3 system-ui,Arial,sans-serif;color:#A6CA93;cursor:pointer';
      btn.innerHTML = label + '<br><span style="font-weight:400;opacity:.7;font-size:.78rem">' + sub + '</span>';
      btn.onclick = function () { teardown(); openAt(width); };
      return btn;
    }

    body.appendChild(presetButton('320px', 'mobile reflow — criterion 1.4.10', 320));
    body.appendChild(presetButton('884px', 'foldable phone, open — approximate, varies by device', 884));
    body.appendChild(presetButton('1280px', '400% zoom equivalent', 1280));

    var customRow = document.createElement('div');
    customRow.style.cssText = 'display:flex;gap:8px;margin-top:10px;align-items:center';
    var customInput = document.createElement('input');
    customInput.type = 'number';
    customInput.min = '50';
    customInput.placeholder = 'Custom, px';
    customInput.setAttribute('aria-label', 'Custom width in CSS pixels');
    customInput.style.cssText = 'flex:1;min-width:0;background:#191714;border:1px solid rgba(237,231,218,.3);' +
      'border-radius:6px;padding:7px 9px;color:#EDE7DA;font:13px system-ui,Arial,sans-serif';
    var customBtn = document.createElement('button');
    customBtn.type = 'button';
    customBtn.textContent = 'Open';
    customBtn.style.cssText = 'flex:none;background:#A6CA93;border:1px solid #A6CA93;color:#100F0D;' +
      'border-radius:6px;padding:7px 12px;font:700 .82rem/1 system-ui,Arial,sans-serif;cursor:pointer';
    customBtn.onclick = function () {
      var width = parseInt(customInput.value, 10);
      teardown();
      openAt(width);
    };
    customInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') customBtn.click();
    });
    customRow.appendChild(customInput);
    customRow.appendChild(customBtn);
    body.appendChild(customRow);

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
  } catch (e) {
    alert('The bookmarklet ran into an error: ' + e.message + '. Open the console for details. If nothing appears at all, the site is probably blocking external scripts (CSP).');
  }
})();
