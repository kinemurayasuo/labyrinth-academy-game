# Clean Architecture Migration Guide

이 프로젝트는 Clean Architecture 패턴을 적용하여 구조를 개선했습니다. 이 가이드는 기존 컴포넌트를 새로운 아키텍처로 마이그레이션하는 방법을 설명합니다.

## 🏗️ 새로운 아키텍처 구조

```
src/
├── domain/              # 비즈니스 로직 (핵심 도메인)
│   ├── entities/        # 도메인 엔티티
│   ├── services/        # 도메인 서비스
│   └── repositories/    # 저장소 인터페이스
├── application/         # 유스케이스 (애플리케이션 로직)
│   ├── use-cases/       # 비즈니스 유스케이스
│   └── ports/           # 인터페이스/포트
├── infrastructure/      # 외부 시스템 연동
│   ├── repositories/    # 저장소 구현체
│   └── di-container.ts  # 의존성 주입 컨테이너
└── presentation/        # UI 레이어
    ├── hooks/           # React 훅
    └── adapters/        # 컴포넌트 어댑터
```

## 🔄 기존 코드에서 새로운 아키텍처로 마이그레이션

### 1. 기존 useGameStore 대체

**이전 방식:**
```typescript
import { useGameStore } from '../store/useGameStore';

function MyComponent() {
  const { player, characters, startNewGame } = useGameStore();
  // ...
}
```

**새로운 방식 (방법 1 - 직접 대체):**
```typescript
import { useGameState } from '../presentation/hooks';

function MyComponent() {
  const { player, characters, startNewGame } = useGameState();
  // 기존 코드와 동일한 인터페이스로 작동
}
```

**새로운 방식 (방법 2 - 어댑터 사용):**
```typescript
import { useGameStoreAdapter } from '../presentation/adapters/ComponentAdapter';

function MyComponent() {
  const gameStore = useGameStoreAdapter();
  // 완전히 동일한 인터페이스 제공
}
```

### 2. HOC를 사용한 자동 마이그레이션

기존 컴포넌트를 변경하지 않고 새로운 아키텍처를 사용:

```typescript
import { withCleanArchitecture } from '../presentation/adapters/ComponentAdapter';

// 기존 컴포넌트
function MyComponent({ gameState }) {
  // 기존 코드 그대로 사용
}

// 새로운 아키텍처와 연결
export default withCleanArchitecture(MyComponent);
```

### 3. Context Provider 사용

앱 전체에서 Clean Architecture 사용:

```typescript
// App.tsx
import { CleanArchitectureProvider } from './presentation/adapters/ComponentAdapter';

function App() {
  return (
    <CleanArchitectureProvider>
      <Router>
        {/* 기존 컴포넌트들 */}
      </Router>
    </CleanArchitectureProvider>
  );
}
```

```typescript
// 하위 컴포넌트에서
import { useCleanArchitectureContext } from '../presentation/adapters/ComponentAdapter';

function SomeComponent() {
  const gameState = useCleanArchitectureContext();
  // Clean Architecture 상태 사용
}
```

## 🎯 핵심 개선사항

### 1. 비즈니스 로직 분리
- **이전**: 컴포넌트와 store에 비즈니스 로직 혼재
- **현재**: `domain/` 폴더에 순수한 비즈니스 로직 분리

### 2. 의존성 역전
- **이전**: 직접적인 데이터 접근
- **현재**: 인터페이스를 통한 느슨한 결합

### 3. 테스트 용이성
- **이전**: UI와 로직이 결합되어 테스트 어려움
- **현재**: 각 레이어별 독립적 테스트 가능

### 4. 확장성
- **이전**: 기능 추가 시 여러 파일 수정 필요
- **현재**: 각 관심사별로 독립적 확장 가능

## 🚀 새로운 기능 개발 가이드

### 1. 새로운 도메인 개념 추가

```typescript
// 1. 도메인 엔티티 생성
// src/domain/entities/NewFeature.ts
export interface NewFeatureState {
  id: string;
  // ...
}

export const NewFeatureEntity = {
  create: (data: any): NewFeatureState => ({
    // 팩토리 메서드
  }),
  // 비즈니스 로직 메서드들
};
```

