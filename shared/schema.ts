import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(), // email address
  first_name: text("first_name").notNull(),
  last_name: text("last_name").notNull(),
  password: text("password").notNull(),
  user_type: text("user_type").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  expires_at: timestamp("expires_at").notNull(),
});

export const loginAttempts = pgTable("login_attempts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull(),
  attempted_at: timestamp("attempted_at").defaultNow(),
});

// Registration schema with validation - standalone schema not tied to DB table
export const registerUserSchema = z.object({
  username: z.string().email("Please enter a valid email address"),
  first_name: z.string().min(1, "First name is required").max(50, "First name must be 50 characters or less"),
  last_name: z.string().min(1, "Last name is required").max(50, "Last name must be 50 characters or less"),
  password: z.string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/\d/, "Password must contain at least one digit")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),
});

// Login schema
export const loginUserSchema = z.object({
  username: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type RegisterUser = z.infer<typeof registerUserSchema>;
export type LoginUser = z.infer<typeof loginUserSchema>;
export type User = typeof users.$inferSelect;
export type Session = typeof sessions.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Chat-related schemas
export const chatSessions = pgTable("chat_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  user_id: varchar("user_id").notNull(),
  title: text("title").notNull(),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  session_id: varchar("session_id").notNull(),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});

// Chat request schema
export const chatRequestSchema = z.object({
  prompt: z.string().min(1, "Message cannot be empty").max(4000, "Message too long"),
  session_id: z.string().optional(),
});

export const createChatSessionSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type CreateChatSession = z.infer<typeof createChatSessionSchema>;
export type ChatSession = typeof chatSessions.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatSession = typeof chatSessions.$inferInsert;
export type InsertChatMessage = typeof chatMessages.$inferInsert;
