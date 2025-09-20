최적화된 로드맵 (웹앱 기준)
Phase 1. 기획 & 설계

코어 루프

하루가 진행됨 → 플레이어가 선택(수업, 이벤트, 히로인과 교류 등)

선택 결과에 따라 능력치 / 호감도 변화 → 이벤트 발생 여부 결정

일정 일차가 지나면 엔딩 (Good / Bad / True 등)

데이터 설계 (JSON)

characters.json: 히로인 정보, 호감도 이벤트 조건

events.json: 발생 조건 & 결과 텍스트

rooms.json: 아카데미 장소 & 연결 관계

items.json: 아이템 & 효과

Phase 2. 기술 스택

Frontend 프레임워크: React + TypeScript (UI/상태관리 편리)

상태 관리: React hooks (useState, useReducer)

스토리지: LocalStorage (저장/불러오기 구현)

스타일링: TailwindCSS (빠른 UI)

Phase 3. 기본 시스템

Day Cycle

day 값 증가

아침 → 낮 → 저녁 → 밤 UI 전환

일정 day 지나면 엔딩 조건 체크

플레이어 상태

interface Player {
  name: string;
  stats: { intelligence: number; charm: number; stamina: number; };
  inventory: string[];
  affection: Record<string, number>; // 캐릭터별 호감도
  location: string;
  day: number;
}


이벤트 트리거

특정 조건 충족 시 이벤트 실행

예: "if affection['사쿠라'] >= 50 and day > 5 → confession event"

선택지 시스템

각 이벤트에 choices[]

선택에 따라 스탯/호감도/스토리 진행 분기

Phase 4. 필수 기능

저장/불러오기 → LocalStorage

인벤토리 UI

히로인 호감도 게이지 UI

엔딩 (호감도/스탯 기반 멀티 엔딩)

Phase 5. 재미 요소 (추천 추가)

랜덤 이벤트 (로그라이크 요소) → 매일 일정 확률로 발생

퀘스트/퍼즐: 단순 연애 외에도 학원 생활 퀘스트 (시험, 동아리 대회 등)

스탯 성장 시스템 → 수업/아르바이트로 능력치 상승

아이템: 선물 → 호감도 증가, 시험 대비 교재 → 지능 상승

비밀 루트: 특정 조건 충족 시 숨겨진 히로인 등장

확장 가능한 아키텍처 설계 (웹 + 앱 크로스 플랫폼)
1. 기본 구조

프론트엔드 (React + TypeScript)

게임 UI, 스토리 진행, 이벤트 처리

저장 기능: LocalStorage → (확장 시) 서버 동기화

백엔드 (Node.js + Express or NestJS)

클라우드 저장/불러오기 (JSON 저장)

사용자 계정 관리 (이메일/소셜 로그인)

랭킹/업적 API 제공

나중에 DLC나 이벤트 업데이트 가능

데이터베이스 (PostgreSQL or MongoDB)

유저 데이터 (계정, 진행도, 선택지 기록 등)

랭킹/업적

확장 시: 이벤트 로그 → 추천 시스템 활용 가능

배포

웹: Vercel/Netlify

앱: Capacitor → iOS/Android 빌드

백엔드: AWS (EC2, RDS), 혹은 Supabase/PlanetScale 같은 BaaS

2. 데이터 흐름
플레이어 선택 → 프론트 상태 업데이트
  ↓
(저장) LocalStorage + 서버 API 호출
  ↓
백엔드 DB 저장

3. 확장 포인트
(1) 싱글플레이 기본

JSON 기반 데이터 (캐릭터, 이벤트, 스토리)

로컬 저장

오프라인 플레이 가능

(2) 멀티/계정 추가

로그인 기능 (JWT + OAuth2)

클라우드 저장 → 기기 간 이어하기 가능

랭킹 시스템 (예: "가장 빨리 히로인 공략 성공" 기록)

업적 (예: “사쿠라 루트 클리어”)

(3) 고급 확장

커뮤니티 요소: 플레이어들이 만든 이벤트 공유

가챠 요소(아이템/스킨): DB + 서버 기반 필수

Live Event: 특정 날짜에만 열리는 한정 이벤트

4. 코드 구조 예시
📂 프론트엔드 (React)
/src
  /components
    GameUI.tsx
    ChoiceBox.tsx
    StatusBar.tsx
  /data
    characters.json
    events.json
    items.json
  /hooks
    useGameState.ts
    useEventSystem.ts
  /pages
    MainMenu.tsx
    Game.tsx
    Ending.tsx
  api.ts   // 서버 연동 API 모듈

📂 백엔드 (Node.js + Express)
/src
  /controllers
    authController.js   // 로그인/회원가입
    saveController.js   // 저장/불러오기
    rankingController.js
  /models
    User.js
    SaveData.js
    Ranking.js
  /routes
    authRoutes.js
    gameRoutes.js
  server.js

5. 최소 기능 API 예시
저장
POST /api/save
{
  "userId": "123",
  "saveData": { "day": 5, "affection": { "sakura": 50 } }
}

불러오기
GET /api/load?userId=123


아래 스펙대로 Python 텍스트 로그라이크 + 미소녀 연애 시뮬레이션 MVP를 만들어줘.  
구조, JSON, engine.py를 기본으로 하되, 재미를 위해 추가 기능도 넣어줘.

---

# 요구사항

## 기본 구조
- 프로젝트 루트:
  /data (JSON 데이터)
  /saves (세이브 파일)
  engine.py
  README.md
