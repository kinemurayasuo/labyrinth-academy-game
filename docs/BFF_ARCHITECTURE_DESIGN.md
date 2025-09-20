# 🚀 Academy Dating Sim - Backend for Frontend (BFF) Architecture

## 🏗️ 현대적 백엔드 아키텍처 설계

### 📊 아키텍처 개요

```
📱 Frontend (React)     🔄 BFF (Node.js)        💾 Services & Database
├── Auth Module         ├── Auth Proxy          ├── 🔐 Auth Service (JWT + OAuth)
├── Game Module         ├── Game API            ├── 💾 User Database (PostgreSQL)
├── Profile Module      ├── Profile API         ├── 🎮 Game Data Service
└── Settings Module     └── File Upload API     └── 📊 Analytics Service
```

### 🎯 BFF 패턴의 장점

1. **🛡️ 보안 강화**: 프론트엔드에서 직접 DB 접근 차단
2. **🔄 API 통합**: 여러 마이크로서비스를 하나의 인터페이스로 통합
3. **⚡ 성능 최적화**: 데이터 집계 및 캐싱
4. **🎮 게임 특화**: 실시간 상태 동기화 및 치트 방지

## 🛠️ 기술 스택

### Backend (BFF)
- **Framework**: Node.js + Express/Fastify
- **Language**: TypeScript
- **Authentication**: JWT + Passport.js
- **Database ORM**: Prisma (PostgreSQL)
- **Cache**: Redis
- **Validation**: Zod
- **API Documentation**: Swagger/OpenAPI

### Security & CORS
- **CORS Policy**: Whitelist 기반 동적 설정
- **Rate Limiting**: Express-rate-limit
- **Helmet**: 보안 헤더 설정
- **CSRF Protection**: CSRF 토큰 검증

### Database Design
```sql
-- Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  profile_image TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game Save Data
CREATE TABLE game_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  save_name VARCHAR(100) DEFAULT 'Auto Save',
  player_data JSONB NOT NULL,
  game_progress JSONB NOT NULL,
  unlocked_characters TEXT[] DEFAULT '{}',
  completed_events TEXT[] DEFAULT '{}',
  save_date TIMESTAMPTZ DEFAULT NOW(),
  version VARCHAR(20) DEFAULT '1.0.0'
);

-- Game Analytics
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  session_start TIMESTAMPTZ DEFAULT NOW(),
  session_end TIMESTAMPTZ,
  device_info JSONB,
  game_version VARCHAR(20)
);

-- User Achievements
CREATE TABLE user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id VARCHAR(100) NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  progress JSONB DEFAULT '{}'
);
```

## 🔐 인증 & 보안 전략

### 1. 다중 인증 방식 지원
```typescript
// OAuth2 Providers
const authProviders = {
  google: GoogleStrategy,
  discord: DiscordStrategy,
  github: GitHubStrategy,
  kakao: KakaoStrategy
};

// JWT Token Strategy
interface JWTPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
  iat: number;
  exp: number;
}
```

### 2. CORS 정책
```typescript
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',          // Development
      'https://academy-dating-sim.vercel.app', // Production
      'capacitor://localhost',          // Mobile App
      'https://localhost'               // HTTPS Dev
    ];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
```

### 3. Rate Limiting & 보안
```typescript
// API Rate Limiting
const gameApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 사용자당 최대 100요청
  message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.'
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 5, // 로그인 시도 5회로 제한
  skipSuccessfulRequests: true
});
```

## 🎮 게임 특화 기능

### 1. 실시간 세이브/로드 동기화
```typescript
// WebSocket for real-time sync
const gameSync = {
  // 자동 저장 (매 5분 또는 중요 이벤트)
  autoSave: async (userId: string, gameData: GameState) => {
    await redis.setex(`game:${userId}:temp`, 300, JSON.stringify(gameData));
    await saveToDatabase(userId, gameData);
  },
  
  // 충돌 해결 (여러 기기에서 동시 플레이)
  resolveConflict: (localSave: GameSave, remoteSave: GameSave) => {
    return localSave.saveDate > remoteSave.saveDate ? localSave : remoteSave;
  }
};
```

### 2. 치트 방지 & 검증
```typescript
// 서버사이드 게임 로직 검증
const validateGameAction = {
  statIncrease: (before: Stats, after: Stats, action: string) => {
    const maxIncrease = getMaxStatIncrease(action);
    return Object.keys(after).every(stat => 
      after[stat] <= before[stat] + maxIncrease
    );
  },
  
  affectionChange: (before: number, after: number, interaction: string) => {
    const expectedChange = getExpectedAffectionChange(interaction);
    return Math.abs((after - before) - expectedChange) <= 1;
  }
};
```

### 3. 분석 & 통계
```typescript
// 게임 플레이 분석
const analytics = {
  trackUserChoice: async (userId: string, eventId: string, choice: number) => {
    await analyticsDB.trackChoice(userId, eventId, choice);
  },
  
  getPopularRoutes: async () => {
    return await analyticsDB.getCharacterPopularity();
  },
  
  getUserPlaytime: async (userId: string) => {
    return await analyticsDB.getPlaytime(userId);
  }
};
```

