export const config = { runtime: 'edge' };

const CHANNEL = 'timewarp-sync';

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const body = await req.json();
    const message = JSON.stringify(body);

    const url = `${process.env.UPSTASH_REDIS_REST_URL}/publish/${CHANNEL}/${encodeURIComponent(message)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`
      }
    });

    if (!res.ok) {
      const text = await res.text();
      return new Response(`Publish failed: ${text}`, { status: 500 });
    }

    return new Response('ok', { status: 200 });
  } catch (err) {
    return new Response(`Error: ${err.message}`, { status: 500 });
  }
}
