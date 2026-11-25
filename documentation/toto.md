Étape 4 : pages et composants

┌─────────────────────────────────────┬────────┬────────┐
│ Fichier │ Avant │ Après │
├─────────────────────────────────────┼────────┼────────┤
│ src/pages/feeds.tsx │ 8,6 % │ 90,5 % │
├─────────────────────────────────────┼────────┼────────┤
│ src/pages/index.tsx │ 34,8 % │ 91,3 % │
├─────────────────────────────────────┼────────┼────────┤
│ src/pages/about.tsx │ 33,3 % │ 100 % │
├─────────────────────────────────────┼────────┼────────┤
│ src/components/gloss-grid.tsx │ 61 % │ 97,6 % │
├─────────────────────────────────────┼────────┼────────┤
│ src/components/gloss-terms-form.tsx │ 60,4 % │ 95,8 % │
└─────────────────────────────────────┴────────┴────────┘

- Page Feeds : les tests sont réécrits pour couvrir l'ajout, la suppression, le chargement depuis
  localStorage, les erreurs, le message de chargement, les URLs en double et l'affichage des
  articles. Un test sous React.StrictMode couvre la déduplication : en StrictMode, l'effet
  s'exécute deux fois et charge deux fois les flux sauvegardés.
- Page d'accueil : le test « Render with errors » ne testait pas ce qu'il annonçait. Il faisait
  le rendu avant de mocker fetch et vérifiait le message de chargement, pas l'erreur. Je l'ai
  corrigé et j'ai ajouté les tests du filtre par thème (sélection, désélection, plusieurs
  thèmes).
- Formulaire : j'ai ajouté les cas suivants : champs remplis uniquement d'espaces, thème
  manquant, libellé « Loading », message d'erreur.
- Grille et About : la grille a maintenant un test par couleur de tag, plus un test pour un tag
  inconnu. Pour About, je vérifie qu'aucun paragraphe n'est vide, sans recopier le texte dans le
  test.

Les 234 tests passent, ainsi qu'ESLint, Prettier et la vérification de types.

Un piège à connaître : une action asynchrone qui ne se termine jamais dans un test bloque les
actions useActionState des tests suivants, même après démontage du composant. C'est ce qui a fait
échouer un test qui passait avant. Le test « Loading » résout donc sa promesse à la fin, et un
commentaire l'explique.

Les survivants restants sont quasiment tous des mutants qu'aucun test ne peut tuer, par exemple :

- un rendu conditionnel d'une chaîne vide ;
- le tableau de dépendances d'un useEffect ;
- un trim() sur un champ type="url", que le navigateur nettoie déjà.

Restent les valeurs initiales de useState pour error (feeds, index). On ne peut pas les vérifier
sans passer par les classes CSS. Je les ai laissées.
