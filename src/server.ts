import { createApp } from './app';
import { env } from './config/env';
import { attachMultiplayer } from './multiplayer';

const app = createApp();
const port = env.port;

const server = app.listen(port, '0.0.0.0', () => {
  console.log(`Lexi Explorer backend listening on http://0.0.0.0:${port}`);
  console.log(`Environment: ${env.nodeEnv}`);
  console.log(`Frontend origin: ${env.frontendOrigin}`);
});
const multiplayer = attachMultiplayer(server, {
  frontendOrigin: env.frontendOrigin,
  authorizedDomains: env.authorizedDomains,
  nodeEnv: env.nodeEnv
});

// Graceful shutdown
const signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT'];
signals.forEach((signal) => {
  process.on(signal, () => {
    console.log(`Received ${signal}, shutting down gracefully...`);
    multiplayer.clients.forEach((client) => client.close(1001, 'Server shutting down'));
    multiplayer.close();
    server.close(() => {
      console.log('HTTP server closed.');
      process.exit(0);
    });
  });
});

// Handle unhandled errors
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
  process.exit(1);
});
