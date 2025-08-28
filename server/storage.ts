import { type Supplier, type InsertSupplier, type SupplierWithCalculated, type User, type InsertUser } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getSupplier(id: string): Promise<SupplierWithCalculated | undefined>;
  getAllSuppliers(): Promise<SupplierWithCalculated[]>;
  createSupplier(supplier: InsertSupplier): Promise<SupplierWithCalculated>;
  updateSupplier(id: string, supplier: Partial<InsertSupplier>): Promise<SupplierWithCalculated | undefined>;
  deleteSupplier(id: string): Promise<boolean>;
}

function calculateSustainabilityScore(supplier: Supplier): number {
  let score = 100;
  
  // Carbon footprint penalty (higher = worse)
  if (supplier.carbonFootprint > 3000) score -= 30;
  else if (supplier.carbonFootprint > 2000) score -= 20;
  else if (supplier.carbonFootprint > 1000) score -= 10;
  
  // Water usage penalty (higher = worse)
  if (supplier.waterUsage > 2000) score -= 20;
  else if (supplier.waterUsage > 1500) score -= 15;
  else if (supplier.waterUsage > 1000) score -= 10;
  
  // Risk score penalty (higher = worse)
  if (supplier.riskScore > 70) score -= 25;
  else if (supplier.riskScore > 40) score -= 15;
  else if (supplier.riskScore > 20) score -= 5;
  
  // Bonuses for good practices
  if (supplier.recyclingPolicy) score += 10;
  if (supplier.ISO14001) score += 15;
  
  return Math.max(0, Math.min(100, score));
}

function calculateRiskLevel(riskScore: number): 'Low' | 'Medium' | 'High' {
  if (riskScore <= 30) return 'Low';
  if (riskScore <= 60) return 'Medium';
  return 'High';
}

