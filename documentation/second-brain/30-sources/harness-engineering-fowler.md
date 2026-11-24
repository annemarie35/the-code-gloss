---
type: source
title: Harness Engineering for Coding Agents
date: 2026-07-09
tags: [ai, architecture, testing]
status: digéré
source: https://martinfowler.com/articles/harness-engineering.html
author: Martin Fowler (site)
format: article
---

# Harness Engineering for Coding Agents

## Résumé en 3 lignes

- **Agent = Modèle + Harness** : le harness, c'est tout ce qui entoure le modèle pour rendre son code digne de confiance.
- Deux familles de contrôles : **guides** (feedforward, avant l'action) et **sensors** (feedback, après l'action, pour l'auto-correction).
- Trois dimensions à couvrir : **maintainability**, **architecture fitness**, **behavior**.

## Idées clés

- Les règles d'architecture écrites en prose (ex. `../../../CLAUDE.md`) ne sont pas un harness : il faut des **fitness functions exécutables**.
- Les messages d'erreur des sensors doivent être **écrits pour un LLM** : dire ce qui est interdit _et_ quoi faire à la place.
- « A good harness should direct human input to where it is most important. »

## Ce que j'en pense

Le cadre guides/sensors est un bon outil de diagnostic : appliqué à code-gloss, il a révélé que les couches Page → Action → API → Service → Repository ne sont vérifiées par aucun outil.

## Application concrète

Analyse complète : `../..` dans code-gloss. Priorités retenues :

- [ ] Enforcer les couches (`dependency-cruiser` ou `eslint-plugin-boundaries`)
- [ ] Vrais tests Playwright sur l'app (actuellement des placeholders)
- [ ] Seuil de coverage dans `../../../vitest.config.mts`
- [ ] Dead code avec `knip`
- [ ] Messages ESLint guidants pour l'agent
- [ ] Mutation testing (Stryker)

## Liens

- Notes : [[agent-harness-guides-and-sensors]]
- Area : [[ai-engineering]] · [[architecture]] · [[testing]]
