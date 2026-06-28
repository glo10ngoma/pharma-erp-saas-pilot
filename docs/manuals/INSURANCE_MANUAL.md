# Manuel Assurances & Creances - ERP Pharmaceutique SaaS V1.0 RC1

## Objectif

Le module Assurance & Creances suit le cycle :

Vente assurance -> Creance -> Bordereau -> Envoi assurance -> Paiement -> Rapprochement -> Cloture.

## Organisations

Menu : `Assurances & Creances > Organisations`.

Representent :

- assurances.
- entreprises.
- ONG.
- autres organismes payeurs.

Champs principaux :

- code.
- nom.
- telephone.
- email.
- statut.

## Plans assurance

Menu : `Assurances & Creances > Plans assurance`.

Un plan definit :

- organisation.
- nom plan.
- pourcentage couverture.
- quote-part patient.

Exemple :

- plan 80% : assurance couvre 80%, patient paie 20%.

## Memberships

Menu : `Assurances & Creances > Memberships`.

Associe un client a une assurance et a un plan.

Verifier :

- client.
- organisation.
- plan.
- numero carte.
- statut actif.

## Vente assurance

Dans le POS :

1. Choisir un client nominatif.
2. Basculer le type vers `ASSURANCE`.
3. Choisir membership/plan.
4. Ajouter les produits.
5. Appliquer assurance.
6. Encaisser la part patient.
7. Valider.

Resultat :

- paiement patient cree.
- creance assurance creee.
- comptabilite conservee en USD.

## Creances

Menus :

- ancien : `/receivables`.
- V2 : `Assurances & Creances > Creances`.

La page V2 affiche :

- facture.
- date.
- client.
- organisation.
- montant.
- paye.
- solde.
- echeance.
- anciennete.
- statut.

## Paiements assurance

Menu : `Assurances & Creances > Paiements`.

V1.0 RC1 utilise l'endpoint backend existant `POST /receivables/:id/pay`.

La repartition V2 affecte le paiement aux creances ouvertes les plus anciennes.

Effets backend :

- mise a jour montant paye.
- mise a jour solde.
- statut `PAID` ou `PARTIALLY_PAID`.
- ecriture comptable automatique existante.

## Bordereaux

Menu : `Assurances & Creances > Bordereaux`.

Permet de creer un bordereau frontend :

- organisation.
- periode.
- creances incluses.
- montant.
- nombre factures.
- statut.

Limite V1.0 RC1 :

- Les bordereaux V2 sont stockes en `localStorage`.
- Pas encore de table backend dediee.

## Litiges

Menu : `Assurances & Creances > Litiges`.

Types :

- facture refusee.
- medicament refuse.
- montant refuse.
- erreur quantite.
- autre.

Limite :

- Les litiges V2 sont stockes en `localStorage`.

## Relances

Menu : `Assurances & Creances > Relances`.

Relances automatiques :

- >30 jours : relance simple.
- >60 jours : relance importante.
- >90 jours : relance critique.

## Rapports assurance

Utiliser :

- `Rapports > Assurances`.
- `Assurances & Creances > Dashboard`.
- exports Excel/CSV/JSON.

PDF desactive.

## Bonnes pratiques

- Verifier les creances ouvertes chaque semaine.
- Creer les bordereaux par organisation.
- Suivre les relances >60 jours.
- Documenter les litiges.
- Valider les paiements seulement apres reception effective.
