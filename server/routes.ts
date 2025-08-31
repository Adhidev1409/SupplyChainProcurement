import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { insertSupplierSchema, weightsSchema, loginSchema, users } from "@shared/schema";
import { z } from "zod";

// Extend Express Request and Session to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

declare module 'express-session' {
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
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // API status route (moved from root to avoid conflict with React app)
  app.get('/api/status', (req, res) => {
    res.json({ message: 'Supply Chain Procurement API Server is running', status: 'ok' });
  });

  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      const user = await storage.authenticateUser(username, password);

      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Set user session (exclude password)
      const { password: _, ...userWithoutPassword } = user;
      req.session.user = userWithoutPassword;

      res.json({
        message: "Login successful",
        user: userWithoutPassword
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (!req.session.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json({ user: req.session.user });
  });

  // Get all suppliers (admin only)
  app.get("/api/suppliers", requireAdmin, async (req, res) => {
    try {
      const suppliers = await storage.getAllSuppliers();
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  // Get single supplier
  app.get("/api/suppliers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const supplier = await storage.getSupplier(id);
      
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      
      res.json(supplier);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch supplier" });
    }
  });

  // Create new supplier
  app.post("/api/suppliers", async (req, res) => {
    try {
      const supplierData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(supplierData);
      res.status(201).json(supplier);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid supplier data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create supplier" });
    }
  });

  // Update supplier
  app.patch("/api/suppliers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = insertSupplierSchema.partial().parse(req.body);
      const supplier = await storage.updateSupplier(id, updateData);
      
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      
      res.json(supplier);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid supplier data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update supplier" });
    }
  });

  // Delete supplier
  app.delete("/api/suppliers/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteSupplier(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete supplier" });
    }
  });

  // Get the current metric weights
  app.get("/api/metric-weights", async (req, res) => {
    try {
      const weights = await storage.getMetricWeights();
      res.json(weights);
    } catch (error) {
      console.error("Failed to fetch metric weights:", error);
      res.status(500).json({ message: "Failed to fetch metric weights" });
    }
  });

  // Save/update the metric weights
  app.post("/api/metric-weights", async (req, res) => {
    try {
      // Validate the incoming data against your Zod schema
      const newWeights = weightsSchema.parse(req.body);
      const savedWeights = await storage.saveMetricWeights(newWeights);
      res.status(200).json(savedWeights);
    } catch (error) {
      // If validation fails, Zod throws an error we can catch
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid weights data", errors: error.errors });
      }
      // Handle other potential errors (e.g., database connection issue)
      console.error("Failed to save metric weights:", error);
      res.status(500).json({ message: "Failed to save metric weights" });
    }
  });

  // Get suppliers for authenticated user (user-specific)
  app.get("/api/my-suppliers", requireAuth, async (req, res) => {
    try {
      const suppliers = await storage.getSuppliersForUser(req.user);
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  // Get dashboard metrics (user-specific)
  app.get("/api/dashboard/metrics", requireAuth, async (req, res) => {
    try {
      const suppliers = await storage.getSuppliersForUser(req.user);

      const totalSuppliers = suppliers.length;
      const avgScore = suppliers.length > 0 ?
        suppliers.reduce((sum, s) => sum + s.sustainabilityScore, 0) / totalSuppliers : 0;
      const certifiedSuppliers = suppliers.filter(s => s.ISO14001).length;

      const riskDistribution = {
        low: suppliers.filter(s => s.riskLevel === 'Low').length,
        medium: suppliers.filter(s => s.riskLevel === 'Medium').length,
        high: suppliers.filter(s => s.riskLevel === 'High').length,
      };

      res.json({
        totalSuppliers,
        avgScore: Math.round(avgScore * 10) / 10,
        certifiedSuppliers,
        riskDistribution,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dashboard metrics" });
    }
  });

  // Create user (admin only)
  app.post("/api/users", requireAdmin, async (req, res) => {
    try {
      const userData = req.body;
      const user = await storage.createUser(userData);
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Get users (admin only)
  app.get("/api/users", requireAdmin, async (req, res) => {
    try {
      const allUsers = await storage.getUsersByRole('supplier');
      const usersWithoutPasswords = allUsers.map(user => {
        const { password: _, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
