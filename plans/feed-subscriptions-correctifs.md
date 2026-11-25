# Plan — Correctifs de la page Flux RSS

## Contexte

Points relevés pendant la mise en base des abonnements aux flux (`plans/feed-subscriptions.md`, branche `feat/feed-subscriptions`), sans être corrigés. Ils sont classés par priorité. Le code neuf suit `documentation/architecture-cible.md` et chaque correctif se fait en TDD (test rouge, puis code, puis vert).

## Corrigés dans la PR #120 (revue de code)

- [x] **a. Course à l'abonnement** : deux `POST` simultanés passent tous les deux `findByUrl`, et le second `INSERT` viole la contrainte `UNIQUE` (code pg `23505`) : 500 au lieu de 409. Le repository traduit `23505` en `FeedAlreadySubscribedError`.
- [x] **b. Flux supprimé qui réapparaît** : un `loadFeed` encore en cours au moment de la suppression rajoute le flux. La page n'affiche que les flux encore abonnés.
- [x] **c. URL non normalisée** : `https://Example.com` et `https://example.com/` passent pour deux flux. L'entité stocke `new URL(url).href`, et la page compare avec la même normalisation (`normalizeFeedUrl`).
- [x] **d. `id as number` dans le presenter** : un abonnement enregistré a toujours un id. Le type `PersistedFeedSubscription` le garantit, et le repository le renvoie.
- [x] **e. Ports sans test** : tests de type (`expectTypeOf`) pour `clock.ts` et `feed-subscription-repository.ts`.
- [x] **f. URL relative** : `feeds-api.ts` appelle `/api/feeds` au lieu de `http://localhost:3000/api/feeds` (point 4 ci-dessous, pour les flux seulement).

## Priorité haute

