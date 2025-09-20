import rateLimit from 'express-rate-limit';

// General API rate limiting
export const rateLimitConfig = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15분
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // 사용자당 최대 100요청
  message: {
    error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
    retryAfter: Math.ceil(parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000') / 1000 / 60)
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Authentication rate limiting (stricter)
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '5'), // 로그인 시도 5회로 제한
  skipSuccessfulRequests: true, // 성공한 요청은 카운트하지 않음
  message: {
    error: '로그인 시도가 너무 많습니다. 15분 후 다시 시도해주세요.'
  }
});

// Game API rate limiting (moderate)
export const gameApiLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5분
  max: 50, // 게임 API는 더 자주 호출될 수 있음
  message: {
    error: '게임 API 호출이 너무 많습니다. 잠시 후 다시 시도해주세요.'
  }
});