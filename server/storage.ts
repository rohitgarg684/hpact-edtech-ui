import { type User, type InsertUser, type Session } from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  verifyPassword(password: string, hash: string): Promise<boolean>;
  hashPassword(password: string): Promise<string>;
  createSession(username: string): Promise<string>;
  getSession(sessionId: string): Promise<Session | undefined>;
  deleteSession(sessionId: string): Promise<void>;
  recordLoginAttempt(username: string): Promise<void>;
  isRateLimited(username: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private sessions: Map<string, Session>;
  private loginAttempts: Map<string, Date[]>;

  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.loginAttempts = new Map();
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
    const hashedPassword = await this.hashPassword(insertUser.password);
    const user: User = { 
      ...insertUser, 
      id, 
      password: hashedPassword,
      created_at: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async createSession(username: string): Promise<string> {
    const sessionId = randomUUID();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour session

    const session: Session = {
      id: sessionId,
      username,
      created_at: new Date(),
      expires_at: expiresAt,
    };

    this.sessions.set(sessionId, session);
    return sessionId;
  }

  async getSession(sessionId: string): Promise<Session | undefined> {
    const session = this.sessions.get(sessionId);
    if (session && session.expires_at > new Date()) {
      return session;
    }
    if (session) {
      this.sessions.delete(sessionId);
    }
    return undefined;
  }

  async deleteSession(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }

  async recordLoginAttempt(username: string): Promise<void> {
    const attempts = this.loginAttempts.get(username) || [];
    attempts.push(new Date());
    this.loginAttempts.set(username, attempts);
  }

  async isRateLimited(username: string): Promise<boolean> {
    const attempts = this.loginAttempts.get(username) || [];
    const recentAttempts = attempts.filter(
      (attempt) => Date.now() - attempt.getTime() < 15 * 60 * 1000 // 15 minutes
    );
    
    // Update the attempts list to remove old ones
    this.loginAttempts.set(username, recentAttempts);
    
    return recentAttempts.length >= 5; // Max 5 attempts in 15 minutes
  }
}

export const storage = new MemStorage();
