import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import v1Router from './routes/v1';
import { buildOpenApiDocument } from './docs/openapi';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';

/**
 * Builds the Express application WITHOUT starting a listener, so tests
 * (supertest) can import it directly. Middleware order matters: security/parsing
 * first, routes next, then the 404 catch-all, and the error handler LAST.
 */
export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CLIENT_ORIGIN, credentials: true }));
  app.use(express.json());
  if (env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // Operational endpoint — intentionally unversioned.
  app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
  });

  // Interactive API docs (Swagger UI) — unversioned. Generated from Zod schemas.
  const openApiDocument = buildOpenApiDocument();
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
  app.get('/api/docs.json', (_req: Request, res: Response) => {
    res.json(openApiDocument);
  });

  // Versioned resource routes.
  app.use('/api/v1', v1Router);

  // 404 for anything unmatched, then the central error handler.
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

export default createApp;
