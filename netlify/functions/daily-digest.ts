import type { Config } from '@netlify/functions'
import {
  allSubscribers,
  bandLabel,
  configureWebPush,
  fetchPsi,
  REGION_LABELS,
  sendPush,
  worstRegion,
} from './_shared'

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

    // Someone who named the areas they cover hears about the worst of those.
    const region = worstRegion(value, psi)
    const reading = psi[region]
    const highest = Math.max(...Object.values(psi))

    const who = value.audience ? ` for ${value.audience}` : ''
    const title = value.areas?.length
      ? `Today across your areas: PSI ${reading} in ${REGION_LABELS[region]}`
      : `Today in ${REGION_LABELS[region]}: PSI ${reading}`
    const ok = await sendPush(key, value, {
      title,
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
