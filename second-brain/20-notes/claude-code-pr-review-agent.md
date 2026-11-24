---
type: note
title: Agent de code review sur les PR GitHub avec Claude Code
date: 2026-11-24
tags: [ai, devops, github-actions]
status: digéré
---

# Agent de code review sur les PR GitHub avec Claude Code

Pour qu'un agent relise automatiquement chaque PR d'un dépôt, le plus simple est la **GitHub Action Claude Code** (`anthropics/claude-code-action`). Elle se déclenche sur les événements de PR, lit le `CLAUDE.md` du dépôt pour connaître les conventions, puis poste ses remarques en commentaires inline (ou un seul commentaire de synthèse s'il n'y a rien à signaler). Les PR en draft sont ignorées.

## Exemple

**Installation automatique (recommandée)** : dans le dépôt cloné, lancer `claude` puis `/install-github-app`. La commande installe la GitHub App, ajoute le secret et ouvre une PR avec le workflow. Il faut cocher **Claude Code Review** et, si on veut pouvoir écrire `@claude` dans une PR, aussi **PR assistant**. Il faut être admin du dépôt.

**Installation manuelle** :

1. Installer la GitHub App : https://github.com/apps/claude
2. Ajouter le secret `ANTHROPIC_API_KEY` dans Settings → Secrets and variables → Actions.
3. Créer `.github/workflows/claude-review.yml` :

```yaml
name: Claude Code Review

on:
    pull_request:
        types: [opened, synchronize, ready_for_review]

jobs:
    review:
        if: github.event.pull_request.draft == false
        runs-on: ubuntu-latest
        permissions:
            contents: read
            pull-requests: write
            id-token: write
        steps:
            - uses: actions/checkout@v4
              with:
                  fetch-depth: 1

            - uses: anthropics/claude-code-action@v1
              with:
                  anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
                  prompt: |
                      Fais la code review de cette pull request.
                      Concentre-toi sur : bugs, sécurité, cas limites, lisibilité.
                      Poste tes remarques en commentaires inline sur les lignes concernées,
                      puis un résumé. Réponds en français.
```

## Les options possibles

| Option                         | Où ça tourne              | Quand l'utiliser                                        |
| ------------------------------ | ------------------------- | ------------------------------------------------------- |
| GitHub Action                  | Runner GitHub, ma clé API | Review automatique sur chaque PR, tous plans            |
| Code Review géré par Anthropic | Infra Anthropic           | Plans Team/Enterprise : multi-agents, findings vérifiés |
| `/code-review` en local        | Mon poste                 | Relire ma branche **avant** d'ouvrir la PR              |

## Quand l'utiliser / ne pas l'utiliser

- ✅ Comme **sensor** supplémentaire : un deuxième regard sur les bugs, la sécurité et les conventions du `CLAUDE.md`.
- ⚠️ Chaque review consomme de l'API : limiter les déclencheurs (pas de review sur les drafts, éventuellement pas sur chaque `synchronize`).
- ❌ Ne remplace pas la review humaine ni les tests : la qualité dépend du `CLAUDE.md` et du prompt.

## Application concrète

- [ ] Installer le workflow Claude Code Review sur `annemarie35/the-code-gloss`.
- [ ] Ajouter au prompt les règles d'architecture du `CLAUDE.md` (couches Page → Action → API → Service → Repository, test obligatoire pour chaque fichier).
- [ ] Comparer sur 2–3 PR les remarques de l'Action et celles de `/code-review` en local.

## Liens

- Sources : [Code Review – Claude Code docs](https://code.claude.com/docs/en/code-review), réponse de Claude à « comment créer un agent qui fait la code review des PR ? »
- Area : [[ai-engineering]]
- Voir aussi : [[agent-harness-guides-and-sensors]]
