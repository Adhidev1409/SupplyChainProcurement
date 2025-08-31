// scripts/seed.ts

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { suppliers, appSettings, users, type InsertSupplier, type Weights, type InsertUser } from '../shared/schema';
import bcrypt from 'bcrypt';
import 'dotenv/config';

// Sample supplier data
const sampleSuppliers: InsertSupplier[] = [
  {
    name: "GreenSupply Co.",
    carbonFootprint: 1245,
    waterUsage: 780,
    recyclingPolicy: true,
    ISO14001: true,
    wasteReduction: 85,
    energyEfficiency: 90,
    waterPolicy: true,
    sustainabilityReport: true,
    location: "California, USA",
    employeeCount: 250,
    riskScore: 15,
    historicalCarbon: [1400, 1350, 1300, 1280, 1245, 1200, 1180, 1160, 1140, 1120, 1100, 1080],
  },
  {
    name: "EcoTech Industries",
    carbonFootprint: 3890,
    waterUsage: 2100,
    recyclingPolicy: false,
    ISO14001: false,
    wasteReduction: 30,
    energyEfficiency: 40,
    waterPolicy: false,
    sustainabilityReport: false,
    location: "Texas, USA",
    employeeCount: 500,
    riskScore: 75,
    historicalCarbon: [4200, 4150, 4100, 4050, 4000, 3950, 3900, 3890, 3880, 3870, 3860, 3850],
  },
  {
    name: "Sustainable Materials Ltd.",
    carbonFootprint: 2100,
    waterUsage: 1200,
    recyclingPolicy: true,
    ISO14001: true,
    wasteReduction: 75,
    energyEfficiency: 70,
    waterPolicy: true,
    sustainabilityReport: true,
    location: "Ontario, Canada",
    employeeCount: 180,
    riskScore: 25,
    historicalCarbon: [2300, 2250, 2200, 2180, 2150, 2120, 2100, 2080, 2060, 2040, 2020, 2000],
  },
];

// Sample users
const sampleUsers: (Omit<InsertUser, 'password'> & { password: string })[] = [
  {
    username: "admin",
    password: "admin123",
    role: "admin",
    email: "admin@supplychain.com",
    supplierId: null,
  },
  {
    username: "greensupply",
    password: "supplier123",
    role: "supplier",
    email: "contact@greensupply.com",
    supplierId: null, // Will be set after creating suppliers
  },
  {
    username: "ecotech",
    password: "supplier123",
    role: "supplier",
    email: "contact@ecotech.com",
    supplierId: null, // Will be set after creating suppliers
  },
];

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

  // --- Seed Suppliers ---
  console.log("Seeding suppliers...");
  const createdSuppliers = [];
  for (const supplier of sampleSuppliers) {
    const result = await db.insert(suppliers).values(supplier).returning();
    createdSuppliers.push(result[0]);
    console.log(`✅ Created supplier: ${supplier.name}`);
  }

  // --- Seed Users ---
  console.log("Seeding users...");
  for (let i = 0; i < sampleUsers.length; i++) {
    const userData = sampleUsers[i];

    // For supplier users, link to the corresponding supplier
    let supplierId = null;
    if (userData.role === 'supplier') {
      if (i === 1) supplierId = createdSuppliers[0].id; // GreenSupply
      if (i === 2) supplierId = createdSuppliers[1].id; // EcoTech
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const result = await db.insert(users).values({
      ...userData,
      password: hashedPassword,
      supplierId,
    }).returning();

    console.log(`✅ Created user: ${userData.username} (${userData.role})`);
  }

  console.log("🎉 Database seeding complete!");
  console.log("\n--- Test Login Credentials ---");
  console.log("Admin: admin / admin123");
  console.log("Supplier (GreenSupply): greensupply / supplier123");
  console.log("Supplier (EcoTech): ecotech / supplier123");
}

seedDatabase().catch((error) => {
  console.error("❌ Database seeding failed:", error);
  process.exit(1);
});