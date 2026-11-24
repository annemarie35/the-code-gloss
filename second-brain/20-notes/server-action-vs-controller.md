---
type: note
title: Server Action vs controller
date: 2026-10-08
tags: [architecture, nextjs]
status: digéré
origin: private-doc/todo-refacto.md
---

##  should i extract http call in src/actions/people-actions.ts to move it to a controller ?

⏺ Non, ce n'est pas nécessaire ici. Voici pourquoi :

Ce fichier est un Server Action Next.js ('use server'), pas une couche de présentation
classique. Son rôle est précisément de faire le pont entre le formulaire et l'API — c'est
son unique responsabilité.

Extraire l'appel HTTP dans un "controller" n'apporterait rien car :

- Un controller existe déjà : c'est src/pages/api/people.ts qui reçoit la requête HTTP,
  valide l'origine, applique le rate limiting, et appelle le use case.
- Le Server Action n'est pas du domaine : il gère uniquement le mapping FormData → payload
  HTTP + retour UI. C'est la bonne granularité pour ce pattern Next.js.
- Tu créerais une abstraction pour une seule utilisation, ce qui va à l'encontre du principe
  YAGNI.

Ce qui pourrait valoir la peine en revanche : extraire le mapping FormData → objet personne
dans une fonction pure, testable indépendamment. Mais c'est un refactor distinct et
optionnel.


## Liens

- Area : [[architecture]] · [[frontend]]
