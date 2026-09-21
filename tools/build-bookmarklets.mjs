#!/usr/bin/env node
// build-bookmarklets.mjs, Vesper Bookmarklets
//
// À lancer à la main avant chaque publication (aucune CI, aucune dépendance npm) :
//   node tools/build-bookmarklets.mjs
//
// Pour chaque script listé dans SLUGS, ce script :
//   1. lit scripts/<slug>.js (la version lisible, avec commentaires FR),
//   2. la "minifie" (retire les lignes de commentaire et les lignes vides, aplatit en une seule ligne),
//   3. l'échappe pour pouvoir vivre dans un attribut HTML href="...",
//   4. remplace le href="..." du <a data-bookmarklet="slug" ...> correspondant, directement dans index.html.
//
// Important : la minification ici est volontairement simple (pas de vrai parseur JS). Elle ne
// fonctionne que parce que dans scripts/*.js, un commentaire est TOUJOURS seul sur sa ligne
// (jamais en fin de ligne de code). 

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const SCRIPTS_DIR = join(ROOT, 'scripts');
const INDEX_FILE = join(ROOT, 'index.html');

// L'ordre n'a pas d'importance ici, seule la présence du fichier compte.
const SLUGS = [
  'full-scan',
  'targeted-scan',
  'css-selector',
  'element-finder',
  'link-scan',
  'image-scan',
  'label-scan',
  'sonar',
  'contrast-picker',
  'headings-landmarks',
  'tab-order',
  'reflow-toggle',
  'accessible-name'
];

function minify(source) {
  const lines = source.split('\n');
  const kept = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed === '' || trimmed.startsWith('//')) continue;
    kept.push(trimmed);
  }
  return kept.join(' ').replace(/\s{2,}/g, ' ').trim();
}

// Échappe les caractères qui casseraient un attribut HTML href="...".
// Pas d'encodeURIComponent 
function escapeForHtmlAttr(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildHref(slug) {
  const path = join(SCRIPTS_DIR, `${slug}.js`);
  if (!existsSync(path)) {
    console.log(`  — ${slug}: pas de scripts/${slug}.js pour l'instant, ignoré.`);
    return null;
  }
  const source = readFileSync(path, 'utf8');
  const flat = minify(source);
  return escapeForHtmlAttr(`javascript:${flat}`);
}

function main() {
  let html = readFileSync(INDEX_FILE, 'utf8');
  let updated = 0;

  for (const slug of SLUGS) {
    const href = buildHref(slug);
    if (href === null) continue;

    const pattern = new RegExp(
      `(<a[^>]*data-bookmarklet="${slug}"[^>]*?)href="[^"]*"`
    );
    if (!pattern.test(html)) {
      console.log(`  — ${slug}: aucune balise data-bookmarklet="${slug}" trouvée dans index.html, ignoré.`);
      continue;
    }
    html = html.replace(pattern, `$1href="${href}"`);
    console.log(`  ✓ ${slug}: href mis à jour (${href.length} caractères).`);
    updated++;
  }

  writeFileSync(INDEX_FILE, html, 'utf8');
  console.log(`\n${updated} bookmarklet(s) injecté(s) dans index.html.`);
}

main();
