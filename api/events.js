export const config = { runtime: 'edge' };

const CHANNEL = 'timewarp-sync';

export default async function handler() {
  const url = `${process.env.UPSTASH_REDIS_REST_URL}/sse/${CHANNEL}`;

  const upstream = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`
    }
  });

  if (!upstream.ok || !upstream.body) {
    return new Response('Unable to subscribe to events', { status: 500 });
  }

  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder('event: ping\ndata: ok\n\n')); // keep EventSource alive

      const reader = upstream.body.getReader();
      const pump = () =>
        reader.read().then(({ value, done }) => {
          if (done) {
            controller.close();
            return;
          }
          controller.enqueue(value);
          return pump();
        });

      pump();
    }
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

const encoder = (str) => new TextEncoder().encode(str);
