---
type: note
title: Harness d'agent — guides et sensors
date: 2026-10-08
tags: [ai, architecture]
status: digéré
---

# Harness d'agent — guides et sensors

Un agent de code n'est fiable que si on l'entoure de contrôles. Les **guides** orientent avant l'action (conventions, types, docs d'archi), les **sensors** vérifient après (tests, lint, fitness functions) et renvoient un signal assez précis pour que l'agent se corrige seul.

## Exemple

| Type   | Dans code-gloss                                     |
| ------ | --------------------------------------------------- |
| Guide  | `../../../CLAUDE.md`, TypeScript, ESLint/Prettier            |
| Sensor | Vitest, Playwright, Husky + lint-staged             |
| Manque | Vérification automatique des couches d'architecture |

## Quand l'utiliser

Pour auditer n'importe quel projet où des agents écrivent du code : lister guides et sensors pour chaque dimension (maintainability, architecture, behavior) et repérer les trous.

## Liens

- Sources : [[harness-engineering-fowler]]
- Area : [[ai-engineering]]
- Voir aussi : [[architecture]]