- [x] **1. Protéger `GET /api/feeds?url=` contre la SSRF**
    - **Problème** : le serveur va chercher n'importe quelle URL http ou https (`src/lib/service/get-feeds.ts`), y compris `localhost`, une IP privée (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), le lien local `169.254.0.0/16` (métadonnées cloud) ou une adresse IPv6 locale. Il n'y a pas de timeout ni de taille maximale. L'URL n'a même pas besoin d'être enregistrée : n'importe quel visiteur peut s'en servir.
    - **Préconisation** :
        - créer le port `src/core/ports/feed-reader.ts` et son adaptateur `src/infrastructure/rss/http-feed-reader.ts`, comme le prévoit la cible ;
        - **SSRF** : résoudre le nom d'hôte (`dns.lookup`, toutes les adresses) et refuser les plages privées, de bouclage, de lien local et non routables ; refuser aussi les redirections vers ces plages (`redirect: 'manual'` puis revalidation de chaque saut, avec un nombre de sauts limité) ;
        - **limites** : timeout (`AbortSignal.timeout(5_000)`), lecture du corps plafonnée (par exemple 2 Mo), `Content-Type` attendu (XML, RSS ou Atom) ;
        - **portée** : ne servir que les flux enregistrés, en passant à `GET /api/feeds/[id]/items` au lieu de `?url=`. Cela supprime le proxy ouvert.
    - **Tests** : IP privées, IPv4 et IPv6, `localhost`, nom d'hôte qui résout vers une IP privée, redirection vers une IP interne, timeout, corps trop gros. Les appels DNS et `fetch` sont injectés, sans réseau.
    - **Étapes** (TDD) :
        - [x] a. `src/core/domain/feed/parse-feed.ts` : déplacer le parsing de `get-feeds.ts` sans le changer (le point 9 le remplacera), avec ses tests.
        - [x] b. Erreurs `FeedSubscriptionNotFoundError` et `FeedUnavailableError` dans `feed-errors.ts`.
        - [x] c. `findById` dans le port `FeedSubscriptionRepository`, la requête `SELECT_FEED_SUBSCRIPTION_BY_ID`, le repository pg et le faux en mémoire.
        - [x] d. Port `src/core/ports/feed-reader.ts` (`read(url): Promise<string>`, lève `FeedUnavailableError`).
        - [x] e. Use case `src/core/usecases/feeds/read-feed.ts` : abonnement par id (sinon `FeedSubscriptionNotFoundError`), lecture, parsing.
        - [x] f. `src/infrastructure/rss/address-guard.ts` : `isPublicAddress(ip)` (plages réservées IPv4 et IPv6 via `net.BlockList`, adresses IPv4 mappées en IPv6) et `guardedLookup`, qui valide **toutes** les adresses résolues au moment de la connexion : pas de fenêtre de DNS rebinding entre la vérification et la connexion.
        - [x] g. `src/infrastructure/rss/http-feed-reader.ts` : `http`/`https` de Node avec `guardedLookup`, IP littérales vérifiées avant la connexion, redirections manuelles (3 au plus, http(s) seulement, chaque saut revalidé), timeout global de 5 s, corps plafonné à 2 Mo, `Content-Type` XML, RSS ou Atom. Tests contre un serveur HTTP local et un DNS injecté.
        - [x] h. Contrôleur `items` : 200 (`Feed`), 400 (id invalide), 404 (abonnement inconnu), 502 (flux inaccessible), 500. Câblage dans `container.ts`.
        - [x] i. Route `src/pages/api/feeds/[id]/items.ts` (GET seulement, rate limit des lectures) ; retirer `GET /api/feeds?url=` de `feeds.ts` ; supprimer `src/lib/service/get-feeds.ts` et son test.
        - [x] j. Client `getFeedItems(id)` à la place de `getFeed(url)`, et la page charge les flux par id.
        - [x] k. Vérifications : type-check, lint, tests, tests DB, `/verify` (flux réel chargé, `?url=` ne sert plus rien, `/api/feeds/<id>/items` d'un id inconnu → 404).

- [ ] **2. Séparer les compteurs du rate limiter**
    - **Problème** : `src/lib/rate-limiter.ts` garde un seul compteur par IP pour toutes les routes et toutes les méthodes, donc les GET comptent dans la limite de 10 écritures par minute. En dev, React StrictMode double les appels du montage : ouvrir `/feeds` deux ou trois fois suffit pour que le `POST` ou le `DELETE` suivant reçoive un 429. Le problème touche aussi `people` et `gloses`.
    - **Préconisation** : préfixer la clé par le type de limite (`${ip}:read` et `${ip}:write`), via un paramètre `bucket` ou deux fonctions. Le déplacer dans `src/infrastructure/http/rate-limiter.ts` en même temps.
    - **Tests** : 30 GET n'empêchent pas un POST ; 10 POST bloquent le 11ᵉ sans bloquer les GET ; chaque compteur se réinitialise à la fin de sa fenêtre.

## Priorité moyenne

- [ ] **3. Faire remonter le code HTTP par `httpClient`**
    - **Problème** : `src/lib/http.ts` lève toujours la même erreur. Le client ne distingue donc pas un 400, un 409 ou un 429, et la page détecte les doublons elle-même.
    - **Préconisation** : lever une `HttpError` qui porte le `status` et le message `error` du corps JSON. Dans `src/client/api/feeds-api.ts`, retourner un résultat typé (`'duplicate' | 'invalid' | 'rate-limited' | 'unknown'`) et afficher le message renvoyé par l'API. Mettre à jour les tests existants de `http.ts`, qui vérifient le message actuel.

- [ ] **4. Rendre l'URL de l'API configurable**
    - **Problème** : `http://localhost:3000` est écrit en dur dans `src/client/api/feeds-api.ts` et dans les autres clients ; en dehors du local, ça ne marche pas.
    - **Préconisation** : utiliser des URLs relatives (`/api/feeds`), puisque ces appels se font dans le navigateur depuis la même origine. Sinon, une variable `NEXT_PUBLIC_API_BASE_URL`.

- [ ] **5. Appliquer la migration `feed_subscriptions` partout**
    - **Problème** : la table n'existe que là où `migrations.sql` a été rejoué (la base de dev l'est).
    - **Préconisation** : rejouer `npm run database:migrations` sur chaque environnement, Scalingo compris, avant de déployer. À terme, passer à des migrations versionnées (knex, déjà cité dans `CLAUDE.md`).

## Priorité basse

