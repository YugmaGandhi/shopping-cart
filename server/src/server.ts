import type { Server } from 'node:http';
import { env } from './config/env';
import { connectDB, disconnectDB } from './config/db';
import { createApp } from './app';

async function bootstrap(): Promise<void> {
  try {
    await connectDB(env.MONGO_URI);
  } catch (err) {
    console.error('Failed to connect to MongoDB:', (err as Error).message);
    process.exit(1);
  }

  const app = createApp();
  const server: Server = app.listen(env.PORT, () => {
    console.log(`Server listening on http://localhost:${env.PORT}`);
  });

  // Graceful shutdown: stop accepting connections, then close the DB.
  const shutdown = (signal: string) => {
    console.log(`\n${signal} received — shutting down gracefully`);
    server.close(() => {
      void disconnectDB().finally(() => process.exit(0));
    });
    // Hard exit if cleanup hangs.
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

void bootstrap();
