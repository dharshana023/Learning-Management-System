import { Request, Response, NextFunction } from 'express';
import { storage } from './storage';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { loginUserSchema, signupUserSchema } from '@shared/schema';

// JWT Secret key (in a real-world app, this would be in an environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d'; // Token expires in 7 days

// Generate JWT token
export function generateToken(userId: number): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// Verify JWT token
export function verifyToken(token: string): { userId: number } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    return decoded;
  } catch (error) {
    return null;
  }
}

// Middleware to authenticate requests
export function authenticate(req: Request, res: Response, next: NextFunction) {
  // Get token from the Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }

  // Add user ID to request for use in route handlers
  (req as any).userId = decoded.userId;
  next();
}

// Optional authentication - doesn't require auth but adds user to request if present
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    
    if (decoded) {
      (req as any).userId = decoded.userId;
    }
  }
  
  next();
}

// Login validation
export async function validateLogin(req: Request, res: Response) {
  try {
    // Validate request body against the schema
    const validatedData = loginUserSchema.parse(req.body);
    
    // Check credentials
    const user = await storage.validateUserPassword(
      validatedData.username, 
      validatedData.password
    );
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    // Generate token
    const token = generateToken(user.id);
    
    // Return token and user info (excluding password)
    const { password, ...userWithoutPassword } = user;
    return res.json({ 
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    return res.status(500).json({ message: 'Server error during login' });
  }
}

// Signup validation
export async function validateSignup(req: Request, res: Response) {
  try {
    // Validate request body against the schema
    const validatedData = signupUserSchema.parse(req.body);
    
    // Check if username already exists
    const existingUserByUsername = await storage.getUserByUsername(validatedData.username);
    if (existingUserByUsername) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    // Check if email already exists (if provided)
    if (validatedData.email) {
      const existingUserByEmail = await storage.getUserByEmail(validatedData.email);
      if (existingUserByEmail) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }
    
    // Create the user (we don't need confirmPassword in the database)
    const { confirmPassword, ...userData } = validatedData;
    const newUser = await storage.createUser(userData);
    
    // Generate token
    const token = generateToken(newUser.id);
    
    // Return token and user info (excluding password)
    const { password, ...userWithoutPassword } = newUser;
    return res.json({ 
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: 'Validation error', 
        errors: error.errors 
      });
    }
    return res.status(500).json({ message: 'Server error during signup' });
  }
}

// Get current user info from token
export async function getCurrentUser(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return user info (excluding password)
    const { password, ...userWithoutPassword } = user;
    return res.json(userWithoutPassword);
  } catch (error) {
    return res.status(500).json({ message: 'Server error' });
  }
}