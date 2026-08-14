// CSS Selector — Vesper Bookmarklets
// Survole la page pour voir le sélecteur CSS de l'élément sous la souris, clique pour le copier.
// À utiliser avec 🦇 AC Targeted Scan.
(function () {
  'use strict';

  // Évite d'activer l'outil deux fois de suite si on reclique sur le favori pendant qu'il tourne déjà.
  if (window.__vlPicking) {
    return;
  }
  window.__vlPicking = true;

  // Le cadre qui suit la souris pour montrer la zone survolée.
  var overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;pointer-events:none;z-index:2147483647;' +
    'border:2px solid #A6CA93;background:rgba(166,202,147,0.18);display:none;';
  document.body.appendChild(overlay);

  // La petite étiquette qui affiche le sélecteur au-dessus de l'élément survolé.
  var badge = document.createElement('div');
  badge.style.cssText = 'position:fixed;pointer-events:none;z-index:2147483647;' +
    'background:#100F0D;color:#EDE7DA;font:12px monospace;padding:4px 8px;border-radius:4px;' +
    'display:none;max-width:80vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
  document.body.appendChild(badge);

  var prevCursor = document.documentElement.style.cursor;
  document.documentElement.style.cursor = 'crosshair';

  function esc(s) {
    try {
      return CSS.escape(s);
    } catch (e) {
      return s;
    }
  }

  // Construit le sélecteur CSS le plus court et le plus stable possible pour un élément donné :
  // priorité à l'id, sinon on remonte les parents en ajoutant classes / :nth-of-type au besoin,
  // et on s'arrête dès que le sélecteur assemblé ne cible qu'un seul élément sur la page.
  function buildSelector(el) {
    if (!el || el.nodeType !== 1) return '';
    if (el.id) {
      var s = '#' + esc(el.id);
      try {
        if (document.querySelectorAll(s).length === 1) return s;
      } catch (e) {}
    }
    var parts = [];
    var node = el;
    while (node && node.nodeType === 1 && node !== document.documentElement) {
      var part = node.tagName.toLowerCase();
      if (node.id) {
        part = '#' + esc(node.id);
        parts.unshift(part);
        break;
      }
      var cls = (node.className && typeof node.className === 'string')
        ? node.className.trim().split(/\s+/).filter(Boolean).slice(0, 2)
        : [];
      if (cls.length) {
        part += '.' + cls.map(esc).join('.');
      }
      var parent = node.parentElement;
      if (parent) {
        var same = Array.prototype.filter.call(parent.children, function (c) { return c.tagName === node.tagName; });
        if (same.length > 1) {
          part += ':nth-of-type(' + (Array.prototype.indexOf.call(same, node) + 1) + ')';
        }
      }
      parts.unshift(part);
      var candidate = parts.join(' > ');
      try {
        if (document.querySelectorAll(candidate).length === 1) return candidate;
      } catch (e) {}
      node = parent;
    }
    return parts.join(' > ');
  }

  function onMove(e) {
    var el = e.target;
    if (el === overlay || el === badge) return;
    var r = el.getBoundingClientRect();
    overlay.style.display = 'block';
    overlay.style.left = r.left + 'px';
    overlay.style.top = r.top + 'px';
    overlay.style.width = r.width + 'px';
    overlay.style.height = r.height + 'px';
    var sel = buildSelector(el);
    badge.textContent = sel;
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
    var sel = buildSelector(e.target);
    var copied = false;
    try {
      var ta = document.createElement('textarea');
      ta.value = sel;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      copied = document.execCommand('copy');
      document.body.removeChild(ta);
    } catch (err) {
      copied = false;
    }
    cleanup();
    if (copied) {
      alert('Selector copied: ' + sel);
    } else {
      alert('Copy failed. Selector: ' + sel);
    }
  }

  function onKey(e) {
    if (e.key === 'Escape') {
      cleanup();
    }
  }

  document.addEventListener('mousemove', onMove, true);
  document.addEventListener('click', onClick, true);
  document.addEventListener('keydown', onKey, true);
})();
