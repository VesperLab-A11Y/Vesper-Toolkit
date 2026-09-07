// Sonar
// Ouvre un panneau flottant qui charge sonar.html (hébergé sur GitHub Pages) dans une iframe.
// Contrairement aux 7 autres bookmarklets, celui-ci ne s'exécute pas seul : il a besoin que
// sonar.html soit servi en HTTPS, donc il ne fonctionnera pas sur une page file:// ou en HTTP simple.
(function () {
  'use strict';

  // URL fixe du repo publié sur GitHub Pages.
  var URL_SONAR = 'https://VesperLab-A11Y.github.io/Vesper-Toolkit/sonar.html';

  // Si le panneau existe déjà, un second clic sur le favori le referme plutôt que d'en ouvrir un autre.
  var existing = document.getElementById('vl-sonar-panel');
  if (existing) {
    existing.remove();
    return;
  }

  var panel = document.createElement('div');
  panel.id = 'vl-sonar-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Sonar - WCAG 2.2 reference');
  panel.style.cssText = 'position:fixed;top:24px;right:24px;width:min(460px,92vw);height:min(640px,86vh);' +
    'z-index:2147483647;background:#100F0D;border:1px solid #A6CA93;border-radius:12px;' +
    'box-shadow:0 18px 48px rgba(0,0,0,.55);display:flex;flex-direction:column;overflow:hidden;' +
    'font:14px/1.5 system-ui,Arial,sans-serif';

  // Barre de titre : sert aussi de poignée pour déplacer le panneau (voir le drag plus bas).
  var bar = document.createElement('div');
  bar.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:12px;' +
    'padding:8px 10px;background:#191714;color:#EDE7DA;cursor:move;border-bottom:1px solid rgba(237,231,218,.16)';
  bar.innerHTML = '<span style="font-weight:700;letter-spacing:.04em">SONAR &mdash; WCAG 2.2</span>';

  var closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.textContent = '×';
  closeBtn.setAttribute('aria-label', 'Close Sonar');
  closeBtn.style.cssText = 'background:transparent;border:1px solid rgba(237,231,218,.3);color:#F0A9A2;' +
    'border-radius:6px;width:28px;height:28px;font-size:16px;cursor:pointer';
  closeBtn.onclick = function () {
    panel.remove();
    document.removeEventListener('keydown', onKey);
  };
  bar.appendChild(closeBtn);

  var frame = document.createElement('iframe');
  frame.src = URL_SONAR;
  frame.title = 'Sonar - WCAG 2.2 criteria search';
  // Délègue la permission clipboard-write à l'iframe : sans ça, les boutons "copier" de
  // sonar.html retombent silencieusement sur leur repli execCommand dans la plupart des navigateurs.
  frame.setAttribute('allow', 'clipboard-write');
  frame.style.cssText = 'border:0;flex:1;width:100%;background:#100F0D';

  panel.appendChild(bar);
  panel.appendChild(frame);
  document.body.appendChild(panel);
  closeBtn.focus();

  // Déplacement du panneau : on suit la souris depuis le mousedown sur la barre de titre
  // (sauf si on a cliqué le bouton fermer) jusqu'au mouseup.
  var drag = null;
  bar.addEventListener('mousedown', function (e) {
    if (e.target === closeBtn) return;
    var r = panel.getBoundingClientRect();
    drag = { x: e.clientX - r.left, y: e.clientY - r.top };
    panel.style.right = 'auto';
    panel.style.left = r.left + 'px';
    panel.style.top = r.top + 'px';
    e.preventDefault();
  });
  document.addEventListener('mousemove', function (e) {
    if (!drag) return;
    panel.style.left = Math.max(0, e.clientX - drag.x) + 'px';
    panel.style.top = Math.max(0, e.clientY - drag.y) + 'px';
  });
  document.addEventListener('mouseup', function () {
    drag = null;
  });

  function onKey(e) {
    if (e.key === 'Escape') {
      panel.remove();
      document.removeEventListener('keydown', onKey);
    }
  }
  document.addEventListener('keydown', onKey);
})();
