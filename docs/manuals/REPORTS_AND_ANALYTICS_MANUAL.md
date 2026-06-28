# Manuel Rapports, BI, Notifications et Analyses - ERP Pharmaceutique SaaS V1.0 RC1

## Dashboard BI

Menu : `Pilotage > Dashboard BI`.

Objectif :

- Donner une vue decisionnelle au responsable.
- Visualiser ventes, stock, marge, caisse, creances et FEFO.

Elements :

- cartes KPI.
- graphiques.
- alertes intelligentes.
- filtres site/periode.

## Rapports imprimables

Menu : `Rapports`.

Rapports disponibles :

- Ventes.
- Achats.
- Stocks.
- Inventaires.
- FEFO.
- Caisse.
- Assurance.
- Marges.

Chaque rapport propose :

- filtres.
- apercu imprimable.
- Excel.
- CSV.
- JSON.
- PDF desactive.

## Impression

Le bouton `Imprimer` utilise l'impression navigateur.

L'aperçu contient :

- titre.
- pharmacie.
- site.
- periode.
- date impression.
- tableau.
- totaux.
- pied de page.

## Notifications

Menu : `Notifications`.

Types :

- Stock.
- FEFO.
- Caisse.
- Assurance.
- Inventaire.
- Systeme.

Actions :

- voir module concerne.
- marquer lu.
- marquer non lu.
- supprimer si autorise.

Les notifications V1.1 sont generees au chargement, sans websocket ni cron.

## Statistiques avancees

Menu : `Analyses`.

### Vue d'ensemble

Synthese dirigeant :

- CA periode.
- marge brute.
- valeur stock.
- produits a risque.
- creances.
- top alertes.

### ABC / Pareto

Classe les produits selon leur contribution au chiffre d'affaires :

- A jusqu'a 80%.
- B de 80 a 95%.
- C au-dela.

### Rotation stocks

Calcule :

- quantite vendue.
- stock moyen estime.
- rotation.
- jours de couverture.

### Produits dormants

Detecte les produits en stock sans vente recente.

Recommandations :

- promotion.
- reduire commande.
- surveiller.

### Marges

Analyse :

- marge par produit.
- marge par categorie.
- top marges.
- marges faibles.

### Fournisseurs

Analyse :

- achats par fournisseur.
- valeur achetee.
- nombre commandes.
- dependance fournisseur.

### Vendeurs

Si les donnees vendeur sont disponibles :

- CA par vendeur.
- nombre ventes.
- panier moyen.

Sinon, la page affiche un etat de donnees insuffisantes.

## Limites connues

- Certaines analyses sont estimatives en V1.0 RC1.
- Les exports PDF sont desactives.
- Les notifications ne sont pas temps reel.
- Les rapports dependent de la qualite des donnees source.
