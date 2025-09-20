#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🏗️ 모든 Academy Dating Sim 패키지 빌드 중...');

const packages = [
  'packages/shared-types',
  'packages/game-engine', 
  'packages/ui-components',
  'apps/backend',
  'apps/frontend',
];

const workspaceRoot = path.resolve(__dirname, '../..');
process.chdir(workspaceRoot);

for (const pkg of packages) {
  console.log(`📦 ${pkg} 빌드 중...`);
  try {
    execSync(`npm run build --workspace=${pkg}`, { stdio: 'inherit' });
    console.log(`✅ ${pkg} 빌드 성공`);
  } catch (error) {
    console.error(`❌ ${pkg} 빌드 실패:`, error.message);
    process.exit(1);
  }
}

console.log('🎉 모든 패키지 빌드 완료!');
console.log('');
console.log('📦 빌드된 패키지들:');
packages.forEach(pkg => console.log(`  ✓ ${pkg}`));