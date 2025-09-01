// scripts/reset-db.ts
// This script will drop and recreate tables to handle schema migration

import { drizzle } from 'drizzle-orm/neon-http';
import { neon, neonConfig } from '@neondatabase/serverless';
import { sql } from 'drizzle-orm';
import 'dotenv/config';

async function resetDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  neonConfig.fetchConnectionCache = true;
  const client = neon(process.env.DATABASE_URL);
  const db = drizzle(client);

  console.log("🗑️  Dropping existing tables...");
  
  try {
    // Drop tables in correct order (users first due to foreign key)
    await db.execute(sql`DROP TABLE IF EXISTS users CASCADE;`);
    await db.execute(sql`DROP TABLE IF EXISTS suppliers CASCADE;`);
    await db.execute(sql`DROP TABLE IF EXISTS app_settings CASCADE;`);
    
    console.log("✅ Tables dropped successfully");
  } catch (error) {
    console.log("ℹ️  Some tables may not have existed:", error);
  }

  console.log("🔄 Now run: npm run db:push && npm run db:seed");
}

resetDatabase().catch((error) => {
  console.error("❌ Database reset failed:", error);
  process.exit(1);
});