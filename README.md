# Grammar App Quiz

An interactive English grammar drill. The app shows a random **subject + cue**
(e.g. `She + work`) tagged with a **tense**, **type**, and **sentence form**.
You form the correct sentence in your head, then reveal the answer.

Built with **React + Vite + TypeScript**. Fully static — no backend.

## What it covers

- **All 12 tenses** (present / past / future × simple / continuous / perfect / perfect continuous)
- **Three types**: Verbal (action verb), Nominal (to be + complement), Passive voice
- **Four forms**: Positive (+), Negative (−), Yes/No question (?), WH-question
- **80 verbs** with explicit V1/V2/V3/-ing/3rd-singular forms (regular + irregular)
- Subject-verb agreement across every person/number (I, he, the students, a pilot, ...)

Grammar rules enforced by the engine:

- **Passive** is built from the active sentence: the object becomes the subject
  and the doer moves to a `by ...` phrase (*The teacher explains the lesson* →
  *The lesson is explained by the teacher*). Supports + / − / ? / WH.
- **Continuous** tenses exclude **stative** verbs (no `-ing`).
- The "being" nominal form (temporary behavior) is used only with **behavioral
  adjectives** (rude, careful), never state adjectives (happy, tired).
- Perfect-continuous has **no true nominal**; it falls back to the perfect
  `been` form, with an on-screen note explaining the shift.
- Subjects are matched to verbs/complements by **entity** (a dog never becomes
  a teacher) and plural subjects get plural nouns (*they are doctors*).
- **Time signals** per tense (yesterday, for 2 hours, by 2028, ...) keep
  otherwise-identical tenses distinguishable.
- Rare-but-valid forms (e.g. `will be being`, perfect-continuous passive) and
  stative-verb traps are hidden from the random pool behind a toggle.

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build      # type-check + static build into dist/
npm run preview    # preview the production build locally
```

## Deploy to GitHub Pages

1. Create a GitHub repo named **`grammar-app-quiz`** (the name must match
   `base` in `vite.config.ts`). To use a different name, update `base`.
2. Push to the `main` branch.
3. In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. The included workflow (`.github/workflows/deploy.yml`) builds and publishes
   automatically on every push to `main`.

Live URL: `https://<your-username>.github.io/grammar-app-quiz/`

## Project structure

```
src/
  grammar/
    types.ts            domain types
    engine.ts           conjugation for all 12 tenses (verbal/nominal/passive)
    generator.ts        random question generator + filters + grammar rules
    labels.ts           display labels and tense ordering
    data/
      subjects.ts       subjects across person/number
      verbs.ts          80 verbs with explicit forms
      complements.ts    complements for nominal sentences
  App.tsx               UI
  index.css             styles
```
