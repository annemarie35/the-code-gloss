# Plan — Correctifs de la page Flux RSS

## Contexte

Points relevés pendant la mise en base des abonnements aux flux (`plans/feed-subscriptions.md`, branche `feat/feed-subscriptions`), sans être corrigés. Ils sont classés par priorité. Le code neuf suit `documentation/architecture-cible.md` et chaque correctif se fait en TDD (test rouge, puis code, puis vert).

## Corrigés dans la PR #120 (revue de code)

- [x] **a. Course à l'abonnement** : deux `POST` simultanés passent tous les deux `findByUrl`, et le second `INSERT` viole la contrainte `UNIQUE` (code pg `23505`) : 500 au lieu de 409. Le repository traduit `23505` en `FeedAlreadySubscribedError`.
- [ ] **b. Flux supprimé qui réapparaît** : un `loadFeed` encore en cours au moment de la suppression rajoute le flux. La page n'affiche que les flux encore abonnés.
- [x] **c. URL non normalisée** : `https://Example.com` et `https://example.com/` passent pour deux flux. L'entité stocke `new URL(url).href`, et la page compare avec la même normalisation (`normalizeFeedUrl`).
- [ ] **d. `id as number` dans le presenter** : un abonnement enregistré a toujours un id. Le type `PersistedFeedSubscription` le garantit, et le repository le renvoie.
- [ ] **e. Ports sans test** : tests de type (`expectTypeOf`) pour `clock.ts` et `feed-subscription-repository.ts`.
- [ ] **f. URL relative** : `feeds-api.ts` appelle `/api/feeds` au lieu de `http://localhost:3000/api/feeds` (point 4 ci-dessous, pour les flux seulement).

## Priorité haute

- [ ] **1. Protéger `GET /api/feeds?url=` contre la SSRF**
    - **Problème** : le serveur va chercher n'importe quelle URL http ou https (`src/lib/service/get-feeds.ts`), y compris `localhost`, une IP privée (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), le lien local `169.254.0.0/16` (métadonnées cloud) ou une adresse IPv6 locale. Il n'y a pas de timeout ni de taille maximale. L'URL n'a même pas besoin d'être enregistrée : n'importe quel visiteur peut s'en servir.
    - **Préconisation** :
        - créer le port `src/core/ports/feed-reader.ts` et son adaptateur `src/infrastructure/rss/http-feed-reader.ts`, comme le prévoit la cible ;
        - **SSRF** : résoudre le nom d'hôte (`dns.lookup`, toutes les adresses) et refuser les plages privées, de bouclage, de lien local et non routables ; refuser aussi les redirections vers ces plages (`redirect: 'manual'` puis revalidation de chaque saut, avec un nombre de sauts limité) ;
        - **limites** : timeout (`AbortSignal.timeout(5_000)`), lecture du corps plafonnée (par exemple 2 Mo), `Content-Type` attendu (XML, RSS ou Atom) ;
        - **portée** : ne servir que les flux enregistrés, en passant à `GET /api/feeds/[id]/items` au lieu de `?url=`. Cela supprime le proxy ouvert.
    - **Tests** : IP privées, IPv4 et IPv6, `localhost`, nom d'hôte qui résout vers une IP privée, redirection vers une IP interne, timeout, corps trop gros. Les appels DNS et `fetch` sont injectés, sans réseau.

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

## Ordre conseillé

1 → 2 → 3 (qui débloque de meilleurs messages pour 1 et 2) → 4 → 5, puis 6 à 9 selon le besoin. Les points 10 et 11 suivent la migration des gloses et des personnes.
