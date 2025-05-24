import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  currentRole: text("current_role").notNull().default("software-developer"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // communication, collaboration, leadership, etc.
  role: text("role").notNull(), // software-developer, tech-lead, architect, principal
  difficulty: text("difficulty").notNull(), // junior, mid, senior
  sampleAnswer: text("sample_answer").notNull(),
  tips: text("tips").array().notNull(),
  keywords: text("keywords").array().notNull(),
});

export const practiceSessions = pgTable("practice_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  role: text("role").notNull(),
  category: text("category").notNull(),
  duration: integer("duration").notNull(), // in minutes
  questionsCompleted: integer("questions_completed").notNull().default(0),
  totalQuestions: integer("total_questions").notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  isActive: boolean("is_active").notNull().default(true),
});

export const questionResponses = pgTable("question_responses", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => practiceSessions.id).notNull(),
  questionId: integer("question_id").references(() => questions.id).notNull(),
  response: text("response").notNull(),
  timeSpent: integer("time_spent").notNull(), // in seconds
  isFlagged: boolean("is_flagged").notNull().default(false),
  answeredAt: timestamp("answered_at").defaultNow().notNull(),
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  role: text("role").notNull(),
  category: text("category").notNull(),
  questionsCompleted: integer("questions_completed").notNull().default(0),
  totalPracticeTime: integer("total_practice_time").notNull().default(0), // in minutes
  averageScore: integer("average_score").notNull().default(0), // percentage
  lastPracticed: timestamp("last_practiced"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
});

export const insertPracticeSessionSchema = createInsertSchema(practiceSessions).omit({
  id: true,
  startedAt: true,
  completedAt: true,
});

export const insertQuestionResponseSchema = createInsertSchema(questionResponses).omit({
  id: true,
  answeredAt: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  lastPracticed: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;

export type PracticeSession = typeof practiceSessions.$inferSelect;
export type InsertPracticeSession = z.infer<typeof insertPracticeSessionSchema>;

export type QuestionResponse = typeof questionResponses.$inferSelect;
export type InsertQuestionResponse = z.infer<typeof insertQuestionResponseSchema>;

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;

// Enums
export const ROLES = ["software-developer", "tech-lead", "architect", "principal"] as const;
export const CATEGORIES = ["communication", "collaboration", "leadership", "problem-solving", "technical-mentoring"] as const;
export const DIFFICULTIES = ["junior", "mid", "senior"] as const;

export interface VideoQuestion {
  id: number;
  category: string;
  question: string;
  timeLimit: number;
  tips: string[];
  difficulty: string;
  role: string;
  evaluation?: {
    keywords: string[];
    expectedDuration: number;
    sampleVideoUrl?: string;
    idealResponse: string;
    evaluationCriteria: {
      technicalAccuracy: string[];
      communication: string[];
      structure: string[];
    };
    scoringRubric: {
      technical: number;
      communication: number;
      structure: number;
      timeManagement: number;
    };
  };
}