---
type: radar
title: Tech radar personnel
date: 2026-10-08
tags: [radar]
---

# Tech radar personnel

Anneaux : **Adopt** (j'utilise par défaut) · **Trial** (j'expérimente sur un vrai projet) · **Assess** (je lis, je surveille) · **Hold** (j'évite ou je sors).

Revue mensuelle. Chaque mouvement est noté dans la note hebdo et dans l'historique de l'entrée.

## Adopt

### Next.js (Pages Router)

- **Quadrant** : langages & frameworks
- **Depuis** : 2026-10-08 (v16 dans code-gloss)
- **Pourquoi** : stack de code-gloss
- **Sources** :

### React 19

- **Quadrant** : langages & frameworks
- **Depuis** : 2026-10-08
- **Pourquoi** : stack de code-gloss

### TypeScript

- **Quadrant** : langages & frameworks
- **Depuis** : 2026-10-08 (v7)
- **Pourquoi** : typage = guide pour humains et agents, voir [[agent-harness-guides-and-sensors]]

### Vitest

- **Quadrant** : outils
- **Depuis** : 2026-10-08
- **Pourquoi** : tests unitaires/composants, voir [[vitest-mocking-patterns]]

### Tailwind CSS v4

- **Quadrant** : langages & frameworks
- **Depuis** : 2026-10-08

### PostgreSQL

- **Quadrant** : plateformes
- **Depuis** : 2026-10-08

### Content Security Policy + HSTS

- **Quadrant** : techniques
- **Depuis** : 2026-10-08
- **Pourquoi** : en place dans `next.config.ts`, voir [[content-security-policy]] · [[hsts]]

## Trial

### Playwright

- **Quadrant** : outils
- **Depuis** : 2026-10-08
- **Pourquoi** : installé mais tests encore placeholders → à utiliser réellement

### Testcontainers

- **Quadrant** : outils
- **Depuis** : 2026-10-08
- **Pourquoi** : tests d'intégration DB réels, voir [[testcontainers-with-colima]]

### Harness engineering pour agents

- **Quadrant** : techniques
- **Depuis** : 2026-10-08
- **Pourquoi** : voir [[harness-engineering-fowler]]

## Assess

### dependency-cruiser / eslint-plugin-boundaries

- **Quadrant** : outils
- **Pourquoi** : enforcer les couches Page → Action → API → Service → Repository

### knip

- **Quadrant** : outils
- **Pourquoi** : détection de dead code

### Stryker (mutation testing)

- **Quadrant** : outils
- **Pourquoi** : mesurer la pertinence des tests

### Zod

- **Quadrant** : langages & frameworks
- **Pourquoi** : validation d'entrée des API routes (cf. `docs/journal.md`)

## Hold

### Rate limiter en mémoire en multi-instance

- **Quadrant** : techniques
- **Pourquoi** : état non partagé entre instances → Redis si scale, voir [[rate-limiting-fixed-window]]
