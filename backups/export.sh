#!/usr/bin/env bash

echo "Deleting CSV files.."
rm ./*.csv

echo "Exporting data"

psql --dbname "$POSTGRESQL_DATABASE_URL" \
 --echo-all \
 --file=export.sql

echo "Export finished"
