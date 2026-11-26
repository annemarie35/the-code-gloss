# Plan — Améliorer la lecture des gloses et la robustesse du serveur MCP

## Contexte

Points relevés par la revue de code (`/code-review`) du plan [mcp-server](mcp-server.md), après l'étape 1. Ils ne sont pas intégrés à ce plan pour le garder centré sur la v1 du serveur. Ils sont classés par priorité. Le code neuf suit `documentation/architecture-cible.md`, et chaque point se fait en TDD (test rouge, puis code, puis vert).

La revue signalait aussi que le SDK v1 (`@modelcontextprotocol/sdk`) ajoutait Express, Hono, etc. aux dépendances de prod. C'est réglé par le passage au SDK v2 (`@modelcontextprotocol/server`), qui n'embarque pas d'adaptateur HTTP.

## Priorité haute

- [ ] **1. Mapper les lignes `gloses` au lieu de les caster**
    - **Problème** : `getGlosesInMemory` (`src/lib/service/get-gloses.ts`) fait `data as GloseComplete`. Or, en base, `title`, `description`, `tags` et `created_at` n'ont pas de contrainte `NOT NULL`, `themes` peut être NULL malgré son `DEFAULT '{}'`, et pg renvoie `created_at` (`timestamptz`) comme un `Date`, pas comme une `string`. Le type ment :
        - une glose sans `tags` fait planter une recherche en `glose.tags.toLowerCase()` (étape 3 du plan MCP) ;
        - une glose avec `themes` NULL fait planter `filterByThemes` sur `glose.themes.some`, ce qui touche aussi le filtre par thème de la page d'accueil ;
        - un `outputSchema` MCP qui attend `created_at: z.string()` rejette un `Date`.
    - **Préconisation** : une fonction de mapping `toGlose(row)` dans l'adaptateur `pg-glose-reader.ts` (étape 4 du plan MCP) : NULL → `''` pour les textes, NULL → `[]` pour `themes`, `Date` → chaîne ISO, et les thèmes inconnus sont écartés. On ne touche à `getGlosesInMemory` que si on décide de la brancher sur le même mapping.
    - **Tests** : lignes avec chaque colonne NULL, `created_at` en `Date`, thème inconnu. Les tests du use case `searchGloses` couvrent une glose sans tags ni thèmes.
    - **Ordre** : à faire **avec l'étape 4** du plan MCP, pas après.

