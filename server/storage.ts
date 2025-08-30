import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
import { 
  // --- TABLE OBJECTS (for Drizzle) ---
  users, 
  suppliers, 
  appSettings,

  // --- TYPESCRIPT TYPES (for your code) ---
  type Weights,
  type Supplier, 
  type InsertSupplier, 
  type SupplierWithCalculated, 
  type User, 
  type InsertUser 
} from "@shared/schema";

// --- Database Connection ---
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema: { users, suppliers, appSettings } });

// --- The hardcoded ID for our single settings row ---
const GLOBAL_SETTINGS_ID = 'global';

// --- IStorage Interface (Updated) ---
export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Supplier methods
  getSupplier(id: string): Promise<SupplierWithCalculated | undefined>;
  getAllSuppliers(): Promise<SupplierWithCalculated[]>;
  createSupplier(supplier: InsertSupplier): Promise<SupplierWithCalculated>;
  updateSupplier(id: string, supplier: Partial<InsertSupplier>): Promise<SupplierWithCalculated | undefined>;
  deleteSupplier(id: string): Promise<boolean>;

  // NEW Methods for global weights
  getMetricWeights(): Promise<Weights>;
  saveMetricWeights(weights: Weights): Promise<Weights>;
}

// --- NEW Dynamic Calculation Logic ---
function calculateSustainabilityScore(supplier: Supplier, weights: Weights): number {
  let totalScore = 0;

  // --- Normalize and Score Metrics (0-100) ---
  // Lower is better for these, so we invert the score.
  // You can adjust the max values (4000, 2500) based on your data.
  let carbonScore = 100 - (Math.min(supplier.carbonFootprint, 4000) / 4000) * 100;
  let waterScore = 100 - (Math.min(supplier.waterUsage, 2500) / 2500) * 100;
  // Higher is better for these, so the score is the value itself.
  let wasteReductionScore = supplier.wasteReduction;
  let energyEfficiencyScore = supplier.energyEfficiency;

  // --- Apply the weights ---
  totalScore += (carbonScore / 100) * weights.carbonFootprint;
  totalScore += (waterScore / 100) * weights.waterUsage;
  totalScore += (wasteReductionScore / 100) * weights.wasteReduction;
  totalScore += (energyEfficiencyScore / 100) * weights.energyEfficiency;

  // --- Score Policies (Boolean metrics) ---
  // If a policy exists, they get the full weight for that category.
  if (supplier.ISO14001) totalScore += weights.iso14001;
  if (supplier.recyclingPolicy) totalScore += weights.recyclingPolicy;
  if (supplier.waterPolicy) totalScore += weights.waterPolicy;
  if (supplier.sustainabilityReport) totalScore += weights.sustainabilityReport;

  // Ensure the final score is between 0 and 100
  return Math.max(0, Math.min(100, Math.round(totalScore)));
}

function calculateRiskLevel(riskScore: number): 'Low' | 'Medium' | 'High' {
  if (riskScore >= 75) return 'Low';
  if (riskScore >= 50) return 'Medium';
  return 'High';
}

// This function now requires weights to be passed in
function addCalculatedFields(supplier: Supplier, weights: Weights): SupplierWithCalculated {
  const sustainabilityScore = calculateSustainabilityScore(supplier, weights);

  return {
    ...supplier,
    sustainabilityScore,
    riskLevel: calculateRiskLevel(sustainabilityScore), // 👈 switched here
  };
}

// --- Database-driven Implementation of IStorage ---
export class DbStorage implements IStorage {
  // --- User methods ---
  async getUser(id: string): Promise<User | undefined> {
    return db.query.users.findFirst({ where: eq(users.id, id) });
  }
  async getUserByUsername(username: string): Promise<User | undefined> {
    return db.query.users.findFirst({ where: eq(users.username, username) });
  }
  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // --- Supplier methods (now use dynamic weights) ---
  async getSupplier(id: string): Promise<SupplierWithCalculated | undefined> {
    const weights = await this.getMetricWeights();
    const supplier = await db.query.suppliers.findFirst({ where: eq(suppliers.id, id) });
    return supplier ? addCalculatedFields(supplier, weights) : undefined;
  }

  async getAllSuppliers(): Promise<SupplierWithCalculated[]> {
    const weights = await this.getMetricWeights();
    const allSuppliers = await db.query.suppliers.findMany();
    return allSuppliers.map(supplier => addCalculatedFields(supplier, weights));
  }

  async createSupplier(insertSupplier: InsertSupplier): Promise<SupplierWithCalculated> {
    const weights = await this.getMetricWeights();
    const result = await db.insert(suppliers).values(insertSupplier).returning();
    return addCalculatedFields(result[0], weights);
  }

  async updateSupplier(id: string, updates: Partial<InsertSupplier>): Promise<SupplierWithCalculated | undefined> {
    const weights = await this.getMetricWeights();
    const result = await db.update(suppliers).set(updates).where(eq(suppliers.id, id)).returning();
    if (result.length === 0) return undefined;
    return addCalculatedFields(result[0], weights);
  }

  async deleteSupplier(id: string): Promise<boolean> {
    const result = await db.delete(suppliers).where(eq(suppliers.id, id)).returning({ id: suppliers.id });
    return result.length > 0;
  }

  // --- Implementations for Global Metric Weights ---
  async getMetricWeights(): Promise<Weights> {
    const settings = await db.query.appSettings.findFirst({
      where: eq(appSettings.id, GLOBAL_SETTINGS_ID),
    });

    if (!settings) {
      return {
        carbonFootprint: 25, waterUsage: 17, wasteReduction: 10,
        energyEfficiency: 10, iso14001: 15, recyclingPolicy: 8,
        waterPolicy: 6, sustainabilityReport: 9,
      };
    }
    const { id, ...weights } = settings;
    return weights;
  }

  async saveMetricWeights(weights: Weights): Promise<Weights> {
    const settingsToSave = { id: GLOBAL_SETTINGS_ID, ...weights };
    const result = await db.insert(appSettings).values(settingsToSave)
      .onConflictDoUpdate({ target: appSettings.id, set: settingsToSave })
      .returning();
    const { id, ...savedWeights } = result[0];
    return savedWeights;
  }
}

// Export an instance of the new DbStorage class
export const storage = new DbStorage();