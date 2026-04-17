import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable in your .env file")
}

type MongooseInstance = typeof mongoose

interface MongooseCache {
  conn: MongooseInstance | null
  promise: Promise<MongooseInstance> | null
}

declare global {
  var mongooseCache: MongooseCache | undefined
}

// Persist the cache on the global object so it survives module reloads in development.
const globalWithMongoose = globalThis as typeof globalThis & {
  mongooseCache?: MongooseCache
}

const cached: MongooseCache = globalWithMongoose.mongooseCache ?? {
  conn: null,
  promise: null,
}

if (!globalWithMongoose.mongooseCache) {
  globalWithMongoose.mongooseCache = cached
}

/**
 * Connect to MongoDB using Mongoose.
 * Reuses an existing connection/pending promise to avoid opening multiple connections.
 */
export async function connectToDatabase(): Promise<MongooseInstance> {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    // Start a single connection attempt and share it across concurrent requests.
    cached.promise = mongoose.connect(MONGODB_URI!).then((mongooseInstance) => mongooseInstance)
  }

  try {
    cached.conn = await cached.promise
  } catch (error) {
    // Reset promise so future calls can retry if the first connection fails.
    cached.promise = null
    throw error
  }

  return cached.conn
}

export default connectToDatabase
