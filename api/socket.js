import { WebSocketServer, WebSocket } from 'ws';

// Keep the server and client set alive across invocations
let wss;
const clients = new Set();

export const config = {
  api: {
    bodyParser: false
  }
};

export default function handler(req, res) {
  if (req.headers.upgrade !== 'websocket') {
    res.status(426).end('Upgrade Required');
    return;
  }

  if (!wss) {
    wss = new WebSocketServer({ noServer: true });

    wss.on('connection', (ws) => {
      clients.add(ws);

      ws.on('message', (message) => {
        // Fan-out to all other connected clients
        clients.forEach((client) => {
          if (client === ws) return;
          if (client.readyState === WebSocket.OPEN) {
            client.send(message);
          }
        });
      });

      const cleanup = () => {
        clients.delete(ws);
      };

      ws.on('close', cleanup);
      ws.on('error', cleanup);
    });
  }

  wss.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => {
    wss.emit('connection', ws, req);
  });
}