### 2. 유스케이스 구현

```typescript
// 2. 애플리케이션 유스케이스 생성
// src/application/use-cases/NewFeatureUseCase.ts
export const NewFeatureUseCase = (deps: Dependencies) => ({
  async performAction(): Promise<Result> {
    // 유스케이스 로직
  }
});
```

### 3. 인프라스트럭처 구현

```typescript
// 3. 저장소 구현
// src/infrastructure/repositories/NewFeatureRepository.ts
export class NewFeatureRepository implements INewFeatureRepository {
  // 데이터 접근 로직
}
```

### 4. 프레젠테이션 훅 생성

```typescript
// 4. React 훅 생성
// src/presentation/hooks/useNewFeature.ts
export const useNewFeature = () => {
  // React 상태 관리와 Clean Architecture 연결
};
```

## 🔧 실제 마이그레이션 예시

### CharacterCard 컴포넌트 마이그레이션

**이전 코드:**
```typescript
// components/character/CharacterCard.tsx
import { useGameStore } from '../../store/useGameStore';

function CharacterCard({ characterId }) {
  const { characters, player, interactWithCharacter } = useGameStore();
  const character = characters.find(c => c.id === characterId);
  
  const handleInteract = () => {
    interactWithCharacter(characterId, 'talk');
  };
  
  return (
    <div>
      <h3>{character?.name}</h3>
      <button onClick={handleInteract}>대화하기</button>
    </div>
  );
}
```

**새로운 코드:**
```typescript
// components/character/CharacterCard.tsx
import { useGameState } from '../../presentation';

function CharacterCard({ characterId }) {
  const { characters, player, interactWithCharacter } = useGameState();
  const character = characters.find(c => c.id === characterId);
  
  const handleInteract = () => {
    interactWithCharacter('talk'); // characterId는 선택된 캐릭터에서 자동 처리
  };
  
  return (
    <div>
      <h3>{character?.name}</h3>
      <button onClick={handleInteract}>대화하기</button>
    </div>
  );
}
```

## 📋 마이그레이션 체크리스트

### Phase 1: 기본 설정
- [ ] `src/presentation/hooks` 임포트 경로 변경
- [ ] 기존 `useGameStore` 호출을 `useGameState`로 변경
- [ ] 컴파일 에러 해결

### Phase 2: 점진적 개선
- [ ] 복잡한 비즈니스 로직을 도메인 레이어로 이동
- [ ] 데이터 접근 로직을 인프라스트럭처 레이어로 분리
- [ ] 컴포넌트에서 순수 UI 로직만 유지

### Phase 3: 고급 기능 활용
- [ ] 의존성 주입 컨테이너 활용
- [ ] 도메인 이벤트 시스템 구현
- [ ] 단위 테스트 추가

## 🎯 마이그레이션 팁

1. **점진적 마이그레이션**: 한 번에 모든 컴포넌트를 변경하지 말고 하나씩 점진적으로 마이그레이션

2. **레거시 호환성**: `useGameState`는 기존 `useGameStore` 인터페이스와 호환되므로 대부분의 코드 변경 없이 사용 가능

3. **타입 안전성**: TypeScript를 활용하여 컴파일 시점에 오류 발견

4. **테스트 우선**: 새로운 기능 개발 시 도메인 로직부터 테스트 작성

## 🆘 문제 해결

### 공통 이슈

1. **임포트 에러**: 경로가 변경되었으므로 새로운 임포트 경로 사용
2. **타입 에러**: 인터페이스가 약간 변경되었을 수 있으니 타입 정의 확인
3. **상태 동기화**: 복잡한 상태 변경은 유스케이스를 통해 처리

### 도움말

문제가 발생하면 다음을 확인하세요:
1. DI 컨테이너가 제대로 설정되었는지
2. 모든 의존성이 주입되었는지
3. 도메인 로직이 올바르게 분리되었는지

이 가이드를 따라 점진적으로 마이그레이션하면 안전하고 효율적으로 Clean Architecture의 이점을 활용할 수 있습니다.