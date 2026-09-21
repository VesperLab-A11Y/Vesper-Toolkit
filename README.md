# Vesper Toolkit

## English

Small, free accessibility-testing tools that live in your bookmarks bar. No
extension, no account, no data leaving your browser. Built by
[Vesper Lab](https://vesperlab.dev/).

**[Get the bookmarklets →](https://toolkit.vesperlab.dev/)**

### What's here

- **AC Scan / AC Targeted Scan**: run [axe-core](https://github.com/dequelabs/axe-core)
  (Deque Systems) on a page or on one CSS selector, copy the JSON result.
- **CSS Selector**: click an element, copy its selector.
- **Finder**: find and highlight an element (even hidden or off-screen) from a
  selector or a code snippet.
- **Link / Image / Label Scan**: focused reports on links, images and form
  labels, each opening its own printable and exportable report tab. Each report
  has a **Copy as JSON** button, in the same axe-core-shaped format AC Scan
  produces, so you can paste it into the Vesper Axe-Core Viewer the same way.
- **Sonar**: search the 87 WCAG 2.2 success criteria in a movable panel over the
  page you're working on. Shows the official name, level, guideline and a link to
  the W3C page.
- **Contrast**: click a text element, then its background, and get the
  WCAG contrast ratio with an AA/AAA verdict for the detected text size.
- **Headings**: lists the h1-h6 hierarchy (level skips flagged) and
  the ARIA/HTML5 landmarks in a panel; click an entry to jump to it.
- **Tab Order**: numbers every focusable element in real tab order and draws the
  path between them; flags positive `tabindex` and invisible focusable elements.
  Export the list as a `.txt` file.
- **Reflow**: opens the page in a window resized to a CSS width you
  choose (320px, 884px foldable open, 1280px, or custom) and flags horizontal scroll automatically.
- **ARIA Reader**: click an element to see its computed accessible name,
  role and ARIA states, plus an approximate screen reader announcement.
- **Vesper Axe-Core Viewer** (`scan-results.html`): turns the JSON from AC Scan
  into a readable report, exportable to Word, Excel and print.

### Installation

Open the **[install page](https://toolkit.vesperlab.dev/)**: it has a draggable
button and a **Clipboard** fallback for each tool, plus a source link so you can
read the code before you install it.

**By dragging**

1. Show your browser's bookmarks bar: `Cmd+Shift+B` (macOS) or `Ctrl+Shift+B`
   (Windows/Linux).
2. Drag the button for the tool you want onto that bar.
3. Go to the page you want to check, then click the bookmark.

**Without dragging** (keyboard, tremor, or simply preference)

1. Press **Clipboard** next to the tool you want.
2. In your browser's bookmark manager, create a new bookmark.
3. Give it a name, paste the copied code into the *URL* field, save.

**If nothing happens**: open the console (`Cmd+Option+I` on macOS,
`Ctrl+Shift+I` on Windows) before clicking. A *Content Security Policy* message
means the site forbids running external scripts, and no bookmarklet can get
around that. If a report tab does not open, allow pop-ups for the site you are
checking.

**Sonar is the exception**: the other tools run entirely inside the page you are
on. Sonar opens a panel that loads `sonar.html` over HTTPS in an iframe, so it
will not work on a page served from `file://` or plain HTTP.

### Deployment

Static repo, served as-is by GitHub Pages, no build step. Published at
<https://toolkit.vesperlab.dev/>.

### Structure

| Path | Role |
|---|---|
| `index.html` | Install page: draggable buttons, Clipboard fallback, source links |
| `scan-results.html` | Vesper Axe-Core Viewer — AC Scan JSON to a readable, exportable report |
| `sonar.html` | Sonar's page, loaded in an iframe by `scripts/sonar.js` |
| `scripts/` | Readable, unminified source of every bookmarklet |
| `tools/build-bookmarklets.mjs` | Regenerates the `javascript:` links in `index.html` from `scripts/` |
| `assets/wcag22-public.json` | The 87 WCAG 2.2 criteria, public fields only |
| `assets/` | Logo, favicons, `logo.b64.js` (base64 logo for the Word/Excel exports) |

### Editing a bookmarklet

Never edit a `javascript:` link in `index.html` by hand. Edit the readable
source in `scripts/<name>.js`, then regenerate the links:

```bash
node tools/build-bookmarklets.mjs
```

It reads every file in `scripts/`, strips the comments, flattens each to one
line, and writes the result into the matching `data-bookmarklet="<name>"` link.
Commit the script and the updated `index.html` together. One rule in
`scripts/*.js`: a comment is always alone on its line, never after code, because
the build script's minifier is deliberately simple.

**Copy as JSON**: Link / Image / Label Scan build a small internal rule table per
scanner (`RULES` near the top of each `vlScan()`) so the JSON groups issues the
way axe-core does (one entry per rule, every affected element under it). Where a
check has a real axe-core equivalent (`link-name`, `image-alt`, `label`,
`button-name`, `autocomplete-valid`), the same id and impact level are reused;
Vesper-only checks get a `vesper-*` id and a best-effort impact level. Check the
impact levels on a real report before relying on them for triage.

### Credits

Built on [axe-core](https://github.com/dequelabs/axe-core) (Deque Systems).
Criteria based on [WCAG 2.2](https://www.w3.org/TR/WCAG22/).

### Contact

Found an accessibility barrier, a bug, or a translation error? Open an issue or
write to contact@vesperlab.dev.

If my work is useful to you, you can
[buy me a coffee](https://buymeacoffee.com/vesperlab).

## Français

Petits outils gratuits de test d'accessibilité, rangés dans la barre de
favoris. Pas d'extension, pas de compte, aucune donnée qui sort du navigateur.
Réalisés par [Vesper Lab](https://vesperlab.dev/).

**[Obtenir les bookmarklets →](https://toolkit.vesperlab.dev/)**

### Ce qu'il y a ici

- **AC Scan / AC Targeted Scan** : lance [axe-core](https://github.com/dequelabs/axe-core)
  (Deque Systems) sur une page ou sur un sélecteur CSS, copie le résultat JSON.
- **CSS Selector** : clique un élément, copie son sélecteur.
- **Finder** : retrouve et met en évidence un élément (même masqué ou hors
  écran) à partir d'un sélecteur ou d'un extrait de code.
- **Link / Image / Label Scan** : rapports ciblés sur les liens, les images et
  les étiquettes de formulaire, chacun dans son propre onglet imprimable et
  exportable. Chaque rapport a un bouton **Copy as JSON**, au même format
  qu'AC Scan, à coller dans le Vesper Axe-Core Viewer de la même façon.
- **Sonar** : recherche parmi les 87 critères de succès WCAG 2.2 dans un panneau
  déplaçable par-dessus la page en cours. Affiche le nom officiel, le niveau, la
  règle et un lien vers la page du W3C.
- **Contrast** : clique un élément de texte, puis son fond, et obtiens le
  ratio de contraste WCAG avec un verdict AA/AAA selon la taille de texte détectée.
- **Headings** : liste la hiérarchie h1-h6 (sauts de niveau signalés)
  et les landmarks ARIA/HTML5 dans un panneau ; clique une entrée pour y aller.
- **Tab Order** : numérote chaque élément focusable dans l'ordre réel de
  tabulation et trace le chemin entre eux ; signale les `tabindex` positifs et
  les éléments focusables invisibles. Exporte la liste en fichier `.txt`.
- **Reflow** : ouvre la page dans une fenêtre redimensionnée à la largeur
  CSS de ton choix (320px, 884px pliable déplié, 1280px, ou personnalisée) et repère le défilement horizontal
  automatiquement.
- **ARIA Reader** : clique un élément pour voir son nom accessible calculé,
  son rôle et ses états ARIA, plus une annonce approximative de lecteur d'écran.
- **Vesper Axe-Core Viewer** (`scan-results.html`) : transforme le JSON d'AC Scan
  en rapport lisible, exportable en Word, Excel et impression.

### Installation

Ouvre la **[page d'installation](https://toolkit.vesperlab.dev/)** : elle a un
bouton à glisser et une solution de repli **Presse-papiers** pour chaque outil,
ainsi qu'un lien vers le code source pour le lire avant d'installer.

**En glissant**

1. Affiche la barre de favoris : `Cmd+Shift+B` (macOS) ou `Ctrl+Shift+B`
   (Windows/Linux).
2. Glisse le bouton de l'outil voulu sur cette barre.
3. Va sur la page à vérifier, puis clique le favori.

**Sans glisser** (clavier, tremblement, ou simplement préférence)

1. Appuie sur **Presse-papiers** à côté de l'outil voulu.
2. Dans le gestionnaire de favoris du navigateur, crée un favori.
3. Donne-lui un nom, colle le code copié dans le champ *URL*, enregistre.

**Si rien ne se passe** : ouvre la console (`Cmd+Option+I` sur macOS,
`Ctrl+Shift+I` sur Windows) avant de cliquer. Un message *Content Security
Policy* signifie que le site interdit l'exécution de scripts externes, et aucun
bookmarklet ne peut contourner ça. Si un onglet de rapport ne s'ouvre pas,
autorise les fenêtres surgissantes pour le site vérifié.

**Sonar fait exception** : les autres outils tournent entièrement dans la page
où tu es. Sonar ouvre un panneau qui charge `sonar.html` en HTTPS dans une
iframe, donc il ne fonctionne pas sur une page servie en `file://` ou en HTTP
simple.

### Déploiement

Dépôt statique, servi tel quel par GitHub Pages, sans étape de build. Publié sur
<https://toolkit.vesperlab.dev/>.

### Structure

| Chemin | Rôle |
|---|---|
| `index.html` | Page d'installation : boutons à glisser, repli Presse-papiers, liens source |
| `scan-results.html` | Vesper Axe-Core Viewer — le JSON d'AC Scan en rapport lisible et exportable |
| `sonar.html` | Page de Sonar, chargée en iframe par `scripts/sonar.js` |
| `scripts/` | Source lisible, non minifiée, de chaque bookmarklet |
| `tools/build-bookmarklets.mjs` | Régénère les liens `javascript:` de `index.html` à partir de `scripts/` |
| `assets/wcag22-public.json` | Les 87 critères WCAG 2.2, champs publics seulement |
| `assets/` | Logo, favicons, `logo.b64.js` (logo en base64 pour les exports Word/Excel) |

### Modifier un bookmarklet

Ne modifie jamais un lien `javascript:` de `index.html` à la main. Modifie la
source lisible dans `scripts/<nom>.js`, puis régénère les liens :

```bash
node tools/build-bookmarklets.mjs
```

Le script lit chaque fichier de `scripts/`, retire les commentaires, aplatit
tout sur une ligne et écrit le résultat dans le lien
`data-bookmarklet="<nom>"` correspondant. Commite le script et le `index.html`
mis à jour ensemble. Une règle dans `scripts/*.js` : un commentaire est toujours
seul sur sa ligne, jamais après du code, car le minifieur du script de build est
volontairement simple.

**Copy as JSON** : Link / Image / Label Scan construisent une petite table de
règles interne par scanner (`RULES` en haut de chaque `vlScan()`) pour que le
JSON regroupe les problèmes comme le fait axe-core (une entrée par règle, chaque
élément concerné en dessous). Quand un test a un équivalent axe-core réel
(`link-name`, `image-alt`, `label`, `button-name`, `autocomplete-valid`), le
même id et le même niveau d'impact sont repris ; les tests propres à Vesper
reçoivent un id `vesper-*` et un niveau d'impact estimé. Vérifie ces niveaux sur
un vrai rapport avant de t'y fier pour le triage.

### Crédits

Fondé sur [axe-core](https://github.com/dequelabs/axe-core) (Deque Systems).
Critères basés sur [WCAG 2.2](https://www.w3.org/TR/WCAG22/).

### Contact

Une barrière d'accessibilité, un bug ou une erreur de traduction ? Ouvre une
issue ou écris à contact@vesperlab.dev.

Si mon travail t'est utile, tu peux
[financer mon apport en caféine](https://buymeacoffee.com/vesperlab).
