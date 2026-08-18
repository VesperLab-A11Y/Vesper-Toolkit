// Finder — Vesper Toolkit
// Retrouve et met en évidence un ou plusieurs éléments à partir d'un sélecteur CSS ou d'un extrait de code HTML.
// Utile quand le CSS Selector ne peut pas cibler un élément déjà disparu, masqué ou hors écran.
(function () {
  'use strict';
  try {
    // Si le panneau est déjà ouvert, on se contente de lui redonner le focus plutôt que d'en ouvrir un second.
    if (document.getElementById('vl-finder-panel')) {
      document.getElementById('vl-finder-input').focus();
      return;
    }

    // Éléments qu'on a dû révéler temporairement (display/visibility/opacity/hidden modifiés) pour les montrer.
    var revealed = [];
    // Éléments actuellement entourés d'un contour de surlignage.
    var marked = [];

    function esc(s) {
      if (s == null) return '';
      return String(s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }

    function isHidden(el) {
      var st = getComputedStyle(el);
      return (st.display === 'none') || (st.visibility === 'hidden') || (parseFloat(st.opacity) === 0);
    }

    // Remonte la chaîne des parents d'un élément et force l'affichage de tous ceux qui le cachaient
    // (display:none, visibility:hidden, opacity:0, ou l'attribut hidden). On garde en mémoire l'état
    // d'origine de chacun pour pouvoir tout restaurer exactement au clic sur "Reset" ou "Close".
    function reveal(el) {
      var chain = [];
      var node = el;
      while (node && node.nodeType === 1) {
        chain.push(node);
        node = node.parentElement;
      }
      chain.forEach(function (n) {
        if (!isHidden(n) && n.getAttribute('hidden') === null) return;
        revealed.push({ el: n, style: n.getAttribute('style'), hidden: n.getAttribute('hidden') });
        if (n.getAttribute('hidden') !== null) {
          n.removeAttribute('hidden');
        }
        n.style.display = 'block';
        n.style.visibility = 'visible';
        n.style.opacity = '1';
      });
    }

    // Remet tous les éléments touchés dans l'état exact où on les a trouvés.
    function restore() {
      revealed.forEach(function (r) {
        if (r.style === null) {
          r.el.removeAttribute('style');
        } else {
          r.el.setAttribute('style', r.style);
        }
        if (r.hidden !== null) {
          r.el.setAttribute('hidden', r.hidden);
        }
      });
      revealed = [];
      marked.forEach(function (m) {
        m.el.style.outline = m.outline;
      });
      marked = [];
    }

    function mark(el) {
      marked.push({ el: el, outline: el.style.outline });
      el.style.outline = '4px solid #C6B2ED';
      el.style.outlineOffset = '2px';
    }

    function describe(el) {
      var d = el.tagName.toLowerCase();
      if (el.id) {
        d += '#' + el.id;
      }
      if (el.className && typeof el.className === 'string') {
        var cls = el.className.trim().split(/\s+/).filter(Boolean).slice(0, 3);
        if (cls.length) {
          d += '.' + cls.join('.');
        }
      }
      return d;
    }

    function searchBySelector(q) {
      try {
        return Array.prototype.slice.call(document.querySelectorAll(q));
      } catch (e) {
        return null;
      }
    }

    // Recherche par extrait de code : on parse le HTML collé pour en extraire un élément "sonde",
    // puis on note ses attributs distinctifs (id, src, href...) et son texte, et on compare
    // chaque élément du même tag présent sur la page pour trouver le meilleur candidat.
    // Si le texte collé n'est pas du HTML valide, on cherche simplement ce texte tel quel dans la page.
    function searchBySnippet(q) {
      var host = document.createElement('div');
      host.innerHTML = q;
      var probe = host.firstElementChild;
      if (!probe) {
        var text = q.trim();
        if (!text) return [];
        var all = document.querySelectorAll('body *');
        return Array.prototype.filter.call(all, function (el) {
          return el.children.length === 0 && el.textContent.trim().indexOf(text) !== -1;
        });
      }
      var tag = probe.tagName;
      var candidates = Array.prototype.slice.call(document.getElementsByTagName(tag));
      var attrs = ['id', 'src', 'href', 'alt', 'aria-label', 'name', 'title', 'for', 'class'];
      var probeAttrs = {};
      attrs.forEach(function (a) {
        var v = probe.getAttribute(a);
        if (v) {
          probeAttrs[a] = v;
        }
      });
      var probeText = probe.textContent.replace(/\s+/g, ' ').trim();

      var scored = candidates.map(function (el) {
        var score = 0;
        Object.keys(probeAttrs).forEach(function (a) {
          var v = el.getAttribute(a);
          if (v && v === probeAttrs[a]) {
            score += (a === 'id' || a === 'src' || a === 'href') ? 4 : 2;
          }
        });
        if (probeText && el.textContent.replace(/\s+/g, ' ').trim() === probeText) {
          score += 3;
        }
        return { el: el, score: score };
      }).filter(function (x) { return x.score > 0; });

      scored.sort(function (a, b) { return b.score - a.score; });
      return scored.map(function (x) { return x.el; });
    }

    // --- Construction du panneau flottant ---
    // Pas de police Noto ici volontairement : ce panneau s'injecte dans une page tierce quelconque,
    // qui n'a aucune raison d'avoir chargé les polices Vesper Lab. On reste sur la pile système.
    var panel = document.createElement('div');
    panel.id = 'vl-finder-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Vesper Lab, find an element');
    panel.style.cssText = 'position:fixed;top:16px;right:16px;width:340px;max-height:80vh;overflow:auto;' +
      'z-index:2147483647;background:#191714;color:#EDE7DA;border:1px solid rgba(237,231,218,0.16);' +
      'border-radius:12px;padding:16px;font:14px/1.5 -apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;' +
      'box-shadow:0 12px 40px rgba(0,0,0,.5);';

    panel.innerHTML =
      '<h2 style="font-family:Georgia,serif;font-size:16px;margin:0 0 4px;">🦇 Finder</h2>' +
      '<p id="vl-finder-hint" style="margin:0 0 10px;font-size:12px;color:#A9A091;">Paste a CSS selector (<code>#menu .item</code>) or an HTML snippet. Hidden elements are revealed temporarily.</p>' +
      '<label for="vl-finder-input" style="display:block;font-size:12px;font-weight:700;margin-bottom:4px;">Selector or snippet</label>' +
      '<textarea id="vl-finder-input" rows="4" aria-describedby="vl-finder-hint" style="width:100%;font-family:Consolas,monospace;font-size:12px;padding:8px;border-radius:6px;border:1px solid rgba(237,231,218,0.18);background:#100F0D;color:#EDE7DA;"></textarea>' +
      '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;">' +
      '<button type="button" id="vl-finder-go" style="font-weight:700;font-size:13px;padding:8px 14px;border-radius:8px;border:1px solid #A6CA93;background:#A6CA93;color:#100F0D;cursor:pointer;">Search</button>' +
      '<button type="button" id="vl-finder-reset" style="font-weight:700;font-size:13px;padding:8px 14px;border-radius:8px;border:1px solid rgba(237,231,218,0.22);background:transparent;color:#F0A9A2;cursor:pointer;">Reset</button>' +
      '<button type="button" id="vl-finder-close" style="font-weight:700;font-size:13px;padding:8px 14px;border-radius:8px;border:1px solid rgba(237,231,218,0.22);background:transparent;color:#A9A091;cursor:pointer;">Close</button>' +
      '</div>' +
      '<div id="vl-finder-status" role="status" style="margin-top:10px;font-size:13px;color:#E5BE7D;font-weight:600;"></div>' +
      '<ul id="vl-finder-results" style="list-style:none;padding:0;margin:10px 0 0;font-size:12px;"></ul>';

    document.body.appendChild(panel);

    var input = document.getElementById('vl-finder-input');
    var statusEl = document.getElementById('vl-finder-status');
    var resultsEl = document.getElementById('vl-finder-results');

    // Lance la recherche : essaie d'abord comme sélecteur CSS, puis comme extrait de code /
    // recherche textuelle si le sélecteur est invalide ou ne trouve rien. Révèle et surligne
    // jusqu'à 25 résultats, avec un bouton "Go to element" pour chacun.
    function run() {
      restore();
      resultsEl.innerHTML = '';
      var q = input.value.trim();
      if (!q) {
        statusEl.textContent = 'Enter a selector or a code snippet.';
        input.focus();
        return;
      }

      var found = null;
      var mode = '';
      if (q.indexOf('<') !== -1) {
        found = searchBySnippet(q);
        mode = 'code snippet';
      } else {
        found = searchBySelector(q);
        mode = 'CSS selector';
        if (found === null) {
          found = searchBySnippet(q);
          mode = 'text search (invalid selector)';
        } else if (found.length === 0) {
          var alt = searchBySnippet(q);
          if (alt.length) {
            found = alt;
            mode = 'text search';
          }
        }
      }

      found = (found || []).filter(function (el) {
        return el && el !== panel && !panel.contains(el);
      }).slice(0, 25);

      if (!found.length) {
        statusEl.textContent = 'No element found (' + mode + '). It may be inside an iframe, or loaded dynamically.';
        return;
      }

      statusEl.textContent = found.length + ' element(s) found via ' + mode + '.';

      found.forEach(function (el, i) {
        var wasHidden = isHidden(el);
        reveal(el);
        mark(el);
        var li = document.createElement('li');
        li.style.cssText = 'padding:7px 0;border-bottom:1px solid rgba(237,231,218,0.12);';
        li.innerHTML = '<code style="font-size:11px;color:#C8C0B2;">' + esc(describe(el)) + '</code>' +
          (wasHidden ? '<span style="color:#E5BE7D;font-size:11px;display:block;">▲ was hidden, temporarily revealed</span>' : '');
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = 'Go to element ' + (i + 1);
        btn.style.cssText = 'margin-top:5px;font-size:11px;font-weight:700;padding:5px 10px;border-radius:6px;border:1px solid rgba(237,231,218,0.22);background:transparent;color:#F0A9A2;cursor:pointer;';
        btn.addEventListener('click', function () {
          try {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } catch (e) {
            el.scrollIntoView();
          }
          try {
            el.setAttribute('tabindex', '-1');
            el.focus();
          } catch (e) {}
          statusEl.textContent = 'Element ' + (i + 1) + ' targeted: ' + describe(el);
        });
        li.appendChild(btn);
        resultsEl.appendChild(li);
      });

      try {
        found[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      } catch (e) {}
    }

    document.getElementById('vl-finder-go').addEventListener('click', run);
    document.getElementById('vl-finder-reset').addEventListener('click', function () {
      restore();
      resultsEl.innerHTML = '';
      input.value = '';
      statusEl.textContent = 'Reset: highlights and reveals undone.';
      input.focus();
    });
    document.getElementById('vl-finder-close').addEventListener('click', function () {
      restore();
      panel.remove();
    });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        run();
      }
      if (e.key === 'Escape') {
        restore();
        panel.remove();
      }
    });

    input.focus();
  } catch (err) {
    alert('The bookmarklet ran into an error: ' + err.message + '. Open the console for details. If nothing appears at all, the site is probably blocking external scripts (CSP).');
    if (window.console) {
      console.error('Vesper Lab, find an element:', err);
    }
  }
})();
