# 🜊 L'Or du Rhin — jeu d'aventure dans le *Rheingold* de Wagner

Jeu d'aventure textuel en HTML/JavaScript pur, sans dépendance, jouable hors-ligne.

## Comment jouer
Ouvrez **`jeu-rheingold.html`** dans n'importe quel navigateur (double-clic suffit).

## Contenu
- Trame fidèle aux 4 scènes de *Das Rheingold* : le Rhin → Nibelheim → le rocher des géants → le Walhalla
- 20 lieux explorables, 12 quêtes, 16 objets, 6 fins différentes
- Énigmes d'Erda, ruse du Tarnhelm, complainte des Nibelungs (9 vers à collectionner),
  mini-jeu de mémoire des leitmotivs, tanière de Fafner
- Systèmes : vigueur, honneur, or, savoirs/leitmotive, renoncement à l'amour
- Sauvegarde locale (`localStorage`), journal, 15 hauts faits

## Fichiers
- `jeu-rheingold.html` : version autonome (un seul fichier)
- `index-modulaire.html` + `rheingold_data.js` / `rheingold_events.js` / `rheingold_extra.js` / `rheingold.js` : sources modulaires
- `test.js` : harnais de test Node.js (simulation complète d'une partie : `node test.js`)
