export const config = { runtime: 'edge' };

// Keep connections alive across edge invocations
let clients = new Set();

export default function handler(req) {
  // Only proceed on WebSocket upgrade requests
  if (req.headers.get('upgrade') !== 'websocket') {
    return new Response('Expected a WebSocket upgrade', { status: 426 });
  }

  // Create server/client pair
  const { 0: client, 1: server } = new WebSocketPair();
  server.accept();

  clients.add(server);

  server.addEventListener('message', (event) => {
    // Broadcast incoming message to all other clients
    clients.forEach((ws) => {
      if (ws === server) return;
      if (ws.readyState === ws.OPEN) {
        try {
          ws.send(event.data);
        } catch (e) {
          // Ignore failed sends
        }
      }
    });
  });

  const cleanup = () => {
    clients.delete(server);
  };

  server.addEventListener('close', cleanup);
  server.addEventListener('error', cleanup);

  return new Response(null, { status: 101, webSocket: client });
}
