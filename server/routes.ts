import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { registerUserSchema, loginUserSchema, chatRequestSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Register endpoint
  app.post("/register", async (req, res) => {
    try {
      // Validate request body
      const validationResult = registerUserSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: validationResult.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }

      const userData = validationResult.data;

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({
          message: "Username already exists"
        });
      }

      // Create user
      const user = await storage.createUser(userData);
      
      res.status(201).json({
        message: `User ${user.username} registered successfully!`,
        user: {
          id: user.id,
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
          user_type: user.user_type
        }
      });

    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({
        message: "Internal server error"
      });
    }
  });

  // Login endpoint
  app.post("/login", async (req, res) => {
    try {
      // Validate request body
      const validationResult = loginUserSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid credentials"
        });
      }

      const { username, password } = validationResult.data;

      // Check rate limit
      const isRateLimited = await storage.isRateLimited(username);
      if (isRateLimited) {
        return res.status(429).json({
          message: "Too many login attempts. Try again later."
        });
      }

      // Find user
      const user = await storage.getUserByUsername(username);
      if (!user) {
        await storage.recordLoginAttempt(username);
        return res.status(401).json({
          message: "Invalid credentials"
        });
      }

      // Verify password
      const isPasswordValid = await storage.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        await storage.recordLoginAttempt(username);
        return res.status(401).json({
          message: "Invalid credentials"
        });
      }

      // Create session
      const sessionId = await storage.createSession(username);

      res.json({
        session_id: sessionId,
        user: {
          id: user.id,
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
          user_type: user.user_type
        }
      });

    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        message: "Internal server error"
      });
    }
  });

  // Logout endpoint
  app.post("/logout", async (req, res) => {
    try {
      const sessionId = req.headers.authorization?.replace('Bearer ', '');
      
      if (sessionId) {
        await storage.deleteSession(sessionId);
      }

      res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({
        message: "Internal server error"
      });
    }
  });

  // Get current user endpoint
  app.get("/user", async (req, res) => {
    try {
      const sessionId = req.headers.authorization?.replace('Bearer ', '');
      
      if (!sessionId) {
        return res.status(401).json({
          message: "No session provided"
        });
      }

      const session = await storage.getSession(sessionId);
      if (!session) {
        return res.status(401).json({
          message: "Invalid session"
        });
      }

      const user = await storage.getUserByUsername(session.username);
      if (!user) {
        return res.status(401).json({
          message: "User not found"
        });
      }

      res.json({
        user: {
          id: user.id,
          username: user.username,
          first_name: user.first_name,
          last_name: user.last_name,
          user_type: user.user_type
        }
      });

    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({
        message: "Internal server error"
      });
    }
  });

  // Chat endpoint
  app.post("/chat", async (req, res) => {
    try {
      const sessionId = req.headers.authorization?.replace('Bearer ', '');
      
      if (!sessionId) {
        return res.status(401).json({
          message: "No session provided"
        });
      }

      const session = await storage.getSession(sessionId);
      if (!session) {
        return res.status(401).json({
          message: "Invalid session"
        });
      }

      // Validate request body
      const validationResult = chatRequestSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Validation failed",
          errors: validationResult.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        });
      }

      const { prompt } = validationResult.data;

      // Simulate AI response (in real implementation, this would call your AI service)
      const response = `Thank you for your message: "${prompt}". This is a simulated AI response. In your actual implementation, this would be processed by your OpenAI service with chat history context and RAG enrichment.`;

      res.json({
        response: response
      });

    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({
        message: "Internal server error"
      });
    }
  });

  // Save chat endpoint
  app.post("/save-chat", async (req, res) => {
    try {
      const sessionId = req.headers.authorization?.replace('Bearer ', '');
      
      if (!sessionId) {
        return res.status(401).json({
          message: "No session provided"
        });
      }

      const session = await storage.getSession(sessionId);
      if (!session) {
        return res.status(401).json({
          message: "Invalid session"
        });
      }

      // Simulate saving chat (in real implementation, this would save embeddings)
      res.json({
        message: "Chat session saved successfully",
        session_id: sessionId
      });

    } catch (error) {
      console.error("Save chat error:", error);
      res.status(500).json({
        message: "Internal server error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
