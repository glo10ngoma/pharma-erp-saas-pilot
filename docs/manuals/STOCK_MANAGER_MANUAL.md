# Manuel Magasinier / Gestionnaire Stock - ERP Pharmaceutique SaaS V1.0 RC1

## Role

Le gestionnaire stock suit les achats, lots, stocks, transferts, inventaires et rotations FEFO.

## Achats

Menu : `Stock > Achats`.

Fonctions :

- Liste achats.
- Recherche et filtres.
- Export Excel/CSV/JSON.
- Detail achat.
- Nouvel achat via `/purchases/new`.

## Nouvel achat

La page `/purchases/new` est une page complete, pas une modal.

Elle permet :

- informations generales.
- lignes multi-articles.
- selection article par popover.
- lot.
- expiration.
- quantite.
- prix achat.
- prix vente.
- total automatique.

Validation achat :

- Cree ou reutilise les lots.
- Augmente le stock.
- Cree mouvements `PURCHASE_IN`.
- Cree audit log.

## Lots

Menu : `Stock > Lots`.

Verifier :

- numero lot.
- article.
- expiration.
- prix achat/vente.
- quantite disponible.
- statut bloque/expire/proche expiration.

Actions :

- Voir detail.
- Bloquer lot.
- Debloquer lot.
- Exporter.

## Stocks

Menu : `Stock > Stocks`.

La page affiche :

- stock disponible.
- stock reserve.
- stock total.
- stock minimum.
- statut.
- valeur achat.
- valeur vente.

## Stock a date

Le stock a date reconstruit un stock theorique depuis `stock_movements`.

Limite V1.0 RC1 :

- La precision depend de l'historique disponible.
- La reconstruction est en lecture seule.
- Aucun stock n'est modifie.

## Transferts

Menu : `Stock > Transferts`.

Workflow :

1. Creer transfert DRAFT.
2. Choisir site source et destination.
3. Ajouter article/lot/quantite.
4. Valider.

Validation :

- Diminue stock source.
- Augmente stock destination.
- Cree `TRANSFER_OUT`.
- Cree `TRANSFER_IN`.

## Inventaires

Menu : `Stock > Inventaires`.

Workflow :

1. Creer inventaire.
2. Demarrer.
3. Compter physiquement.
4. Cloturer.
5. Valider.

Regle critique :

- Le stock reel ne doit jamais etre modifie directement.
- Les corrections passent par `INVENTORY_GAIN` ou `INVENTORY_LOSS`.

## FEFO

Menus :

- `Produits a mettre en avant`.
- `Rotation des rayons`.

Utilisation quotidienne :

- Identifier les lots proches expiration.
- Prioriser les lots FEFO.
- Reorganiser les rayons.
- Retirer les lots expires.

## Rotation des rayons

Objectif :

- Placer devant les lots les plus proches expiration.
- Eviter les pertes.
- Guider les equipes sans modifier le stock.

## Bonnes pratiques

- Saisir une expiration future pour tout lot.
- Ne jamais vendre ou conserver en rayon un lot expire.
- Bloquer un lot douteux.
- Verifier les stocks faibles chaque matin.
- Imprimer ou exporter les inventaires valides.
