# 🏗️ Academy Dating Sim - 개선된 프로젝트 구조

## 📁 제안하는 새로운 구조

```
academy-dating-sim/
├── 📋 package.json                    # 루트 워크스페이스 설정
├── 📋 .gitignore                      # 전체 gitignore
├── 📋 README.md                       # 프로젝트 메인 문서
├── 📋 CHANGELOG.md                    # 전체 변경사항
├── 📋 LICENSE                         # 라이선스
│
├── 📁 apps/                           # 애플리케이션들
│   ├── 📁 frontend/                   # 웹 프론트엔드
│   │   ├── 📋 package.json
│   │   ├── 📋 index.html
│   │   ├── 📋 vite.config.ts
│   │   ├── 📁 src/
│   │   │   ├── 📁 modules/            # 기능별 모듈
│   │   │   │   ├── 📁 auth/           # 인증 모듈
│   │   │   │   ├── 📁 character/      # 캐릭터 모듈
│   │   │   │   ├── 📁 game/           # 게임 모듈
│   │   │   │   ├── 📁 story/          # 스토리 모듈
│   │   │   │   └── 📁 shared/         # 공통 모듈
│   │   │   ├── 📁 core/               # 핵심 인프라
│   │   │   │   ├── 📁 api/
│   │   │   │   ├── 📁 store/
│   │   │   │   ├── 📁 router/
│   │   │   │   └── 📁 types/
│   │   │   ├── 📁 shared/             # 공유 컴포넌트
│   │   │   │   ├── 📁 components/
│   │   │   │   ├── 📁 hooks/
│   │   │   │   ├── 📁 utils/
│   │   │   │   └── 📁 constants/
│   │   │   ├── 📋 App.tsx
│   │   │   └── 📋 main.tsx
│   │   └── 📁 public/
│   │
│   ├── 📁 backend/                    # BFF 백엔드
│   │   ├── 📋 package.json
│   │   ├── 📋 tsconfig.json
│   │   ├── 📁 src/
│   │   │   ├── 📁 modules/            # 기능별 모듈
│   │   │   │   ├── 📁 auth/
│   │   │   │   ├── 📁 user/
│   │   │   │   ├── 📁 game/
│   │   │   │   └── 📁 character/
│   │   │   ├── 📁 core/               # 핵심 인프라
│   │   │   │   ├── 📁 database/
│   │   │   │   ├── 📁 middleware/
│   │   │   │   ├── 📁 config/
│   │   │   │   └── 📁 types/
│   │   │   └── 📋 server.ts
│   │   ├── 📁 prisma/
│   │   └── 📁 dist/
│   │
│   └── 📁 mobile/                     # 모바일 앱
│       ├── 📋 capacitor.config.json
│       ├── 📁 android/
│       ├── 📁 ios/
│       └── 📁 resources/
│
├── 📁 packages/                       # 공유 패키지들
│   ├── 📁 shared-types/               # 공통 타입 정의
│   │   ├── 📋 package.json
│   │   └── 📁 src/
│   ├── 📁 game-engine/                # 게임 엔진 로직
│   │   ├── 📋 package.json
│   │   └── 📁 src/
│   └── 📁 ui-components/              # 공통 UI 컴포넌트
│       ├── 📋 package.json
│       └── 📁 src/
│
├── 📁 tools/                          # 개발 도구들
│   ├── 📁 build-scripts/
│   ├── 📁 dev-tools/
│   └── 📁 deployment/
│
├── 📁 docs/                           # 문서들
│   ├── 📋 ARCHITECTURE.md
│   ├── 📋 API.md
│   ├── 📋 DEVELOPMENT.md
│   └── 📁 images/
│
├── 📁 configs/                        # 전체 설정들
│   ├── 📋 eslint.config.js
│   ├── 📋 prettier.config.js
│   ├── 📋 tailwind.config.js
│   └── 📋 tsconfig.base.json
│
└── 📁 assets/                         # 정적 에셋들
    ├── 📁 images/
    ├── 📁 sounds/
    └── 📁 fonts/
```

## 🎯 주요 개선사항

### 1. **모노레포 워크스페이스**
- 단일 저장소에서 여러 앱 관리
- 공통 의존성 효율적 관리
- 일관된 빌드/배포 파이프라인

### 2. **기능별 모듈화**
- 각 기능을 독립적인 모듈로 분리
- 코드 재사용성 향상
- 테스트와 유지보수 용이

### 3. **계층형 아키텍처**
- 각 앱 내에서 명확한 계층 분리
- 의존성 방향 명확화
- 확장성 향상

### 4. **공유 패키지**
- 타입, UI 컴포넌트, 게임 엔진 공유
- 코드 중복 제거
- 일관성 유지

### 5. **도구와 설정 통합**
- 개발 도구들 중앙 관리
- 설정 파일들 체계적 정리
- 문서화 강화