function addCalculatedFields(supplier: Supplier): SupplierWithCalculated {
  return {
    ...supplier,
    sustainabilityScore: calculateSustainabilityScore(supplier),
    riskLevel: calculateRiskLevel(supplier.riskScore),
  };
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private suppliers: Map<string, Supplier>;

  constructor() {
    this.users = new Map();
    this.suppliers = new Map();
    this.initializeSampleData();
  }

  private initializeSampleData() {
    const sampleSuppliers: (Omit<Supplier, 'id'>)[] = [
      {
        name: "GreenSupply Co.",
        carbonFootprint: 1245,
        waterUsage: 780,
        recyclingPolicy: true,
        ISO14001: true,
        riskScore: 15,
        historicalCarbon: [1400, 1350, 1300, 1280, 1245, 1200, 1180, 1160, 1140, 1120, 1100, 1080]
      },
      {
        name: "EcoTech Industries",
        carbonFootprint: 3890,
        waterUsage: 2100,
        recyclingPolicy: false,
        ISO14001: false,
        riskScore: 75,
        historicalCarbon: [4200, 4150, 4100, 4050, 4000, 3950, 3900, 3890, 3880, 3870, 3860, 3850]
      },
      {
        name: "Sustainable Materials Ltd.",
        carbonFootprint: 2100,
        waterUsage: 1200,
        recyclingPolicy: true,
        ISO14001: true,
        riskScore: 25,
        historicalCarbon: [2300, 2250, 2200, 2180, 2150, 2120, 2100, 2080, 2060, 2040, 2020, 2000]
      },
      {
        name: "Clean Energy Corp.",
        carbonFootprint: 890,
        waterUsage: 450,
        recyclingPolicy: true,
        ISO14001: true,
        riskScore: 10,
        historicalCarbon: [1100, 1050, 1000, 950, 920, 900, 890, 880, 870, 860, 850, 840]
      },
      {
        name: "Zero Waste Solutions",
        carbonFootprint: 1567,
        waterUsage: 890,
        recyclingPolicy: true,
        ISO14001: true,
        riskScore: 18,
        historicalCarbon: [1800, 1750, 1700, 1650, 1600, 1580, 1567, 1550, 1540, 1530, 1520, 1510]
      },
      {
        name: "Renewable Resources Inc.",
        carbonFootprint: 2340,
        waterUsage: 1450,
        recyclingPolicy: false,
        ISO14001: true,
        riskScore: 35,
        historicalCarbon: [2600, 2550, 2500, 2450, 2400, 2370, 2340, 2320, 2300, 2280, 2260, 2240]
      },
      {
        name: "Standard Supply Chain",
        carbonFootprint: 2890,
        waterUsage: 1780,
        recyclingPolicy: false,
        ISO14001: false,
        riskScore: 55,
        historicalCarbon: [3100, 3050, 3000, 2950, 2920, 2900, 2890, 2880, 2870, 2860, 2850, 2840]
      },
      {
        name: "Basic Materials Corp",
        carbonFootprint: 3245,
        waterUsage: 2010,
        recyclingPolicy: false,
        ISO14001: false,
        riskScore: 68,
        historicalCarbon: [3500, 3450, 3400, 3350, 3300, 3270, 3245, 3220, 3200, 3180, 3160, 3140]
      },
      {
        name: "Average Industrial Co.",
        carbonFootprint: 2567,
        waterUsage: 1567,
        recyclingPolicy: true,
        ISO14001: false,
        riskScore: 42,
        historicalCarbon: [2800, 2750, 2700, 2650, 2600, 2580, 2567, 2550, 2540, 2530, 2520, 2510]
      },
      {
        name: "Mid-tier Suppliers Ltd.",
        carbonFootprint: 2234,
        waterUsage: 1334,
        recyclingPolicy: true,
        ISO14001: false,
        riskScore: 38,
        historicalCarbon: [2500, 2450, 2400, 2350, 2300, 2270, 2234, 2220, 2210, 2200, 2190, 2180]
      },
      {
        name: "Good Quality Materials",
        carbonFootprint: 1678,
        waterUsage: 987,
        recyclingPolicy: true,
        ISO14001: true,
        riskScore: 22,
        historicalCarbon: [1900, 1850, 1800, 1750, 1700, 1680, 1678, 1670, 1660, 1650, 1640, 1630]
      },
      {
        name: "Better Supply Systems",
        carbonFootprint: 1456,
        waterUsage: 823,
        recyclingPolicy: true,
        ISO14001: true,
        riskScore: 19,
        historicalCarbon: [1700, 1650, 1600, 1550, 1500, 1480, 1456, 1450, 1440, 1430, 1420, 1410]
      },
      {
        name: "Quality Corporation",
        carbonFootprint: 1234,
        waterUsage: 756,
        recyclingPolicy: true,
        ISO14001: true,
        riskScore: 16,
        historicalCarbon: [1500, 1450, 1400, 1350, 1300, 1270, 1234, 1220, 1210, 1200, 1190, 1180]
      },
      {
        name: "Premium Supply Co.",
        carbonFootprint: 1123,
        waterUsage: 678,
        recyclingPolicy: true,
        ISO14001: true,
        riskScore: 14,
        historicalCarbon: [1400, 1350, 1300, 1250, 1200, 1160, 1123, 1110, 1100, 1090, 1080, 1070]
      },
      {
        name: "Excellence Materials Inc.",
        carbonFootprint: 987,
        waterUsage: 543,
        recyclingPolicy: true,
        ISO14001: true,
        riskScore: 12,
        historicalCarbon: [1200, 1150, 1100, 1050, 1020, 1000, 987, 980, 970, 960, 950, 940]
      }
    ];

    sampleSuppliers.forEach(supplier => {
      const id = randomUUID();
      this.suppliers.set(id, { id, ...supplier });
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getSupplier(id: string): Promise<SupplierWithCalculated | undefined> {
    const supplier = this.suppliers.get(id);
    return supplier ? addCalculatedFields(supplier) : undefined;
  }

  async getAllSuppliers(): Promise<SupplierWithCalculated[]> {
    return Array.from(this.suppliers.values()).map(addCalculatedFields);
  }

  async createSupplier(insertSupplier: InsertSupplier): Promise<SupplierWithCalculated> {
    const id = randomUUID();
    const supplier: Supplier = { 
      ...insertSupplier, 
      id,
      historicalCarbon: insertSupplier.historicalCarbon || []
    };
    this.suppliers.set(id, supplier);
    return addCalculatedFields(supplier);
  }

  async updateSupplier(id: string, updates: Partial<InsertSupplier>): Promise<SupplierWithCalculated | undefined> {
    const supplier = this.suppliers.get(id);
    if (!supplier) return undefined;

    const updatedSupplier: Supplier = { ...supplier, ...updates };
    this.suppliers.set(id, updatedSupplier);
    return addCalculatedFields(updatedSupplier);
  }

  async deleteSupplier(id: string): Promise<boolean> {
    return this.suppliers.delete(id);
  }
}

export const storage = new MemStorage();
