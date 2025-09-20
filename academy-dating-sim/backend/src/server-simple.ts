import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Basic middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Simple CORS configuration for development
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    message: 'Academy Dating Sim Backend is running! 🚀'
  });
});

// Test API endpoint
app.get('/api/test', (_req, res) => {
  res.json({
    success: true,
    message: 'Backend API is working!',
    data: {
      timestamp: new Date().toISOString(),
      cors: 'enabled',
      auth: 'ready (database connection needed)',
      gameApi: 'ready (database connection needed)'
    }
  });
});

// Simple auth test endpoint
app.post('/api/auth/test', (req, res) => {
  res.json({
    success: true,
    message: 'Auth endpoint is working!',
    received: req.body,
    note: 'Database connection needed for full functionality'
  });
});

// Error handling
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `경로를 찾을 수 없습니다: ${req.method} ${req.originalUrl}`,
      statusCode: 404
    }
  });
});

app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('Error:', err);
  res.status(err.statusCode || 500).json({
    success: false,
    error: {
      message: err.message || '서버 내부 오류가 발생했습니다.',
      statusCode: err.statusCode || 500
    }
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Academy Dating Sim Backend running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`⚡ Health Check: http://localhost:${PORT}/health`);
  console.log(`🧪 API Test: http://localhost:${PORT}/api/test`);
  console.log('');
  console.log('📝 Next Steps:');
  console.log('   1. Set up PostgreSQL database');
  console.log('   2. Configure DATABASE_URL in .env');
  console.log('   3. Run: npm run prisma:migrate');
  console.log('   4. Enable full authentication & game APIs');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('✅ Process terminated');
  });
});

export default app;