# JOURNAL

## To see next

- [ ] Choose between French and english
- [x] Add tailwind properly to project and some ~~fancy~~ glossy [css](https://nextjs.org/docs/app/getting-started/css-and-styling)
- [ ] [Lazy loading](https://nextjs.org/docs/pages/building-your-application/optimizing/lazy-loading)
- [ ] Should I use Memo ?
- [x] Finish installation of https://typescript-eslint.io/getting-started
- [x] Run type checking (add husky before ?)
- [ ] Add [renovate](https://github.com/renovatebot/renovate/blob/main/docs/usage/getting-started/installing-onboarding.md)
- [ ] Migrate to new eslint config https://eslint.org/docs/latest/use/configure/migration-guide#ignoring-files
- [ ] Add GitHub action for deployment
- [ ] Add Zod validation, well, first use cases that needs Zod^^
- [ ] Add seeds to feed database
- [x] Test with test container
- [ ] Data Fetching from db (to be removed -> api call plus maybe a backend cause we don't want secrets in client side)
- [ ] Add test to form after reading some documentation on how to do it the better way
- [ ] Fix type-checking in husky (path problem)
- [ ] Delete branch after merge
- [ ] Continue hhtp client improvements https://blog.logrocket.com/modern-api-data-fetching-methods-react/
- [ ] Use a node server as appi ?

## TODO NEXT

- https://stackoverflow.com/questions/47015693/how-to-fix-throw-[globals.css](../src/styles/globals.css)of-exception-caught-locally
- clean/reset mocks in tests with before each
- do not import types from db ?

## 26/11/2026

- Pourquoi la review de la GitHub Action ne dit jamais rien alors que `/code-review` en local trouve de vrais bugs ? Note [code-review-local-vs-github-action](second-brain/20-notes/code-review-local-vs-github-action.md) dans le second brain (PR #124)
    - Pas le même outil (plugin `code-review` contre commande intégrée), pas le même modèle (Sonnet contre Opus), et l'Action n'avait presque rien lu sur la PR #120 : 19 s, 5 tours, 0,11 $ pour ~1 500 lignes
    - Sources ajoutées : The Tech Away #17, Matt Pocock sur le goulot des PR, Greptile sur les modèles qui relisent mal leur propre code
- Fin de la garde d'origine partagée (PR #122) : `isSameOrigin` passe **avant** le rate limit sur people et feeds. Une requête d'une autre origine consommait le quota de l'IP avant d'être refusée, donc un site tiers pouvait épuiser la limite d'un visiteur
    - :clown_face: Le diff de feeds supprimait au passage le test de non-régression SSRF (`?url=http://169.254.169.254/...`). Remis en place
- Suites de la revue locale de la PR #122 (PR #125), un commit par point
    - Test de refus d'origine pour gloses : le seul test vérifiait l'appel à `isSameOrigin`, pas le 403. Vérifié en retirant la garde : le test casse
    - En-tête `Allow` sur le 405 de people, import d'`origin-check` sans `.ts` partout, gloses répond directement sans `let` inutiles
    - `setHeader` fourni par `createMockApiResponse` au lieu d'être ajouté à la main dans chaque test
    - **Choix assumé** : plus de limite de débit sur les écritures (POST, DELETE) de gloses, people et feeds. Seule la garde d'origine reste, et elle ne protège que du CSRF depuis un navigateur : un script qui envoie `Origin` et `Host` identiques n'est plus limité. Seuls les GET restent limités
    - Reportés dans le [plan des correctifs feeds](../plans/feed-subscriptions-correctifs.md) : `getIp` fait confiance à `X-Forwarded-For` (point 16), `JSON.parse(req.body)` sans garde donne 500 au lieu de 400 (point 17)
- Nouvelle review Claude dans la GitHub Action (PR #126)
    - Même sur Opus, l'Action a répondu « No issues found » sur la PR #125 (9 tours, 0,86 $), alors que la revue locale signalait les écritures sans limite
    - Le plugin `code-review` écarte ce dont il n'est pas sûr, les problèmes antérieurs à la PR et ce qui semble voulu. Remplacé par un prompt propre au repo : suivre le flux entre les couches, signaler les régressions de sécurité même voulues, gravité sur chaque remarque, toujours une synthèse de ce qui a été lu
    - Leçon : un « No issues found » ne prouve rien tant qu'on ne sait pas ce que l'agent a lu

## 25/11/2026

- Mutation testing : PR #117 mergée (mutants survivants tués dans le client HTTP, les routes API, les pages et les composants)
- Correction des vulnérabilités des dépendances Node, PR Dependabot #118 (22 mises à jour) encore ouverte
- Les seeds insèrent aussi les personnes depuis `seeds.json` (PR #119)
- Abonnements aux flux RSS stockés en base au lieu du `localStorage` (PR #120), premier morceau construit selon l'[architecture cible](architecture-cible.md) : entités → ports → use cases → adapters → `container.ts` → route fine
    - `CLAUDE.md` pointe maintenant le code neuf vers l'architecture cible
    - Correctifs après la revue locale : 409 au lieu de 500 quand deux abonnements au même flux arrivent en même temps (code pg `23505`), URLs normalisées avant stockage, flux supprimé qui ne réapparaît plus quand son chargement finit en retard, appel de l'API en URL relative, tests de contrat des ports
    - **SSRF corrigée** : le serveur ne va plus chercher n'importe quelle URL passée en `?url=`. Lecteur HTTP qui refuse les IP privées et de lien local (y compris après résolution DNS et redirections), timeout de 5 s, corps plafonné à 2 Mo, et articles servis seulement pour les flux enregistrés (`/api/feeds/[id]/items`)
    - Diagrammes d'architecture et suivi dans le [plan des correctifs feeds](../plans/feed-subscriptions-correctifs.md)
- Review de la GitHub Action passée sur Opus avec tout l'historique git (`fetch-depth: 0`) (PR #121), après le faux négatif de Sonnet sur la PR #120
- Désactivation de la génération des règles d'agent par Next.js (PR #123)
- Début de la garde d'origine partagée (`src/infrastructure/http/origin-check.ts`) pour gloses et people, et gloses refuse les méthodes non gérées (PR #122)

## 24/11/2026

- Ajout d'un [second brain](second-brain/README.md) pour organiser ma veille technique (PR #105)
    - Markdown pur avec liens `[[wiki]]`, ouvrable comme vault Obsidian
    - Workflow : capture (`00-inbox/`) → fiche de lecture (`30-sources/`) → note atomique (`20-notes/`) → action (`50-radar/`, spike, ADR)
    - Areas (`40-areas/`) comme pages d'index : sécurité, frontend, testing, architecture, IA, leadership
    - Règle d'or : pas de fiche sans « application concrète », sinon ça finit en pile de favoris
    - Deux skills Claude Code pour automatiser : `/veille <url>` crée la fiche source et la relie aux areas, `/weekly` prépare la note hebdo et trie l'inbox
    - `/second-brain` retiré du `.gitignore` pour versionner les notes
- Nouvelle note [claude-code-pr-review-agent](second-brain/20-notes/claude-code-pr-review-agent.md) : comment brancher un agent Claude Code qui fait la code review des PR (GitHub Action `anthropics/claude-code-action`, `/install-github-app`, ou `/code-review` en local)
    - À tester sur ce repo, en ajoutant au prompt les règles de couches du `CLAUDE.md`
- Ajout des workflows GitHub Claude Code Review et Claude PR Assistant (PR #108)
- Les seeds insèrent enfin les thèmes et la date de création des gloses, en SQL comme en TypeScript (PR #109)
    - Nouveau thème `DESIGN`, test unitaire des seeds lancé par `npm run test`, remplacement du matcher déprécié `toBeCalledWith`
    - Templates du second brain exclus de Prettier (il cassait le placeholder `{{date}}`)
- Déplacement de la doc et du second brain dans le dossier `documentation/` (PR #110)
- Ajout de l'[architecture cible](architecture-cible.md) et d'une colonne d'avancement dans le [plan](plan.md) (PR #111)
- Ménage : suppression d'un paquet inutilisé, `@types/pg` passé en `devDependencies`, retrait des `'use server'` inutiles (sans effet avec le Pages Router), rapports barad-dur ignorés
- Affichage des thèmes des gloses dans les cartes de la grille (PR #113)
    - Extraction d'un composant `ThemePill` réutilisé par le filtre et les cartes, restreint aux valeurs de `Theme`
    - Les thèmes des gloses sont typés `Theme[]` au lieu de `string[]`
- Scripts `format:check` et `format:fix`, `node_modules` imbriqués ignorés par Prettier (PR #114)
- Mise en place du test de mutation avec [Stryker](https://stryker-mutator.io/) et le runner Vitest : `npm run test:mutation` (PR #115)
    - `.claude` et `.agents` exclus de la copie du sandbox Stryker
    - Premier passage : score global de 62,56 % (493 mutants tués, 193 survivants, 102 sans couverture). Les failles sont suivies dans un nouveau chantier du [plan](plan.md#chantier--failles-révélées-par-le-test-de-mutation)
- Chasse aux mutants survivants (PR #116 et branche `test/mutation-http-and-api`)
    - `ThemePill` : la classe de l'état sélectionné n'était pas vérifiée ; `?.` inutile retiré dans `filterByThemes`
    - `httpClient` : 35,7 % → 71,4 % en couvrant les réponses non `ok`, le JSON invalide et les erreurs réseau. Le reste porte sur la config de pino
    - Routes API : `feeds.ts` 100 %, `gloses.ts` 97,9 %, `people.ts` 98,6 %. Les tests vérifient maintenant le corps des réponses, plus seulement le code HTTP (helper `createMockApiResponse`)
    - Pages et composants : `feeds.tsx` 8,6 % → 90,5 %, `index.tsx` 34,8 % → 91,3 %, `about.tsx` 100 %, `gloss-grid.tsx` 97,6 %, `gloss-terms-form.tsx` 95,8 %
    - :clown_face: Stryker a révélé un test faux : le test « erreur de chargement » de l'index faisait le rendu avant de mocker `fetch` et vérifiait en fait le message de chargement
    - Leçon : une partie des survivants sont des mutants équivalents (catch vidé qui donne le même 403, dépendances de `useEffect`, `trim()` sur un `input type="url"`). Viser 100 % n'a pas de sens

## 23/11/2026

- Correction du bug n°1 (critique) du [plan de modifications](plan.md) : les thèmes des gloses sont enfin persistés (PR #103)
    - Le formulaire envoyait `glose-theme` mais l'action ne le transmettait pas et l'`INSERT` n'écrivait pas la colonne `themes` : le filtre par thème ne marchait que sur les données de seed
    - L'action récupère maintenant les thèmes avec `formData.getAll('glose-theme')`, le repository les passe à la requête (`themes ?? []`) et `INSERT_GLOSE` écrit la colonne `themes`
    - Tests ajoutés/mis à jour sur l'action, le service, les requêtes SQL, les seeds et les repositories
- Ajout de la doc d'architecture et du plan de modifications (PR #104)
    - [architecture.md](architecture.md) : diagramme Mermaid des couches Pages → Actions → API routes → Services → Repositories
    - [plan.md](plan.md) : les 15 modifications issues de l'[audit](audit-claude.md), classées de critique à faible (SSRF sur `/api/feeds`, validation des entrées des routes API, URLs `localhost` en dur, identifiants de base versionnés, CSP, rate limiter…)
    - Ajout dans `CLAUDE.md` du bloc généré par `next dev` qui rappelle aux agents que Next.js 16 a des breaking changes
- Formatage du README et de l'audit avec Prettier

## 22/09/2026

- Ajout du skill [security-audit](https://github.com/cloudflare/security-audit-skill) de Cloudflare via `npx skills add https://github.com/cloudflare/security-audit-skill --skill security-audit`
    - Installé dans `.agents/skills/security-audit/`, symlinké pour Claude Code
    - Ce skill transforme l'agent en auditeur de sécurité automatisé en 6 phases : reconnaissance, hunting ciblé, validation des findings, output structuré, vérification indépendante et rapport final
    - Produit un `findings.json` (findings confirmés / à valider / rejetés) et un `REPORT.md`
    - Bénéfice concret pour ce projet : détecter des vulnérabilités dans les API routes (injection SQL, CSRF bypass, validation manquante), les actions server-side, et la configuration CSP/headers dans `next.config.ts`
    - Usage : "security audit this codebase" ou "find security vulnerabilities in ./src"

## 24/06/2026

- Ajout de la possibilité de supprimer une personne depuis sa carte dans `PeopleGrid`
    - Nouveau bouton "Supprimer" affiché via une prop `onDelete?: (id: number) => void`
    - Stack complète implémentée : SQL → repository → usecase → API route (DELETE) → action → `PeopleList` → `PeopleGrid` → page `people.tsx`
    - La personne est retirée du state local après suppression sans recharger la liste
- Refactoring : renommage de `card-grid.tsx` en `gloss-grid.tsx`
    - Composant `CardGrid` → `GlossGrid`, types et variables internes mis à jour
    - Import mis à jour dans `gloss-terms-list.tsx`
- Ajout de reviewdog dans les GitHub Actions pour annoter les PRs avec les erreurs ESLint directement sur les lignes du diff
- Mise à jour du `.gitignore` pour ignorer `infra/database/scripts/backups/gloses.csv`

## 16/06/2026

- affiche la liste des personnesfor p
- installation de la librairie https://lacrafterie.tech/barad-dur/. Barad-Dur est un outil CLI écrit en Rust qui analyse la santé de vos dépôts Git en profondeur. Il ne se contente pas de mesurer la qualité du code : il évalue aussi la dynamique d'équipe, la dette temporelle, et la robustesse organisationnelle.

## 13/05/2026

- `psql $POSTGRESQL_DATABASE_URL -f infra/database/scripts/add_themes_to_gloses.sql`

## 06/05/2026

- Ajout de vice dans les github actions
- Pr dependabot mergée -> mise à jour du code

### Résumé de la correction :

- \_app.tsx → remplacé par le vrai wrapper Next.js (App({ Component, pageProps })). C'est là que
  vit l'import de globals.css (qui s'applique à toutes les pages).
- index.tsx → créé avec le contenu de la page d'accueil (formulaire + liste).
- **tests**/index.test.tsx → import mis à jour vers index au lieu de \_app.

Sans index.tsx, Next.js ne savait pas quelle page servir sur /, ce qui provoquait l'erreur de
navigation hard vers la même URL.

### Tous les tests passent — 18 fichiers, 44 tests. Voici un résumé des corrections :

1. import_json_file.test.ts : vi.mock('fs') et vi.mock('path') sans factory ne créent pas de vrais vi.fn() dans Vitest 4. Ajout de factories
   explicites avec les méthodes nécessaires (existsSync, readFileSync, resolve). Les mocks sont également déplacés au niveau module (hors du
   describe).
2. gloses-actions.test.ts et gloss-terms-form.test.tsx : headers: new Headers() dans expect.objectContaining ne correspondait pas aux headers
   réels (qui contiennent Accept: application/json). Suppression de cette propriété de l'assertion.
3. get-gloses.test.ts et create-glose.test.ts : vi.mock('pg', ...) était appelé à l'intérieur d'un bloc it(). Vitest 4 exige que les mocks
   soient au niveau module pour être correctement hissés. De plus, le constructeur MockPool utilisait une arrow function incompatible avec new —
   remplacé par une fonction classique.

## 21/01/2025

- fix test on faking timer

## 03/01/2025

- working on testing actions create et getall gloses for success and failing cases
- https://stackoverflow.com/questions/77734117/cache-response-data-in-nextjs-api-route

## 02/01/2025

- some refactoring on api call and managing errors
- test failure api call in index page

## 31/12/2024

- Fix mocking fetch and add test help for mocking rejected api calls

## 30/12/2024

- Add and fix tests (improve mocking)
- Extract fetch call to an http client instead of callint from actions
- Testing api call in forms is a nightmare...
- Discovered a bug with knex, once a I made an insert, select \* returns the answer from the insert 🤡
- Mock action
    - The problem with that was that I couldn't unmock for testing mocked api call

## 27/12/2024

- Always fun with react testing library, got this error https://github.com/testing-library/dom-testing-library/issues/716
    - the form is [standard html form](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/form)
    - it was fixed by adding `aria-labelledby` to label
- :recycle: Move folders to src and rearrange files structure
- :lipstick: Add some text on about page, so I start to create some reusable ui components
- :monocle_face: Since I move app and layout pages, the build is broken `You are attempting to export "metadata" from a component marked with "use client", which is disallowed.` -> https://github.com/vercel/next.js/discussions/51002
- then another error on build `webpack config.resolve.alias was incorrectly overridden. https://nextjs.org/docs/messages/invalid-resolve-alias`
    - go further with:
        - https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns
        - https://nextjs.org/docs/app/building-your-application/optimizing/metadata#static-metadata
- `Unexpected end of JSON input` https://github.com/webpack/webpack/issues/18963 -> upgraded to node v23.3.0
- new error with import of `./src/styles/globals.css`
  Global CSS cannot be imported from files other than your Custom <App>.
- playing with api and use state action
    - https://www.youtube.com/watch?v=GgyP0_b-WPY
    - fetch
    - https://dev.to/rashidshamloo/api-data-fetching-in-react-nextjs-289d
    - need to be cleaned ^^
    -

## 26/12/2024

- enabled dependabot for project https://github.com/annemarie35/the-code-gloss/settings/security_analysis
- I've been reading, cleaning notes, try for organise my toughts and how to progress with this app.
    - Adding an api call after submitting the form ? Well, finish the form before
    - Start a small Hapi server + a postgresql for training ? Add docker ? I have already done that in some past work experience and not sure if it worth it for the moment
    - Working on architecture ? Like in this tutorial https://medium.com/@martin_42533/building-a-clean-next-js-app-with-hexagonal-architecture-and-redux-7c898ac26e66 (well, I don't think I need Redux for the moment)
- Add a postgres database to project to store data
- Add Knex to make db queries
- :clown_face: Always a pleasure to have import errors like this https://github.com/oven-sh/bun/issues/7886, can't build with knex module
    - adding as suggested https://github.com/vercel/next.js/discussions/26420 this below in next.config.ts did not work so i add to install all required modules for knex...
    ```js
    const nextConfig: NextConfig = {
      experimental: {
          externalDir: true
      }
    }
    ```
- Fetch data from db on home page

## 24/12/2024

Add some style to the pages, improve the nav venue and make tailwind work on all pages.
Still something not working with tailwind on production [https://the-code-gloss.osc-fr1.scalingo.io](https://the-code-gloss.osc-fr1.scalingo.io)

Now that I have some components and the beginning of the form, let's go back to tools. Just finished the config for **prettier** and add **husky** to pre-commit.
I keep using next lint instead of **eslint** for the moment, see that [discussion about the difference between next lint and eslint](https://github.com/vercel/next.js/discussions/36440) for config if I decide to change that.

Wondering what is that .mjs extension

> The .mjs extension makes the file use the ES modules (ESM) format. Node interprets .js files in the CommonJS (CJS) format by default, but if you have "type": "module" in your package.json, you can also use eslint.config.js.
> [source](https://typescript-eslint.io/getting-started/)

## 23/12/2024

Some error `Error: Invalid Chai property: toHaveAttribute ` with testing library, Custom jest matchers and vitest, types were not recognized... 😭 The jest setup files inferno !
Fixed with this [solution](https://stackoverflow.com/questions/77611978/invalid-chai-property-in-vitest) but, have a failed to import problem with vite () that was caused by the fact that when I installed `└──> npm install --save-dev testing-library/jest-dom ───┘` there was no package version number but the link to the github repository, maybe there was a problem with installed version in node_modules. Whatever happened, it works now.

I check then that css was working fine with tailwind, so i just add a background and some style on h1 to do so

Then I add the form, don't want to use react-form-hook or another library for the moment. Saw somebody on linkedin writing that using the `useActionState` hook can be a simple way to do it. So it is ok for me to start somewhere, I will use it and test it.

> The useActionState hook allows you to update component state based on the result of a form action. Essentially, it provides a way to manage state that is tied to form submissions, giving you greater control and flexibility over how your forms behave.
> [source](https://medium.com/zestgeek/understanding-the-useactionstate-hook-in-react-real-life-examples-f1d2350d4932)
>
> Talking about tests baby, reading [Kent C. Dodds](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library) may help.

## 18/12/2024

- I was trying to add a router and use finally the nextjs router with adding pages in `src/pages` and `next/link`. First add the `react-router-dom` library that was redirected to `react-router` and it seems that Yagni for the moment
- Switching from VueJs/Vitest to react testing library is a little bit painful
    - would like to test unitary my component and just check that page contains the component but i didn't found how to do it, so i have used [data-test-id](https://testing-library.com/docs/queries/bytestid/) but not sure is it a good practice
    - i had to refresh my memory with the right usage of `react-testing-library` some returns boolean, other data and maybe i should add some `async/await` sometimes. [See](https://timdeschryver.dev/blog/making-sure-youre-using-the-correct-query#byrole-provides-a-solution-to)
- Add a simple layout for the pages, with a header, navbar and footer
    - Typescript
    - ...to continue
- Attend a very nice [workshop](https://www.next-level.run/webinar-web-perf-bundle-optimisation) focused on three essential tools for optimizing your JavaScript code, efficiently managing your bundles and improving the performance of your React applications with Chrome's profiler, stats.json and Bundle Analyzer and React Profiling. See [https://www.fasterize.com/fr/blog/vitesse-chargement-chiffres-cles-web-performance/](https://www.fasterize.com/fr/blog/vitesse-chargement-chiffres-cles-web-performance/)

# Done

- [x] Where do I store data ? First a file read/write with fs and then add a database with knex as a query builder or another (should ask the React community) https://github.com/vercel/next.js/tree/canary/examples/with-knex
