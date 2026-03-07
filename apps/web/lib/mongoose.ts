import mongoose from 'mongoose';

/*
 * Mongoose connection helper.
 *
 * This file centralises the creation of the Mongoose connection and caches it
 * across hot reloads in development. Without this cache Next.js would
 * re‑instantiate a new connection on every API call which quickly exhausts
 * the connection pool. When the server is deployed this cache has no effect
 * because modules are loaded once on boot.
 */

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  console.warn('⚠️ MONGODB_URI is not defined in environment. Database calls will fail.');
}

interface CachedConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseGlobal: CachedConnection | undefined;
}

let cached: CachedConnection;

if (!global.mongooseGlobal) {
  cached = global.mongooseGlobal = { conn: null, promise: null };
} else {
  cached = global.mongooseGlobal;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        autoIndex: false,
        maxPoolSize: 10
      })
      .then(mongooseInstance => mongooseInstance);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
