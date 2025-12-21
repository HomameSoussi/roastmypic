import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

// JWT secret - MUST be set in environment variables for production
const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-key-in-production-use-long-random-string';
const JWT_EXPIRES_IN = '7d'; // Token expires in 7 days

// Admin credentials from environment variables
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || '$2a$10$rKZqxQxGxvK5vJ5vJ5vJ5eZqxQxGxvK5vJ5vJ5vJ5eZqxQxGxvK5v'; // Default: admin123

export interface AdminUser {
  username: string;
  role: 'admin' | 'superadmin';
}

export interface JWTPayload extends AdminUser {
  iat: number;
  exp: number;
}

/**
 * Hash a password using bcrypt
 * Use this to generate password hashes for environment variables
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    return false;
  }
}

/**
 * Verify admin credentials
 */
export async function verifyCredentials(username: string, password: string): Promise<boolean> {
  if (username !== ADMIN_USERNAME) {
    return false;
  }
  
  return await verifyPassword(password, ADMIN_PASSWORD_HASH);
}

/**
 * Generate a JWT token for an admin user
 */
export function generateToken(user: AdminUser): string {
  return jwt.sign(
    {
      username: user.username,
      role: user.role,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRES_IN,
    }
  );
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Get the current admin user from the request cookies
 */
export async function getCurrentAdmin(): Promise<AdminUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_session')?.value;

    if (!token) {
      return null;
    }

    const payload = verifyToken(token);
    if (!payload) {
      return null;
    }

    return {
      username: payload.username,
      role: payload.role,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const admin = await getCurrentAdmin();
  return admin !== null;
}

/**
 * Set the admin session cookie with JWT
 */
export async function setAdminSession(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });
}

/**
 * Clear the admin session cookie
 */
export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_session');
}

/**
 * Middleware to require authentication
 * Throws an error if not authenticated
 */
export async function requireAuth(): Promise<AdminUser> {
  const admin = await getCurrentAdmin();
  
  if (!admin) {
    throw new Error('Unauthorized');
  }
  
  return admin;
}

/**
 * Create a session for an admin user
 * Returns the JWT token
 */
export async function createSession(username: string): Promise<string> {
  const user: AdminUser = {
    username,
    role: 'admin', // You can extend this to support different roles
  };
  
  return generateToken(user);
}
