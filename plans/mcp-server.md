# Plan — Serveur MCP pour code-gloss

## Contexte

L'objectif est de rendre les données de code-gloss (gloses et flux RSS) utilisables par un agent (Claude Code, Claude Desktop). Pendant une session, il pourra par exemple chercher une glose ou lire les articles d'un flux.

Choix retenus :

- **v1 en local** : transport stdio, lancé sur le poste et branché sur la base de dev. Il n'y a pas d'auth à gérer et rien n'est exposé sur Internet.
- **Lecture seule** pour commencer.
- **Accès à distance plus tard** (phase 2) : Streamable HTTP sur le même cœur.

Le serveur MCP est un **nouvel adaptateur d'entrée** de la [Clean Architecture](../documentation/architecture-cible.md), au même niveau que les routes API. Il appelle les use cases, ne contient aucune logique métier et ne passe ni par HTTP ni par les routes Next.

## Outils exposés (v1)

| Outil                     | Entrée                | Sortie                                          | Use case                                      |
| ------------------------- | --------------------- | ----------------------------------------------- | --------------------------------------------- |
| `search_gloses`           | `{ query?, themes? }` | gloses (titre, description, tags, thèmes, date) | `searchGloses` (nouveau)                      |
| `list_feed_subscriptions` | aucune                | id, url, date d'abonnement                      | `listFeedSubscriptions` (existant)            |
| `read_feed`               | `{ id }`              | titre du flux et articles                       | `readFeed` (existant, ne lit que les abonnés) |

Tous les outils ont `annotations: { readOnlyHint: true }`, un schéma zod en entrée et une description claire. Chacun renvoie du texte et `structuredContent`, et limite le nombre d'éléments (par exemple 50) pour ne pas remplir le contexte de l'agent.

## Étapes (TDD : test rouge → code → vert)

- [ ] 1. **Dépendances**
    - `@modelcontextprotocol/sdk` et `zod` en dépendances directes (`zod` n'est aujourd'hui qu'une dépendance transitive).
    - `tsx` en devDependency pour lancer le serveur hors de Next : le repo est en ESM (`"type": "module"`) avec l'alias `@/*`, et ni `tsx` ni `ts-node` ne sont installés.
- [ ] 2. **Port `src/core/ports/glose-reader.ts`** : `findAll(): Promise<GloseComplete[]>`.
    - Test de type (`expectTypeOf`) dans `__tests__/src/core/ports/glose-reader.test.ts`, comme les autres ports.
- [ ] 3. **Use case `src/core/usecases/gloses/search-gloses.ts`**
    - Il filtre par texte dans le titre, la description et les tags, sans tenir compte de la casse, et par thèmes en réutilisant `filterByThemes` (`src/lib/filter-by-themes.ts`).
    - Tests avec un faux `GloseReader` : texte seul, thèmes seuls, les deux, aucun résultat, casse ignorée.
    - La route `/api/gloses` n'est pas migrée : ce point ne la touche pas.
- [ ] 4. **Adaptateur `src/infrastructure/postgres/pg-glose-reader.ts`**
    - Il enveloppe `selectAllGloses` (`infra/database/repositories`), comme `getGlosesInMemory` (`src/lib/service/get-gloses.ts`).
    - Test avec testcontainers, comme le repository des abonnements.
- [ ] 5. **Adaptateur MCP `src/adapters/mcp/create-mcp-server.ts`**
    - `createMcpServer(deps)` crée un `McpServer` nommé `code-gloss` et enregistre les trois outils, sans dépendre du transport.
    - `list_feed_subscriptions` réutilise `toFeedSubscriptionDto` (`src/adapters/presenters/`).
    - `FeedSubscriptionNotFoundError` et `FeedUnavailableError` deviennent des résultats `isError: true` avec un message lisible, pas des exceptions.
    - Tests avec un vrai `Client` du SDK relié par `InMemoryTransport.createLinkedPair()` et des faux use cases. Ils vérifient la liste des outils et leur `readOnlyHint`, les résultats, `isError` pour un id inconnu ou un flux inaccessible, la limite d'éléments, et le rejet d'un `id` qui n'est pas un entier.
- [ ] 6. **Container** : une entrée `mcp` dans `src/composition/container.ts` avec `searchGloses`, `listFeedSubscriptions` et `readFeed`.
- [ ] 7. **Point d'entrée `src/mcp/stdio.ts`**
    - Il construit le serveur depuis le container et le connecte à `StdioServerTransport`.
    - **Rien sur stdout** en dehors du protocole : les logs vont sur stderr. Il faut vérifier que ce chemin n'importe pas le logger pino de `src/lib/http.ts`.
    - Il ferme le pool pg (`pgConnectionPool.end()`) quand stdin se ferme ou à la réception de SIGINT ou SIGTERM.
    - Test : avec un transport et un pool injectés, le démarrage connecte le transport et l'arrêt ferme le pool.
- [ ] 8. **Lancement**
    - Script `"mcp": "tsx src/mcp/stdio.ts"` dans `package.json`.
    - `.mcp.json` à la racine, en portée projet et versionné : `{"mcpServers": {"code-gloss": {"command": "npm", "args": ["run", "--silent", "mcp"]}}}`. Les variables `POSTGRESQL_*` viennent de direnv, puisque Claude Code est lancé depuis le repo. Aucun secret dans le fichier.
    - Une ligne sur `npm run mcp` dans la section Development de `CLAUDE.md`.
- [ ] 9. **Vérifications**
    - `npm run test`, `npm run type-check`, `npm run lint`, puis les tests DB (testcontainers).
    - Base démarrée (`npm run start:database`), puis `npx @modelcontextprotocol/inspector npm run --silent mcp` :
        - les 3 outils apparaissent ;
        - `search_gloses` sans argument renvoie les gloses de la base ;
        - `read_feed` avec l'id d'un abonnement réel renvoie ses articles ;
        - un id inconnu renvoie `isError`.
    - Aucune ligne non JSON-RPC sur stdout : sinon, l'Inspector signale une erreur de parse.
    - Dans Claude Code relancé dans le repo, `/mcp` affiche `code-gloss` connecté, et « quelles gloses ai-je sur le thème CRAFT ? » déclenche `search_gloses`.
- [ ] 10. **Journal** : une entrée dans `documentation/journal.md`.

## Phase 2 — Accès à distance (pas dans la v1)

- [ ] 11. **Route Streamable HTTP** `src/pages/api/mcp.ts`, construite sur le même `createMcpServer`, sans état (`sessionIdGenerator: undefined`).
- [ ] 12. **Authentification OAuth** : métadonnées de ressource protégée et validation du jeton sur chaque requête. Sans jeton valide, réponse 401 avec `WWW-Authenticate`.
- [ ] 13. **Rate limiting** : il dépend des points 2 (compteurs séparés) et 16 (`X-Forwarded-For`) de [feed-subscriptions-correctifs](feed-subscriptions-correctifs.md).
- [ ] 14. **Outils d'écriture** (ajouter une glose, s'abonner à un flux) : seulement après le retour d'une limite de débit sur les écritures, aujourd'hui retirée sur toutes les routes.

## Ordre conseillé

1 → 2 → 3 → 4 (le cœur des gloses), puis 5 → 6 → 7 → 8 (l'adaptateur et le lancement), puis 9 et 10. La phase 2 attend que la v1 serve au quotidien.
