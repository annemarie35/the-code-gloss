# Plan de modifications — code-gloss

> 18 novembre 2026 · issu de [``](audit-claude.md) · branche `fix/architecture-review`

Les modifications sont classées de la plus critique à la moins critique :

- **Critique** : bug fonctionnel visible ou faille exploitable
- **Élevée** : bloque le déploiement ou expose des secrets
- **Moyenne** : robustesse, sécurité en profondeur, cohérence de l'architecture
- **Faible** : lisibilité, documentation, hygiène du dépôt

## Synthèse

| #   | Priorité | Modification                                                   | Fichiers principaux              | Fait  |
| --- | -------- | -------------------------------------------------------------- | -------------------------------- | ----- |
| 1   | Critique | Persister les thèmes des gloses                                | `src/actions/gloses-actions.ts`… | [ x ] |
| 2   | Critique | Protéger `/api/feeds` contre le SSRF                           | `src/pages/api/feeds.ts`…        | [ ]   |
| 3   | Critique | Valider les entrées et gérer les erreurs dans les routes API   | `src/pages/api/gloses.ts`…       | [ ]   |
| 4   | Élevée   | Retirer les routes parasites de `src/pages/`                   | `src/pages/layout.tsx`…          | [ ]   |
| 5   | Élevée   | Supprimer les URLs `http://localhost:3000` codées en dur       | `src/actions/*.ts`…              | [ ]   |
| 6   | Élevée   | Sortir les identifiants de base des fichiers versionnés        | `package.json`…                  | [ ]   |
| 7   | Moyenne  | Fiabiliser le rate limiter                                     | `src/lib/rate-limiter.ts`        | [ ]   |
| 8   | Moyenne  | Durcir la Content Security Policy                              | `next.config.ts`                 | [ ]   |
| 9   | Moyenne  | Corriger les comportements UI incohérents                      | `src/pages/index.tsx`…           | [ ]   |
| 10  | Moyenne  | Unifier le pattern métier et les repositories                  | `src/lib/service/`…              | [ ]   |
| 11  | Faible   | Ranger les types dans le domaine et supprimer les duplications | `src/lib/service/add-glose.ts`…  | [ ]   |
| 12  | Faible   | Retirer les directives `'use server'` sans effet               | `src/actions/*.ts`…              | [ x ] |
| 13  | Faible   | Mettre à jour la documentation                                 | `CLAUDE.md`…                     | [ ]   |
| 14  | Faible   | Écrire de vrais tests e2e                                      | `integration-tests/`…            | [ ]   |
| 15  | Faible   | Nettoyer les dépendances et fichiers inutiles                  | `package.json`…                  | [ x ] |

## Détail des modifications

### Priorité critique

#### 1. Persister les thèmes des gloses

**Problème :** Le formulaire envoie « glose-theme » mais l'action ne le transmet pas et la requête INSERT n'écrit pas la colonne `themes`. Le filtre par thème ne fonctionne que sur les données de seed.

**Fichiers :** `src/actions/gloses-actions.ts`, `src/lib/service/add-glose.ts`, `infra/database/repositories.ts`, `infra/database/sql_queries.ts`

**Modification :** Ajouter `themes` au body de l'action (tableau), au type de service, et à `INSERT_GLOSE` (`$5`). Ajouter les tests correspondants (action, service, repository).

#### 2. Protéger /api/feeds contre le SSRF

**Problème :** Le serveur récupère n'importe quelle URL http(s), y compris `localhost`, `127.0.0.1`, `169.254.169.254` ou des IP de réseau privé.

**Fichiers :** `src/pages/api/feeds.ts`, `src/lib/service/get-feeds.ts`

**Modification :** Résoudre le nom d'hôte et refuser les plages loopback, privées et link-local ; interdire les redirections vers ces plages ; ajouter un timeout et une taille maximale de réponse.

#### 3. Valider les entrées et gérer les erreurs dans les routes API

**Problème :** `JSON.parse(req.body)` et les appels base ne sont pas protégés : un body invalide ou une erreur SQL produit un 500 brut. Aucun champ n'est validé (requis, longueurs varchar, format des URLs).

**Fichiers :** `src/pages/api/gloses.ts`, `src/pages/api/people.ts`

