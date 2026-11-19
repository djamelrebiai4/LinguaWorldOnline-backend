import { createServer } from 'http';
import { attachMultiplayer } from './multiplayer';

const port = Number(process.env.MULTIPLAYER_PORT || process.env.PORT || 3031);
const allowedDomains = (process.env.AUTHORIZED_DOMAINS || '')
  .split(',')
  .map((domain) => domain.trim())
  .filter(Boolean);
const server = createServer((request, response) => {
  if (request.url === '/health') {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ status: 'ok' }));
    return;
  }
  response.writeHead(404);
  response.end();
});

attachMultiplayer(server, {
  frontendOrigin: process.env.FRONTEND_ORIGIN || '',
  authorizedDomains: allowedDomains,
  nodeEnv: process.env.NODE_ENV || 'development'
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Multiplayer WebSocket listening on ws://0.0.0.0:${port}/multiplayer`);
});