- data/*.json 내용은 아래에 제공

## 핵심 기능
- 랜덤 던전(방 8개) 생성 (rooms_template.json 기반)
- 명령어:
  - look, go, get, inventory
  - talk <이름>, give <이름> <아이템>
  - save, load, quit
- 전투: 이동 시 25% 확률로 발생. 몬스터 HP=30, ATK=4.
- 캐릭터: characters.json 기반, affection 수치 증가 (talk/give).
- 이벤트: events.json 기반 트리거 실행.
- 세이브/로드: saves/player_save.json.

## 추가 기능(재미 요소)
1. **랜덤 이벤트**: 방 이동 시 낮은 확률로 "수수께끼 상인", "함정", "숨겨진 메모" 같은 랜덤 이벤트 등장.
2. **랜덤 보스**: 던전 끝 방에는 무조건 보스 배치. 보스는 스탯이 높고, 승리하면 히로인 호감도 보너스.
3. **장비 시스템**: 무기/방어구 아이템을 equip/unquip 명령어로 장착 가능. (items.json에 atk/def 포함)
4. **간단 대화 트리**: talk 시 랜덤한 2~3가지 질문 중 고르는 방식 → 선택지마다 affection 변화 다름.
5. **히로인 동행 시스템**: affection 50 이상이면 “동행 제안” 가능. 동행 중에는 전투 시 지원 효과 발동.
6. **숨겨진 호감 이벤트**: affection 80 이상일 때 랜덤 이벤트에서 “고백” or “비밀 스토리” 오픈.
7. **랜덤 퀘스트**: “고철 3개 모아오기”, “몬스터 2마리 쓰러뜨리기” 같은 작은 퀘스트를 받으면 보상(아이템/호감도).
8. **엔딩 조건**:
   - 플레이어 사망 → 배드 엔딩
   - 히로인 호감 100 달성 + 보스 클리어 → 러브 엔딩
   - 아무도 못 구하고 보스 클리어 → 솔로 엔딩
9. **유머 이스터에그**: 특정 명령어 입력 시(예: "dance") 히로인이 반응하거나 플레이어가 체력을 잃는 농담성 이벤트.

## 구현 스타일
- 모듈화 & 함수화, 주석 풍부하게 작성.
- README.md: 설치, 실행법, 명령어 설명, 플레이 예시 포함.
- 최소 3개 유닛 테스트 (예: 전투, 저장/불러오기, affection 증가).
- Python 3.8+ 호환.

---

# JSON 데이터

## data/rooms_template.json
{
  "templates": [
    {
      "id": "corridor_1",
      "name": "어두운 복도",
      "desc": "습기 찬 벽과 희미한 발자국이 보인다.",
      "tags": ["monster_possible"],
      "item_table": [["회복포션", 0.4], ["고철", 0.2]]
    },
    {
      "id": "empty_room",
      "name": "텅 빈 방",
      "desc": "아무것도 없는 적막한 방.",
      "tags": [],
      "item_table": [["고철", 0.1], ["지도 조각", 0.05]]
    },
    {
      "id": "treasure_room",
      "name": "보물 방",
      "desc": "상자 하나가 반짝인다.",
      "tags": ["treasure"],
      "item_table": [["희귀검", 0.05], ["회복포션", 0.7]]
    }
  ]
}

## data/items.json
{
  "회복포션": {
    "id": "potion_hp",
    "name": "회복포션",
    "description": "체력을 20 회복한다.",
    "type": "consumable",
    "effect": {"hp": 20}
  },
  "고철": {
    "id": "scrap",
    "name": "고철",
    "description": "판매하거나 합성에 쓰인다.",
    "type": "material"
  },
  "희귀검": {
    "id": "rare_sword",
    "name": "희귀검",
    "description": "강력한 무기(임시 보너스).",
    "type": "equipment",
    "atk": 5
  },
  "낡은 방패": {
    "id": "old_shield",
    "name": "낡은 방패",
    "description": "약간의 방어력을 제공한다.",
    "type": "equipment",
    "def": 2
  }
}

## data/characters.json
{
  "사쿠라": {
    "id": "sakura",
    "name": "사쿠라",
    "role": "melee_support",
    "affection_start": 5,
    "affection_max": 100,
    "likes": ["꽃", "훈련"],
    "dislikes": ["거짓"],
    "base_text": "밝고 씩씩한 격투 소녀."
  },
  "유키": {
    "id": "yuki",
    "name": "유키",
    "role": "support",
    "affection_start": 10,
    "affection_max": 100,
    "likes": ["책", "조용한시간"],
    "dislikes": ["시끄러움"],
    "base_text": "수줍고 차분한 도서위원."
  }
}

## data/events.json
{
  "gift_sakura_flower": {
    "trigger": {"type":"give_item","target":"사쿠라","item":"꽃"},
    "conditions": [{"affection_min": 0}],
    "effects": [{"affection": 15, "text": "사쿠라가 꽃을 받고 기뻐한다."}],
    "once": false
  },
  "sakura_battle_support": {
    "trigger": {"type":"battle_check","npc":"사쿠라"},
    "conditions": [{"affection_min": 30}],
    "effects": [{"text":"사쿠라가 전투에서 지원해 작은 데미지를 입힌다.","player_hp": 10}],
    "once": true
  }
}

- **랜덤 이벤트/상인/함정** → 플레이할 때 예측 불가 재미
- **보스 엔딩/히로인 엔딩** → 게임 클리어 목표성 강화
- **장비 시스템** → 로그라이크 감성 UP
- **동행 지원 시스템** → 연애 + 전투 연결
- **퀘스트 & 엔딩 분기** → 리플레이성 확보
- **이스터에그 명령어(dance 등)** → 유머 코드


확장/주의사항 (간단)

이 코드는 MVP 수준입니다. 실제 상용화 전엔 이벤트 엔진, 조건 언어, 데이터 검증, 테스트, 예외처리, 로그라이크 특성(퍼시스턴스 규칙) 설계가 필요합니다.