// scripts/seed.ts

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { suppliers, appSettings, users, type InsertSupplier, type Weights, type InsertUser } from '../shared/schema';
import bcrypt from 'bcrypt';
import 'dotenv/config';

// Sample supplier data
const sampleSuppliers: (InsertSupplier & { id: number })[] = [
  {
    id: 1,
    name: "GreenSupply Co.",
    productCategory: "Electronics",
    carbonFootprint: 1245,
    waterUsage: 780,
    wasteGeneration: 8.5,
    energyEfficiency: 90,
    laborPractices: 95,
    transportCostPerUnit: 45.20,
    onTimeDelivery: 92,
    regulatoryFlags: 0,
    leadTimeDays: 14,
    ISO14001: true,
    sustainabilityScore: 85.5,
    riskLevel: "Low",
  },
  {
    id: 2,
    name: "EcoTech Industries",
    productCategory: "Automotive",
    carbonFootprint: 3890,
    waterUsage: 2100,
    wasteGeneration: 22.3,
    energyEfficiency: 40,
    laborPractices: 60,
    transportCostPerUnit: 78.90,
    onTimeDelivery: 75,
    regulatoryFlags: 2,
    leadTimeDays: 28,
    ISO14001: false,
    sustainabilityScore: 45.2,
    riskLevel: "High",
  },
  {
    id: 3,
    name: "Sustainable Materials Ltd.",
    productCategory: "Textiles",
    carbonFootprint: 2100,
    waterUsage: 1200,
    wasteGeneration: 12.1,
    energyEfficiency: 70,
    laborPractices: 88,
    transportCostPerUnit: 52.40,
    onTimeDelivery: 89,
    regulatoryFlags: 0,
    leadTimeDays: 18,
    ISO14001: true,
    sustainabilityScore: 78.9,
    riskLevel: "Medium",
  },
  {
    id: 4,
    name: "ChemTech Solutions",
    productCategory: "Chemicals",
    carbonFootprint: 4200,
    waterUsage: 3500,
    wasteGeneration: 35.7,
    energyEfficiency: 55,
    laborPractices: 70,
    transportCostPerUnit: 95.30,
    onTimeDelivery: 82,
    regulatoryFlags: 1,
    leadTimeDays: 21,
    ISO14001: true,
    sustainabilityScore: 62.3,
    riskLevel: "Medium",
  },
  {
    id: 5,
    name: "BioPharm Inc.",
    productCategory: "Pharmaceuticals",
    carbonFootprint: 1580,
    waterUsage: 950,
    wasteGeneration: 6.2,
    energyEfficiency: 85,
    laborPractices: 92,
    transportCostPerUnit: 120.75,
    onTimeDelivery: 95,
    regulatoryFlags: 0,
    leadTimeDays: 7,
    ISO14001: true,
    sustainabilityScore: 91.7,
    riskLevel: "Low",
  },
  {
    id: 6,
    name: "AgriFood Corp.",
    productCategory: "Food",
    carbonFootprint: 2750,
    waterUsage: 1800,
    wasteGeneration: 18.4,
    energyEfficiency: 65,
    laborPractices: 75,
    transportCostPerUnit: 34.60,
    onTimeDelivery: 88,
    regulatoryFlags: 0,
    leadTimeDays: 5,
    ISO14001: false,
    sustainabilityScore: 68.5,
    riskLevel: "Medium",
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
    carbonFootprint: 25,
    waterUsage: 17,
    wasteReduction: 10,
    energyEfficiency: 10,
    iso14001: 15,
    recyclingPolicy: 8,
    waterPolicy: 6,
    sustainabilityReport: 9,
  };
  console.log("Initializing global metric weights...");
  await db
    .insert(appSettings)
    .values({ id: 'global', ...defaultWeights })
    .onConflictDoUpdate({
      target: appSettings.id,
      set: defaultWeights,
    });
  console.log("✅ Global settings initialized.");

  // --- Seed Suppliers ---
  console.log("Seeding suppliers...");
  const createdSuppliers: Array<{ id: number; name: string }> = [];
  for (const supplier of sampleSuppliers) {
    // Idempotent upsert by primary key `id` to avoid duplicate key errors
    const result = await db
      .insert(suppliers)
      .values(supplier as any)
      .onConflictDoUpdate({
        target: suppliers.id,
        set: {
          name: supplier.name,
          productCategory: supplier.productCategory,
          carbonFootprint: supplier.carbonFootprint,
          waterUsage: supplier.waterUsage,
          wasteGeneration: supplier.wasteGeneration,
          // keep existing wasteReduction if present else default 0
          energyEfficiency: supplier.energyEfficiency,
          laborPractices: supplier.laborPractices,
          transportCostPerUnit: supplier.transportCostPerUnit,
          onTimeDelivery: supplier.onTimeDelivery,
          regulatoryFlags: supplier.regulatoryFlags,
          leadTimeDays: supplier.leadTimeDays,
          ISO14001: supplier.ISO14001,
          sustainabilityScore: supplier.sustainabilityScore,
          riskLevel: supplier.riskLevel,
        },
      })
      .returning({ id: suppliers.id, name: suppliers.name });

    createdSuppliers.push(result[0]);
    console.log(`✅ Upserted supplier: ${supplier.name}`);
  }

  // Ensure the identity sequence is set to max(id) to avoid duplicate key errors
  console.log("Syncing suppliers identity sequence to max(id)...");
  // Using a raw query to set the sequence value to the max id present
  // pg_get_serial_sequence works for identity as well
  await (db as any).execute(`
    SELECT setval(
      pg_get_serial_sequence('suppliers','id'),
      COALESCE((SELECT MAX(id) FROM suppliers), 1)
    );
  `);
  console.log("✅ Suppliers identity sequence synced.");

  // --- Seed Users ---
  console.log("Seeding users...");
  // Build quick lookup by supplier name for linking
  const supplierMap = new Map(createdSuppliers.map((s) => [s.name, s.id] as const));

  for (let i = 0; i < sampleUsers.length; i++) {
    const userData = sampleUsers[i];

    // For supplier users, link to the corresponding supplier by known names
    let supplierId: number | null = null;
    if (userData.role === 'supplier') {
      if (userData.username === 'greensupply') supplierId = supplierMap.get('GreenSupply Co.') ?? null;
      if (userData.username === 'ecotech') supplierId = supplierMap.get('EcoTech Industries') ?? null;
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Idempotent upsert by unique username
    await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword,
        supplierId,
      } as any)
      .onConflictDoUpdate({
        target: users.username,
        set: {
          password: hashedPassword,
          role: userData.role,
          email: userData.email,
          supplierId,
        },
      })
      .returning();

    console.log(`✅ Upserted user: ${userData.username} (${userData.role})`);
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