# Plan — Seeder aussi des `Person` depuis `seeds.json`

## Contexte

Le script `infra/database/seeds/create_gloses_and_seeds.ts` (lancé par `npm run seed:database:ts`) ne sait insérer que des gloses : `seeds.json` est un tableau de gloses et `importJsonFile` (`infra/import_json_file.ts`) exige un tableau. La table `people` existe déjà (`infra/database/scripts/migrations.sql`) et la requête `INSERT_PERSON` existe dans `infra/database/sql_queries.ts`, mais rien ne seede de personnes. Objectif : un seul `seeds.json` contenant gloses **et** people, et le script insère les deux (people via `INSERT_PERSON`).

## Format cible de `seeds.json`

```json
{
    "gloses": [{ "description": "...", "tags": "...", "title": "...", "themes": ["CRAFT"] }],
    "people": [
        {
            "first_name": "Alistair",
            "last_name": "Cockburn",
            "nickname": null,
            "blog_url": "https://alistair.cockburn.us",
            "linkedin_url": null,
            "biography": "Inventeur de l'architecture hexagonale (2005)...",
            "year_of_birth": 1953,
            "tags": "Craft, Architecture"
        }
    ]
}
```

`created_at` n'est pas dans le JSON : il est généré par le script (comme pour les gloses).

## Étapes (TDD : test rouge → code → vert)

- [x] 0. Copier ce plan dans `plans/seed-people.md` (le dossier `plans/` existe et est vide)
- [x] 1. **Types de seeds** — dans `infra/import_json_file.ts` :
    - `GloseSeed = Omit<GloseComplete, 'id'>` (sans `created_at` si absent du JSON — à aligner sur l'usage actuel)
    - `PersonSeed = Omit<Person, 'id' | 'created_at'>` (réutilise `src/core/domain/Types/Person.ts`)
    - `Seeds = { gloses: GloseSeed[]; people: PersonSeed[] }`
- [x] 2. **Tests `__tests__/infra/import_json_file.test.ts`** (rouge) :
    - lit et retourne un objet `{ gloses, people }`
    - lève une erreur si le JSON n'est pas un objet avec `gloses` et `people` tableaux (remplace le test « must contain an array »)
    - log `File with X gloses and Y people successfully imported!`
- [x] 3. **`importJsonFile`** (vert) : valider la nouvelle structure, adapter le message d'erreur et le log
- [x] 4. **Tests `__tests__/infra/database/seeds/create_gloses_and_seeds.test.ts`** (rouge) :
    - mock de seeds au nouveau format (2 gloses + 1 personne)
    - `queryMock` appelé 3 fois au total
    - appel avec `INSERT_PERSON('public')` et `[first_name, last_name, nickname, blog_url, linkedin_url, biography, year_of_birth, tags, expect.any(String)]`
    - si `people` est vide, seules les gloses sont insérées
    - une erreur d'insertion est bien propagée/loggée
- [x] 5. **`createAndSeedDatabase`** (vert) :
    - importer `INSERT_PERSON` depuis `../sql_queries.ts`
    - remplacer `gloses.forEach(async …)` par des `for…of` + `await` (aujourd'hui les erreurs d'insertion ne sont pas attendues ni catchées)
    - insérer chaque personne avec `INSERT_PERSON('public')` dans l'ordre des colonnes de `insertPerson` (`infra/repositories/person_repository.ts`)
- [x] 6. **Mettre à jour `infra/database/seeds/seeds.json`** : envelopper les 3 gloses existantes dans `gloses` et ajouter `people` (ex. Alistair Cockburn, Eric Evans, Robert C. Martin, Michael Feathers — en lien avec les gloses existantes)
- [x] 7. `npm run type-check`, `npm run lint`, `npm run test`
- [x] 8. Vérif bout en bout : `npm run start:database`, `create:database` (migrations people + gloses), `npm run seed:database:ts`, puis `SELECT * FROM public.people;` via `docker exec postgresql psql …` → 4 personnes insérées
- [ ] 9. Entrée dans `documentation/journal.md` (optionnel)

## Fichiers modifiés

- `infra/database/seeds/seeds.json`
- `infra/import_json_file.ts` + `__tests__/infra/import_json_file.test.ts`
- `infra/database/seeds/create_gloses_and_seeds.ts` + `__tests__/infra/database/seeds/create_gloses_and_seeds.test.ts`

Hors périmètre : `gloses_seeds.sql` (seed SQL `seed:database:pg`) et renommage du script.
