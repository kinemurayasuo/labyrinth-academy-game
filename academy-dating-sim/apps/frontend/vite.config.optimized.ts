import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc'; // Faster than @vitejs/plugin-react
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import compression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    // Gzip compression
    compression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    // Brotli compression (better than gzip)
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
    // Bundle analyzer (only in build)
    visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/bundle-analysis.html',
    }),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@ui': path.resolve(__dirname, './src/components/ui'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@store': path.resolve(__dirname, './src/store'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },

  build: {
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
        passes: 2,
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    },

    // Optimize chunk splitting
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // React core libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],

          // UI libraries
          'ui-vendor': [
            'class-variance-authority',
            'clsx',
            'tailwind-merge',
          ],

          // Game engine (if large)
          'game-engine': [
            './src/store/useGameStore',
            './src/components/game/GameUI',
          ],

          // Separate mini-games into their own chunk
          'mini-games': [
            './src/components/game/MiniGames/FishingGame',
            './src/components/game/MiniGames/CardMatchingGame',
            './src/components/game/MiniGames/QuizGame',
            './src/components/game/MiniGames/RhythmGame',
            './src/components/game/MiniGames/PuzzleGame',
          ],
        },

        // Optimize chunk file names
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `assets/js/${facadeModuleId}-[hash].js`;
        },

        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/woff|woff2|ttf|otf|eot/i.test(ext)) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
    },

    // Increase chunk size warning limit (default is 500kb)
    chunkSizeWarningLimit: 1000,

    // Enable source maps for production debugging
    sourcemap: false, // Set to true if needed for debugging

    // Assets inlining threshold (4kb)
    assetsInlineLimit: 4096,

    // Target modern browsers for smaller bundles
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari14'],

    // CSS code splitting
    cssCodeSplit: true,

    // Enable module preload polyfill
    polyfillModulePreload: true,

    // Report compressed size
    reportCompressedSize: true,
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'zustand',
    ],
    exclude: ['@vite/client', '@vite/env'],
  },

  // Server configuration
  server: {
    port: 3000,
    strictPort: false,
    open: true,
    cors: true,

    // HMR configuration
    hmr: {
      overlay: true,
    },

    // Proxy configuration for API
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },

  // Preview configuration
  preview: {
    port: 3001,
    strictPort: false,
    open: true,
  },

  // CSS configuration
  css: {
    modules: {
      localsConvention: 'camelCase',
      generateScopedName: '[name]__[local]__[hash:base64:5]',
    },
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`,
      },
    },
  },

  // Environment variable configuration
  envPrefix: 'VITE_',
});