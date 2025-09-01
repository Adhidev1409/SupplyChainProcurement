import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { insertSupplierInputSchema, weightsSchema, loginSchema } from "@shared/schema";
import { z } from "zod";

// Extend Express Request and Session to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

declare module "express-session" {
  interface SessionData {
    user?: any;
  }
}

// Authentication middleware
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  req.user = req.session.user;
  next();
};

// Admin only middleware
const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false, // set true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000, // 24h
      },
    })
  );

  // API status
  app.get("/api/status", (req, res) => {
    res.json({ message: "Supply Chain Procurement API Server is running", status: "ok" });
  });

  // ---------------- AUTH ----------------
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      const user = await storage.authenticateUser(username, password);

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // exclude password before storing in session
      const { password: _, ...userWithoutPassword } = user;
      req.session.user = userWithoutPassword;

      res.json({ message: "Login successful", user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) return res.status(500).json({ message: "Logout failed" });
      res.json({ message: "Logout successful" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (!req.session.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json({ user: req.session.user });
  });

  // ---------------- SUPPLIERS ----------------
  app.get("/api/suppliers", requireAdmin, async (req, res) => {
    try {
      const suppliers = await storage.getAllSuppliers();
      res.json(suppliers);
    } catch {
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  app.get("/api/suppliers/:id", async (req, res) => {
    try {
      const supplier = await storage.getSupplier(req.params.id);
      if (!supplier) return res.status(404).json({ message: "Supplier not found" });
      res.json(supplier);
    } catch {
      res.status(500).json({ message: "Failed to fetch supplier" });
    }
  });

  app.post("/api/suppliers", async (req, res) => {
    try {
      const supplierData = insertSupplierInputSchema.parse(req.body);
      const supplier = await storage.createSupplier(supplierData);
      res.status(201).json(supplier);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid supplier data", errors: error.errors });
      }
      console.error("Create supplier failed:", error);
      res.status(500).json({ message: "Failed to create supplier", error: (error as any)?.message });
    }
  });

  app.patch("/api/suppliers/:id", async (req, res) => {
    try {
      const updateData = insertSupplierInputSchema.partial().parse(req.body);
      const supplier = await storage.updateSupplier(req.params.id, updateData);
      if (!supplier) return res.status(404).json({ message: "Supplier not found" });
      res.json(supplier);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid supplier data", errors: error.errors });
      }
      console.error("Update supplier failed:", error);
      res.status(500).json({ message: "Failed to update supplier", error: (error as any)?.message });
    }
  });

  app.delete("/api/suppliers/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteSupplier(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Supplier not found" });
      res.status(204).send();
    } catch {
      res.status(500).json({ message: "Failed to delete supplier" });
    }
  });

  // ---------------- METRIC WEIGHTS ----------------
  app.get("/api/metric-weights", async (req, res) => {
    try {
      const weights = await storage.getMetricWeights();
      res.json(weights);
    } catch (error) {
      console.error("Failed to fetch metric weights:", error);
      res.status(500).json({ message: "Failed to fetch metric weights" });
    }
  });

  const saveWeightsHandler = async (req: Request, res: Response) => {
    try {
      const newWeights = weightsSchema.parse(req.body);
      const savedWeights = await storage.saveMetricWeights(newWeights);
      res.status(200).json(savedWeights);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid weights data", errors: error.errors });
      }
      console.error("Failed to save metric weights:", error);
      res.status(500).json({ message: "Failed to save metric weights" });
    }
  };

  app.post("/api/metric-weights", saveWeightsHandler);
  app.put("/api/metric-weights", saveWeightsHandler);

  // ---------------- USER-SPECIFIC ----------------
  app.get("/api/my-suppliers", requireAuth, async (req, res) => {
    try {
      const suppliers = await storage.getSuppliersForUser(req.user);
      res.json(suppliers);
    } catch {
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  app.get("/api/dashboard/metrics", requireAuth, async (req, res) => {
    try {
      const suppliers = await storage.getSuppliersForUser(req.user);

      const totalSuppliers = suppliers.length;
      const avgScore =
        suppliers.length > 0
          ? suppliers.reduce((sum, s) => sum + s.sustainabilityScore, 0) / totalSuppliers
          : 0;
      const certifiedSuppliers = suppliers.filter((s) => s.ISO14001).length;

      const riskDistribution = {
        low: suppliers.filter((s) => s.riskLevel === "Low").length,
        medium: suppliers.filter((s) => s.riskLevel === "Medium").length,
        high: suppliers.filter((s) => s.riskLevel === "High").length,
      };

      res.json({
        totalSuppliers,
        avgScore: Math.round(avgScore * 10) / 10,
        certifiedSuppliers,
        riskDistribution,
      });
    } catch {
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // ---------------- USERS (ADMIN ONLY) ----------------
  app.post("/api/users", requireAdmin, async (req, res) => {
    try {
      const userData = req.body;
      const user = await storage.createUser(userData);
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch {
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.get("/api/users", requireAdmin, async (req, res) => {
    try {
      const allUsers = await storage.getUsersByRole("supplier");
      const usersWithoutPasswords = allUsers.map(({ password: _, ...u }) => u);
      res.json(usersWithoutPasswords);
    } catch {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
