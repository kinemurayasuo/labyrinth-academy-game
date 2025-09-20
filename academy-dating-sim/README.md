# 🎮 Academy Dating Sim - Labyrinth Academy

<div align="center">

  [![Version](https://img.shields.io/badge/version-1.6.0-blue.svg)](https://github.com/kinemurayasuo/academy-dating-sim)
  [![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
  [![React](https://img.shields.io/badge/React-19.1.1-61dafb.svg)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)

  **마법과 로맨스가 공존하는 학원 데이팅 시뮬레이션 게임**

  [🎮 지금 플레이하기](https://kinemurayasuo.github.io/academy-dating-sim/)

</div>

---

## 🌟 게임 소개

라비린스 아카데미에서 펼쳐지는 로맨틱한 학원 생활!
다양한 캐릭터들과의 만남, 던전 탐험, 그리고 당신의 선택이 만들어가는 특별한 이야기.

## 🎯 주요 기능

### 📚 스토리 & 캐릭터
- 9명의 매력적인 히로인과의 로맨스
- 각 캐릭터별 고유 스토리라인
- 다중 엔딩 시스템
- 대화 선택지에 따른 호감도 변화

### ⚔️ 던전 탐험
- 5층 규모의 던전 (숲, 동굴, 묘지, 얼음 동굴, 용암 지대)
- 턴제 전투 시스템
- 14종의 몬스터와 5명의 보스
- 보물 발견 및 레벨업 시스템

### 🎮 미니게임
- 카드 매칭 게임
- 퀴즈 게임
- 보상 시스템 (골드, 경험치, 스탯 보너스)

### 🏆 메타 시스템 (v1.6.0)
- **업적 시스템**: 15개의 다양한 업적과 포인트 시스템
- **도감 기능**: 히로인, 몬스터, 아이템, 엔딩 컬렉션
- **일일 퀘스트**: 일일/주간/특별 퀘스트와 보상
- **이벤트 캘린더**: 계절별 축제와 특별 이벤트

### 🎵 사운드 & 비주얼
- 6종의 BGM (메뉴, 게임, 전투, 던전, 승리, 로맨틱)
- 12종의 효과음
- 반응형 모바일 UI
- 15단계 인터랙티브 튜토리얼

## 🚀 기술 스택

- **Frontend**: React 19.1.1, TypeScript 5.8.3
- **State Management**: Zustand 5.0.8
- **Routing**: React Router 7.9.1
- **Styling**: TailwindCSS 3.4.17
- **Build Tool**: Vite 7.1.6
- **Deployment**: GitHub Pages

## 📦 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/kinemurayasuo/academy-dating-sim.git

# 디렉토리 이동
cd academy-dating-sim

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# GitHub Pages 배포
npm run deploy
```

## 🗓️ 버전 히스토리

### v2.1.0 (2024-12-21) - 심화 콘텐츠 대규모 업데이트
- **장비 시스템**: 캐릭터 장비 관리 (무기, 방어구, 액세서리)
- **7개 테마 던전**: 난이도별 던전 선택 시스템
- **일기 시스템**: 매일의 추억과 감정 기록
- **히로인 스토리라인**: 개별 히로인 스토리 챕터 시스템
- **전투 개선**: 기절 상태 및 회복 메커니즘 추가
- **UI 개선**: 캐릭터 잠금 표시, 홈페이지 간소화

### v2.0.0 (2024-12-21) - 대규모 시스템 개편
- 4인 파티 시스템 구현
- 스테미나 시스템 개선
- 10가지 새로운 활동 추가
- 양방향 대화 시스템
- 랜덤 히로인 이벤트
- 게임 소개 튜토리얼
- 펫 시스템 개선
- UI/UX 전면 개편

### v1.6.0 (2025-09-20) - 메타 시스템
- 업적, 도감, 퀘스트, 이벤트 시스템 추가

### v1.5.0 (2025-09-20) - 대규모 업데이트
- 튜토리얼, 모바일 반응형, 사운드, 미니게임, 던전 확장

### v1.0.0 (2025-09-20) - 정식 출시
- 기본 게임 시스템 완성

## 💭 클로드 코드와 함께한 개발 이야기

> "클로드 코드에게 기능을 대책없이 마구마구 넣은 다음, 이를 전부 적용되기까지 얼마나 시간이 흐를까?"

놀랍게도 단 하루만에 v1.0.0부터 v1.6.0까지 6번의 메이저 업데이트를 완료했습니다!
클로드 코드와 함께라면 상상했던 모든 기능을 빠르게 구현할 수 있었습니다.

### 2024년 12월 21일 추가된 기능들:
- ✅ 4인 파티 시스템 (주인공 + 3명 히로인)
- ✅ 독립적인 스테미나 시스템
- ✅ 10가지 새로운 활동 (아르바이트, 명상, 요리, 독서 등)
- ✅ 양방향 대화 시스템
- ✅ 랜덤 히로인 이벤트
- ✅ 게임 세계관 소개
- ✅ 펫 시스템 영속성 수정
- ✅ 히로인 수 확장 (5명 → 9명)

### 이전 추가된 기능들:
- ✅ 전투 시스템 완전 재구현
- ✅ 5층 던전 추가 (2개 층 → 5개 층)
- ✅ 2개의 미니게임 시스템
- ✅ 완전한 사운드 시스템 (BGM + SFX)
- ✅ 모바일 반응형 디자인
- ✅ 15단계 튜토리얼 시스템
- ✅ 업적 시스템 (15개 업적)
- ✅ 도감 기능 (4개 카테고리)
- ✅ 일일 퀘스트 시스템
- ✅ 이벤트 캘린더

**결론: 클로드 코드와 함께라면 하루면 충분합니다! 🚀**

## 🤝 기여하기

버그 리포트, 기능 제안, PR은 언제나 환영합니다!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🙏 크레딧

- 개발: [@kinemurayasuo](https://github.com/kinemurayasuo)
- AI 어시스턴트: [Claude Code](https://claude.ai/code)
- 아이디어 및 기획: 라비린스 아카데미 팀

---

<div align="center">

  **Made with ❤️ and 🤖 Claude Code**

  [🎮 Play Now](https://kinemurayasuo.github.io/academy-dating-sim/) | [🐛 Report Bug](https://github.com/kinemurayasuo/academy-dating-sim/issues) | [✨ Request Feature](https://github.com/kinemurayasuo/academy-dating-sim/issues)

</div>