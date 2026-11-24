# Second brain — veille technique

Espace personnel de veille. Markdown pur, liens `[[wiki]]`, ouvrable comme vault Obsidian.

## Structure

| Dossier        | Rôle                                                           |
| -------------- | -------------------------------------------------------------- |
| `00-inbox`    | Capture brute : un lien + une ligne « pourquoi ». Pas de tri.  |
| `10-journal`  | Une note par semaine : `YYYY-Www.md` (ex. `2026-W41.md`).      |
| `20-notes`    | Notes atomiques permanentes : 1 concept = 1 fichier, mes mots. |
| `30-sources`  | Fiches de lecture : articles, talks, livres, podcasts.         |
| `40-areas`    | Domaines suivis en continu (MOC = pages d'index qui lient).    |
| `50-radar`    | Mon tech radar : Adopt / Trial / Assess / Hold.                |
| `60-projects` | Veille liée à un objectif borné dans le temps.                 |
| `90-archives` | Ce qui n'est plus actif.                                       |
| `_templates`  | Modèles de notes.                                              |

## Workflow

```
capture (inbox) → lecture (fiche source) → digestion (note atomique) → action (radar / spike / ADR)
```

| Fréquence       | Action                                                                    | Durée  |
| --------------- | ------------------------------------------------------------------------- | ------ |
| Au fil de l'eau | Capturer dans `00-inbox`                                                 | 30 s   |
| 2–3×/semaine    | Lire 1–2 items, créer une fiche `30-sources`                             | 20 min |
| Vendredi        | Note hebdo, vider l'inbox, extraire 1–3 notes atomiques                   | 30 min |
| Mensuel         | Revoir le radar, archiver, choisir 1 sujet à expérimenter dans code-gloss | 1 h    |

**Règle d'or : pas de fiche sans « application concrète ».** Sinon, c'est une pile de favoris.

### Avec Claude Code

- `/veille <url> [pourquoi]` : crée la fiche dans `30-sources`, la relie aux areas, l'ajoute à la note hebdo et coche l'inbox.
- `/veille` sans argument : propose de traiter un item de l'inbox.
- `/weekly [YYYY-Www]` : prépare la note hebdo, trie l'inbox avec moi, suggère des notes atomiques et des mouvements de radar.

## Conventions

- **Noms de fichiers** : `kebab-case.md`, en anglais ou français mais cohérent dans un dossier.
- **Frontmatter** obligatoire (voir `_templates`) : `type`, `title`, `date`, `tags`, `status`.
- **Status** : `inbox` → `lu` → `digéré` → `archivé`.
- **Tags** (minuscules, courts) : `architecture`, `security`, `frontend`, `testing`, `ai`, `leadership`, `devops`, `database`, + techno (`nextjs`, `react`, `typescript`…).
- Chaque note atomique est liée à **au moins une** area (`[[security]]`, `[[frontend]]`…).

## Sources de veille

- **Radars & synthèses** : ThoughtWorks Technology Radar, InfoQ Trends Reports, State of JS
- **Blogs** : martinfowler.com, Simon Willison, Kent C. Dodds, Josh Comeau, Overreacted
- **Newsletters** : The Pragmatic Engineer, Bytes, TLDR, JavaScript Weekly, Node Weekly
- **Releases** : changelogs Next.js, React, Node.js, TypeScript, Vitest, Playwright (GitHub « Watch → Releases »)
- **Sécurité** : GitHub Security Advisories, OWASP, CVE des dépendances du projet
- **Talks** : QCon, Devoxx, React Summit, JSConf, NDC
