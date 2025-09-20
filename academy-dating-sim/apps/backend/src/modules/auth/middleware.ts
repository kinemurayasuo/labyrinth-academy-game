import { Request, Response, NextFunction } from 'express';
import { JWTService } from '@/services/jwtService';
import { AuthService } from '@/services/authService';
import { createError } from './errorHandler';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
    role?: string;
  };
}

/**
 * JWT Authentication middleware
 */
export const authenticateToken = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = JWTService.extractTokenFromHeader(authHeader);

    if (!token) {
      throw createError('접근 토큰이 필요합니다.', 401);
    }

    // Verify token
    const payload = JWTService.verifyAccessToken(token);

    // Get user from database to ensure user still exists
    const user = await AuthService.getUserById(payload.userId);
    if (!user) {
      throw createError('유효하지 않은 사용자입니다.', 401);
    }

    // Add user to request object
    req.user = {
      id: user.id,
      email: user.email,
      username: user.username,
      ...(payload.role && { role: payload.role })
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication middleware
 * Continues even if no token is provided
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = JWTService.extractTokenFromHeader(authHeader);

    if (token) {
      try {
        const payload = JWTService.verifyAccessToken(token);
        const user = await AuthService.getUserById(payload.userId);
        
        if (user) {
          req.user = {
            id: user.id,
            email: user.email,
            username: user.username,
            ...(payload.role && { role: payload.role })
          };
        }
      } catch (error) {
        // Invalid token, but continue without user
      }
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Role-based authorization middleware
 */
export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw createError('인증이 필요합니다.', 401);
    }

    const userRole = req.user.role || 'user';
    if (!roles.includes(userRole)) {
      throw createError('권한이 부족합니다.', 403);
    }

    next();
  };
};

/**
 * Check if user owns the resource
 */
export const requireOwnership = (userIdParam: string = 'userId') => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw createError('인증이 필요합니다.', 401);
    }

    const resourceUserId = req.params?.[userIdParam];
    if (req.user.id !== resourceUserId && req.user.role !== 'admin') {
      throw createError('권한이 부족합니다.', 403);
    }

    next();
  };
};