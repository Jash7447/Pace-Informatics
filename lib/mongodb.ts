import dns from "node:dns";

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

// async function connectDB() {
//   if (cached.conn) {
//     return cached.conn;
//   }

//   if (!cached.promise) {
//     const opts = {
//       bufferCommands: false,
//     };
//     console.log("ENV:", process.env.MONGODB_URI);
//     console.log("passed this level1");
//     cached.promise = mongoose
//       .connect(MONGODB_URI!, opts)
//       .then((mongoose) => {
//         console.log("passed this level2");
//         return mongoose;
//       })
//       .catch((error) => {
//         console.error("❌ MongoDB connection error:");
//         console.error(error);
//         throw error;
//       });
//   }
// }

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log("MONGODB_URI exists:", !!process.env.MONGODB_URI);
    console.log("passed this level1");

    dns.setServers(["8.8.8.8", "1.1.1.1"]);

    cached.promise = mongoose
      .connect(MONGODB_URI!, opts)
      .then((mongoose) => {
        console.log("passed this level2");
        return mongoose;
      })
      .catch((error) => {
        console.error("❌ MongoDB connection error:");
        console.error(error);
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}



export default connectDB;

