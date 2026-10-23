# F1 Dashboard

An Angular 22 dashboard for real Formula 1 data from the free [OpenF1](https://openf1.org) API, built with the [`@sheep-ng/ui`](https://www.npmjs.com/package/@sheep-ng/ui) component library.

- **Season**: calendar of every meeting and session (2023 onward).
- **Standings**: driver and constructor championships after the latest race.
- **Session**: results with grid deltas, lap-time chart, sector bests, tyre strategy, pit stops, race control and weather.
- **Track replay**: animated car positions on the circuit outline, with a live running order.

## Getting started

```bash
npm install
```

```bash
npm start
```

Then open `http://localhost:4200/`. Run the unit tests with `npm test` and make a production build with `npm run build`.

## Project structure

```
src/app/
├── app.*                      Shell: nav bar, theme switcher, footer
├── app.routes.ts              Top level; lazy-loads each feature's routes
├── core/                      App-wide, UI-free code (import via `@core`)
│   ├── api/                   HTTP client, rate limiter, query builder, response store
│   ├── constants/             API limits and F1 constants (compound and flag colours, …)
│   ├── models/                OpenF1 response types
│   ├── services/              OpenF1Service: one method per endpoint
│   └── utils/                 Formatting, colour and session helpers
├── shared/                    Reusable UI building blocks (import via `@shared`)
│   ├── charts/                SVG scale and tick helpers
│   ├── components/            e.g. year-picker
│   ├── types/                 UI types shared with @sheep-ng (Tone)
│   └── utils/                 Generic array helpers
└── features/                  One folder per screen (import via `@features/...`)
    ├── season/
    ├── standings/
    ├── session/
    │   ├── session.constants.ts   Tabs, chart geometry, filters
    │   ├── session.models.ts      View models shared by the tabs
    │   ├── session.utils.ts       Pure helpers (+ spec)
    │   └── tabs/{results,laps,tyres,pits,control}/
    └── replay/
        ├── replay.constants.ts
        ├── replay.models.ts
        └── utils/             Track geometry and replay helpers (+ specs)
```

Conventions:

- Each component has its own `.ts`, `.html` and `.scss` files.
- Constants live in `*.constants.ts` files, view models in `*.models.ts` files, and pure logic in `*.utils.ts` files with a spec beside them.
- Pages load data with Angular `resource()` signals, through `OpenF1Service` only.
- Layout and chart styles use only the `--sheep-*` theme tokens, so light and dark mode follow the theme. Global layout classes (`.card`, `.grid-2`, `.skeleton`, `.chart`, …) are in `src/styles.scss`.

## OpenF1 notes

- No auth is needed, and CORS is open, so the browser calls `https://api.openf1.org/v1` directly.
- The free tier allows 3 requests per second and 30 per minute. `OpenF1Client` queues every request to stay inside those limits, caches responses in memory, persists small ones in localStorage, and retries on 429.
- Data during a live session needs a paid OpenF1 plan, so this app shows completed sessions only.
- Replay location data is fetched in 60-second windows for all cars, about 650 kB each, prefetched ahead of the playhead.

Data © their respective owners. OpenF1 is unofficial and for non-commercial use, and is not affiliated with Formula 1 or the FIA.
