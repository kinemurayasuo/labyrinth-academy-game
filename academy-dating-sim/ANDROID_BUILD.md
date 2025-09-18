# Android 앱 빌드 가이드

## 📱 구글 플레이스토어 출시를 위한 설정 완료!

### ✅ 설치된 것들
- Capacitor (웹앱을 네이티브 앱으로 변환)
- Android 플랫폼 지원
- 빌드 스크립트

### 📋 사용 가능한 명령어

1. **웹 앱 빌드 + Android 동기화**
   ```bash
   npm run android:build
   ```

2. **Android Studio 열기** (APK/AAB 생성용)
   ```bash
   npm run android:open
   ```

3. **테스트 디바이스에서 실행**
   ```bash
   npm run android:run
   ```

### 🚀 구글 플레이스토어 출시 방법

#### 1단계: Android Studio 설치
- [Android Studio 다운로드](https://developer.android.com/studio)
- 설치 후 Android SDK 설정

#### 2단계: 앱 빌드
```bash
cd academy-dating-sim
npm run android:build
npm run android:open
```

#### 3단계: Android Studio에서 APK/AAB 생성
1. Android Studio가 열리면 프로젝트가 자동으로 로드됩니다
2. 상단 메뉴에서 **Build → Generate Signed Bundle / APK** 선택
3. **Android App Bundle (AAB)** 선택 (플레이스토어 권장)
4. 새 키스토어 생성 또는 기존 키 사용
5. 빌드 완료!

#### 4단계: 구글 플레이 콘솔에 업로드
1. [Google Play Console](https://play.google.com/console) 접속
2. 개발자 계정 생성 ($25 일회성 비용)
3. 새 앱 생성
4. 생성된 AAB 파일 업로드
5. 앱 정보, 스크린샷, 설명 입력
6. 검토 제출

### 📝 체크리스트
- [ ] Android Studio 설치
- [ ] 구글 개발자 계정 생성
- [ ] 앱 아이콘 준비 (512x512px)
- [ ] 스크린샷 준비 (최소 2장)
- [ ] 앱 설명 작성
- [ ] 개인정보 처리방침 URL 준비

### 🔧 문제 해결

**Android Studio가 없다고 나올 때:**
```bash
# Android Studio 설치 후
npx cap open android
```

**빌드 오류 발생 시:**
```bash
# 클린 빌드
cd android
./gradlew clean
cd ..
npm run android:build
```

### 💡 팁
- 처음에는 내부 테스트로 시작하세요
- 앱 버전은 `capacitor.config.json`에서 관리됩니다
- 업데이트할 때마다 `npm run android:build` 실행 필요

---
준비되셨나요? 이제 당신의 게임을 플레이스토어에 출시할 수 있습니다! 🎉