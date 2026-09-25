# Push notifications

ClearSG sends two kinds of notification, both from Netlify:

- **Unhealthy PSI alert** — when your region passes your alert level. Checked hourly,
  ten past the hour, because NEA publishes on the hour.
- **Daily forecast digest** — one summary at 7am Singapore time.

Each arrives even when the app is closed. Turning either switch on in Settings asks for
notification permission and registers the phone; turning both off unregisters it.

## How it fits together

| Piece | What it does |
| --- | --- |
| `public/sw.js` | Service worker. Shows the notification and opens the app when tapped. Caches nothing. |
| `src/lib/push.ts` | Asks permission, subscribes, and sends the subscription plus preferences to the server. |
| `src/lib/usePush.ts` | Keeps the subscription in step with the alert settings. |
| `netlify/functions/subscribe.ts` | Stores one phone's subscription and preferences in Netlify Blobs. |
| `netlify/functions/unsubscribe.ts` | Removes it. |
| `netlify/functions/check-alerts.ts` | Hourly. Pushes to whoever is over their level. |
| `netlify/functions/daily-digest.ts` | Daily at 7am SGT. |

An alert fires once per episode: when the reading crosses the level you get one push, and
nothing more until it drops back below and rises again. `aboveThreshold` on each stored
record tracks that.

## Setting it up on Netlify

1. **Deploy the site.** Build command `npm run build`, publish directory `dist` — both are
   already in `netlify.toml`.
2. **Add the environment variables** under Site configuration → Environment variables:
   - `VITE_VAPID_PUBLIC_KEY` — the public key (also needed at build time, for the browser)
   - `VAPID_PUBLIC_KEY` — the same value
   - `VAPID_PRIVATE_KEY` — the private key, which must never be committed
   - `VAPID_CONTACT_EMAIL` — your email, which push services use to contact you about problems
   The local `.env` (gitignored) holds a pair generated during development. Generate a fresh
   pair any time with `npx web-push generate-vapid-keys`.
3. **Redeploy** after adding the variables, so the public key is built into the app.
4. **Check the schedules** under Functions: `check-alerts` and `daily-digest` should be listed
   as scheduled.

## Testing it

- **Android:** open the deployed site in Chrome, turn on an alert, and allow notifications.
- **iPhone:** add ClearSG to the home screen first (Share → Add to Home Screen) and open it
  from there. iOS only allows notifications for installed web apps, on iOS 16.4 or later.
- **To force an alert**, set your alert level below the current reading and run `check-alerts`
  by hand from the Netlify dashboard (Functions → check-alerts → Run). The episode rule means
  the next hourly run will not repeat it.
- **Notifications will not work over `http://`**, so the phone-on-Wi-Fi dev setup can't test
  them. They need the deployed HTTPS site.

## Privacy

A subscription record holds the push endpoint and keys, the chosen region and persona, and the
alert preferences. No account, name or precise location is stored.
