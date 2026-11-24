# Audit d'architecture — code-gloss

> Rédigé par Claude le 2026-11-18, sur la branche `fix/architecture-review`.
> Basé sur la lecture des fichiers sources (`src/`, `infra/`), de la configuration (Next, Vitest, Docker, CI) et de la documentation existante (`CLAUDE.md`, ``).

## 1. Vue d'ensemble

**code-gloss** est un glossaire personnel du code : on y enregistre des termes (« gloses ») classés par tags et thèmes, des personnes de référence (blogueurs, auteurs…), et on peut agréger des flux RSS externes. L'application expose aussi son propre flux RSS.

| Élément         | Choix                                                                                   |
| --------------- | --------------------------------------------------------------------------------------- |
| Framework       | Next.js 16 (Pages Router), React 19, TypeScript                                         |
| Style           | Tailwind CSS v4                                                                         |
| Base de données | PostgreSQL (image bitnami, via Docker Compose), driver `pg`                             |
| Logs            | pino / pino-pretty (dans le client HTTP)                                                |
| Tests           | Vitest + Testing Library (jsdom), Testcontainers (infra), Playwright (e2e)              |
| Qualité         | ESLint, Prettier, Husky + lint-staged, `just check`                                     |
| CI              | GitHub Actions (tests + couverture + type-check, reviewdog, audit de sécurité « vice ») |

## 2. Fonctionnalités

| Page      | Rôle                                                                | Données            |
| --------- | ------------------------------------------------------------------- | ------------------ |
| `/`       | Formulaire d'ajout de glose, filtre par thème, liste en grille      | table `gloses`     |
| `/people` | Ajout / liste / suppression de personnes                            | table `people`     |
| `/feeds`  | Lecture de flux RSS/Atom externes (URLs stockées en `localStorage`) | proxy `/api/feeds` |
| `/rss`    | Aperçu des gloses + lien d'abonnement                               | `/api/rss`         |
| `/about`  | Texte de présentation statique                                      | —                  |

## 3. Architecture en couches

Le projet suit une architecture en couches documentée dans `CLAUDE.md` :

```
Page (src/pages/*.tsx)                 useEffect + useState
  → Action (src/actions/*-actions.ts)   httpClient → http://localhost:3000/api/...
    → Route API (src/pages/api/*.ts)    rate limiting, contrôle d'origine, validation
      → Service / Use case              src/lib/service/  ou  src/core/domain/usecases/
        → Repository (infra/)           requêtes SQL paramétrées via le pool pg
          → PostgreSQL
```

### 3.1 Flux par ressource

| Ressource | Page                   | Action              | Route API                           | Service / Use case                                                                    | Repository                                |
| --------- | ---------------------- | ------------------- | ----------------------------------- | ------------------------------------------------------------------------------------- | ----------------------------------------- |
| Gloses    | `index.tsx`, `rss.tsx` | `gloses-actions.ts` | `api/gloses.ts` (GET, POST)         | `lib/service/get-gloses.ts`, `lib/service/add-glose.ts`                               | `infra/database/repositories.ts`          |
| People    | `people.tsx`           | `people-actions.ts` | `api/people.ts` (GET, POST, DELETE) | `lib/service/get-people.ts`, `core/domain/usecases/add-person.ts`, `delete-person.ts` | `infra/repositories/person_repository.ts` |
| Feeds     | `feeds.tsx`            | `feeds-actions.ts`  | `api/feeds.ts` (GET)                | `lib/service/get-feeds.ts` (fetch + parsing regex RSS/Atom)                           | — (pas de persistance)                    |
| RSS       | `rss.tsx` (lien)       | —                   | `api/rss.ts` (GET, XML)             | `lib/service/get-gloses.ts`                                                           | `infra/database/repositories.ts`          |

### 3.2 Les couches en détail

- **Pages** (`src/pages/`) : composants clients, chargent les données dans un `useEffect`. Toutes s'enveloppent dans `PageLayout` (logo, header + navbar, footer).
- **Composants** (`src/components/`) : formulaires (`gloss-terms-form`, `people-form`) basés sur `useActionState` de React 19, listes et grilles, filtre de thèmes, `ui/paragraph`.
- **Actions** (`src/actions/`) : appellent `httpClient` (`src/lib/http.ts`, wrapper `fetch` + logs pino), capturent les erreurs et renvoient un objet typé `{ message, error, ... }`.
- **Routes API** (`src/pages/api/`) : limitation de débit en mémoire (`src/lib/rate-limiter.ts`, fenêtre fixe par IP), contrôle `Origin === Host` sur les mutations (protection CSRF), puis délégation.
- **Domaine** (`src/core/domain/`) :
    - `models/Glose.ts` (type `GloseComplete`, constante `THEMES` : OPS, CRAFT, DATABASE, DDD, AGILE), `models/Feed.ts`
    - `Types/Person.ts`
    - `usecases/add-person.ts`, `delete-person.ts` — avec injection de dépendance du repository (paramètre par défaut), ce qui les rend testables sans base.
