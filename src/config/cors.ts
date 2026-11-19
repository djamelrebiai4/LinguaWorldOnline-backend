import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

// CORS: allow only exact frontend origin, no wildcard for private APIs
export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) return callback(null, true); // allow non-browser (curl, etc.) — auth still required
    if (origin === env.frontendOrigin) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
