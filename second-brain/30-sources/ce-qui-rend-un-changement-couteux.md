---
type: source
title: Ce qui rend un changement coûteux, et pourquoi les agents IA aggravent la note
date: 2026-10-08
tags: [architecture, ai, testing]
status: lu
source: https://lacrafterie.tech/blog/ce-qui-rend-un-changement-couteux/
author: Edouard Mangel
format: article
---

# Ce qui rend un changement coûteux, et pourquoi les agents IA aggravent la note

## Résumé en 3 lignes

- Un changement coûte cher pour trois raisons : le code est **difficile à comprendre**, la modification est **éparpillée**, ou on n'a **aucune certitude** de ne rien casser.
- Il faut distinguer trois niveaux : **problème de conception** (cause) → **code smell** (symptôme) → **coût** (conséquence). Traiter le symptôme laisse la dette en place.
- Les agents IA ne rendent pas la maintenabilité obsolète : ils **amplifient** les trois causes.

## Idées clés

- **Compréhension difficile** : code long, niveaux d'abstraction mélangés, noms trompeurs, connaissance implicite, effets de bord invisibles.
- **Modifications éparpillées** (Shotgun Surgery) : une même décision métier recopiée à plusieurs endroits, donc des changements multiples et des oublis.
- **Absence de certitude** : sans tests de comportement, on contourne (flag, duplication) au lieu de modifier.
- « Le coût n'est que le dernier maillon d'une chaîne qui en compte trois. »
- Les agents paient aussi pour comprendre (fenêtre de contexte limitée), oublient les dépendances que le compilateur ne voit pas, reproduisent et multiplient les smells existants, et manquent de feedback sans tests.
- « Un agent est remarquablement efficace pour un changement local. Il est mauvais pour retrouver tous les endroits où une même décision a été recopiée. »
- La relecture humaine devient le nouveau goulet d'étranglement. « Le code facile à changer n'est pas devenu un luxe. C'est ce qui sépare une équipe qui va plus vite avec des agents d'une équipe qui produit de la dette plus vite. »

## Ce que j'en pense

<!-- À compléter -->

- Parmi les trois causes, laquelle coûte le plus cher dans code-gloss aujourd'hui ? Et au travail ?
- D'accord pour dire que les agents amplifient les smells ? Le harness (guides + sensors, cf. [[harness-engineering-fowler]]) suffit-il à compenser, ou faut-il d'abord refactorer ?

## Application concrète

- [ ] (proposé) Chercher les décisions métier recopiées dans code-gloss (ex. validation d'un glose, limites du rate limiting, liste des thèmes) et les centraliser dans `src/core/domain/`.
- [ ] (proposé) Pour chaque couche (Page → Action → API → Service → Repository), vérifier qu'il existe au moins un test de comportement, pas seulement des tests de mocks, pour lever la « absence de certitude » avant de déléguer un changement à un agent.
- [ ] (proposé) En équipe : utiliser la grille cause → smell → coût en revue de code pour nommer le problème de conception plutôt que le symptôme.

## Liens

- Notes : [[agent-harness-guides-and-sensors]] · [[vitest-mocking-patterns]]
- Sources : [[harness-engineering-fowler]]
- Area : [[architecture]] · [[ai-engineering]] · [[testing]]