## 🔄 API 엔드포인트 설계

### Authentication APIs
```typescript
POST /api/auth/register       // 회원가입
POST /api/auth/login          // 로그인  
POST /api/auth/logout         // 로그아웃
POST /api/auth/refresh        // 토큰 갱신
GET  /api/auth/profile        // 프로필 조회
PUT  /api/auth/profile        // 프로필 수정

// OAuth2 Routes
GET  /api/auth/google         // Google OAuth 시작
GET  /api/auth/google/callback // Google OAuth 콜백
GET  /api/auth/discord        // Discord OAuth
GET  /api/auth/kakao          // Kakao OAuth
```

### Game Data APIs
```typescript
GET    /api/game/saves              // 저장 목록
POST   /api/game/saves              // 게임 저장
GET    /api/game/saves/:id          // 특정 저장 데이터
PUT    /api/game/saves/:id          // 저장 데이터 업데이트
DELETE /api/game/saves/:id          // 저장 데이터 삭제

GET    /api/game/characters         // 캐릭터 데이터
GET    /api/game/events             // 이벤트 데이터
GET    /api/game/achievements       // 업적 목록
POST   /api/game/achievements/:id   // 업적 달성

// 실시간 동기화
WS     /api/game/sync              // WebSocket 연결
```

### User Management APIs
```typescript
GET    /api/users/profile          // 사용자 프로필
PUT    /api/users/profile          // 프로필 업데이트
POST   /api/users/avatar           // 아바타 업로드
GET    /api/users/achievements     // 사용자 업적
GET    /api/users/statistics       // 플레이 통계
DELETE /api/users/account          // 계정 삭제
```

## 🚀 구현 우선순위

### Phase 1: 기본 인프라 (1-2주)
1. ✅ Express.js + TypeScript 설정
2. ✅ PostgreSQL + Prisma 설정  
3. ✅ JWT 인증 시스템
4. ✅ CORS 및 보안 설정

### Phase 2: 핵심 기능 (2-3주)
1. 🔄 사용자 등록/로그인 API
2. 🔄 게임 세이브/로드 API
3. 🔄 OAuth2 소셜 로그인
4. 🔄 기본 데이터 동기화

### Phase 3: 고급 기능 (3-4주)
1. 📊 실시간 동기화 (WebSocket)
2. 📈 게임 분석 시스템
3. 🏆 업적 시스템
4. 🛡️ 치트 방지 로직

### Phase 4: 운영 최적화 (지속적)
1. ⚡ 캐싱 최적화 (Redis)
2. 📊 모니터링 & 로깅
3. 🔒 고급 보안 기능
4. 📱 모바일 앱 지원

## 💡 마이그레이션 전략

### 1. 점진적 전환
```typescript
// Hybrid Repository - LocalStorage → API 전환
class HybridGameRepository implements ISaveRepository {
  constructor(
    private localRepo: LocalStorageSaveRepository,
    private apiRepo: ApiSaveRepository,
    private isOnline: boolean
  ) {}
  
  async save(data: GameSaveData): Promise<void> {
    // 로컬에 먼저 저장 (빠른 응답)
    await this.localRepo.save(data);
    
    // 온라인이면 서버에도 저장
    if (this.isOnline) {
      try {
        await this.apiRepo.save(data);
      } catch (error) {
        // 실패해도 로컬 저장은 유지
        console.warn('Server save failed, kept local save');
      }
    }
  }
}
```

### 2. 백워드 호환성
```typescript
// 기존 LocalStorage 데이터 마이그레이션
const migrateLocalData = async () => {
  const localSave = localStorage.getItem('academyDatingSim');
  if (localSave && isLoggedIn) {
    const saveData = JSON.parse(localSave);
    await apiClient.migrateUserData(saveData);
    localStorage.removeItem('academyDatingSim'); // 마이그레이션 후 삭제
  }
};
```

## 🎯 성능 & 확장성

### 1. 캐싱 전략
```typescript
// Redis 캐싱
const cacheStrategy = {
  userProfile: { ttl: 3600 },      // 1시간
  gameData: { ttl: 1800 },         // 30분  
  achievements: { ttl: 86400 },    // 24시간
  leaderboard: { ttl: 300 }        // 5분
};
```

### 2. 데이터베이스 최적화
```sql
-- 인덱스 최적화
CREATE INDEX idx_game_saves_user_id ON game_saves(user_id);
CREATE INDEX idx_game_saves_save_date ON game_saves(save_date DESC);
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);

-- 파티셔닝 (대용량 데이터 대비)
CREATE TABLE user_sessions_y2024 PARTITION OF user_sessions 
FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

이렇게 구현하면 **확장 가능하고 안전한 백엔드 시스템**을 가질 수 있습니다! 🚀

다음 단계로 실제 구현을 시작할까요?