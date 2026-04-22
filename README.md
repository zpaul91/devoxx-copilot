# 2048 — Phaser + React + TypeScript

Un jeu **2048** construit avec [Phaser 4](https://phaser.io), React 19, TypeScript et Vite.

![screenshot](screenshot.png)

## 🎮 Jouer

```bash
npm install
npm run dev
```

Ouvrez `http://localhost:8080` dans votre navigateur.

### Contrôles

| Entrée | Action |
|--------|--------|
| ← ↑ → ↓ / WASD | Déplacer les tuiles |
| Swipe tactile | Déplacer les tuiles (mobile) |
| Bouton "Restart" | Recommencer la partie |

## 🏗 Architecture

```
src/
├── App.tsx                  # Composant React (conteneur Phaser)
├── PhaserGame.tsx           # Pont React ↔ Phaser
├── game/
│   ├── main.ts              # Config Phaser (520×680, scènes)
│   ├── EventBus.ts          # Bus d'événements React ↔ Phaser
│   ├── logic/
│   │   └── Board.ts         # Logique pure : grille, mouvements, fusions, score
│   └── scenes/
│       ├── Boot.ts           # Initialisation
│       ├── Preloader.ts      # Barre de chargement
│       ├── MainMenu.ts       # Menu principal
│       ├── GameScene.ts      # Scène de jeu (rendu, inputs, animations)
│       └── GameOver.ts       # Écran de fin
```

### Logique (`Board.ts`)

- Grille 4×4, opérations `moveLeft/Right/Up/Down`
- Spawn : 90% chance d'un **2**, 10% d'un **4**
- Détection automatique de game over
- Meilleur score persisté en `localStorage`

### Rendu (`GameScene.ts`)

- Grille et tuiles dessinées avec les primitives Phaser (Graphics, Rectangle, Text)
- Animations de spawn (scale 0→1) et de fusion (scale 0.5→1)
- Thème **bleu** : fond bleu nuit, tuiles dégradé bleu → cyan → turquoise

## 🎨 Palette

| Tuile | Couleur |
|-------|---------|
| 2 | `#4a90d9` bleu clair |
| 4 | `#3d7ec8` bleu moyen |
| 8 | `#2e6ab5` bleu |
| 16 | `#1f56a2` bleu royal |
| 32 | `#1a4b8f` bleu profond |
| 64 | `#0d3b7a` bleu foncé |
| 128 | `#00b4d8` cyan |
| 256 | `#00cfea` cyan clair |
| 512 | `#48e8c8` turquoise |
| 1024 | `#90f0d0` vert-eau |
| 2048 | `#e0f7fa` blanc bleuté |

## Commandes

| Commande | Description |
|----------|-------------|
| `npm install` | Installer les dépendances |
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production dans `dist/` |
| `npm run test` | Lancer les tests unitaires |
| `npm run test:coverage` | Tests + rapport de couverture (seuil : 75%) |
| `npm run release` | Créer une release (bump auto selon commits) |
| `npm run release:patch` | Release patch (ex: 1.1.0 → 1.1.1) |
| `npm run release:minor` | Release minor (ex: 1.1.0 → 1.2.0) |
| `npm run release:major` | Release major (ex: 1.1.0 → 2.0.0) |

## 🧪 Tests & Coverage

Les tests unitaires utilisent [Vitest](https://vitest.dev) et couvrent la logique de jeu (`src/game/logic/`).

```bash
npm run test              # lancer les tests
npm run test:coverage     # tests + rapport de couverture
```

Le seuil de couverture minimum est de **75%** (lines, branches, functions, statements). Le CI échoue si ce seuil n'est pas atteint.

## 🔄 CI/CD

Le projet utilise GitHub Actions avec deux workflows :

### Pipeline principal (`.github/workflows/deploy.yml`)

Déclenché sur chaque push sur `main` :

1. **CI** — Exécute les tests avec couverture. Échoue si coverage < 75%
2. **Build** — Build Vite de production (uniquement si CI passe)
3. **Deploy** — Déploie sur GitHub Pages (uniquement si build passe)

### Release (`.github/workflows/release.yml`)

Déclenché manuellement via `workflow_dispatch` :

- Choisir le type de release : `patch`, `minor` ou `major`
- Bump automatique de la version dans `package.json`
- Génération du `CHANGELOG.md`
- Création d'un tag Git et d'une GitHub Release

## 📝 Conventional Commits

Ce projet suit la convention [Conventional Commits](https://www.conventionalcommits.org/) pour les messages de commit :

| Préfixe | Description | Effet sur la version |
|---------|-------------|---------------------|
| `feat:` | Nouvelle fonctionnalité | minor |
| `fix:` | Correction de bug | patch |
| `perf:` | Amélioration de performance | patch |
| `docs:` | Documentation | — |
| `test:` | Tests | — |
| `ci:` | CI/CD | — |
| `refactor:` | Refactoring | — |
| `chore:` | Maintenance | — |

Exemples :
```
feat: ajouter animation de victoire
fix: corriger le calcul du score lors des fusions
docs: mettre à jour le README
```

## Stack

- [Phaser 4](https://phaser.io) — moteur de jeu
- [React 19](https://react.dev) — UI
- [TypeScript 5.7](https://typescriptlang.org) — typage
- [Vite 6](https://vitejs.dev) — bundler

Basé sur le template [phaserjs/template-react-ts](https://github.com/phaserjs/template-react-ts).
