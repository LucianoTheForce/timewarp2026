// Edge WebSocket broadcast server for sync between control and stage
export const config = {
  runtime: 'edge'
};

let clients = [];

export default function handler(req) {
  if (req.headers.get('upgrade') !== 'websocket') {
    return new Response('Upgrade to WebSocket expected', { status: 426 });
  }

  const { 0: client, 1: server } = new WebSocketPair();
  const ws = server;
  ws.accept();

  clients.push(ws);

  const broadcast = (data, sender) => {
    clients.forEach((socket) => {
      if (socket === sender) return;
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(data);
      }
    });
  };

  ws.addEventListener('message', (event) => {
    broadcast(event.data, ws);
  });

  const cleanup = () => {
    clients = clients.filter((c) => c !== ws);
  };

  ws.addEventListener('close', cleanup);
  ws.addEventListener('error', cleanup);

  return new Response(null, { status: 101, webSocket: client });
}
