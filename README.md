# Labyrinth Academy - 미궁 아카데미

아카데미 배경의 로그라이크 연애 시뮬레이션 RPG 게임입니다. 웹과 모바일 앱 모두에서 실행 가능한 Progressive Web App(PWA)으로 제작되었습니다.

## 게임 특징

- **듀얼 페이즈 시스템**: 낮에는 아카데미에서 히로인들과 교류, 밤에는 미궁 탐사
- **3명의 히로인**: 각각 고유한 성격과 스토리를 가진 캐릭터
- **로그라이크 던전**: 매번 랜덤하게 생성되는 미궁
- **턴제 전투 시스템**: 전략적인 RPG 전투
- **호감도 시스템**: 히로인과의 관계 발전
- **자동 저장**: 브라우저에 게임 진행 상황 저장

## 실행 방법

### 웹 브라우저에서 실행
1. `index.html` 파일을 웹 브라우저로 열기
2. 또는 웹 서버에 파일들을 업로드하여 실행

### 모바일 앱으로 설치 (PWA)
1. Chrome이나 Safari로 게임 웹페이지 접속
2. 메뉴에서 "홈 화면에 추가" 선택
3. 앱처럼 실행 가능

### 로컬 서버로 실행 (권장)
```bash
# Python 3
python -m http.server 8000

# Node.js (http-server 설치 필요)
npx http-server

# 브라우저에서 http://localhost:8000 접속
```

## 조작 방법

- **마우스/터치**: 버튼 클릭으로 모든 조작 가능
- **Ctrl+S**: 게임 저장
- **Ctrl+L**: 게임 불러오기
- **Enter**: 밤 페이즈 시작 (미궁 진입)
- **Esc**: 미궁 탈출

## 게임 플레이 팁

1. **낮 시간 활용**: 스탯을 올리고 히로인들과 대화하여 호감도 상승
2. **밤 탐사 준비**: 충분한 HP/MP와 아이템을 준비하고 미궁 진입
3. **호감도 보너스**: 히로인 호감도가 높을수록 전투에 유용한 버프 획득
4. **아이템 관리**: 미궁에서 얻은 아이템을 히로인에게 선물 가능

## 파일 구조

- `index.html` - 메인 게임 HTML
- `styles.css` - 게임 스타일시트
- `game.js` - 게임 로직
- `manifest.json` - PWA 설정 파일
- `service-worker.js` - 오프라인 지원을 위한 서비스 워커
- `icon-generator.html` - 아이콘 생성 도구

## 기술 스택

- HTML5
- CSS3 (반응형 디자인)
- JavaScript (ES6+)
- PWA (Progressive Web App)
- Service Worker (오프라인 지원)

## 브라우저 지원

- Chrome 90+
- Safari 14+
- Firefox 88+
- Edge 90+
- 모바일 브라우저 (iOS Safari, Chrome Mobile)