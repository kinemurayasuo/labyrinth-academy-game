const { createClient } = require('@supabase/supabase-js');

// Supabase 설정 (환경변수로 관리해야 함)
const supabaseUrl = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

// Supabase 클라이언트 초기화
const supabase = supabaseUrl !== 'YOUR_SUPABASE_URL'
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// 사용자 생성
async function createUser(email, username, password) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username,
      }
    }
  });

  if (error) throw error;
  return data;
}

// 사용자 로그인
async function loginUser(email, password) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

// 게임 저장
async function saveGame(userId, gameData) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('game_saves')
    .upsert({
      user_id: userId,
      save_data: gameData,
      updated_at: new Date().toISOString()
    })
    .select();

  if (error) throw error;
  return data;
}

// 게임 불러오기
async function loadGame(userId) {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('game_saves')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data;
}

module.exports = {
  supabase,
  createUser,
  loginUser,
  saveGame,
  loadGame,
};