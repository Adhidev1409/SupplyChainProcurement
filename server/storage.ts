import { drizzle } from 'drizzle-orm/neon-http';
import { sql as dsql } from 'drizzle-orm';
import { neon } from '@neondatabase/serverless';
import { eq, and } from 'drizzle-orm';
import bcrypt from 'bcrypt';
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
  authenticateUser(username: string, password: string): Promise<User | null>;
  getUsersByRole(role: string): Promise<User[]>;

  // Supplier methods
  getSupplier(id: string): Promise<SupplierWithCalculated | undefined>;
  getAllSuppliers(): Promise<SupplierWithCalculated[]>;
  getSuppliersForUser(user: User): Promise<SupplierWithCalculated[]>;
  createSupplier(supplier: Omit<InsertSupplier, 'sustainabilityScore' | 'riskLevel'>): Promise<SupplierWithCalculated>;
  updateSupplier(id: string, supplier: Partial<Omit<InsertSupplier, 'sustainabilityScore' | 'riskLevel'>>): Promise<SupplierWithCalculated | undefined>;
  deleteSupplier(id: string): Promise<boolean>;

  // NEW Methods for global weights
  getMetricWeights(): Promise<Weights>;
  saveMetricWeights(weights: Weights): Promise<Weights>;
}

// --- NEW Dynamic Calculation Logic ---
function calculateSustainabilityScore(supplier: Supplier, weights: Weights): number {
  // --- Numeric metrics ---
  const carbonScore = 100 - (Math.min(supplier.carbonFootprint, 4000) / 4000) * 100;
  const waterScore = 100 - (Math.min(supplier.waterUsage, 2500) / 2500) * 100;
  const energyEfficiencyScore = supplier.energyEfficiency;
  const wasteReductionScore = supplier.wasteReduction ?? 0;

  // --- Weighted sum ---
  let totalScore = 0;
  totalScore += (carbonScore / 100) * weights.carbonFootprint;
  totalScore += (waterScore / 100) * weights.waterUsage;
  totalScore += (energyEfficiencyScore / 100) * weights.energyEfficiency;
  totalScore += (wasteReductionScore / 100) * (weights.wasteReduction ?? 0);

  // --- Boolean metrics ---
  if (supplier.ISO14001) totalScore += weights.iso14001;
  if ((supplier as any).recyclingPolicy) totalScore += weights.recyclingPolicy;
  if ((supplier as any).waterPolicy) totalScore += weights.waterPolicy;
  if ((supplier as any).sustainabilityReport) totalScore += weights.sustainabilityReport;

  // --- Normalize to 100 based on total possible weight ---
  const maxPossibleScore = Object.values(weights).reduce((sum, w) => sum + (w ?? 0), 0);
  totalScore = (totalScore / maxPossibleScore) * 100;

  return Math.round(totalScore);
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
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const result = await db.insert(users).values({
      ...insertUser,
      password: hashedPassword
    }).returning();
    return result[0];
  }
  async authenticateUser(username: string, password: string): Promise<User | null> {
    const user = await db.query.users.findFirst({ where: eq(users.username, username) });
    if (!user) return null;

    const isValidPassword = await bcrypt.compare(password, user.password);
    return isValidPassword ? user : null;
  }
  async getUsersByRole(role: string): Promise<User[]> {
    return db.query.users.findMany({ where: eq(users.role, role) });
  }

  // --- Supplier methods (now use dynamic weights) ---
  async getSupplier(id: string): Promise<SupplierWithCalculated | undefined> {
    const weights = await this.getMetricWeights();
    const supplierId = parseInt(id);
    if (isNaN(supplierId)) return undefined;
    
    const supplier = await db.query.suppliers.findFirst({ 
      where: eq(suppliers.id, supplierId) 
    });
    return supplier ? addCalculatedFields(supplier, weights) : undefined;
  }

  async getAllSuppliers(): Promise<SupplierWithCalculated[]> {
    const weights = await this.getMetricWeights();
    const allSuppliers = await db.query.suppliers.findMany();
    return allSuppliers.map(supplier => addCalculatedFields(supplier, weights));
  }

  async getSuppliersForUser(user: User): Promise<SupplierWithCalculated[]> {
    const weights = await this.getMetricWeights();

    if (user.role === 'admin') {
      // Admin sees all suppliers
      return this.getAllSuppliers();
    } else if (user.role === 'supplier' && user.supplierId) {
      // Supplier users see only their own supplier data
  const supplierId = parseInt(String(user.supplierId));
      if (isNaN(supplierId)) return [];
      
      const supplier = await db.query.suppliers.findFirst({
        where: eq(suppliers.id, supplierId)
      });
      return supplier ? [addCalculatedFields(supplier, weights)] : [];
    }

    return [];
  }

  async createSupplier(insertSupplier: Omit<InsertSupplier, 'sustainabilityScore' | 'riskLevel'>): Promise<SupplierWithCalculated> {
    const weights = await this.getMetricWeights();
    // Compute sustainability score and risk from provided inputs
    const tempSupplier = {
      ...insertSupplier,
      sustainabilityScore: 0,
      riskLevel: 'Medium' as const,
    } as unknown as Supplier;
    const computedScore = calculateSustainabilityScore(tempSupplier, weights);
    const computedRisk = calculateRiskLevel(computedScore);

    const doInsert = async () => {
      const result = await db
        .insert(suppliers)
        .values({
          ...(insertSupplier as any),
          sustainabilityScore: computedScore,
          riskLevel: computedRisk,
        } as InsertSupplier)
        .returning();
      return result[0];
    };

    try {
      const inserted = await doInsert();
      return addCalculatedFields(inserted, weights);
    } catch (err: any) {
      // If identity sequence is behind (after seeding explicit IDs), reset and retry once
      const message: string = err?.message || '';
      if (err?.code === '23505' && message.includes('suppliers_pkey')) {
        try {
          // Reset the sequence to max(id)
          await dsql`SELECT setval(pg_get_serial_sequence('suppliers','id'), COALESCE((SELECT MAX(id) FROM suppliers), 1));`;
          const retried = await doInsert();
          return addCalculatedFields(retried, weights);
        } catch (err2) {
          throw err2;
        }
      }
      throw err;
    }
  }

  async updateSupplier(id: string, updates: Partial<Omit<InsertSupplier, 'sustainabilityScore' | 'riskLevel'>>): Promise<SupplierWithCalculated | undefined> {
    const weights = await this.getMetricWeights();
    const supplierId = parseInt(id);
    if (isNaN(supplierId)) return undefined;

    // Apply updates first
    const result = await db.update(suppliers).set(updates).where(eq(suppliers.id, supplierId)).returning();
    if (result.length === 0) return undefined;

    // Recalculate score and risk
    const updated = result[0] as Supplier;
    const newScore = calculateSustainabilityScore(updated, weights);
    const newRisk = calculateRiskLevel(newScore);
    const result2 = await db.update(suppliers).set({ sustainabilityScore: newScore, riskLevel: newRisk }).where(eq(suppliers.id, supplierId)).returning();
    return addCalculatedFields(result2[0], weights);
  }

  async deleteSupplier(id: string): Promise<boolean> {
    const supplierId = parseInt(id);
    if (isNaN(supplierId)) return false;
    
    const result = await db.delete(suppliers).where(eq(suppliers.id, supplierId)).returning({ id: suppliers.id });
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
      } as unknown as Weights;
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