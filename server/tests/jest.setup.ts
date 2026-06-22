// Runs before each test file is imported, so env validation (config/env.ts)
// passes when the app module is loaded. The real DB connection is provided by
// mongodb-memory-server in db helper (not via MONGO_URI).
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-at-least-16-characters';
process.env.JWT_EXPIRES_IN = '1h';
process.env.MONGO_URI = 'mongodb://127.0.0.1:27017/test-placeholder';
process.env.CLIENT_ORIGIN = 'http://localhost:5173';
