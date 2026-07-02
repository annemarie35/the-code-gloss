# syntax=docker/dockerfile:1
FROM bitnami/postgresql:latest
COPY infra/database/scripts/migrations.sql /docker-entrypoint-initdb.d/