**Modification :** Entourer le traitement d'un try/catch, renvoyer 400 sur body invalide et 500 avec un message générique sur erreur serveur. Placer la validation dans le domaine (fonction `validateGlose` / `validatePerson`) et non dans la route.

### Priorité élevée

#### 4. Retirer les routes parasites de src/pages/

**Problème :** Avec le Pages Router, `layout.tsx` et `pageLayout.tsx` deviennent les routes `/layout` et `/pageLayout`. `layout.tsx` est un reliquat de l'App Router.

**Fichiers :** `src/pages/layout.tsx`, `src/pages/pageLayout.tsx`

**Modification :** Supprimer `layout.tsx` (et son test), déplacer `pageLayout.tsx` dans `src/components/page-layout.tsx` avec son test miroir, mettre à jour les imports.

#### 5. Supprimer les URLs http://localhost:3000 codées en dur

**Problème :** Toutes les actions et le `<link>` du flux RSS pointent vers localhost : l'application ne peut pas être déployée.

**Fichiers :** `src/actions/*.ts`, `src/pages/api/rss.ts`

**Modification :** Utiliser des URLs relatives (`/api/...`) dans les actions et une variable d'environnement (ex. `APP_URL`) pour le flux RSS.

#### 6. Sortir les identifiants de base des fichiers versionnés

**Problème :** Utilisateur et mot de passe en clair dans les scripts npm et le healthcheck docker-compose ; image `bitnami/postgresql:latest` non épinglée.

**Fichiers :** `package.json`, `docker-compose.yml`, `Dockerfile`

**Modification :** Lire les identifiants depuis les variables d'environnement (`$POSTGRESQL_USERNAME`, etc.) et épingler une version précise de l'image.

### Priorité moyenne

#### 7. Fiabiliser le rate limiter

**Problème :** Le `Map` en mémoire n'est jamais purgé (croissance illimitée) et l'IP vient de `x-forwarded-for`, falsifiable sans proxy de confiance.

**Fichiers :** `src/lib/rate-limiter.ts`

**Modification :** Purger les entrées expirées, n'utiliser `x-forwarded-for` que derrière un proxy configuré, envisager un stockage partagé si plusieurs instances.

#### 8. Durcir la Content Security Policy

**Problème :** `script-src` autorise `'unsafe-inline'` et `'unsafe-eval'`.

**Fichiers :** `next.config.ts`

**Modification :** Retirer `'unsafe-eval'` en production et passer à des nonces pour les scripts inline (sans supprimer les en-têtes CSP).

#### 9. Corriger les comportements UI incohérents

**Problème :** La liste des gloses n'est pas rechargée après un ajout ; une personne est retirée de la liste même si la suppression échoue ; `api/gloses.ts` répond en GET à toute méthode autre que POST.

**Fichiers :** `src/pages/index.tsx`, `src/components/gloss-terms-form.tsx`, `src/pages/people.tsx`, `src/pages/api/gloses.ts`

**Modification :** Ajouter un callback `onSuccess` au formulaire de glose, ne mettre à jour la liste people qu'en cas de succès, renvoyer 405 pour les méthodes non gérées.

#### 10. Unifier le pattern métier et les repositories

**Problème :** Les gloses passent par `src/lib/service/`, les personnes par `src/core/domain/usecases/` avec injection de dépendance. Les repositories sont dans deux dossiers différents.

**Fichiers :** `src/lib/service/`, `src/core/domain/usecases/`, `infra/database/repositories.ts`, `infra/repositories/`

**Modification :** Migrer `add-glose` vers un use case avec injection du repository, regrouper les repositories dans `infra/repositories/` (`glose_repository.ts`), puis mettre à jour `CLAUDE.md`.

### Priorité faible

#### 11. Ranger les types dans le domaine et supprimer les duplications

**Problème :** Type `Glose` redéclaré dans `add-glose.ts` ; `ResponseData` déclaré dans les routes ; les actions importent `InitialState` depuis les composants ; `isValidOrigin` dupliqué dans deux routes ; génération XML du RSS dans la route.

**Fichiers :** `src/lib/service/add-glose.ts`, `src/pages/api/*.ts`, `src/actions/*.ts`, `src/components/*-form.tsx`

