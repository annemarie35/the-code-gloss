---
type: note
title: Pourquoi /code-review en local trouve plus de problèmes que la GitHub Action
date: 2026-11-26
tags: [ai, devops, github-actions]
status: digéré
---

# Pourquoi /code-review en local trouve plus de problèmes que la GitHub Action

La commande `/code-review` en local et la review Claude de la GitHub Action ne font pas tourner la même revue. Sur la PR #120 (feed subscriptions), l'Action a répondu « No issues found. Checked for bugs and CLAUDE.md compliance. », alors que la revue locale a trouvé de vrais bugs. Trois différences l'expliquent : l'outil, le modèle et le temps passé à lire le code.

## Les trois différences

### 1. Ce n'est pas le même outil

- **GitHub Action** : `.github/workflows/claude-code-review.yml` lance le plugin `code-review@claude-code-plugins` (`/code-review:code-review --comment …`). Il cherche la précision : il écarte les remarques dont il n'est pas assez sûr, les problèmes déjà présents avant la PR et les détails de style. C'est l'interprétation de Claude, pas une lecture de la configuration exacte du plugin.
- **`/code-review` en local** : c'est la commande intégrée à Claude Code. Elle dépend d'un niveau d'effort, remonte bugs et nettoyages, y compris des points incertains, et prend en compte le contexte autour du diff.

Plusieurs remarques de la revue locale portaient sur du code existant (rate limiter partagé, `httpClient`, `localhost:3000`) que la PR rendait bloquant. Un outil qui ignore ce qui existait avant la PR ne les signale pas.

### 2. Ce n'est pas le même modèle

| Revue  | Modèle                               |
| ------ | ------------------------------------ |
| Action | `claude-sonnet-5-5` (d'après le log) |
| Local  | modèle de la session, Opus 5.5       |

### 3. L'Action n'a presque pas lu le code

| Revue  | Diff                       | Effort                |
| ------ | -------------------------- | --------------------- |
| Action | 39 fichiers, ~1 500 lignes | 19 s, 5 tours, 0,11 $ |
| Local  | idem                       | ~63 000 tokens        |

En 5 tours, impossible de suivre l'enchaînement page → client → route → contrôleur → use case → repository. Or c'est là que se trouvaient les bugs propres à la PR :

- la course entre `findByUrl` et `save`, qui donne un 500 ;
- les articles qui réapparaissent après une suppression.

**Conséquence** : sur cette PR, le « No issues found » de l'Action est un faux négatif. Tel qu'il est configuré, le workflow sert de filet léger, pas de vraie revue.

## Rapprocher les deux revues

Dans `.github/workflows/claude-code-review.yml` :

- forcer le modèle : `claude_args: '--model claude-opus-5-5 --allowedTools "…"'` ;
- passer `fetch-depth: 0` au checkout (aujourd'hui il ne récupère qu'un seul commit) pour que l'agent ait l'historique.

## Quand l'utiliser / ne pas l'utiliser

- ✅ `/code-review` en local **avant** d'ouvrir la PR, pour une revue approfondie qui suit le flux complet.
- ✅ L'Action comme filet léger et rapide sur chaque PR.
- ❌ Ne pas lire un « No issues found » de l'Action comme une validation : regarder la durée et le nombre de tours dans le log.

## Application concrète

- [ ] Forcer `claude-opus-5-5` et `fetch-depth: 0` dans le workflow, puis comparer sur la prochaine PR.
- [ ] Vérifier le coût par review après le changement de modèle.

## Liens

- Sources : réponse de Claude Code à « pourquoi /code-review renvoie plus de demandes de modifications que la code review de la GitHub Action ? » (PR #120)
- Area : [[ai-engineering]]
- Voir aussi : [[claude-code-pr-review-agent]], [[agent-harness-guides-and-sensors]]
