# 🎮 Frontend Module Structure - 기능별 모듈화

## 📁 프론트엔드 새로운 구조

```
apps/frontend/src/
├── 📁 modules/                        # 기능별 비즈니스 모듈
│   ├── 📁 auth/                       # 인증 모듈
│   │   ├── 📁 components/             # 인증 관련 컴포넌트
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   └── index.ts
│   │   ├── 📁 hooks/                  # 인증 관련 훅
│   │   │   ├── useAuth.ts
│   │   │   ├── useLogin.ts
│   │   │   └── index.ts
│   │   ├── 📁 services/               # 인증 API 서비스
│   │   │   ├── authApi.ts
│   │   │   └── index.ts
│   │   ├── 📁 store/                  # 인증 상태 관리
│   │   │   ├── authStore.ts
│   │   │   └── index.ts
│   │   ├── 📁 types/                  # 인증 타입 정의
│   │   │   ├── auth.types.ts
│   │   │   └── index.ts
│   │   └── 📋 index.ts                # 모듈 진입점
│   │
│   ├── 📁 character/                  # 캐릭터 모듈
│   │   ├── 📁 components/
│   │   │   ├── CharacterCard.tsx
│   │   │   ├── CharacterProfile.tsx
│   │   │   ├── CharacterSelector.tsx
│   │   │   └── index.ts
│   │   ├── 📁 hooks/
│   │   │   ├── useCharacter.ts
│   │   │   ├── useCharacterInteraction.ts
│   │   │   └── index.ts
│   │   ├── 📁 services/
│   │   │   ├── characterApi.ts
│   │   │   └── index.ts
│   │   ├── 📁 store/
│   │   │   ├── characterStore.ts
│   │   │   └── index.ts
│   │   ├── 📁 types/
│   │   │   ├── character.types.ts
│   │   │   └── index.ts
│   │   └── 📋 index.ts
│   │
│   ├── 📁 game/                       # 게임 모듈
│   │   ├── 📁 components/
│   │   │   ├── 📁 mini-games/         # 미니게임들
│   │   │   │   ├── CardMatchingGame.tsx
│   │   │   │   ├── PuzzleGame.tsx
│   │   │   │   └── index.ts
│   │   │   ├── 📁 battle/             # 전투 시스템
│   │   │   │   ├── BattleArena.tsx
│   │   │   │   ├── SkillSelector.tsx
│   │   │   │   └── index.ts
│   │   │   ├── GameBoard.tsx
│   │   │   ├── GameUI.tsx
│   │   │   └── index.ts
│   │   ├── 📁 hooks/
│   │   │   ├── useGame.ts
│   │   │   ├── useGameState.ts
│   │   │   ├── useBattle.ts
│   │   │   └── index.ts
│   │   ├── 📁 services/
│   │   │   ├── gameApi.ts
│   │   │   ├── gameEngine.ts
│   │   │   └── index.ts
│   │   ├── 📁 store/
│   │   │   ├── gameStore.ts
│   │   │   ├── battleStore.ts
│   │   │   └── index.ts
│   │   ├── 📁 types/
│   │   │   ├── game.types.ts
│   │   │   ├── battle.types.ts
│   │   │   └── index.ts
│   │   └── 📋 index.ts
│   │
│   ├── 📁 story/                      # 스토리/대화 모듈
│   │   ├── 📁 components/
│   │   │   ├── VisualNovelDialog.tsx
│   │   │   ├── StoryScene.tsx
│   │   │   ├── DialogueBox.tsx
│   │   │   └── index.ts
│   │   ├── 📁 hooks/
│   │   │   ├── useStory.ts
│   │   │   ├── useDialogue.ts
│   │   │   └── index.ts
│   │   ├── 📁 services/
│   │   │   ├── storyApi.ts
│   │   │   └── index.ts
│   │   ├── 📁 store/
│   │   │   ├── storyStore.ts
│   │   │   └── index.ts
│   │   ├── 📁 types/
│   │   │   ├── story.types.ts
│   │   │   └── index.ts
│   │   └── 📋 index.ts
│   │
│   └── 📁 shared/                     # 공통 모듈
│       ├── 📁 components/
│       │   ├── Layout.tsx
│       │   ├── Navigation.tsx
│       │   └── index.ts
│       ├── 📁 hooks/
│       │   ├── useLocalStorage.ts
│       │   └── index.ts
│       ├── 📁 utils/
│       │   ├── validation.ts
│       │   ├── helpers.ts
│       │   └── index.ts
│       └── 📋 index.ts
│
├── 📁 core/                          # 핵심 인프라
│   ├── 📁 api/                       # API 클라이언트
│   │   ├── client.ts
│   │   ├── interceptors.ts
│   │   └── index.ts
│   ├── 📁 store/                     # 전역 상태 관리
│   │   ├── rootStore.ts
│   │   ├── middleware.ts
│   │   └── index.ts
│   ├── 📁 router/                    # 라우팅
│   │   ├── AppRouter.tsx
│   │   ├── routes.ts
│   │   └── index.ts
│   ├── 📁 types/                     # 전역 타입
│   │   ├── global.types.ts
│   │   ├── api.types.ts
│   │   └── index.ts
│   └── 📁 config/                    # 설정
│       ├── constants.ts
│       ├── environment.ts
│       └── index.ts
│
├── 📁 shared/                        # 재사용 가능한 공통 요소
│   ├── 📁 components/                # 공통 UI 컴포넌트
│   │   ├── 📁 ui/                    # 기본 UI 요소
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── index.ts
│   │   ├── 📁 layout/                # 레이아웃 컴포넌트
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── index.ts
│   │   └── 📋 index.ts
│   ├── 📁 hooks/                     # 공통 훅
│   │   ├── useDebounce.ts
│   │   ├── useWindowSize.ts
│   │   ├── useLocalStorage.ts
│   │   └── index.ts
│   ├── 📁 utils/                     # 유틸리티 함수
│   │   ├── date.utils.ts
│   │   ├── string.utils.ts
│   │   ├── validation.utils.ts
│   │   └── index.ts
│   ├── 📁 constants/                 # 상수 정의
│   │   ├── routes.constants.ts
│   │   ├── api.constants.ts
│   │   └── index.ts
│   └── 📁 styles/                    # 공통 스타일
│       ├── globals.css
│       ├── theme.css
│       ├── components.css
│       └── index.ts
│
├── 📋 App.tsx                        # 메인 앱 컴포넌트
├── 📋 main.tsx                       # 앱 진입점
└── 📋 vite-env.d.ts                  # Vite 타입 정의
```