**Modification :** Déplacer les types dans `src/core/domain/`, extraire `isValidOrigin` dans `src/lib/`, créer un service `get-rss.ts`.

#### 12. Retirer les directives 'use server' sans effet

**Problème :** Le projet utilise le Pages Router : `'use server'` n'a pas d'effet sur les actions et services et entretient la confusion.

**Fichiers :** `src/actions/*.ts`, `src/lib/service/*.ts`

**Modification :** Supprimer la directive, ou documenter l'intention si une migration vers l'App Router est prévue.

#### 13. Mettre à jour la documentation

**Problème :** `CLAUDE.md` cite `npm run create:database` (n'existe plus) et des commandes knex (non installé) ; l'ADR 001 indique `infra/database/seeds/migrations.sql` au lieu de `scripts/`.

**Fichiers :** `CLAUDE.md`, ``

**Modification :** Aligner les commandes et les chemins sur l'état réel du projet.

#### 14. Écrire de vrais tests e2e

**Problème :** `integration-tests/` ne contient que les exemples Playwright par défaut. Le test de `add-glose.ts` s'appelle `create-glose.test.ts`.

**Fichiers :** `integration-tests/`, `__tests__/src/lib/service/create-glose.test.ts`

**Modification :** Remplacer les exemples par un parcours ajout/filtre de glose et ajout/suppression de personne ; renommer le test en `add-glose.test.ts`.

#### 15. Nettoyer les dépendances et fichiers inutiles

**Problème :** `mysql`, `mysql2`, `oracledb`, `sqlite3`, `better-sqlite3`, `pg-query-stream` semblent inutilisés ; `@types/pg` est en `dependencies` ; `report.html` est versionné ; le message d'erreur de `httpClient` est spécifique aux gloses.

**Fichiers :** `package.json`, `report.html`, `src/lib/http.ts`

**Modification :** Vérifier puis supprimer les paquets inutilisés, déplacer `@types/pg` en `devDependencies`, ignorer `report.html`, rendre le message de `httpClient` générique (issue #10).

## Chantier : failles révélées par le test de mutation

> 24 novembre 2026 · premier passage de Stryker (`npm run test:mutation`) · score global 62,56 % (493 mutants tués, 193 survivants, 102 sans couverture)

Les étapes vont du plus ciblé au plus large. Après chaque étape, relancer Stryker sur les fichiers concernés (`npx stryker run --mutate <fichiers>`) pour vérifier que les mutants sont tués.

- [x] **1. Fermer les failles du code des thèmes** : tuer le mutant survivant de `src/components/ui/theme-pill.tsx` (classe de l'état sélectionné non vérifiée) et retirer le `?.` devenu inutile dans `src/lib/filter-by-themes.ts` depuis que `themes` est typé `Theme[]`.
- [x] **2. Renforcer les tests de `src/lib/http.ts`** (35,7 %, 6 erreurs) : c'est le client HTTP utilisé par toutes les actions, il faut couvrir les cas d'erreur (réponse non `ok`, corps JSON invalide, erreur réseau). → 71,4 %. Les 4 survivants restants portent sur la configuration de pino (`colorize`, `redact`, `options`) ; les 6 erreurs sont des configurations pino invalides qui font planter le module au chargement (pas un trou de test).
- [x] **3. Renforcer les tests des routes API** : `src/pages/api/feeds.ts` (55,9 %), `gloses.ts` (66 %) et `people.ts` (67,6 %), en priorité les codes HTTP et les messages d'erreur. À coordonner avec le point 3 du plan (validation des entrées). → `feeds.ts` 100 %, `gloses.ts` 97,9 %, `people.ts` 98,6 %. Les tests vérifient désormais le corps des réponses (helper `createMockApiResponse`). Le seul survivant restant (catch vidé dans `isValidOrigin`) est un mutant équivalent : `undefined` et `false` donnent le même 403. La validation des entrées (point 3 du plan) reste à faire.
- [ ] **4. Couvrir les pages et les composants les plus faibles** : `src/pages/feeds.tsx` (8,6 %), `index.tsx` (34,8 %), `about.tsx` (33,3 %), `src/components/gloss-grid.tsx` (61 %) et `gloss-terms-form.tsx` (60,4 %).
