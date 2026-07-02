# The Code Gloss

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).
The purpose is to practice React since I didn't work with it since October 2021.
Also make some practice of [clean archigonale architecture](https://www.youtube.com/watch?v=QV-CHSmlOh8).

Another purpose was added after, use Claude to make an opinion about it. Well, since I used it, I realized that I don't want to do code reviews anymore, even though I enjoy them.
Plus, I want to add more and more features. Looks like an addictive effect, don't you think ?
Well, I am turning this project onto a good legacy project to practice making refactoring, improve architecture, and tests.

## Why code gloss?

I take many notes while working, sometimes a link, a word, a notion, a quote related to my everyday developer practice.
But it is all about papers, notebooks, a public and a private TIL, and, well, I tried evernote, joplin, zetllr, mind maps, in French or English, and various tools, and those are different sources of truth.

:gem: So my goal is a definitive code glossary, the code gloss. :gem:

This is a work in progress; maybe I will find one day the ultimate methodology to take notes.
My favorite is a simple markdown file now, my own property (exporting files from one tool to another is sometimes a nightmare or a time devourer)

So, the code gloss will be a simple form for the moment.

## Prerequisites

Install [Direnv](https://direnv.net/)
Docker
NodeJs
[Just](https://just.maciejwalkowiak.com/)

## Start database & run migrations

If you use Direnv, create a .envrc file

```bash
cp .envrc.sample .envrc
```

Feed env variables with `direnv allow`

You need to have [Docker](https://www.docker.com/) installed on your machine and running.
Run `docker compose up` to start docker postgres container
or `docker compose up -d --build` to start database with migrations executed
If not, then `npm run create:database` to create database
Then `seed:database:pg` or `seed:database:pg` to seed database with some data

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

~~## Create and run a migration with knex~~

~~- add a migration file with an explicit name, example "update_users_name_column_to_text_type" `npx knex migrate:make migration_name`~~
~~- add the code to create query~~
~~- run the migration with `npx knex migrate:latest`~~
~~- rollback migration if needed with `npx knex migrate:rollba[package.json](package.json)`~~

~~## Create and add seeds~~

~~- create a new seed file `npx knex seed:make add_gloses`~~
~~- run the seed `npx knex seed:run`~~

~~[source](https://knexjs.org/guide/migrations.html#migration-cli)~~

~~## Deploy on Scalingo~~

~~There is a tutorial I wrote [here](https://github.com/annemarie35/TIL/blob/master/OPSERIES/SCALINGO/deployement.md)~~

~~Now I use `git push frontend-scalingo main` to push the code in production.~~
