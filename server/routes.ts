import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPracticeSessionSchema, insertQuestionResponseSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get current user (simplified - in real app would use session/auth)
  app.get("/api/user", async (req, res) => {
    try {
      const user = await storage.getUser(1); // Default user for demo
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get questions by role and category
  app.get("/api/questions", async (req, res) => {
    try {
      const { role, category } = req.query;
      const questions = await storage.getQuestions(
        role as string,
        category as string
      );
      res.json(questions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  // Get random questions for practice
  app.get("/api/questions/random", async (req, res) => {
    try {
      const { role, category, limit = "20" } = req.query;
      
      if (!role || !category) {
        return res.status(400).json({ message: "Role and category are required" });
      }

      const questions = await storage.getRandomQuestions(
        role as string,
        category as string,
        parseInt(limit as string)
      );
      res.json(questions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch random questions" });
    }
  });

  // Get specific question
  app.get("/api/questions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const question = await storage.getQuestion(id);
      
      if (!question) {
        return res.status(404).json({ message: "Question not found" });
      }
      
      res.json(question);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch question" });
    }
  });

  // Create practice session
  app.post("/api/sessions", async (req, res) => {
    try {
      const validatedData = insertPracticeSessionSchema.parse({
        ...req.body,
        userId: 1, // Default user for demo
      });
      
      const session = await storage.createPracticeSession(validatedData);
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid session data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create practice session" });
    }
  });

  // Get practice session
  app.get("/api/sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const session = await storage.getPracticeSession(id);
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch session" });
    }
  });

  // Update practice session
  app.patch("/api/sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const session = await storage.updatePracticeSession(id, req.body);
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to update session" });
    }
  });

  // Get user's active sessions
  app.get("/api/users/:userId/sessions/active", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const sessions = await storage.getUserActiveSessions(userId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active sessions" });
    }
  });

  // Submit question response
  app.post("/api/responses", async (req, res) => {
    try {
      const validatedData = insertQuestionResponseSchema.parse(req.body);
      const response = await storage.createQuestionResponse(validatedData);
      res.status(201).json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid response data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to submit response" });
    }
  });

  // Get session responses
  app.get("/api/sessions/:sessionId/responses", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const responses = await storage.getSessionResponses(sessionId);
      res.json(responses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch session responses" });
    }
  });

  // Update question response (e.g., to flag for review)
  app.patch("/api/responses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const response = await storage.updateQuestionResponse(id, req.body);
      
      if (!response) {
        return res.status(404).json({ message: "Response not found" });
      }
      
      res.json(response);
    } catch (error) {
      res.status(500).json({ message: "Failed to update response" });
    }
  });

  // Get user progress
  app.get("/api/users/:userId/progress", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const progress = await storage.getUserProgress(userId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user progress" });
    }
  });

  // Get user stats
  app.get("/api/users/:userId/stats", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const stats = await storage.getUserStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  // Update user progress
  app.patch("/api/users/:userId/progress", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { role, category, ...updates } = req.body;
      
      if (!role || !category) {
        return res.status(400).json({ message: "Role and category are required" });
      }
      
      const progress = await storage.updateUserProgress(userId, role, category, updates);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user progress" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
