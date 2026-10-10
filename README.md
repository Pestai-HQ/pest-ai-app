# pest-ai-app

Application PEST AI (PWA installable) : expériences Producteur et Agent terrain.
Documentation : dépôt `pest-ai-docs`.

## Principes
- Une seule application, deux expériences selon le rôle.
- Offline-first : UUID générés côté client, file d'envoi locale, statut de synchro visible.
- Toute donnée passe par `src/api/` (données fictives pour l'instant, vrai back-end ensuite).
- Textes dans `src/i18n/` (français, wolof, pulaar).

## Structure
- `public/` : manifest et icônes de la PWA
- `src/screens/` : écrans (P-xx Producteur, A-xx Agent)
- `src/components/` : composants partagés (badge AgroID, statut de synchro, etc.)
- `src/i18n/` : traductions
- `src/api/` : accès aux données (mock puis API `/api/v1/`)
- `docs/` : notes propres à l'application

## Première étape
Parcours Producteur : connexion → parcelle → photo → résultat → conseil audio → historique.
