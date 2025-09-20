# 🎮 라비린스 아카데미 - 학원 데이팅 시뮬레이션 게임

![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)
![Vite](https://img.shields.io/badge/Vite-7.1.6-purple)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.1-cyan)

## 📖 소개

라비린스 아카데미는 학원을 배경으로 한 연애 시뮬레이션 RPG 게임입니다. 플레이어는 학원 생활을 하며 다양한 캐릭터들과 교류하고, 던전을 탐험하며, 자신만의 스토리를 만들어갑니다.

### 🌐 플레이하기
[🎮 게임 플레이](https://kinemurayasuo.github.io/labyrinth-academy-game/)

## 📊 개발 현황 (2025-09-20)
- **완료율**: 95% (주요 기능 대부분 완료)
- **최신 업데이트**: 던전 탐험 및 전투 시스템 완성
- [상세 진행 상황 보기](./PROGRESS.md)

## 🎯 주요 기능

### 🏫 학원 시스템
- **캐릭터 생성**: 이름, 성별, 외형 커스터마이징
- **스탯 시스템**: 체력, 지능, 매력, 운 등 다양한 능력치
- **일정 관리**: 요일별 활동 계획 수립
- **학업 시스템**: 수업 참여를 통한 스탯 상승

### 💕 연애 시스템
- **5명의 히로인**: 각자 고유한 성격과 스토리
  - 아카네 (열정적인 검술부원)
  - 유키 (차분한 도서부원)
  - 사쿠라 (밝은 아이돌 지망생)
  - 레이나 (쿨한 학생회장)
  - 미코 (신비로운 무녀)
- **호감도 시스템**: 선물, 대화, 이벤트를 통한 관계 발전
- **데이트 시스템**: 다양한 장소에서의 데이트
- **특별 이벤트**: 캐릭터별 고유 스토리 이벤트

### ⚔️ 전투 시스템
- **던전 탐험**: 3개 층의 던전 탐험
- **턴제 전투**: 전략적인 전투 시스템
- **스킬 시스템**: 파이어볼, 회복 등 다양한 스킬
- **보스 전투**: 각 층마다 강력한 보스 몬스터
- **보상 시스템**: 경험치, 골드, 아이템 획득

### 🛍️ 상점 시스템
- **아이템 구매**: 선물, 장비, 소비 아이템
- **인벤토리 관리**: 아이템 정리 및 사용
- **선물 시스템**: 히로인들에게 선물 증정

### 🏆 엔딩 시스템
- **멀티 엔딩**: 선택에 따른 다양한 결말
- **히로인별 엔딩**: 각 캐릭터와의 특별한 엔딩
- **업적 시스템**: 다양한 도전 과제

## 🛠️ 기술 스택

### Frontend
- **React 18.3.1**: UI 라이브러리
- **TypeScript 5.5.3**: 타입 안정성
- **Vite 7.1.6**: 빌드 도구
- **React Router 7.1.1**: 라우팅
- **Zustand 5.0.2**: 상태 관리
- **TailwindCSS 3.4.1**: 스타일링
- **Framer Motion 11.15.0**: 애니메이션

### Development
- **ESLint**: 코드 품질 관리
- **PostCSS**: CSS 처리
- **GitHub Pages**: 배포

## 📁 프로젝트 구조

```
academy-dating-sim/
├── src/
│   ├── components/
│   │   ├── game/           # 게임 관련 컴포넌트
│   │   ├── character/      # 캐릭터 관련 컴포넌트
│   │   ├── ui/            # UI 컴포넌트
│   │   └── pages/          # 페이지 컴포넌트
│   ├── data/              # 게임 데이터 (JSON)
│   ├── store/             # Zustand 스토어
│   ├── types/             # TypeScript 타입 정의
│   └── utils/             # 유틸리티 함수
├── public/                # 정적 파일
└── dist/                  # 빌드 결과물
```

## 🚀 시작하기

### 필요 사항
- Node.js 18.0.0 이상
- npm 또는 yarn

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/kinemurayasuo/labyrinth-academy-game.git
cd academy-dating-sim

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 배포
npm run deploy
```

## 🔄 개발 현황

### ✅ 완료된 기능
- 캐릭터 생성 시스템
- 기본 게임 UI
- 스탯 및 스킬 시스템
- 히로인 상호작용
- 던전 탐험 시스템
- 전투 시스템
- 상점 시스템
- 대화 시스템
- 저장/불러오기

### 🚧 개선 예정 사항

#### 게임플레이
- [ ] 더 많은 던전 층 추가
- [ ] 미니게임 시스템
- [ ] 길드/동아리 시스템
- [ ] PvP 전투 모드
- [ ] 계절 이벤트 시스템

#### 스토리 & 콘텐츠
- [ ] 각 히로인별 개별 스토리 확장
- [ ] 서브 캐릭터 추가
- [ ] 숨겨진 루트 및 비밀 엔딩
- [ ] 일일 퀘스트 시스템
- [ ] 연계 이벤트 (복수 히로인 관련)

#### 시스템 개선
- [ ] 사운드 효과 및 BGM
- [ ] 애니메이션 효과 강화
- [ ] 모바일 반응형 개선
- [ ] 클라우드 저장 기능
- [ ] 업적 및 도감 시스템
- [ ] 튜토리얼 시스템 강화

#### 밸런스 조정
- [ ] 스탯 성장 곡선 최적화
- [ ] 아이템 가격 밸런싱
- [ ] 전투 난이도 조절
- [ ] 호감도 상승 속도 조정

## 🎮 조작법

### 키보드
- `방향키` / `WASD`: 던전 이동
- `Enter`: 상호작용/선택
- `ESC`: 메뉴/취소
- `I`: 인벤토리
- `S`: 스탯 창

### 마우스
- 모든 조작은 클릭으로 가능

## 🤝 기여하기

버그 제보, 기능 제안, 코드 기여 등 모든 형태의 기여를 환영합니다!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

## 📞 연락처

- GitHub: [@kinemurayasuo](https://github.com/kinemurayasuo)
- Project Link: [https://github.com/kinemurayasuo/labyrinth-academy-game](https://github.com/kinemurayasuo/labyrinth-academy-game)

## 🙏 감사의 글

이 게임을 플레이해주시는 모든 분들께 감사드립니다!

---

Made with ❤️ by Academy Dating Sim Team
