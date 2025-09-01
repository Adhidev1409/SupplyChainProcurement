import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, jsonb, serial, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const appSettings = pgTable("app_settings", {
  // We use a text ID that we will hardcode to 'global' to ensure we only ever have one row.
  id: text("id").primaryKey(), 
  
  // Individual columns for each metric for easy backend access
  carbonFootprint: integer("carbon_footprint").notNull(),
  waterUsage: integer("water_usage").notNull(),
  wasteReduction: integer("waste_reduction").notNull(),
  energyEfficiency: integer("energy_efficiency").notNull(),
  iso14001: integer("iso14001").notNull(),
  recyclingPolicy: integer("recycling_policy").notNull(),
  waterPolicy: integer("water_policy").notNull(),
  sustainabilityReport: integer("sustainability_report").notNull(),
});

export const weightsSchema = createInsertSchema(appSettings).omit({
  id: true,
});

export type Weights = z.infer<typeof weightsSchema>;
export type AppSettings = typeof appSettings.$inferSelect;
export type InsertAppSettings = typeof appSettings.$inferInsert;

export const suppliers = pgTable("suppliers", {
  // Use integer with identity for auto-incrementing primary key compatible with drizzle-kit
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  name: text("name").notNull(),
  productCategory: text("product_category").notNull(),
  carbonFootprint: real("carbon_footprint").notNull(),
  waterUsage: real("water_usage").notNull(),
  // Waste metrics: legacy generation plus requested waste reduction percent (0-100)
  wasteGeneration: real("waste_generation").notNull(),
  wasteReduction: real("waste_reduction").notNull().default(0),
  energyEfficiency: real("energy_efficiency").notNull(),
  laborPractices: real("labor_practices").notNull(),
  transportCostPerUnit: real("transport_cost_per_unit").notNull(),
  onTimeDelivery: real("on_time_delivery").notNull(),
  regulatoryFlags: integer("regulatory_flags").notNull(),
  leadTimeDays: integer("lead_time_days").notNull(),
  ISO14001: boolean("iso14001").notNull().default(false),
  // Newly requested policy/report flags
  recyclingPolicy: boolean("recycling_policy").notNull().default(false),
  waterPolicy: boolean("water_policy").notNull().default(false),
  sustainabilityReport: boolean("sustainability_report").notNull().default(false),
  sustainabilityScore: real("sustainability_score").notNull(),
  riskLevel: text("risk_level").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Input schema for creating/updating suppliers from clients: exclude computed fields
export const insertSupplierInputSchema = insertSupplierSchema.omit({
  sustainabilityScore: true,
  riskLevel: true,
});

export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type InsertSupplierInput = z.infer<typeof insertSupplierInputSchema>;
export type Supplier = typeof suppliers.$inferSelect;

// Extended supplier type with calculated fields
export type SupplierWithCalculated = Supplier & {
  sustainabilityScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
};

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: varchar("role").notNull().default("supplier"), // 'admin' or 'supplier'
  supplierId: integer("supplier_id").references(() => suppliers.id), // Link to supplier for supplier users
  email: text("email").notNull(),
  createdAt: varchar("created_at").notNull().default(sql`now()`),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
  supplierId: true,
  email: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Login schema for authentication
export const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export type LoginData = z.infer<typeof loginSchema>;