- **Services** (`src/lib/service/`) : lecture/mapping des lignes SQL vers les types du domaine, parsing des flux.
- **Infra** (`infra/`) :
    - `database/connectionPool.ts` : `Pool` pg (6 connexions max) configuré par variables d'environnement, export d'une fonction `query`.
    - `database/sql_queries.ts` : requêtes SQL paramétrées (`$1…`), nom de schéma injecté.
    - `database/repositories.ts` (gloses) et `repositories/person_repository.ts` (people).
    - `database/scripts/migrations.sql` : schéma (`people`, `gloses` + colonne `themes text[]`, `urls`), copié dans `/docker-entrypoint-initdb.d/` par le `Dockerfile` (cf. ADR 001).
    - `database/seeds/` : seeds SQL, JSON et script TS ; `backups/` : scripts d'export/import.

### 3.3 Sécurité transverse

- En-têtes CSP et HSTS définis dans `next.config.ts`, `poweredByHeader` désactivé.
- Rate limiting sur toutes les routes API.
- Contrôle d'origine sur POST/DELETE.
- Requêtes SQL paramétrées (pas d'injection via les valeurs).
- Validation du protocole (`http`/`https`) sur `/api/feeds`.
- Workflow `vice-security` + badge dans `.github/`.

## 4. Tests

| Type                 | Emplacement          | Commande                   | Environnement                    |
| -------------------- | -------------------- | -------------------------- | -------------------------------- |
| Unitaires/composants | `__tests__/src/**`   | `npm run test`             | jsdom                            |
| Infra / base         | `__tests__/infra/**` | `npm run test:db`          | node + Testcontainers PostgreSQL |
| E2E                  | `integration-tests/` | `npm run test:integration` | Playwright                       |

Chaque fichier source a son test miroir (convention imposée par `CLAUDE.md`). La CI sur PR exécute `test:coverage` et `type-check`.

## 5. Points forts

- Séparation des couches claire et documentée, conventions de nommage explicites.
- Use cases `people` découplés de l'infra par injection de dépendance : bon pattern à généraliser.
- Couverture de tests systématique, y compris tests d'intégration base avec Testcontainers.
- Sécurité prise au sérieux dès le départ (CSP, rate limit, CSRF, SQL paramétré).
- Harness pour agents IA déjà réfléchi (`CLAUDE.md`, ``, `just check`, hooks pre-commit).

## 6. Incohérences et points d'attention

### 6.1 Architecture

1. **Deux emplacements pour la logique métier** : les gloses passent par `src/lib/service/` alors que les personnes passent par `src/core/domain/usecases/`. Il faudrait choisir un seul modèle (les use cases avec injection semblent la cible).
2. **Deux emplacements pour les repositories** : `infra/database/repositories.ts` (gloses) vs `infra/repositories/person_repository.ts` (people). Un `TODO` dans `repositories.ts` le signale déjà.
3. **Types définis hors du domaine** :
    - `src/lib/service/add-glose.ts` redéclare un type `Glose` local au lieu de réutiliser `GloseComplete`.
    - `src/pages/api/gloses.ts` et `api/people.ts` déclarent `ResponseData` / `CreateOrGetGloseResponse` dans la route (contraire à la règle « ne jamais exporter de types depuis une route API » — ici non exportés, mais ils gagneraient à vivre dans le domaine).
    - Les actions importent `InitialState` depuis les composants (`gloss-terms-form`, `people-form`) : dépendance inversée action → composant.
4. **`layout.tsx` et `pageLayout.tsx` dans `src/pages/`** : avec le Pages Router, tout fichier de ce dossier devient une route (`/layout`, `/pageLayout`). `layout.tsx` (balises `<html>/<body>`) est un reliquat de l'App Router ; `pageLayout.tsx` devrait être dans `src/components/`.
5. **Duplication** : `isValidOrigin` est copié dans `api/gloses.ts` et `api/people.ts` ; il pourrait rejoindre `src/lib/`.
~~6. **`'use server'`** sur les actions et services alors que le projet utilise le Pages Router : la directive n'a pas d'effet ici et entretient la confusion. Les actions s'exécutent côté client et appellent l'API en HTTP.~~
7. **URLs codées en dur** : `http://localhost:3000` dans toutes les actions et dans le `<link>` du flux RSS — bloquant pour tout déploiement. Une URL relative (`/api/...`) ou une variable d'environnement suffirait.
8. **Logique dans les routes API** : `api/rss.ts` construit le XML dans la route, `api/people.ts` parse l'`id` — la génération RSS pourrait être un service.

### 6.2 Bugs fonctionnels probables

1. **Les thèmes des gloses ne sont jamais enregistrés** : le formulaire envoie `glose-theme`, mais `addGlossTerm` ne l'inclut pas dans le body, et `INSERT_GLOSE` n'insère pas la colonne `themes`. Le filtre par thème de la page d'accueil ne peut donc fonctionner que sur des données seedées.
2. **Pas de rafraîchissement après ajout de glose** : la page d'accueil ne recharge pas la liste après soumission (contrairement à `/people` qui passe `onSuccess`).
3. **Erreurs non gérées côté API** : `JSON.parse(req.body)` et les appels base ne sont pas dans un `try/catch` ; un body invalide ou une erreur SQL produit une 500 brute. Aucune validation des champs (longueurs `varchar`, champs requis).
4. **`api/gloses.ts`** répond en GET à toute méthode autre que POST (pas de 405, contrairement à `api/people.ts`).
5. **`deletePerson` côté page** retire la personne de la liste même si l'appel échoue.

### 6.3 Sécurité

1. **SSRF sur `/api/feeds`** : le serveur fetch n'importe quelle URL http(s), y compris `localhost` ou des IP internes. À filtrer (résolution DNS + blocage des plages privées) si l'app est exposée.
2. **Rate limiter en mémoire** et basé sur `x-forwarded-for` (falsifiable sans proxy de confiance) ; le `Map` n'est jamais purgé.
3. **CSP** autorise `'unsafe-inline'` et `'unsafe-eval'` pour les scripts.
4. **Identifiants de base en clair** dans `package.json` (scripts `database:migrations`, `seed:database:pg`) et dans le healthcheck de `docker-compose.yml`.
5. Image `bitnami/postgresql:latest` non épinglée.

### 6.4 Outillage et documentation

1. `CLAUDE.md` mentionne `npm run create:database` (n'existe plus, remplacé par `database:migrations` / l'ADR 001) et des commandes **knex** alors que knex n'est pas une dépendance.
2. L'ADR 001 référence `infra/database/seeds/migrations.sql` alors que le fichier est dans `infra/database/scripts/`.
3. `integration-tests/` ne contient que les exemples Playwright par défaut (`demo-todo-app.spec.ts`, `example.spec.ts`) : pas de vrai test e2e de l'app.
4. Le test de `add-glose.ts` s'appelle `create-glose.test.ts` (écart avec la convention miroir).
   ~~5. Dépendances de dev probablement inutiles : `mysql`, `mysql2`, `oracledb`, `sqlite3`, `better-sqlite3`, `pg-query-stream` (vestiges d'un usage knex ?). `@types/pg` est en `dependencies` au lieu de `devDependencies`.~~
   ~~6. `report.html` est versionné à la racine.~~
5. Le message d'erreur de `httpClient` (« Erreur dans récupérations des gloses ») est spécifique aux gloses alors que le client est générique ; le TODO #10 sur la gestion des codes d'erreur reste ouvert.

## 7. Recommandations prioritaires

1. **Corriger la persistance des thèmes** (action + requête SQL + repository) — bug visible.
2. **Unifier le pattern métier** : migrer les gloses vers `core/domain/usecases/` avec injection, et regrouper les repositories dans un seul dossier.
3. **Sortir `layout.tsx` / `pageLayout.tsx` de `src/pages/`**.
4. **Remplacer `http://localhost:3000`** par des URLs relatives ou une variable d'environnement.
5. **Ajouter validation + gestion d'erreurs** dans les routes API (try/catch, 400/405/500 explicites), factoriser `isValidOrigin`.
6. **Protéger `/api/feeds` contre le SSRF**.
7. **Mettre à jour `CLAUDE.md` et l'ADR 001**, nettoyer les dépendances inutiles et remplacer les specs Playwright d'exemple par un vrai parcours e2e.
