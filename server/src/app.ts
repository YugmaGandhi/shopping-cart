import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

/**
 * Builds the Express application WITHOUT starting a listener.
 * Keeping `listen` out of here lets tests (supertest) import the app directly.
 * Feature routers, the response envelope, and the central error handler are
 * wired in during Phase 1.
 */
export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  app.get('/api/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
  });

  return app;
}

export default createApp;