- [ ] **2. Signaler la troncature des résultats MCP**
    - **Problème** : le plan MCP limite chaque liste à environ 50 éléments sans le dire à l'agent. Avec 120 gloses CRAFT, `search_gloses({ themes: ['CRAFT'] })` en renvoie 50, et l'agent répond « tu as 50 gloses CRAFT ».
    - **Préconisation** : chaque outil qui limite ses résultats renvoie `total` et `truncated` dans `structuredContent` (et dans l'`outputSchema`), et le texte le dit explicitement (« 50 sur 120, affine la recherche »).
    - **Tests** : à l'étape 5 du plan MCP, au-dessus de la limite (`truncated: true`, `total` exact) et en dessous (`truncated: false`).

- [ ] **3. Arrêter proprement le serveur stdio**
    - **Problème** : le pool pg est configuré avec `idleTimeoutMillis: 0` et `allowExitOnIdle: false` (`infra/database/connectionPool.ts`). Si le client meurt sans fermer stdin proprement, ou si un autre chemin ferme la connexion, ses clients inactifs gardent le processus en vie. Des processus `tsx` orphelins s'accumulent et gardent chacun jusqu'à 6 connexions Postgres.
    - **Préconisation** : à l'étape 7 du plan MCP, fermer le pool sur **toute** fin de connexion, pas seulement sur SIGINT ou SIGTERM : `server.server.onclose` dans la factory passée à `serveStdio`, en plus des signaux. La fermeture doit être idempotente (un seul `pgConnectionPool.end()`).
    - **Tests** : la fermeture du transport injecté ferme le pool une seule fois. Un test de lancement réel (point 6) vérifie que le processus se termine quand stdin se ferme.

## Priorité moyenne

- [ ] **4. Vérifier la configuration de la base au démarrage du serveur MCP**
    - **Problème** : `.mcp.json` compte sur direnv pour fournir `POSTGRESQL_*`, et `connectionPool.ts` lit `process.env` au chargement sans rien vérifier. Lancé hors direnv (Claude Desktop, Claude Code lancé depuis un IDE), le port vaut `NaN`, l'hôte est `undefined`, et pg se rabat sur `localhost:5432` avec l'utilisateur système. Chaque appel d'outil échoue alors avec une erreur de connexion ou d'auth peu parlante.
    - **Préconisation** : au démarrage de `src/mcp/stdio.ts`, vérifier que les variables `POSTGRESQL_*` sont présentes, et sinon écrire un message clair sur stderr et sortir avec un code non nul. Documenter `direnv exec . npm run --silent mcp` pour les clients qui ne passent pas par le shell du repo.
    - **Tests** : variable manquante → message qui la nomme, et sortie en erreur ; configuration complète → démarrage.

- [x] **5. Filtrer les gloses en SQL plutôt qu'en mémoire** — **tranché : on garde `findAll`**, voir [ADR 002](../documentation/adr/002-glose-reader-find-all-and-filter-in-use-case.md). Le volume est faible, `ILIKE '%…%'` lit toute la table de toute façon, et la règle de correspondance reste dans le use case, testable sans base. L'ADR dit quand revenir sur ce choix.
    - **Problème** : `searchGloses` est prévu comme `GloseReader.findAll()` (`SELECT *`) suivi d'un filtre en JavaScript. Chaque appel de l'agent lit toute la table pour en renvoyer au plus 50 lignes.
    - **Préconisation** : comme le port `GloseReader` est neuf, lui donner directement la bonne forme : `search({ query, themes, limit })`, avec `ILIKE` sur le titre, la description et les tags, `themes && $1` et `LIMIT`, plus un `count` pour le `total` du point 2. Pour une base perso de quelques centaines de gloses, `findAll` reste acceptable : c'est un choix à trancher **avant l'étape 2** du plan MCP.
    - **Tests** : testcontainers pour la requête (casse ignorée, thèmes, limite, total), faux reader pour le use case.

- [ ] **6. Tester le lancement réel de `npm run mcp`**
    - **Problème** : les tests des étapes 2 à 8 passent par le résolveur de Vitest. `tsx` résout l'alias `@/*` (vérifié à l'étape 1), mais pas forcément tous les imports du chemin réel, comme ceux qui finissent en `.ts` (`'@/src/core/domain/models/Glose.ts'`). Une erreur `ERR_MODULE_NOT_FOUND` n'apparaîtrait qu'à l'étape 9, avec l'Inspector.
    - **Préconisation** : un test de fumée qui lance le serveur avec `StdioClientTransport` (`@modelcontextprotocol/client/stdio`), appelle `listTools`, vérifie les trois outils, puis ferme stdin et vérifie que le processus se termine (point 3). Il a besoin de la base : il va avec les tests DB.

## Priorité basse

- [ ] **7. Séparer le câblage MCP du container des routes Next**
    - **Problème** : l'étape 6 du plan MCP ajoute une entrée `mcp` à l'objet `container` (`src/composition/container.ts`), qui construit toutes ses dépendances dès le chargement du module. Les routes Next construiraient alors le graphe MCP, et `src/mcp/stdio.ts` chargerait tout le câblage du `feedsController`.
    - **Préconisation** : exposer des fonctions de construction séparées (`createMcpDeps()` à côté du `container` existant), qui partagent les adaptateurs (`pgFeedSubscriptionRepository`, `httpFeedReader`). À décider **à l'étape 6** du plan MCP.
    - **Tests** : `createMcpDeps()` renvoie les trois use cases. Importer le container des routes ne charge pas le SDK MCP.

## Ordre conseillé

Le point 5 est tranché (ADR 002). Les points 1, 2, 7, 3 et 4 accompagnent respectivement les étapes 4, 5, 6 et 7. Le point 6 s'ajoute aux vérifications de l'étape 9.
