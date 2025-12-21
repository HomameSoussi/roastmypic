import { cookies } from 'next/headers';
import crypto from 'crypto';

// Admin credentials (in production, use environment variables)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || hashPassword('admin123'); // Default password

// Session management
const SESSION_COOKIE_NAME = 'admin_session';
const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface Session {
  username: string;
  createdAt: number;
  expiresAt: number;
}

// In-memory session store (in production, use Redis or database)
const sessions = new Map<string, Session>();

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  const passwordHash = hashPassword(password);
  return username === ADMIN_USERNAME && passwordHash === ADMIN_PASSWORD_HASH;
}

export async function createSession(username: string): Promise<string> {
  const token = generateSessionToken();
  const now = Date.now();
  
  sessions.set(token, {
    username,
    createdAt: now,
    expiresAt: now + SESSION_DURATION,
  });
  
  return token;
}

export async function getSession(token: string): Promise<Session | null> {
  const session = sessions.get(token);
  
  if (!session) {
    return null;
  }
  
  // Check if session expired
  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }
  
  return session;
}

export async function deleteSession(token: string): Promise<void> {
  sessions.delete(token);
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    
    if (!sessionToken) {
      return false;
    }
    
    const session = await getSession(sessionToken);
    return session !== null;
  } catch (error) {
    return false;
  }
}

export async function requireAuth(): Promise<Session> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  
  if (!sessionToken) {
    throw new Error('Not authenticated');
  }
  
  const session = await getSession(sessionToken);
  
  if (!session) {
    throw new Error('Invalid or expired session');
  }
  
  return session;
}

// Cleanup expired sessions periodically
setInterval(() => {
  const now = Date.now();
  for (const [token, session] of sessions.entries()) {
    if (now > session.expiresAt) {
      sessions.delete(token);
    }
  }
}, 60 * 60 * 1000); // Every hour
