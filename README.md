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

The persona chosen during onboarding weights the same dashboard rather than changing screens
(`emphasis` in `src/data/personas.ts`): "Someone I care for" makes the strip open the trend, and
"On the go often" leads with the 1-hour PM2.5 instead of the 24-hour PSI.

After picking a persona, an optional screen asks a few questions (`src/data/personalQuestions.ts`).
The answers stay on the phone (`src/lib/personal.ts`) and tailor the wording across the app plus
the starting alert level (`src/data/tailored.ts`); the profile card in Settings
(`src/components/ProfileCard.tsx`) shows them back with a line saying what they changed. Only a
short audience label such as "your child", and the regions someone says they cover, are sent with
a push subscription. Everything can be skipped, and skipping leaves the app generic.

"On the go often" also asks which areas someone usually covers. Those areas are watched alongside
the region chosen at setup, so alerts and the daily digest speak about the worst of them, and the
dashboard names whichever is highest right now.

Settings live in `src/lib/settings.ts` and start from persona-based defaults (a caregiver is
warned earlier and gets the daily digest; an outdoor worker is warned later).

Readings come live from NEA via data.gov.sg (`src/lib/nea.ts`): current PSI and PM2.5 plus the
last day of hourly readings, refreshed every 5 minutes and when the app regains focus. If a
request fails the app keeps the last readings and says so. `src/data/airQuality.ts` holds the
bands and the stand-in readings used before the first successful fetch.
The Live Map shades `src/data/regionShapes.json` — the five NEA regions, generated once by
`scripts/build-region-shapes.mjs` from Singapore's planning areas.
Band colours follow NEA's PSI bands (0–50 good, 51–100 moderate, 101–200 unhealthy).
