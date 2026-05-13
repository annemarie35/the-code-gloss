#!/usr/bin/env bash

echo "Importing CSV files.."

psql --dbname "$POSTGRESQL_DATABASE_URL" \
  --no-psqlrc \
  --echo-all \
  --file=import.sql

echo "Import finished"
