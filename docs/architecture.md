# Architecture de code-gloss

```mermaid
flowchart TD
    subgraph Client["Navigateur"]
        P_index["pages/index.tsx"]
        P_rss["pages/rss.tsx"]
        P_feeds["pages/feeds.tsx"]
        P_people["pages/people.tsx"]
        C_gloseForm["components/gloss-terms-form.tsx"]
        C_peopleForm["components/people-form.tsx"]
    end

    subgraph Actions["Actions — src/actions (httpClient)"]
        A_gloses["gloses-actions.ts"]
        A_feeds["feeds-actions.ts"]
        A_people["people-actions.ts"]
    end

    subgraph API["API routes — src/pages/api (origin check + rate limit)"]
        R_gloses["gloses.ts"]
        R_rss["rss.ts"]
        R_feeds["feeds.ts"]
        R_people["people.ts"]
    end

    subgraph Services["Services — src/lib/service"]
        S_getGloses["get-gloses.ts"]
        S_addGlose["add-glose.ts"]
        S_getFeeds["get-feeds.ts"]
        S_getPeople["get-people.ts"]
    end

    subgraph Domain["Domaine — src/core/domain"]
        U_addPerson["usecases/add-person.ts"]
        U_deletePerson["usecases/delete-person.ts"]
    end

    subgraph Infra["Infra — repositories"]
        Repo_gloses["database/repositories.ts"]
        Repo_person["repositories/person_repository.ts"]
        Pool["database/connectionPool.ts"]
    end

    DB[("PostgreSQL")]
    Ext(["Flux RSS externes"])

    P_index & P_rss & C_gloseForm --> A_gloses
    P_feeds --> A_feeds
    P_people & C_peopleForm --> A_people

    A_gloses --> R_gloses
    A_feeds --> R_feeds
    A_people --> R_people

    R_gloses --> S_getGloses & S_addGlose
    R_rss --> S_getGloses
    R_feeds --> S_getFeeds
    R_people --> S_getPeople & U_addPerson & U_deletePerson

    S_getGloses & S_addGlose --> Repo_gloses
    S_getPeople --> Repo_person
    U_addPerson & U_deletePerson --> Repo_person
    S_getFeeds -->|fetch serveur| Ext

    Repo_gloses & Repo_person --> Pool --> DB
```

## Écarts au modèle cible

- Le repository des gloses est dans `infra/database/repositories.ts`, celui des personnes dans `infra/repositories/person_repository.ts`.
- La route `people.ts` passe par des usecases du domaine (`add-person`, `delete-person`), alors que les autres routes appellent directement les services.
