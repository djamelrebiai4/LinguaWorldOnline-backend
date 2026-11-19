import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { corsOptions } from './config/cors';
import { domainGuard } from './middleware/domain-guard';
import { generalRateLimit } from './middleware/rateLimit';
import { errorHandler } from './middleware/error';
import { notFound } from './middleware/notFound';
import healthRoutes from './routes/health';
import authRoutes from './routes/auth';
import contentRoutes from './routes/content';
import userRoutes from './routes/user';
import chatRoutes from './routes/chat';
import adminRoutes from './routes/admin';

export function createApp(): Application {
  const app = express();

  // Security headers
  app.use(helmet());
  app.use(cors(corsOptions));

  // Body parsing
  app.use(express.json({ limit: '32kb' }));
  app.use(express.urlencoded({ extended: false, limit: '32kb' }));

  // Global rate limiting
  app.use(generalRateLimit);

  // Health is public — no domain restriction
  app.use('/api/v1/health', healthRoutes);

  // Domain guard for all other API routes
  app.use('/api/v1/*', domainGuard);

  // API routes (versioned)
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/content', contentRoutes);
  app.use('/api/v1/user', userRoutes);
  app.use('/api/v1/chat', chatRoutes);
  app.use('/api/v1/admin', adminRoutes);

  // 404
  app.use(notFound);

  // Centralized error handler
  app.use(errorHandler);

  return app;
}
