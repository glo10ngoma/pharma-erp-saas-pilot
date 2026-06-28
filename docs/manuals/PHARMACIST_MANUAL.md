# Manuel Pharmacien / Responsable - ERP Pharmaceutique SaaS V1.0 RC1

## Role

Le pharmacien responsable pilote les operations : ventes, stocks, FEFO, assurances, rapports, notifications et analyses.

## Dashboard BI

Menu : `Pilotage > Dashboard BI`.

Le dashboard affiche :

- Chiffre d'affaires.
- Marge estimee.
- Valeur stock.
- Creances ouvertes.
- Caisse du jour.
- Lots proches expiration.
- FEFO Sante.
- Notifications critiques.

Utiliser les filtres de site et de periode pour analyser une pharmacie ou tout le tenant.

## Stocks

Menu : `Stock > Stocks`.

La page Stocks permet de consulter :

- Stock disponible.
- Stock reserve.
- Stock total.
- Stock minimum.
- Valeur achat.
- Valeur vente.
- Statut : disponible, faible, rupture.

Actions principales :

- Rechercher un article.
- Filtrer les ruptures ou stocks faibles.
- Consulter le detail.
- Exporter Excel/CSV/JSON.

## FEFO

Menus :

- `Stock > Produits a mettre en avant`
- `Stock > Rotation des rayons`

FEFO guide les decisions terrain :

- Mettre en avant les produits proches expiration.
- Retirer les lots expires.
- Reorganiser les rayons pour vendre d'abord les lots les plus anciens.

Les vues FEFO sont en lecture seule : elles orientent le travail sans modifier directement le stock.

## Produits a mettre en avant

Priorites :

- Rouge : expiration critique.
- Orange : expiration proche.
- Vert : surveillance.

Actions recommandees :

- Mettre en tete de rayon.
- Promotion recommandee.
- Rotation immediate.
- Retirer du rayon.

## Ventes

Menus :

- `Vente > POS`
- `Vente > Ventes`

Le POS est concu pour la caisse rapide. Le responsable peut aussi consulter les ventes valides, les details et les paiements.

Verifier regulierement :

- Ventes annulees.
- Ventes assurance.
- Paiements.
- Factures imprimees.

## Assurances

Menu : `Assurances & Creances`.

Le cycle assurance couvre :

1. Vente assurance.
2. Creation de creance.
3. Suivi creance.
4. Bordereau.
5. Paiement assurance.
6. Relance ou litige si necessaire.

V1.0 RC1 conserve les paiements de creance en backend. Les bordereaux/litiges V2 sont locaux au frontend.

## Rapports

Menu : `Rapports`.

Rapports utiles au pharmacien :

- Ventes.
- Achats.
- Stocks.
- Inventaires.
- FEFO.
- Caisse.
- Assurance.
- Marges.

Chaque rapport propose apercu, impression, Excel, CSV et JSON. Le PDF est desactive.

## Notifications

Menu : `Notifications`.

Les notifications signalent :

- Stock faible.
- Rupture.
- Lot expire ou proche expiration.
- Creance agee.
- Caisse ouverte ou non ouverte.
- Inventaire non valide.

Utiliser les actions pour ouvrir le module concerne.

## Analyses

Menu : `Analyses`.

Pages importantes :

- Vue d'ensemble.
- ABC/Pareto.
- Rotation stocks.
- Produits dormants.
- Marges.
- Fournisseurs.
- Vendeurs.

Certaines analyses sont estimatives selon les donnees disponibles.

## Bonnes pratiques

- Verifier FEFO chaque matin.
- Controler les stocks faibles avant commandes.
- Verifier les creances assurance chaque semaine.
- Consulter les notifications avant ouverture.
- Imprimer ou exporter les rapports de fin de jour si necessaire.
