# SEO V2 Dashboard

Interface de pilotage pour les audits SEO : gestion des sites, lancement des analyses, suivi des résultats et contrôle des accès.

## Stack

- Next.js 15 et TypeScript
- Supabase pour l’authentification et les données applicatives
- Stripe pour la souscription
- Vitest pour les tests unitaires

## Démarrer

```bash
npm install
Copy-Item .env.example .env.local
npm run dev
```

Renseignez les variables Supabase, Stripe et l’URL du moteur SEO dans `.env.local`. Ce fichier est local et ne doit jamais être versionné.

## Vérifications

```bash
npm run typecheck
npm run lint
npm test -- --run
```

## Structure

- `src/app` — pages, routes API et écrans du dashboard
- `src/components` — composants réutilisables
- `src/lib` — intégrations et utilitaires
- `supabase` — migrations et fonctions associées

Le moteur d’analyse SEO est maintenu dans le projet compagnon `seo-v2-engine`.
