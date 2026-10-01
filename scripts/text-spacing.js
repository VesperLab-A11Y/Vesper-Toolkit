// Text Spacing
// Applique les espacements de texte du critère WCAG 1.4.12 (interligne 1,5, espacement entre
// paragraphes 2x la taille de police, lettres 0,12em, mots 0,16em) à toute la page, pour vérifier
// qu'aucun contenu n'est coupé, masqué ou superposé. Un second clic sur le favori (ou sur le × du
// bandeau) retire les styles.
(function () {
  'use strict';
  try {
    var STYLE_ID = 'vl-textspacing-style';
    var PILL_ID = 'vl-textspacing-pill';

    var existing = document.getElementById(STYLE_ID);
    if (existing) {
      existing.remove();
      var oldPill = document.getElementById(PILL_ID);
      if (oldPill) oldPill.remove();
      return;
    }

    // Le bandeau est exclu des règles pour qu'il reste lisible pendant le test.
    var skip = ':not(#' + PILL_ID + '):not(#' + PILL_ID + ' *)';
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent =
      '*' + skip + '{line-height:1.5 !important;letter-spacing:0.12em !important;word-spacing:0.16em !important}' +
      'p' + skip + '{margin-bottom:2em !important}';
    document.head.appendChild(style);

    var pill = document.createElement('div');
    pill.id = PILL_ID;
    pill.setAttribute('role', 'status');
    pill.style.cssText = 'position:fixed;bottom:16px;left:16px;z-index:2147483647;max-width:min(380px,92vw);' +
      'background:#100F0D;border:1px solid #A6CA93;border-radius:10px;padding:10px 12px;' +
      'box-shadow:0 12px 32px rgba(0,0,0,.5);display:flex;align-items:flex-start;gap:10px;' +
      'font:13px/1.45 system-ui,Arial,sans-serif;color:#EDE7DA;letter-spacing:normal;word-spacing:normal';

    var text = document.createElement('div');
    text.innerHTML = '<strong style="color:#A6CA93">Text spacing on</strong> (criterion 1.4.12)<br>' +
      '<span style="opacity:.8">Line height 1.5, paragraphs 2x, letters 0.12em, words 0.16em. ' +
      'Look for clipped, hidden or overlapping text.</span>';
    pill.appendChild(text);

    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.textContent = '×';
    closeBtn.setAttribute('aria-label', 'Remove text spacing');
    closeBtn.style.cssText = 'flex:none;background:transparent;border:1px solid rgba(237,231,218,.3);' +
      'color:#F0A9A2;border-radius:6px;width:28px;height:28px;font-size:16px;cursor:pointer';
    closeBtn.onclick = function () {
      style.remove();
      pill.remove();
    };
    pill.appendChild(closeBtn);
    document.body.appendChild(pill);
    closeBtn.focus();
  } catch (e) {
    alert('The bookmarklet ran into an error: ' + e.message + '. Open the console for details. If nothing appears at all, the site is probably blocking external scripts (CSP).');
  }
})();
