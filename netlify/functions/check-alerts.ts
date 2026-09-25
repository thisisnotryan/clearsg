import type { Config } from '@netlify/functions'
import {
  allSubscribers,
  bandLabel,
  configureWebPush,
  fetchPsi,
  REGION_LABELS,
  sendPush,
  subscribers,
} from './_shared'

/*
 * Runs every hour, a few minutes past, since NEA publishes on the hour.
 * Alerts once per episode: when a region climbs past someone's threshold they
 * get one push, and nothing more until it drops back below and rises again.
 */
export default async function handler() {
  configureWebPush()
  const { psi } = await fetchPsi()
  const store = subscribers()

  let sent = 0
  for (const { key, value } of await allSubscribers()) {
    const reading = psi[value.region]
    const above = reading >= value.alertThreshold

    if (above && !value.aboveThreshold && value.unhealthyPsiAlert) {
      const ok = await sendPush(key, value, {
        title: `PSI ${reading} in ${REGION_LABELS[value.region]}`,
        body: `Air is ${bandLabel(reading)} — above your alert level of ${value.alertThreshold}. Tap for what to do.`,
        url: '/',
        tag: 'psi-alert',
      })
      if (ok) sent += 1
    }

    if (above !== value.aboveThreshold) {
      await store.setJSON(key, { ...value, aboveThreshold: above })
    }
  }

  return Response.json({ ok: true, sent })
}

// Ten past the hour, every hour.
export const config: Config = { schedule: '10 * * * *' }
