#!/usr/bin/env node

const { execSync } = require('child_process');
const { existsSync } = require('fs');
const path = require('path');

console.log('🚀 Academy Dating Sim 개발 환경 설정 중...');

// 워크스페이스 루트로 이동
const workspaceRoot = path.resolve(__dirname, '../..');
process.chdir(workspaceRoot);

try {
  // 의존성 설치
  console.log('📦 워크스페이스 의존성 설치 중...');
  execSync('npm install', { stdio: 'inherit' });

  // 공유 패키지 빌드
  console.log('🔧 공유 패키지 빌드 중...');
  if (existsSync('./packages/shared-types/package.json')) {
    execSync('npm run build --workspace=packages/shared-types', { stdio: 'inherit' });
  }
  
  if (existsSync('./packages/game-engine/package.json')) {
    execSync('npm run build --workspace=packages/game-engine', { stdio: 'inherit' });
  }

  // 데이터베이스 설정
  console.log('🗄️ 데이터베이스 설정 확인 중...');
  if (existsSync('./apps/backend/.env')) {
    execSync('npm run migrate:dev --workspace=apps/backend', { stdio: 'inherit' });
  } else {
    console.log('⚠️ 백엔드 .env 파일이 없습니다. 데이터베이스 연결 설정이 필요합니다.');
  }

  console.log('✅ 개발 환경 설정 완료!');
  console.log('');
  console.log('🎮 빠른 시작 명령어:');
  console.log('  npm run dev        - 프론트엔드와 백엔드 동시 실행');
  console.log('  npm run dev:mobile - 모바일 개발 시작');
  console.log('  npm run db:studio  - 데이터베이스 스튜디오 열기');
  console.log('  npm run lint       - 코드 품질 검사');
  console.log('  npm run build      - 모든 앱 빌드');
  
} catch (error) {
  console.error('❌ 설정 중 오류 발생:', error.message);
  process.exit(1);
}