import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const suppliers = pgTable("suppliers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  carbonFootprint: integer("carbon_footprint").notNull(),
  waterUsage: integer("water_usage").notNull(),
  recyclingPolicy: boolean("recycling_policy").notNull().default(false),
  ISO14001: boolean("iso14001").notNull().default(false),
  wasteReduction: integer("waste_reduction").notNull().default(0),
  energyEfficiency: integer("energy_efficiency").notNull().default(0),
  waterPolicy: boolean("water_policy").notNull().default(false),
  sustainabilityReport: boolean("sustainability_report").notNull().default(false),
  location: text("location").notNull().default("Unknown"),
  employeeCount: integer("employee_count").notNull().default(0),
  riskScore: integer("risk_score").notNull(),
  historicalCarbon: jsonb("historical_carbon").$type<number[]>().notNull().default([]),
});

export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
});

export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
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
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
