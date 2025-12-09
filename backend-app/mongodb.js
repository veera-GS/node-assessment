import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

let client;
let db;

export async function connectDB() {
  try {
    if (db) return db; // Reuse existing connection

    client = new MongoClient(process.env.MONGO_URI, {
      serverApi: {
        version: '1',
        strict: true,
        deprecationErrors: true,
      },
    });

    await client.connect();
    console.log('✔ Connected to MongoDB Atlas');

    db = client.db('timesheet'); // Must match DB name in URI
    return db;
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err);
    throw err;
  }
}
