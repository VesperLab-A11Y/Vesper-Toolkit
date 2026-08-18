// AC Targeted Scan — Vesper Toolkit
// Comme AC Scan, mais restreint à un sélecteur CSS précis (voir 🦇 CSS Selector pour l'obtenir).
(function () {
  'use strict';
  try {
    // Copie une chaîne dans le presse-papier via un <textarea> temporaire (voir full-scan.js pour le pourquoi).
    function vlCopy(json, count) {
      var copied = false;
      try {
        var ta = document.createElement('textarea');
        ta.value = json;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        copied = document.execCommand('copy');
        document.body.removeChild(ta);
      } catch (e) {
        copied = false;
      }
      if (copied) {
        alert('JSON copied to clipboard. ' + count + ' violation(s) found.');
      } else {
        alert('Automatic copy failed. Result is visible in the console. ' + count + ' violation(s) found.');
      }
    }

    // Demande le sélecteur CSS, scanne uniquement cette zone (ou toute la page si le champ est vide).
    function scan() {
      var sel = prompt('CSS selector for the area to scan (leave empty for the whole page):', '');
      if (sel === null) {
        // L'utilisatrice a annulé la boîte de dialogue.
        return;
      }
      var target = sel && sel.trim() ? document.querySelector(sel.trim()) : document;
      if (sel && sel.trim() && !target) {
        alert('No element found for that selector.');
        return;
      }
      axe.run(target, {}).then(function (r) {
        console.log(r);
        vlCopy(JSON.stringify(r), r.violations.length);
      }).catch(function (e) {
        alert('axe-core error: ' + e.message);
      });
    }

    // axe-core n'est pas forcément déjà chargé sur la page auditée : on le charge depuis le CDN si besoin.
    if (typeof axe === 'undefined') {
      var s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.0/axe.min.js';
      s.onload = scan;
      document.head.appendChild(s);
    } else {
      scan();
    }
  } catch (e) {
    alert('Error: ' + e.message);
  }
})();
