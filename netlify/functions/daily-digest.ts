import type { Config } from '@netlify/functions'
import { allSubscribers, bandLabel, configureWebPush, fetchPsi, REGION_LABELS, sendPush } from './_shared'

/*
 * The daily forecast digest: one summary each morning for whoever has it
 * switched on. 23:00 UTC is 7am in Singapore.
 */
export default async function handler() {
  configureWebPush()
  const { psi } = await fetchPsi()

  let sent = 0
  for (const { key, value } of await allSubscribers()) {
    if (!value.dailyDigest) continue

    const reading = psi[value.region]
    const island = Object.values(psi)
    const highest = Math.max(...island)

    const who = value.audience ? ` for ${value.audience}` : ''
    const ok = await sendPush(key, value, {
      title: `Today in ${REGION_LABELS[value.region]}: PSI ${reading}`,
      body: `Air is ${bandLabel(reading)}${who}. Highest across Singapore right now is ${highest}.`,
      url: '/',
      tag: 'daily-digest',
    })
    if (ok) sent += 1
  }

  return Response.json({ ok: true, sent })
}

// 23:00 UTC = 7am Singapore.
export const config: Config = { schedule: '0 23 * * *' }