- [ ] **6. Afficher une erreur par flux** : remplacer le state `error: string` par une erreur par URL, affichée à côté du flux concerné, pour qu'un échec n'en masque pas un autre.
- [ ] **7. Trier les articles par date** : trier `allItems` par `pubDate` décroissante ; les dates invalides ou absentes vont en fin de liste.
- [ ] **8. Mettre les flux en cache** : cache côté serveur par URL, avec une durée courte (par exemple 10 minutes), pour ne pas tout recharger depuis les sites à chaque ouverture de la page. À faire après le point 1, dans `http-feed-reader`.
- [ ] **9. Remplacer le parsing par regex** : déplacer le parsing dans `src/core/domain/feed/parse-feed.ts`, comme le prévoit la cible, et utiliser un vrai parseur XML (par exemple `fast-xml-parser`). Tests sur des flux RSS 2.0 et Atom réels, avec CDATA et entités.

## Dette volontaire

- [ ] **10. Supprimer les copies de `isValidOrigin`** dans `src/pages/api/people.ts` et `gloses.ts` en utilisant `src/infrastructure/http/origin-check.ts`, lors de la migration de ces routes vers l'architecture cible.
- [ ] **11. Anciens flux du `localStorage`** : ils sont abandonnés et à rajouter à la main. Pas de migration prévue, sauf si le besoin apparaît.

## Relevés par la seconde revue de code

- [ ] **12. Empêcher la double soumission du formulaire** (priorité moyenne)
    - **Problème** : `handleAdd` (`src/pages/feeds.tsx`) est asynchrone et rien ne bloque un second envoi. Un double-clic sur « Ajouter » (ou deux fois Entrée) envoie deux `POST` avec la même URL. Les deux passent le contrôle de doublon côté client : l'un reçoit 201, l'autre 409, et la page affiche une erreur générique à côté d'un flux pourtant ajouté.
    - **Préconisation** : un state `isSubmitting` qui désactive le bouton (et ignore la soumission) tant que la requête est en cours.
    - **Tests** : deux soumissions rapprochées n'appellent `subscribeToFeed` qu'une fois ; le bouton est désactivé pendant l'envoi puis réactivé, y compris après une erreur.

- [ ] **13. Ne plus afficher « Chargement des articles... » indéfiniment** (priorité basse)
    - **Problème** : le message dépend de `allItems.length === 0 && subscriptions.length > 0`, pas de l'état réel du chargement. Si tous les flux échouent (ou n'ont aucun article), il reste affiché pour toujours.
    - **Préconisation** : suivre l'état de chargement par flux (`loading | loaded | error`), à faire avec le point 6, et n'afficher le message que tant qu'au moins un flux est en `loading`.
    - **Tests** : tous les flux en échec → pas de message de chargement ; un flux sans article → pas de message de chargement.

- [ ] **14. Répondre 404 à la suppression d'un id inexistant** (priorité basse)
    - **Problème** : `DELETE /api/feeds?id=999999`, ou une seconde suppression depuis un autre onglet, répond 200 « Flux supprimé avec succès » : `pgFeedSubscriptionRepository.delete` ignore `rowCount`.
    - **Préconisation** : `delete` renvoie `boolean` (ou le use case lève `FeedSubscriptionNotFoundError`), et le contrôleur répond 404. Côté page, un 404 retire quand même le flux de la liste, puisqu'il n'existe plus.
    - **Tests** : repository (testcontainers) `delete` d'un id absent ; use case avec le faux repository ; contrôleur → 404.

- [ ] **15. Limiter le chargement simultané des flux** (priorité basse)
    - **Problème** : au montage, la page lance un `GET ?url=` par abonnement, tous en parallèle. Avec la limite de 30 GET par minute et par IP (et l'appel de liste en plus), au-delà d'une trentaine d'abonnements les derniers flux reçoivent un 429 et affichent « Impossible de charger » à chaque rechargement.
    - **Préconisation** : d'abord les points 2 (compteurs séparés) et 8 (cache serveur). Ensuite, soit limiter la concurrence côté client (par exemple 4 requêtes à la fois), soit un endpoint qui renvoie les articles de tous les flux enregistrés en un seul appel (à concevoir avec le point 1 et `GET /api/feeds/[id]/items`).
    - **Tests** : avec 10 abonnements et une limite de 4, jamais plus de 4 appels `getFeed` en cours ; tous les flux finissent chargés.

## Ordre conseillé

1 → 2 → 3 (qui débloque de meilleurs messages pour 1 et 2) → 4 → 5, puis 6 à 9 selon le besoin. Le point 12 est indépendant et rapide ; 13 se fait avec 6, 15 après 2 et 8, et 14 quand on veut. Les points 10 et 11 suivent la migration des gloses et des personnes.
