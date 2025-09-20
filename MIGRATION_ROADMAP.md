# 🗓️ 구조 개선 실행 계획 - Migration Roadmap

## 🎯 전체 마이그레이션 전략

### Phase 1: 워크스페이스 기반 구조 준비 (1-2일)
- 새로운 폴더 구조 생성
- 워크스페이스 설정 파일 작성
- 공통 설정 파일들 통합

### Phase 2: 백엔드 모듈 이전 (1일)
- 기존 backend/ → apps/backend/ 이동
- 모듈별 구조 정리
- 빌드 스크립트 수정

### Phase 3: 프론트엔드 모듈화 (2-3일)
- 기능별 모듈 분리
- Clean Architecture 강화
- 컴포넌트 재구조화

### Phase 4: 모바일 앱 분리 (1일)
- android/ → apps/mobile/android/ 이동
- Capacitor 설정 정리

### Phase 5: 공유 패키지 생성 (1-2일)
- shared-types 패키지 생성
- game-engine 패키지 분리
- ui-components 패키지 생성

## 📋 단계별 상세 실행 계획

### 🏁 Phase 1: 워크스페이스 기반 구조 준비

#### Step 1.1: 새 폴더 구조 생성
```bash
# 새로운 디렉토리 구조 생성
mkdir -p apps/{frontend,backend,mobile}
mkdir -p packages/{shared-types,game-engine,ui-components}
mkdir -p tools/{build-scripts,dev-tools,deployment}
mkdir -p configs
mkdir -p docs/architecture
mkdir -p assets/{images,sounds,fonts}
```

#### Step 1.2: 워크스페이스 설정
- 루트 package.json 작성 (워크스페이스 설정)
- 통합 스크립트 설정
- 의존성 정리

#### Step 1.3: 공통 설정 파일 이동
```bash
# 설정 파일들을 configs/ 로 이동
mv config/* configs/
mv tailwind.config.js configs/
mv postcss.config.js configs/
```

### 🔧 Phase 2: 백엔드 모듈 이전

#### Step 2.1: 백엔드 파일 이동
```bash
# 백엔드 전체를 apps/backend/로 이동
cp -r backend/* apps/backend/
```

#### Step 2.2: 백엔드 구조 모듈화
```
apps/backend/src/
├── modules/           # 기능별 모듈
│   ├── auth/
│   ├── user/
│   ├── game/
│   └── character/
└── core/             # 핵심 인프라
    ├── database/
    ├── middleware/
    └── config/
```

#### Step 2.3: 빌드 설정 수정
- package.json 스크립트 업데이트
- TypeScript 설정 정리
- Prisma 설정 확인

### 🎮 Phase 3: 프론트엔드 모듈화

#### Step 3.1: 현재 src/ 백업
```bash
cp -r src/ src-backup/
```

#### Step 3.2: 새로운 모듈 구조 생성
```bash
mkdir -p apps/frontend/src/{modules,core,shared}
mkdir -p apps/frontend/src/modules/{auth,character,game,story,shared}
mkdir -p apps/frontend/src/core/{api,store,router,types,config}
mkdir -p apps/frontend/src/shared/{components,hooks,utils,constants,styles}
```

#### Step 3.3: 기존 파일들 모듈별 분류 이동
- **components/game/** → **modules/game/components/**
- **components/character/** → **modules/character/components/**
- **components/pages/** → **modules/*/components/** (기능별)
- **hooks/** → **modules/*/hooks/** 또는 **shared/hooks/**
- **services/** → **core/api/** 또는 **modules/*/services/**
- **store/** → **core/store/** 또는 **modules/*/store/**
- **types/** → **core/types/** 또는 **modules/*/types/**

#### Step 3.4: 모듈별 index.ts 파일 생성
각 모듈의 public API 정의

### 📱 Phase 4: 모바일 앱 분리

#### Step 4.1: 안드로이드 폴더 이동
```bash
mv android/ apps/mobile/android/
mv capacitor.config.json apps/mobile/
```

#### Step 4.2: 모바일 설정 정리
- Capacitor 설정 업데이트
- 빌드 스크립트 수정
- 리소스 파일 정리

### 📦 Phase 5: 공유 패키지 생성

#### Step 5.1: shared-types 패키지
```typescript
// packages/shared-types/src/index.ts
export interface User { /* ... */ }
export interface Character { /* ... */ }
export interface GameState { /* ... */ }
```

#### Step 5.2: game-engine 패키지
```typescript
// packages/game-engine/src/index.ts
export class GameEngine { /* ... */ }
export class BattleSystem { /* ... */ }
export class StoryEngine { /* ... */ }
```

#### Step 5.3: ui-components 패키지
```typescript
// packages/ui-components/src/index.ts
export { Button } from './Button';
export { Modal } from './Modal';
export { Card } from './Card';
```

## ⚠️ 마이그레이션 주의사항

### 🔍 Pre-Migration 체크리스트
- [ ] 현재 코드 백업 완료
- [ ] Git 커밋 상태 확인
- [ ] 개발 서버 종료
- [ ] 테스트 실행하여 현재 상태 확인

### 🧪 각 Phase별 테스트
- [ ] 빌드 성공 확인
- [ ] 개발 서버 실행 확인
- [ ] 기존 기능 동작 확인
- [ ] 타입 체크 통과 확인

### 🚨 롤백 계획
각 Phase마다 Git 브랜치 생성하여 안전한 롤백 보장

## 📊 예상 효과

### 🎯 개발 효율성
- **모듈별 독립 개발**: 팀원별로 다른 모듈 작업 가능
- **재사용성 향상**: 공통 컴포넌트/로직 재사용
- **테스트 용이성**: 모듈별 단위 테스트 가능

### 🏗️ 유지보수성
- **코드 탐색 용이**: 기능별로 파일이 그룹화됨
- **의존성 명확화**: 모듈 간 의존성 관계 명확
- **확장성**: 새로운 기능 추가 시 독립적인 모듈로 개발

### 🚀 배포 최적화
- **선택적 빌드**: 변경된 모듈만 빌드 가능
- **캐시 효율성**: 모듈별 빌드 캐시 활용
- **CD/CI 최적화**: 병렬 빌드 및 테스트 가능

## 🎉 마이그레이션 완료 후 혜택

1. **🔧 개발 경험 향상**: 더 나은 IDE 지원, 자동완성, 리팩토링
2. **📈 성능 최적화**: 번들 크기 최적화, 지연 로딩 용이
3. **👥 팀 협업**: 명확한 코드 구조로 협업 효율성 증대
4. **🔮 미래 확장성**: 새로운 기능, 플랫폼 추가 용이

---

### 🚀 시작할 준비가 되셨나요?

이 계획에 따라 단계별로 진행하시겠어요? 아니면 특정 부분부터 시작하고 싶으신가요?