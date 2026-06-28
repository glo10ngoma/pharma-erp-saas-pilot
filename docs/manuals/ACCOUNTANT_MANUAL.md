# Manuel Comptable - ERP Pharmaceutique SaaS V1.0 RC1

## Objectif

Ce manuel explique l'utilisation du module Finance et les liens avec ventes, caisse, creances et comptabilite USD.

## Devise comptable

Regle V1.0 RC1 :

- La comptabilite interne reste en USD.
- Le POS peut afficher et encaisser en FC.
- Les paiements FC sont convertis en equivalent USD selon le taux tenant utilise.

## Comptes

Menu : `Finance > Comptes`.

Comptes principaux :

- `57` Caisse.
- `52` Banque.
- `41` Clients / Creances.
- `70` Ventes marchandises.
- `60` Achats marchandises.
- `37` Stock marchandises.
- `709` Remises accordees.

Fonctions :

- Rechercher.
- Exporter.
- Consulter les comptes actifs.

## Journaux

Menu : `Finance > Journaux`.

Journaux principaux :

- `VEN` ventes.
- `CAI` caisse.
- `BAN` banque.
- `OD` operations diverses.

## Ecritures

Menu : `Finance > Ecritures`.

Les ecritures automatiques sont creees par :

- Vente CASH.
- Vente ASSURANCE.
- Paiement creance.
- Depense caisse.

Verifier :

- Date.
- Journal.
- Source.
- Debit.
- Credit.
- Statut.
- Equilibre.

Une ecriture postee ne doit pas etre modifiee.

## Grand livre

Menu : `Finance > Grand livre`.

Utiliser le filtre compte pour consulter les mouvements :

- compte 57 pour caisse.
- compte 41 pour creances.
- compte 70 pour ventes.

## Balance

Menu : `Finance > Balance`.

Verifier :

- Total debit.
- Total credit.
- Ecart.
- Solde debiteur / crediteur.

La balance doit rester equilibree apres les workflows standards.

## Caisse

Les mouvements caisse alimentent indirectement le suivi comptable :

- `SALE_PAYMENT`.
- `RECEIVABLE_PAYMENT`.
- `EXPENSE`.

## Creances

Les ventes assurance creent une creance assurance.

Lors du paiement de creance :

- Debit caisse ou banque.
- Credit clients / creances.

Le backend existant cree l'ecriture comptable automatiquement.

## Rapports finance

Utiliser :

- rapports caisse.
- rapports assurance.
- grand livre.
- balance.
- exports finance.

## Bonnes pratiques

- Verifier la balance apres operations importantes.
- Controler les paiements de creance.
- Revoir les sessions caisse fermees avec ecart.
- Exporter les rapports comptables en fin de periode.

## Limites connues

- Pas de cloture comptable avancee en V1.0 RC1.
- Pas de multi-devise comptable complet : USD reste la base.
- Les rapports PDF sont desactives.
