import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { JWTService } from './jwtService';
import { UserProfile, UserRegistration, UserLogin, TokenPair, OAuthProfile } from '@/types';
import { createError } from '@/middleware/errorHandler';

const prisma = new PrismaClient();

export class AuthService {
  /**
   * Register a new user
   */
  static async register(userData: UserRegistration): Promise<UserProfile> {
    const { email, username, password, confirmPassword } = userData;

    // Validate passwords match
    if (password !== confirmPassword) {
      throw createError('비밀번호가 일치하지 않습니다.', 400);
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username.toLowerCase() }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        throw createError('이미 등록된 이메일입니다.', 409);
      }
      if (existingUser.username === username.toLowerCase()) {
        throw createError('이미 사용 중인 사용자명입니다.', 409);
      }
    }

    // Hash password
    const passwordHash = await this.hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        passwordHash,
        emailVerified: false,
        language: 'ko',
        timezone: 'Asia/Seoul'
      }
    });

    return this.toUserProfile(user);
  }

  /**
   * Login user
   */
  static async login(loginData: UserLogin): Promise<{ user: UserProfile; tokens: TokenPair }> {
    const { email, password } = loginData;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      throw createError('이메일 또는 비밀번호가 올바르지 않습니다.', 401);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw createError('이메일 또는 비밀번호가 올바르지 않습니다.', 401);
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Generate tokens
    const tokens = JWTService.generateTokenPair({
      id: user.id,
      email: user.email,
      username: user.username
    });

    // Store refresh token
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.toUserProfile(user),
      tokens
    };
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string): Promise<TokenPair> {
    try {
      // Verify refresh token
      const payload = JWTService.verifyRefreshToken(refreshToken);

      // Check if refresh token exists in database
      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true }
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw createError('유효하지 않은 또는 만료된 리프레시 토큰입니다.', 401);
      }

      // Generate new token pair
      const newTokens = JWTService.generateTokenPair({
        id: storedToken.userId,
        email: storedToken.user!.email,
        username: storedToken.user!.username
      });

      // Remove old refresh token and store new one
      await prisma.refreshToken.delete({
        where: { token: refreshToken }
      });
      await this.storeRefreshToken(storedToken.userId, newTokens.refreshToken);

      return newTokens;
    } catch (error) {
      throw createError('토큰 갱신에 실패했습니다.', 401);
    }
  }

  /**
   * Logout user (invalidate refresh token)
   */
  static async logout(refreshToken: string): Promise<void> {
    try {
      await prisma.refreshToken.delete({
        where: { token: refreshToken }
      });
    } catch (error) {
      // Token might not exist, which is ok for logout
    }
  }

  /**
   * OAuth login/register
   */
  static async oauthLogin(profile: OAuthProfile): Promise<{ user: UserProfile; tokens: TokenPair; isNewUser: boolean }> {
    let user;
    let isNewUser = false;

    // Check if user exists with OAuth ID
    const oauthField = `${profile.provider}Id`;
    user = await prisma.user.findFirst({
      where: {
        [oauthField]: profile.id
      }
    });

    if (!user) {
      // Check if user exists with same email
      user = await prisma.user.findUnique({
        where: { email: profile.email.toLowerCase() }
      });

      if (user) {
        // Link OAuth account to existing user
        await prisma.user.update({
          where: { id: user.id },
          data: { [oauthField]: profile.id }
        });
      } else {
        // Create new user
        user = await prisma.user.create({
          data: {
            email: profile.email.toLowerCase(),
            username: await this.generateUniqueUsername(profile.username),
            passwordHash: '', // OAuth users don't have passwords
            profileImage: profile.profileImage,
            emailVerified: true, // OAuth emails are pre-verified
            [oauthField]: profile.id,
            language: 'ko',
            timezone: 'Asia/Seoul'
          }
        });
        isNewUser = true;
      }
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Generate tokens
    const tokens = JWTService.generateTokenPair({
      id: user.id,
      email: user.email,
      username: user.username
    });

    // Store refresh token
    await this.storeRefreshToken(user.id, tokens.refreshToken);

    return {
      user: this.toUserProfile(user),
      tokens,
      isNewUser
    };
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<UserProfile | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    return user ? this.toUserProfile(user) : null;
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(updates.username && { username: updates.username.toLowerCase() }),
        ...(updates.profileImage && { profileImage: updates.profileImage }),
        ...(updates.language && { language: updates.language }),
        ...(updates.timezone && { timezone: updates.timezone }),
        updatedAt: new Date()
      }
    });

    return this.toUserProfile(user);
  }

  /**
   * Change password
   */
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw createError('사용자를 찾을 수 없습니다.', 404);
    }

    // Verify current password (skip for OAuth users)
    if (user.passwordHash) {
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isCurrentPasswordValid) {
        throw createError('현재 비밀번호가 올바르지 않습니다.', 401);
      }
    }

    // Hash new password
    const newPasswordHash = await this.hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash }
    });
  }

  /**
   * Delete user account
   */
  static async deleteAccount(userId: string): Promise<void> {
    await prisma.user.delete({
      where: { id: userId }
    });
  }

  // Private helper methods

  private static async hashPassword(password: string): Promise<string> {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    return bcrypt.hash(password, saltRounds);
  }

  private static async storeRefreshToken(userId: string, token: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    await prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt
      }
    });
  }

  private static async generateUniqueUsername(baseUsername: string): Promise<string> {
    let username = baseUsername.toLowerCase();
    let counter = 0;

    while (true) {
      const existingUser = await prisma.user.findUnique({
        where: { username: counter === 0 ? username : `${username}${counter}` }
      });

      if (!existingUser) {
        return counter === 0 ? username : `${username}${counter}`;
      }

      counter++;
    }
  }

  private static toUserProfile(user: any): UserProfile {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      profileImage: user.profileImage || undefined,
      language: user.language,
      timezone: user.timezone,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt.toISOString(),
      lastLoginAt: user.lastLoginAt?.toISOString()
    };
  }
}