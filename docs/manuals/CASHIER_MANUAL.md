# Manuel Caissier - ERP Pharmaceutique SaaS V1.0 RC1

## Objectif

Le POS permet de vendre rapidement au comptoir, au clavier, au scanner ou en mode tactile.

## Ouvrir le POS

Menu : `Vente > POS`.

Au chargement :

- Le site vient du profil utilisateur.
- La devise POS est USD en interne.
- Les montants client sont aussi affiches en FC.
- Le client par defaut est `Client comptoir`.
- Le type par defaut est `CASH`.
- Le champ scan est prioritaire.

## Mode caisse

Bouton : `Mode caisse`.

Effets :

- Masque la sidebar.
- Affiche uniquement l'ecran POS.
- Agrandit les boutons et champs.
- Rend le total FC plus visible.

Utiliser `Quitter mode caisse` pour revenir au layout normal.

## Scanner code-barres

Le scanner USB agit comme un clavier.

1. Placer le curseur dans le champ scan.
2. Scanner.
3. Si le code correspond exactement a un article vendable, l'article est ajoute.
4. Le focus revient automatiquement au scan.

Si le meme article/lot FEFO est scanne plusieurs fois, la quantite de la ligne existante augmente.

## Recherche manuelle article

Dans le champ scan, taper :

- code article
- nom
- DCI
- dosage
- code-barres

Selectionner dans le popover.

## Client comptoir

Par defaut, la vente utilise `Client comptoir`.

Pour revenir au comptoir apres avoir choisi un client nominatif, cliquer `Client comptoir`.

## Client nominatif

Utiliser le champ Client ou le raccourci `F5`.

Recherche par :

- code client
- nom
- telephone

Apres selection, le POS revient au scan.

## CASH / ASSURANCE

Le type par defaut est `CASH`.

Utiliser `F6` ou le champ Type pour basculer vers `ASSURANCE`.

Pour une vente assurance :

- Un client nominatif est obligatoire.
- Une affiliation/membership doit exister.
- Le POS calcule part patient et part assurance.
- La part assurance devient une creance.

## Paiement FC / USD

Le POS affiche :

- Total USD.
- Total FC.
- Paye FC.
- Paye USD.
- Rendu FC.

Regles :

- Le FC est prioritaire pour le client.
- La comptabilite reste en USD.
- Le taux USD/CDF vient des parametres tenant.

## Paiement exact

Bouton : `Paiement exact`.

Raccourci : `F3`.

Il remplit le montant recu avec le total exact.

## Encaisser

Bouton : `ENCAISSER`.

Raccourci : `F10` ou `Ctrl+Entree`.

Le POS bloque si :

- aucune ligne article.
- paiement insuffisant.
- stock insuffisant.
- lot bloque ou expire.

## Impression facture

Apres validation, le POS peut lancer l'impression navigateur.

La facture affiche :

- Produits.
- Quantites.
- Prix FC en priorite.
- Total FC.
- Total USD en reference.
- Taux utilise.

## Affichage client

Bouton : `Affichage Client`.

Ouvre une vue client dediee affichant :

- articles.
- quantites.
- prix FC.
- total FC.

Si le navigateur bloque la fenetre, autoriser les popups pour le site.

## Raccourcis clavier

- `F2` : focus scan.
- `F3` : paiement exact.
- `F4` : modifier quantite.
- `F5` : client.
- `F6` : CASH / ASSURANCE.
- `F8` : nouvelle vente.
- `F9` : imprimer.
- `F10` : encaisser.
- `Echap` : fermer popover ou action en cours.

## Erreurs frequentes

| Message | Cause probable | Action |
|---|---|---|
| Stock insuffisant | Quantite demandee superieure au stock FEFO | Reduire quantite ou informer responsable |
| Lot expire | Le lot n'est pas vendable | Retirer le produit du rayon |
| Lot bloque | Lot bloque par responsable | Ne pas vendre |
| Paiement insuffisant | Montant recu trop faible | Corriger FC/USD |
| Veuillez selectionner un client assure | Vente assurance sans client valide | Choisir client assure |

## Bonnes pratiques

- Garder le focus dans le scan.
- Utiliser paiement exact seulement apres avoir recu l'argent.
- Verifier le rendu FC.
- Fermer ou controler la session caisse en fin de poste.
