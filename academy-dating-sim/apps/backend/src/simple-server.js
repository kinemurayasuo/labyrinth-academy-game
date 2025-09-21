const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { supabase, createUser, loginUser, saveGame, loadGame } = require('./db/supabase');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'academy-dating-sim-secret-key-2025';

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
  credentials: true
}));
app.use(express.json());

// In-memory storage (Supabase가 설정되지 않은 경우 폴백)
const users = [];
const gameSaves = {};

// Check if Supabase is configured
const isSupabaseConfigured = supabase !== null;

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    server: 'Academy Dating Sim Backend',
    version: '1.0.0'
  });
});

// API test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    message: 'API is working!',
    timestamp: new Date().toISOString()
  });
});

// Authentication endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (isSupabaseConfigured) {
      try {
        const data = await createUser(email, username, password);
        res.json({
          success: true,
          message: '회원가입 성공!',
          user: {
            id: data.user.id,
            email: data.user.email,
            username: username
          },
          token: data.session?.access_token
        });
      } catch (error) {
        if (error.message?.includes('already registered')) {
          return res.status(400).json({ error: '이미 존재하는 이메일입니다.' });
        }
        throw error;
      }
    } else {
      // Fallback to in-memory storage
      const existingUser = users.find(u => u.email === email);
      if (existingUser) {
        return res.status(400).json({ error: '이미 존재하는 이메일입니다.' });
      }

      const hashedPassword = Buffer.from(password).toString('base64');
      const user = {
        id: users.length + 1,
        email,
        username,
        password: hashedPassword,
        createdAt: new Date().toISOString()
      };

      users.push(user);

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        message: '회원가입 성공!',
        user: {
          id: user.id,
          email: user.email,
          username: user.username
        },
        token
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (isSupabaseConfigured) {
      try {
        const data = await loginUser(email, password);
        res.json({
          success: true,
          message: '로그인 성공!',
          user: {
            id: data.user.id,
            email: data.user.email,
            username: data.user.user_metadata?.username || email.split('@')[0]
          },
          token: data.session?.access_token
        });
      } catch (error) {
        return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
      }
    } else {
      // Fallback to in-memory storage
      const user = users.find(u => u.email === email);
      if (!user) {
        return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
      }

      const hashedInput = Buffer.from(password).toString('base64');
      if (hashedInput !== user.password) {
        return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다.' });
      }

      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        message: '로그인 성공!',
        user: {
          id: user.id,
          email: user.email,
          username: user.username
        },
        token
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// Password reset endpoint
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email } = req.body;

    const user = users.find(u => u.email === email);
    if (!user) {
      // 보안상 사용자 존재 여부를 알려주지 않음
      return res.json({
        success: true,
        message: '이메일이 존재하면 비밀번호 재설정 링크가 전송됩니다.'
      });
    }

    // 실제로는 이메일을 보내야 하지만 데모용으로 임시 비밀번호 생성
    const tempPassword = Math.random().toString(36).slice(-8);
    user.password = Buffer.from(tempPassword).toString('base64');

    res.json({
      success: true,
      message: '비밀번호가 재설정되었습니다.',
      tempPassword // 데모용 - 실제로는 이메일로 전송
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
});

// Game save/load endpoints
app.post('/api/game/save', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const saveData = req.body;

    if (isSupabaseConfigured) {
      await saveGame(userId, saveData);
    } else {
      gameSaves[userId] = {
        ...saveData,
        savedAt: new Date().toISOString()
      };
    }

    res.json({
      success: true,
      message: '게임이 저장되었습니다.'
    });
  } catch (error) {
    console.error('Save game error:', error);
    res.status(500).json({ error: '저장 실패' });
  }
});

app.get('/api/game/load', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    let saveData;

    if (isSupabaseConfigured) {
      saveData = await loadGame(userId);
    } else {
      saveData = gameSaves[userId];
    }

    if (!saveData) {
      return res.status(404).json({ error: '저장된 게임이 없습니다.' });
    }

    res.json({
      success: true,
      saveData: saveData.save_data || saveData
    });
  } catch (error) {
    console.error('Load game error:', error);
    res.status(500).json({ error: '불러오기 실패' });
  }
});

// Middleware for JWT authentication
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '인증이 필요합니다.' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: '토큰이 유효하지 않습니다.' });
    }
    req.user = user;
    next();
  });
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server is running on http://localhost:${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/health`);
  console.log(`💾 Database: ${isSupabaseConfigured ? 'Supabase connected' : 'In-memory storage (configure Supabase for persistence)'}`);
});