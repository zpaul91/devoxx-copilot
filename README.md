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

## Stack

- [Phaser 4](https://phaser.io) — moteur de jeu
- [React 19](https://react.dev) — UI
- [TypeScript 5.7](https://typescriptlang.org) — typage
- [Vite 6](https://vitejs.dev) — bundler

Basé sur le template [phaserjs/template-react-ts](https://github.com/phaserjs/template-react-ts).
