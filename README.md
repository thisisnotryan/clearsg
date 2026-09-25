# ClearSG

Plain-language haze and air quality guidance for Singapore. Built with React, TypeScript and Vite.

Designs: [ClearSG in Figma](https://www.figma.com/design/oPdvTluiw2paNePVRkSmkY/ClearSG)

## Run it

```bash
npm install
npm run dev
```

## Structure

- `src/screens/` — one file per screen (splash, onboarding steps, home)
- `src/components/` — shared UI (onboarding layout, region chip, persona card, map)
- `src/data/` — regions, personas, and the stand-in PSI/PM2.5 readings (`airQuality.ts`)
- `src/lib/profile.ts` — saves the chosen region and persona so returning users skip onboarding
- `src/assets/figma/` — icons and logo exported from Figma
- `src/index.css` — colour and font tokens from the Figma file

## Status

- Done: splash, onboarding (welcome, location, persona), Home Dashboard, Forecast, Live Map, Settings,
  Mask guide, Safety guide
- To do: deploy to Netlify and switch the notifications on (see NOTIFICATIONS.md)

Light and dark themes share one set of tokens in `src/index.css`; the Light mode switch in
Settings sets `data-theme` on the page. Icons the light designs restyle live in
`src/assets/figma/light/` and are picked by `src/assets/icons.ts`.

Readings older than 90 minutes, or a failed request, count as stale: a notice appears with a
Retry button and the readings below it are dimmed (`STALE_AFTER_MS` in `src/lib/airQualityContext.ts`).
Passing the alert level from Settings shows an in-app banner while the app is open, and — once
deployed — a push notification when it is closed. See NOTIFICATIONS.md. The level is
one of NEA's band boundaries (moderate 51+, unhealthy 101+, very unhealthy 201+) or a custom
PSI value between 20 and 300.

NEA publishes readings but no PSI forecast, so the trend screen shows the last 36 hours and the
dashboard strip shows now against today's high and low.

Guide wording per PSI band lives in `src/data/guidance.ts`.

Settings live in `src/lib/settings.ts` and start from persona-based defaults (a caregiver is
warned earlier and gets the daily digest; an outdoor worker is warned later).

Readings come live from NEA via data.gov.sg (`src/lib/nea.ts`): current PSI and PM2.5 plus the
last day of hourly readings, refreshed every 5 minutes and when the app regains focus. If a
request fails the app keeps the last readings and says so. `src/data/airQuality.ts` holds the
bands and the stand-in readings used before the first successful fetch.
The Live Map shades `src/data/regionShapes.json` — the five NEA regions, generated once by
`scripts/build-region-shapes.mjs` from Singapore's planning areas.
Band colours follow NEA's PSI bands (0–50 good, 51–100 moderate, 101–200 unhealthy).
