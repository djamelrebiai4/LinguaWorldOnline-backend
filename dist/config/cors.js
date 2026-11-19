"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsOptions = void 0;
const env_1 = require("../config/env");
// CORS: allow only exact frontend origin, no wildcard for private APIs
exports.corsOptions = {
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true); // allow non-browser (curl, etc.) — auth still required
        if (origin === env_1.env.frontendOrigin)
            return callback(null, true);
        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
};
