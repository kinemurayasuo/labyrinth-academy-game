# 🎓 Academy Dating Sim - 프로젝트 구조

학원 데이팅 시뮬레이션 게임의 통합 프로젝트 구조입니다.

## 📁 프로젝트 구조

```
academy-dating-sim-project/
├── 📱 academy-dating-sim/          # 메인 React 앱 (Clean Architecture 적용)
│   ├── src/
│   │   ├── domain/                 # 도메인 레이어 (비즈니스 로직)
│   │   ├── application/            # 애플리케이션 레이어 (유스케이스)
│   │   ├── infrastructure/         # 인프라스트럭처 레이어 (외부 연동)
│   │   ├── presentation/           # 프레젠테이션 레이어 (UI)
│   │   ├── components/             # React 컴포넌트
│   │   ├── data/                   # 게임 데이터 (JSON)
│   │   └── styles/                 # 스타일 파일
│   ├── config/                     # 설정 파일들
│   │   ├── vite.config.ts          # Vite 빌드 설정
│   │   ├── tailwind.config.js      # Tailwind CSS 설정
│   │   ├── postcss.config.js       # PostCSS 설정
│   │   ├── eslint.config.js        # ESLint 설정
│   │   ├── tsconfig*.json          # TypeScript 설정
│   │   └── vercel.json             # Vercel 배포 설정
│   ├── public/                     # 정적 자산
│   ├── android/                    # Capacitor Android 빌드
│   ├── capacitor.config.json       # Capacitor 설정
│   ├── package.json                # 프로젝트 의존성
│   └── index.html                  # 메인 HTML
│
├── 🖼️ assets/                      # 공용 정적 자산
│   └── images/
│       └── charactercard.webp
│
├── 📚 docs/                        # 프로젝트 문서
│   ├── academy-dating-sim-README.md # 메인 앱 리드미
│   ├── ANDROID_BUILD.md            # Android 빌드 가이드
│   ├── CLEAN_ARCHITECTURE_MIGRATION.md # Clean Architecture 가이드
│   ├── PROGRESS.md                 # 개발 진행 상황
│   ├── README.md                   # 원본 리드미
│   ├── CLAUDE.md                   # Claude 개발 문서
│   ├── gemini.md                   # Gemini 개발 문서
│   ├── readme.txt                  # 텍스트 리드미
│   ├── update0919.txt              # 업데이트 로그들
│   ├── update09192.txt
│   ├── update09193.txt
│   └── update09194.txt
│
├── 🔧 .github/                     # GitHub 설정
├── 🔧 .git/                        # Git 저장소
├── 🔧 .claude/                     # Claude 설정
└── .gitignore                      # Git 무시 파일
```

## 🎯 각 폴더 설명

### 📱 academy-dating-sim (메인 앱)
- **Clean Architecture** 패턴을 적용한 React + TypeScript 앱
- **Capacitor**를 사용한 크로스 플랫폼 지원 (웹 + 모바일)
- **Vite** 빌드 시스템 + **Tailwind CSS** 스타일링
- **config/** 폴더에 모든 설정 파일 정리

### 🖼️ assets (공용 자산)
- 모든 버전에서 공통으로 사용할 수 있는 이미지, 아이콘 등
- 캐릭터 카드, 배경 이미지 등

### 📚 docs (문서)
- 프로젝트 개발 과정과 문서들
- AI 도구별 개발 기록
- 업데이트 로그 및 변경사항

## 🚀 개발 가이드

### 메인 앱 개발
```bash
cd academy-dating-sim
npm install
npm run dev          # 개발 서버 시작
npm run build        # 프로덕션 빌드
npm run lint         # 코드 검사
```

### 모바일 빌드
```bash
cd academy-dating-sim
npm run android:build   # Android 빌드 준비
npm run android:open    # Android Studio 열기
npm run android:run     # 디바이스에서 실행
```

## 🎯 설정 파일 관리

모든 설정 파일들이 `config/` 폴더로 정리되었습니다:

- **vite.config.ts**: Vite 빌드 도구 설정
- **tailwind.config.js**: Tailwind CSS 스타일 설정
- **postcss.config.js**: PostCSS 전처리기 설정
- **eslint.config.js**: ESLint 코드 품질 설정
- **tsconfig*.json**: TypeScript 컴파일러 설정
- **vercel.json**: Vercel 배포 설정

설정 변경 시 `config/` 폴더 내의 파일들을 수정하면 됩니다.

## 🏗️ 아키텍처 특징

### Clean Architecture (메인 앱)
- **Domain Layer**: 비즈니스 로직과 엔티티
- **Application Layer**: 유스케이스와 인터페이스
- **Infrastructure Layer**: 데이터 접근과 외부 서비스
- **Presentation Layer**: UI 컴포넌트와 상태 관리

### 다중 플랫폼 지원
- **웹**: Progressive Web App 기능 포함
- **모바일**: Capacitor를 통한 네이티브 앱 생성
- **데스크톱**: Electron 지원 (향후 계획)

## 📋 개발 상태

- ✅ **Clean Architecture 구현 완료**
- ✅ **프로젝트 구조 정리 완료**
- ✅ **React 앱 기본 구조 완성**
- 🔄 **게임 컨텐츠 개발 진행 중**
- 📋 **모바일 최적화 예정**

## 🤝 기여하기

1. 새로운 기능은 `academy-dating-sim/src/domain/` 부터 시작
2. Clean Architecture 패턴을 따라 레이어별로 구현
3. 테스트 코드 작성 권장
4. 문서 업데이트 필수

---

이 구조는 확장성과 유지보수성을 고려하여 설계되었으며, 각 플랫폼별 특성을 살린 최적화된 개발 환경을 제공합니다.