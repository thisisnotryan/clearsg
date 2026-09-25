import { keyFor, subscribers } from './_shared'

/** Forgets one phone, so nothing more is pushed to it. */
export default async function handler(request: Request) {
  if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  let body: { endpoint?: string }
  try {
    body = await request.json()
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }
  if (!body.endpoint) return new Response('Missing endpoint', { status: 400 })

  await subscribers().delete(await keyFor(body.endpoint))
  return Response.json({ ok: true })
}

