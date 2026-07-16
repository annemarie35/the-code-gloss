# Harness Engineering — Analyse du projet code-gloss

> Basé sur l'article de Martin Fowler : [Harness Engineering for Coding Agents](https://martinfowler.com/articles/harness-engineering.html)
> Date d'analyse : 2026-07-09

## Concept clé

**Agent = Modèle + Harness**

Le harness désigne tout ce qui entoure un agent IA (hors modèle) pour augmenter la confiance dans le code généré. Il se compose de deux types de contrôles :

- **Guides (feedforward)** : anticipent et orientent l'agent *avant* qu'il agisse
- **Sensors (feedback)** : observent les résultats *après* que l'agent a agi, pour permettre l'auto-correction

Ces contrôles couvrent trois dimensions :

| Dimension | Objectif |
|-----------|----------|
| **Maintainability** | Qualité interne du code |
| **Architecture fitness** | Respect des contraintes architecturales |
| **Behavior** | Correction fonctionnelle |

---

## Ce qui existe déjà dans ce projet

### Guides (feedforward)
- `CLAUDE.md` — conventions d'architecture, nommage, flux en couches
- TypeScript — typage comme guide implicite
- ESLint + Prettier — style et format

### Sensors (feedback — computationnels)
- Vitest — tests unitaires et composants
- Playwright — installé (mais sous-utilisé, voir lacunes)
- Husky + lint-staged — vérifications pre-commit
- `eslint-plugin-unused-imports` — détection basique de code mort

---

## Ce qui manque

### 1. Architecture fitness harness (gap le plus critique)

La `CLAUDE.md` décrit une architecture en couches stricte :

```
Page → Action → API → Service → Repository
```

Mais **rien n'enforce cette règle automatiquement** — un agent peut violer ces couches sans qu'aucun outil ne le détecte.

**Outils manquants :**
- `dependency-cruiser` ou `eslint-plugin-boundaries` — pour interdire les imports transverses (ex: un composant qui importe depuis `infra/repositories/`, ou une page qui appelle `fetch()` directement)
- Fitness functions exécutables — les règles architecturales sont dans un doc texte, pas dans du code vérifiable

### 2. Behavior harness incomplet

- Les **tests Playwright pointent sur `playwright.dev`** (placeholders) — le harness comportemental de l'app est vide
- Pas de **spécifications fonctionnelles** documentées (ce que l'app doit faire, sous forme testable)
- Pas de **mutation testing** (ex: Stryker) pour évaluer la pertinence des tests existants

### 3. Sensors de maintenabilité manquants

- Pas de **seuil de coverage enforced** — la couverture est mesurée (`npm run test:coverage`) mais n'échoue pas le build si elle tombe sous un seuil
- Pas de **détection de code dupliqué** (ex: jscpd)
- Pas de **dead code detection** au-delà des unused imports (ex: knip ou ts-prune)
- Pas de règle ESLint sur la **complexité cyclomatique**

### 4. Messages de sensor non optimisés pour l'agent

L'article insiste : les messages d'erreur doivent être **conçus pour la self-correction par un LLM**, pas pour un humain.

Exemple d'un bon message (à créer) :
> "Import depuis `infra/` détecté dans `src/pages/` — interdit. Utilise une action dans `src/actions/` qui appelle `httpClient`."

Les messages ESLint actuels sont génériques et ne guident pas l'agent vers la solution.

### 5. Guides additionnels

- Pas de **how-to guides** codifiés (ex: "comment ajouter une nouvelle ressource de A à Z")
- Pas de **spécification d'architecture** machine-readable (au-delà du texte dans CLAUDE.md)

---

## Priorisation des actions

| Priorité | Action | Dimension | Outil suggéré |
|----------|--------|-----------|---------------|
| 1 | Enforcer les couches architecturales | Architecture fitness | `dependency-cruiser` ou `eslint-plugin-boundaries` |
| 2 | Ecrire de vrais tests Playwright sur l'app | Behavior | Playwright (existant) |
| 3 | Seuil de coverage minimum | Maintainability | Config `vitest.config.mts` |
| 4 | Détection de dead code | Maintainability | `knip` |
| 5 | Messages ESLint guidants pour l'agent | Tous | ESLint custom rules |
| 6 | Mutation testing | Behavior | Stryker |

---

## Principe directeur

> "A good harness should direct human input to where it is most important."

Le rôle du développeur n'est pas d'éliminer la supervision, mais de l'orienter vers les décisions à haute valeur : contexte organisationnel, jugement esthétique, expérience que l'agent ne possède pas. Le harness prend en charge le reste.
