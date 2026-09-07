// AC Scan
// Lance axe-core sur toute la page et copie le résultat JSON dans le presse-papier.
(function () {
  'use strict';
  try {
    // Copie une chaîne dans le presse-papier via un <textarea> temporaire.
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

    // Lance le scan complet (toute la page) et copie le résultat.
    function scan() {
      axe.run(document, {}).then(function (r) {
        console.log(r);
        vlCopy(JSON.stringify(r), r.violations.length);
      }).catch(function (e) {
        alert('axe-core error: ' + e.message);
      });
    }

    // axe-core n'est pas forcément déjà chargé : charge depuis le CDN si besoin.
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
