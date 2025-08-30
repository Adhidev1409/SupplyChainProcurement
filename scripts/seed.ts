// scripts/seed.ts

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { suppliers, appSettings, type InsertSupplier, type Weights } from '../shared/schema';
import 'dotenv/config'; // Make sure to install dotenv: npm install dotenv


// --- Seeding Logic ---
async function seedDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set in .env file");
  }
  
  const sql = neon(process.env.DATABASE_URL);
  const db = drizzle(sql);

  console.log("🌱 Starting to seed the database...");


  // --- Seed Global App Settings ---
  const defaultWeights: Weights = {
    carbonFootprint: 25, waterUsage: 17, wasteReduction: 10,
    energyEfficiency: 10, iso14001: 15, recyclingPolicy: 8,
    waterPolicy: 6, sustainabilityReport: 9,
  };
  console.log("Initializing global metric weights...");
  await db.insert(appSettings)
    .values({ id: 'global', ...defaultWeights })
    .onConflictDoUpdate({
      target: appSettings.id,
      set: defaultWeights,
    });
  console.log("✅ Global settings initialized.");

  console.log("Database seeding complete!");
}

seedDatabase().catch((error) => {
  console.error("❌ Database seeding failed:", error);
  process.exit(1);
});