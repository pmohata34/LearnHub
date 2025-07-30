import { MongoClient, Db } from "mongodb";

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.DB_NAME || "LearnHub";

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function getDb(): Promise<Db> {
  if (cachedDb) return cachedDb;

  const client = cachedClient || new MongoClient(MONGO_URI);
  await client.connect();

  const db = client.db(DB_NAME);
  cachedClient = client;
  cachedDb = db;

  return db;
}
