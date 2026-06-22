# code-gloss justfile

# List available recipes
default:
    @just --list

# Development
dev:
    npm run dev

build:
    npm run build

start:
    npm run start

# Database
db-start:
    npm run start:database

db-create:
    npm run create:database

db-migrate-people:
    npm run migrate:create-people

db-seed:
    npm run seed:database:pg

db-seed-ts:
    npm run seed:database:ts

# Testing
test:
    npm run test

test-db:
    npm run test:db

test-integration:
    npm run test:integration

test-coverage:
    npm run test:coverage

test-watch:
    npm run test:watch

# Linting & formatting
lint:
    npm run lint

lint-fix:
    npm run lint:fix

format:
    npm run format

type-check:
    npm run type-check

# Check everything
check: format lint-fix type-check test
