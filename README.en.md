# Vocably

A web app for reviewing and learning English vocabulary using Leitner-style spaced repetition (5 boxes), designed to be ergonomic and addictive: short cards, a streak worth keeping, XP on every review.

[README en français](README.md)

## How it works

- Each word lives in one of 5 Leitner boxes. A correct answer moves a word up a box (longer review interval); a wrong answer sends it back to box 1.
- Words due today are the ones whose review date has passed.
- Progress (boxes, streak, XP, review history) is stored locally in the browser (`localStorage`) : no data is sent to a server.

## Stack

- [Next.js](https://nextjs.org) (App Router, Turbopack) + TypeScript
- [Tailwind CSS](https://tailwindcss.com)
- [next-intl](https://next-intl.dev) for the bilingual French / English interface
- Deployed on [Vercel](https://vercel.com)

## Local development

```bash
npm install
npm run dev
```

The app is served at [http://localhost:7162](http://localhost:7162).

## Scripts

- `npm run dev` : development server (port 7162)
- `npm run build` : production build
- `npm run start` : serve the production build
- `npm run lint` : check the code with ESLint

## Deployment

The project is deployed on Vercel, with automatic deployment on every push to `main`.

## License

© 2026 Riadh MNASRI
