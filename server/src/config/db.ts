import mongoose from 'mongoose';

/**
 * Connects Mongoose to MongoDB. Throws on failure so the caller (server.ts)
 * can decide how to react — we exit on initial connect failure.
 */
export async function connectDB(uri: string): Promise<void> {
  mongoose.connection.on('connected', () => {
    console.log('✓ MongoDB connected');
  });
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err.message);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
  });

  // Fail fast rather than buffering queries indefinitely when the DB is down.
  mongoose.set('bufferTimeoutMS', 5000);

  await mongoose.connect(uri);
}

/** Closes the Mongoose connection (used during graceful shutdown). */
export async function disconnectDB(): Promise<void> {
  await mongoose.connection.close();
}