## 🎯 모듈별 역할과 특징

### 1. **modules/** - 비즈니스 로직 모듈
- 각 도메인별로 완전히 독립적인 모듈
- 컴포넌트, 훅, 서비스, 스토어, 타입이 모두 포함
- 다른 모듈과의 의존성 최소화

### 2. **core/** - 핵심 인프라
- 앱 전체에서 사용되는 핵심 기능
- API 클라이언트, 라우터, 전역 상태 관리
- 환경 설정과 전역 타입 정의

### 3. **shared/** - 재사용 가능한 요소
- 여러 모듈에서 공통으로 사용되는 컴포넌트와 유틸리티
- UI 라이브러리 성격의 컴포넌트들
- 프로젝트 전반에 걸친 공통 기능

## 🔄 모듈 간 의존성 규칙

1. **modules → core**: 모듈은 core의 API, 라우터 등을 사용 가능
2. **modules → shared**: 모듈은 shared의 컴포넌트, 유틸리티 사용 가능
3. **modules ↔ modules**: 모듈 간 직접 의존성 금지 (core를 통해 통신)
4. **core → shared**: core는 shared 사용 가능
5. **shared**: 다른 레이어에 의존하지 않음 (순수 함수/컴포넌트)

## 📦 모듈 진입점 예시

각 모듈의 `index.ts`에서 외부에 노출할 API를 정의:

```typescript
// modules/auth/index.ts
export { LoginForm, SignupForm } from './components';
export { useAuth, useLogin } from './hooks';
export { authApi } from './services';
export { authStore } from './store';
export type { User, LoginRequest, AuthState } from './types';

// modules/character/index.ts
export { CharacterCard, CharacterProfile } from './components';
export { useCharacter, useCharacterInteraction } from './hooks';
export { characterApi } from './services';
export type { Character, CharacterStats } from './types';
```

이 구조로 각 모듈이 독립적이면서도 재사용 가능한 형태가 됩니다!