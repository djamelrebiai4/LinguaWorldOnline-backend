"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const multiplayer_1 = require("./multiplayer");
const app = (0, app_1.createApp)();
const port = env_1.env.port;
const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Lexi Explorer backend listening on http://0.0.0.0:${port}`);
    console.log(`Environment: ${env_1.env.nodeEnv}`);
    console.log(`Frontend origin: ${env_1.env.frontendOrigin}`);
});
const multiplayer = (0, multiplayer_1.attachMultiplayer)(server, {
    frontendOrigin: env_1.env.frontendOrigin,
    authorizedDomains: env_1.env.authorizedDomains,
    nodeEnv: env_1.env.nodeEnv
});
// Graceful shutdown
const signals = ['SIGTERM', 'SIGINT'];
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
