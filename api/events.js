export const config = { runtime: 'edge' };

const STREAM = 'timewarp-stream';

// Polls for new entries in the stream since the given cursor.
export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  let cursor = searchParams.get('cursor');

  // If no cursor, start from the last entry so we only receive future messages
  if (!cursor) {
    const latestRes = await fetch(
      `${process.env.UPSTASH_REDIS_REST_URL}/xrevrange/${STREAM}/${encodeURIComponent('+')}/${encodeURIComponent('-')}?count=1`,
      {
        headers: {
          Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`
        }
      }
    );

    if (latestRes.ok) {
      const latest = await latestRes.json();
      if (Array.isArray(latest) && latest.length > 0) {
        cursor = latest[0][0]; // id
      }
    }

    if (!cursor) cursor = '0-0';
    return jsonResponse({ cursor, events: [] });
  }

  // Fetch entries after the cursor
  const start = encodeURIComponent(`(${cursor}`);
  const end = encodeURIComponent('+');
  const url = `${process.env.UPSTASH_REDIS_REST_URL}/xrange/${STREAM}/${start}/${end}?count=100`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.UPSTASH_REDIS_REST_TOKEN}`
    }
  });

  if (!res.ok) {
    const text = await res.text();
    return new Response(`Failed to read stream: ${text}`, { status: 500 });
  }

  const raw = await res.json();
  const events = [];
  let lastCursor = cursor;

  if (Array.isArray(raw)) {
    raw.forEach((entry) => {
      const [id, fields] = entry;
      lastCursor = id;
      const dataIndex = fields.indexOf('data');
      const payloadIndex = dataIndex + 1;
      if (dataIndex >= 0 && payloadIndex < fields.length) {
        try {
          const payload = JSON.parse(fields[payloadIndex]);
          events.push({ id, payload });
        } catch (e) {
          // ignore invalid payload
        }
      }
    });
  }

  return jsonResponse({ cursor: lastCursor, events });
}

function jsonResponse(obj) {
  return new Response(JSON.stringify(obj), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    }
  });
}
