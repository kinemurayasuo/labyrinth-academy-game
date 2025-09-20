import React from 'react';
import { useNavigate } from 'react-router-dom';

const GameMenu: React.FC = () => {
  const navigate = useNavigate();

  const menuSections = [
    {
      title: '🎮 메인 시스템',
      items: [
        { name: '던전 탐험', icon: '⚔️', path: '/dungeon', color: 'from-red-500 to-red-600' },
        { name: '상점', icon: '🏪', path: '/shopping', color: 'from-yellow-500 to-yellow-600' },
        { name: '캐릭터 관리', icon: '👥', path: '/characters', color: 'from-blue-500 to-blue-600' }
      ]
    },
    {
      title: '🏆 진행도 & 컬렉션',
      items: [
        { name: '업적', icon: '🏆', path: '/achievements', color: 'from-yellow-500 to-orange-500' },
        { name: '도감', icon: '📚', path: '/collection', color: 'from-purple-500 to-purple-600' },
        { name: '일일 퀘스트', icon: '📋', path: '/quests', color: 'from-green-500 to-green-600' },
        { name: '이벤트 캘린더', icon: '📅', path: '/calendar', color: 'from-pink-500 to-pink-600' }
      ]
    },
    {
      title: '⚔️ 커뮤니티 & 협동',
      items: [
        { name: '길드', icon: '⚔️', path: '/guild', color: 'from-indigo-500 to-indigo-600' },
        { name: '펫 시스템', icon: '🐾', path: '/pets', color: 'from-emerald-500 to-emerald-600' }
      ]
    },
    {
      title: '🎮 미니게임 & 활동',
      items: [
        { name: '낚시', icon: '🎣', path: '/fishing', color: 'from-cyan-500 to-cyan-600' },
        { name: '농사', icon: '🌾', path: '/farming', color: 'from-green-600 to-green-700' },
        { name: '카드 매칭', icon: '🃏', path: '/card-matching', color: 'from-purple-600 to-pink-600' },
        { name: '퀴즈 게임', icon: '🧠', path: '/quiz-game', color: 'from-orange-500 to-red-500' }
      ]
    },
    {
      title: '🏠 개인 공간',
      items: [
        { name: '하우징', icon: '🏠', path: '/housing', color: 'from-purple-600 to-pink-600' },
        { name: '크래프팅', icon: '🔨', path: '/crafting', color: 'from-amber-500 to-amber-600' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-purple-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-black/30 backdrop-blur rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold text-white">🎮 게임 메뉴</h1>
            <button
              onClick={() => navigate('/game')}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all"
            >
              게임으로 돌아가기
            </button>
          </div>
        </div>

        {/* Menu Sections */}
        <div className="space-y-6">
          {menuSections.map((section, sectionIdx) => (
            <div key={sectionIdx} className="bg-black/30 backdrop-blur rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">{section.title}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {section.items.map((item, itemIdx) => (
                  <button
                    key={itemIdx}
                    onClick={() => navigate(item.path)}
                    className={`bg-gradient-to-r ${item.color} p-4 rounded-xl hover:scale-105 transition-all shadow-lg hover:shadow-xl`}
                  >
                    <div className="text-4xl mb-2">{item.icon}</div>
                    <div className="text-white font-bold">{item.name}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Stats Overview */}
        <div className="bg-black/30 backdrop-blur rounded-xl p-6 mt-6">
          <h2 className="text-2xl font-bold text-white mb-4">📊 게임 통계</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-sm text-white/70">플레이 시간</div>
              <div className="text-2xl font-bold text-white">Day {player.day}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-sm text-white/70">레벨</div>
              <div className="text-2xl font-bold text-yellow-400">Lv.{player.level}</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-sm text-white/70">골드</div>
              <div className="text-2xl font-bold text-green-400">{player.gold || 0} G</div>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
              <div className="text-sm text-white/70">업적 포인트</div>
              <div className="text-2xl font-bold text-purple-400">{player.achievementPoints || 0}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameMenu;