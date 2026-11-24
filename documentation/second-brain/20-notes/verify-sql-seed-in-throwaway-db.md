---
type: note
title: Vérifier un seed SQL sans toucher la base de dev
date: 2026-11-24
tags: [testing, database, docker]
status: digéré
---

# Vérifier un seed SQL sans toucher la base de dev

Pour tester un script de seed, on ne l'exécute pas directement sur la base de dev : il n'a pas de garde-fou contre les doublons, chaque run ajoute les mêmes lignes. Deux options :

1. **Transaction annulée** : `BEGIN` → seed → `SELECT` → `ROLLBACK`. Rapide, mais ça tourne sur la vraie base.
2. **Base jetable** : `create database` → migrations → seed → `SELECT` → `drop database`. La base de dev n'est jamais lue ni écrite.

## Exemple

Contexte : `../../../infra/database/seeds/gloses_seeds.sql` insérait les gloses sans `themes` ni `created_at`. Correction : ajout des colonnes `themes` (`ARRAY['CRAFT']`, valeurs prises dans `THEMES` de `src/core/domain/models/Glose.ts`) et `created_at` (`NOW()`).

### Option 1 — transaction annulée

```bash
docker exec -i postgresql psql -v ON_ERROR_STOP=1 \
  --dbname "host=localhost port=5432 user=username password=password123 dbname=postgres" <<'EOF'
BEGIN;
\i /tmp/seeds/gloses_seeds.sql
SELECT title, themes, created_at FROM gloses ORDER BY id DESC LIMIT 3;
ROLLBACK;
EOF
```

`NOW()` renvoie l'heure de **début de transaction** : dans un `BEGIN … ROLLBACK`, les 3 lignes ont exactement le même `created_at`. Lancé avec `psql --file`, chaque `INSERT` est sa propre transaction, donc les horodatages diffèrent de quelques µs.

### Option 2 — base jetable (méthode du skill `/verify`)

```bash
P='host=localhost user=username password=password123'
docker exec postgresql psql "$P dbname=postgres" -c "create database verify_seed"
docker exec postgresql psql -v ON_ERROR_STOP=1 -q "$P dbname=verify_seed" --file=/tmp/scripts/migrations.sql
docker exec postgresql psql -v ON_ERROR_STOP=1 "$P dbname=verify_seed" --file=/tmp/seeds/gloses_seeds.sql
docker exec postgresql psql "$P dbname=verify_seed" -c "select title, themes, created_at from gloses order by id"
docker exec postgresql psql "$P dbname=postgres" -c "drop database verify_seed"
```

- `ON_ERROR_STOP=1` : psql s'arrête à la première erreur au lieu de continuer.
- Les étapes 1 et 5 se connectent à `postgres` uniquement pour créer / supprimer `verify_seed`.

## Piège rencontré : bind mount périmé

`npm run seed:database:pg` lit `/tmp/seeds/gloses_seeds.sql` **dans le conteneur**. Erreur : `No such file or directory`.

- `docker inspect postgresql --format '{{json .Mounts}}'` : les mounts `infra/database/seeds → /tmp/seeds` et `infra/database/scripts → /tmp/scripts` sont bien configurés.
- `docker exec postgresql ls -la /tmp/seeds` : dossier **vide**. Le partage de fichiers de Docker Desktop était périmé.

Correction, sans rien changer au repo :

```bash
docker compose up --wait --detach --force-recreate postgresql
```

Les données survivent : compose rattache le volume anonyme `/bitnami/postgresql` au nouveau conteneur (7 gloses avant, 7 après, vérifié avec `select count(*)`).

## Quand l'utiliser / ne pas l'utiliser

- **Transaction annulée** : vérification rapide d'un `INSERT` / `UPDATE` quand le schéma existe déjà.
- **Base jetable** : quand on veut aussi valider les migrations, ou ne prendre aucun risque sur la base de dev.
- Le rollback n'annule pas tout : `nextval` sur une séquence n'est pas annulé, donc les prochains `id` de la base de dev sautent.

## Liens

- Area : [[testing]]
- Voir aussi : [[testcontainers-with-colima]]
