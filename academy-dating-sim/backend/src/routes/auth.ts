import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthService } from '@/services/authService';
import { JWTService } from '@/services/jwtService';
import { authenticateToken, AuthenticatedRequest } from '@/middleware/auth';
import { authRateLimit } from '@/config/rateLimit';
import { createError } from '@/middleware/errorHandler';
import { ApiResponse, UserRegistration, UserLogin } from '@/types';

const router = Router();

// Validation rules
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('유효한 이메일 주소를 입력해주세요.'),
  body('username')
    .isLength({ min: 3, max: 20 })
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('사용자명은 3-20자의 영문, 숫자, 언더스코어만 사용 가능합니다.'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('비밀번호는 최소 8자, 대소문자, 숫자를 포함해야 합니다.'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('비밀번호가 일치하지 않습니다.');
      }
      return true;
    })
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('유효한 이메일 주소를 입력해주세요.'),
  body('password')
    .notEmpty()
    .withMessage('비밀번호를 입력해주세요.')
];

// Helper function to handle validation errors
const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const response: ApiResponse = {
      success: false,
      error: {
        message: '입력 데이터가 유효하지 않습니다.',
        statusCode: 400,
        details: errors.array()
      }
    };
    return res.status(400).json(response);
  }
  next();
};

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', 
  authRateLimit,
  registerValidation,
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: UserRegistration = req.body;
      const user = await AuthService.register(userData);

      const response: ApiResponse = {
        success: true,
        data: {
          user,
          message: '회원가입이 완료되었습니다. 로그인해주세요.'
        }
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login',
  authRateLimit,
  loginValidation,
  handleValidationErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const loginData: UserLogin = req.body;
      const result = await AuthService.login(loginData);

      const response: ApiResponse = {
        success: true,
        data: {
          user: result.user,
          tokens: result.tokens,
          message: '로그인이 완료되었습니다.'
        }
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw createError('리프레시 토큰이 필요합니다.', 400);
    }

    const tokens = await AuthService.refreshToken(refreshToken);

    const response: ApiResponse = {
      success: true,
      data: { tokens }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post('/logout', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await AuthService.logout(refreshToken);
    }

    const response: ApiResponse = {
      success: true,
      data: { message: '로그아웃이 완료되었습니다.' }
    };

    res.json(response);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/auth/profile
 * Get user profile
 */
router.get('/profile', 
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = await AuthService.getUserById(req.user!.id);

      if (!user) {
        throw createError('사용자를 찾을 수 없습니다.', 404);
      }

      const response: ApiResponse = {
        success: true,
        data: { user }
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put('/profile',
  authenticateToken,
  [
    body('username')
      .optional()
      .isLength({ min: 3, max: 20 })
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('사용자명은 3-20자의 영문, 숫자, 언더스코어만 사용 가능합니다.'),
    body('language')
      .optional()
      .isIn(['ko', 'en', 'ja'])
      .withMessage('지원하지 않는 언어입니다.'),
    body('timezone')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('유효한 타임존을 입력해주세요.')
  ],
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = await AuthService.updateProfile(req.user!.id, req.body);

      const response: ApiResponse = {
        success: true,
        data: { 
          user,
          message: '프로필이 업데이트되었습니다.'
        }
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/auth/change-password
 * Change user password
 */
router.post('/change-password',
  authenticateToken,
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('현재 비밀번호를 입력해주세요.'),
    body('newPassword')
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('새 비밀번호는 최소 8자, 대소문자, 숫자를 포함해야 합니다.'),
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error('새 비밀번호가 일치하지 않습니다.');
        }
        return true;
      })
  ],
  handleValidationErrors,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      await AuthService.changePassword(req.user!.id, currentPassword, newPassword);

      const response: ApiResponse = {
        success: true,
        data: { message: '비밀번호가 변경되었습니다.' }
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/auth/account
 * Delete user account
 */
router.delete('/account',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      await AuthService.deleteAccount(req.user!.id);

      const response: ApiResponse = {
        success: true,
        data: { message: '계정이 삭제되었습니다.' }
      };

      res.json(response);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/auth/verify-token
 * Verify if token is valid
 */
router.get('/verify-token',
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    const response: ApiResponse = {
      success: true,
      data: { 
        valid: true,
        user: req.user
      }
    };

    res.json(response);
  }
);

export default router;