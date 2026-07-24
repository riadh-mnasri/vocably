# Vocably

Une application web pour réviser et apprendre du vocabulaire anglais avec une répétition espacée façon Leitner (5 boîtes), pensée pour être ergonomique et addictive : cartes courtes, série (streak) à ne pas casser, XP à chaque révision.

[README in English](README.en.md)

## Fonctionnement

- Chaque mot vit dans une des 5 boîtes du système Leitner. Une bonne réponse fait monter le mot d'une boîte (intervalle de révision plus long) ; une mauvaise réponse le renvoie en boîte 1.
- Les mots dus aujourd'hui sont ceux dont la date de révision est passée.
- La progression (boîtes, série, XP, historique de révisions) est stockée en local dans le navigateur (`localStorage`), aucune donnée n'est envoyée à un serveur.

## Stack

- [Next.js](https://nextjs.org) (App Router, Turbopack) + TypeScript
- [Tailwind CSS](https://tailwindcss.com)
- [next-intl](https://next-intl.dev) pour l'interface bilingue français / anglais
- Déploiement sur [Vercel](https://vercel.com)

## Développement local

```bash
npm install
npm run dev
```

L'application est servie sur [http://localhost:7162](http://localhost:7162).

## Scripts

- `npm run dev` : serveur de développement (port 7162)
- `npm run build` : build de production
- `npm run start` : sert le build de production
- `npm run lint` : vérifie le code avec ESLint

## Déploiement

Le projet est déployé sur Vercel, avec déploiement automatique à chaque push sur `main`.

## Licence

© 2026 Riadh MNASRI
