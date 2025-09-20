# 🔧 Workspace Configuration - 도구 통합 설정

## 📋 루트 package.json (워크스페이스 설정)

```json
{
  "name": "academy-dating-sim",
  "version": "2.0.0",
  "private": true,
  "description": "Academy Dating Sim - Monorepo with Frontend, Backend, and Mobile apps",
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev:frontend\" \"npm run dev:backend\"",
    "dev:frontend": "npm run dev --workspace=apps/frontend",
    "dev:backend": "npm run dev --workspace=apps/backend",
    "dev:mobile": "npm run dev --workspace=apps/mobile",
    
    "build": "npm run build --workspaces",
    "build:frontend": "npm run build --workspace=apps/frontend",
    "build:backend": "npm run build --workspace=apps/backend",
    "build:mobile": "npm run build --workspace=apps/mobile",
    
    "test": "npm run test --workspaces",
    "test:watch": "npm run test:watch --workspaces",
    
    "lint": "npm run lint --workspaces",
    "lint:fix": "npm run lint:fix --workspaces",
    
    "type-check": "npm run type-check --workspaces",
    
    "clean": "npm run clean --workspaces && rimraf node_modules dist",
    "clean:deps": "rimraf node_modules apps/*/node_modules packages/*/node_modules",
    
    "migrate:dev": "npm run migrate:dev --workspace=apps/backend",
    "migrate:deploy": "npm run migrate:deploy --workspace=apps/backend",
    "db:studio": "npm run db:studio --workspace=apps/backend",
    
    "android:build": "npm run android:build --workspace=apps/mobile",
    "android:run": "npm run android:run --workspace=apps/mobile",
    
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    
    "release": "changeset publish",
    "changeset": "changeset"
  },
  "devDependencies": {
    "@changesets/cli": "^2.27.1",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "concurrently": "^8.2.2",
    "eslint": "^8.57.0",
    "eslint-config-prettier": "^9.1.0",
    "eslint-plugin-import": "^2.29.1",
    "prettier": "^3.2.5",
    "rimraf": "^5.0.5",
    "typescript": "^5.3.3"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  },
  "packageManager": "npm@10.2.4"
}
```

## 🔧 통합 설정 파일들

### configs/eslint.config.js
```javascript
import js from '@eslint/js';
import typescript from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': typescript,
    },
    rules: {
      ...typescript.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  prettier,
];
```

### configs/prettier.config.js
```javascript
export default {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  endOfLine: 'lf',
  arrowParens: 'avoid',
  bracketSpacing: true,
  jsxSingleQuote: true,
  quoteProps: 'as-needed',
};
```

### configs/tsconfig.base.json
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": false,
    "importsNotUsedAsValues": "error",
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noImplicitOverride": true,
    "noUncheckedIndexedAccess": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/shared/*": ["./src/shared/*"],
      "@/modules/*": ["./src/modules/*"],
      "@/core/*": ["./src/core/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "build"]
}
```

### configs/tailwind.config.js
```javascript
import { fontFamily } from 'tailwindcss/defaultTheme';

export default {
  content: [
    './apps/frontend/src/**/*.{js,ts,jsx,tsx,mdx}',
    './packages/ui-components/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...fontFamily.sans],
        mono: ['JetBrains Mono', ...fontFamily.mono],
      },
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          900: '#111827',
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
  ],
};
```

## 🚀 개발 스크립트들

### tools/dev-scripts/dev-setup.js
```javascript
#!/usr/bin/env node

import { execSync } from 'child_process';
import { existsSync } from 'fs';

console.log('🚀 Setting up Academy Dating Sim development environment...');

// Install dependencies
console.log('📦 Installing dependencies...');
execSync('npm install', { stdio: 'inherit' });

// Setup database
console.log('🗄️ Setting up database...');
if (existsSync('./apps/backend/.env')) {
  execSync('npm run migrate:dev --workspace=apps/backend', { stdio: 'inherit' });
} else {
  console.log('⚠️ Backend .env file not found. Please configure database connection.');
}

// Build shared packages
console.log('🔧 Building shared packages...');
execSync('npm run build --workspace=packages/shared-types', { stdio: 'inherit' });
execSync('npm run build --workspace=packages/game-engine', { stdio: 'inherit' });

console.log('✅ Development environment setup complete!');
console.log('');
console.log('🎮 Quick start commands:');
console.log('  npm run dev        - Start frontend and backend');
console.log('  npm run dev:mobile - Start mobile development');
console.log('  npm run db:studio  - Open database studio');
```

### tools/build-scripts/build-all.js
```javascript
#!/usr/bin/env node

import { execSync } from 'child_process';

console.log('🏗️ Building all Academy Dating Sim packages...');

const packages = [
  'packages/shared-types',
  'packages/game-engine',
  'packages/ui-components',
  'apps/backend',
  'apps/frontend',
];

for (const pkg of packages) {
  console.log(`📦 Building ${pkg}...`);
  try {
    execSync(`npm run build --workspace=${pkg}`, { stdio: 'inherit' });
    console.log(`✅ ${pkg} built successfully`);
  } catch (error) {
    console.error(`❌ Failed to build ${pkg}`);
    process.exit(1);
  }
}

console.log('🎉 All packages built successfully!');
```

## 📝 .gitignore 개선

```gitignore
# Dependencies
node_modules/
*/node_modules/
.pnp
.pnp.js

# Production builds
dist/
build/
*/dist/
*/build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
*/.env
*/.env.*

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
lerna-debug.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Temporary folders
tmp/
temp/

# Database
*.sqlite
*.db

# Mobile
apps/mobile/android/app/build/
apps/mobile/android/.gradle/
apps/mobile/ios/App/build/
apps/mobile/ios/App/Pods/

# Capacitor
apps/mobile/android/app/src/main/assets/public/
apps/mobile/ios/App/App/public/

# Changeset
.changeset/*.md
!.changeset/config.json
```

이 구조로 더 체계적이고 확장 가능한 프로젝트가 됩니다! 🎯