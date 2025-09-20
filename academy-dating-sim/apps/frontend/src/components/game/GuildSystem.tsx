import React, { useState } from 'react';
import { useGameStore } from '../../store/useGameStore';
import soundManager from '../../utils/soundManager';

interface Guild {
  id: string;
  name: string;
  description: string;
  icon: string;
  level: number;
  exp: number;
  maxExp: number;
  members: GuildMember[];
  maxMembers: number;
  benefits: string[];
  treasury: number;
  ranking: number;
}

interface GuildMember {
  id: string;
  name: string;
  role: 'leader' | 'officer' | 'member';
  level: number;
  contribution: number;
  joinDate: string;
  avatar: string;
}

interface GuildQuest {
  id: string;
  name: string;
  description: string;
  reward: {
    guildExp: number;
    treasury: number;
    items?: string[];
  };
  requirement: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'legendary';
  progress: number;
  maxProgress: number;
}

const GuildSystem: React.FC = () => {
  const { player, updatePlayer } = useGameStore();
  const [selectedTab, setSelectedTab] = useState<'overview' | 'members' | 'quests' | 'shop'>('overview');
  const [playerGuild, setPlayerGuild] = useState<Guild | null>(null);
  const [showCreateGuild, setShowCreateGuild] = useState(false);
  const [guildName, setGuildName] = useState('');

  const availableGuilds: Guild[] = [
    {
      id: 'crimson_phoenix',
      name: '진홍의 불사조',
      description: '전투에 특화된 길드',
      icon: '🔥',
      level: 15,
      exp: 8500,
      maxExp: 10000,
      members: [],
      maxMembers: 50,
      benefits: ['공격력 +10%', '던전 보상 +20%', '전투 경험치 +15%'],
      treasury: 150000,
      ranking: 1
    },
    {
      id: 'azure_dragon',
      name: '푸른 용',
      description: '마법과 지식을 추구하는 길드',
      icon: '🐲',
      level: 12,
      exp: 6000,
      maxExp: 8000,
      members: [],
      maxMembers: 40,
      benefits: ['마나 +20%', '스킬 쿨다운 -10%', '학습 속도 +25%'],
      treasury: 120000,
      ranking: 2
    },
    {
      id: 'golden_merchant',
      name: '황금 상단',
      description: '경제와 무역을 중시하는 길드',
      icon: '💰',
      level: 10,
      exp: 4500,
      maxExp: 6000,
      members: [],
      maxMembers: 60,
      benefits: ['상점 할인 20%', '판매 가격 +15%', '일일 골드 보너스'],
      treasury: 500000,
      ranking: 3
    }
  ];

  const guildQuests: GuildQuest[] = [
    {
      id: 'daily_dungeon',
      name: '일일 던전 클리어',
      description: '길드원들이 던전을 10회 클리어',
      reward: {
        guildExp: 100,
        treasury: 5000
      },
      requirement: '던전 10회 클리어',
      difficulty: 'easy',
      progress: 3,
      maxProgress: 10
    },
    {
      id: 'boss_raid',
      name: '보스 레이드',
      description: '강력한 보스 처치',
      reward: {
        guildExp: 500,
        treasury: 20000,
        items: ['legendary_weapon']
      },
      requirement: '레이드 보스 처치',
      difficulty: 'hard',
      progress: 0,
      maxProgress: 1
    },
    {
      id: 'guild_war',
      name: '길드 전쟁 승리',
      description: '다른 길드와의 전쟁에서 승리',
      reward: {
        guildExp: 1000,
        treasury: 50000
      },
      requirement: '길드전 승리',
      difficulty: 'legendary',
      progress: 0,
      maxProgress: 1
    },
    {
      id: 'resource_gathering',
      name: '자원 수집',
      description: '길드 창고에 자원 기부',
      reward: {
        guildExp: 200,
        treasury: 10000
      },
      requirement: '자원 100개 기부',
      difficulty: 'medium',
      progress: 45,
      maxProgress: 100
    }
  ];

  const guildShopItems = [
    { id: 'guild_blessing', name: '길드의 축복', description: '모든 스탯 +10 (24시간)', cost: 10000, icon: '✨' },
    { id: 'guild_teleport', name: '길드 순간이동 주문서', description: '길드 홀로 즉시 이동', cost: 1000, icon: '🌀' },
    { id: 'guild_exp_boost', name: '경험치 부스터', description: '경험치 +50% (1시간)', cost: 5000, icon: '⭐' },
    { id: 'guild_weapon', name: '길드 전용 무기', description: '길드원만 사용 가능한 특별 무기', cost: 50000, icon: '⚔️' },
    { id: 'guild_mount', name: '길드 탈것', description: '이동속도 +100%', cost: 100000, icon: '🐎' }
  ];

  const createGuild = () => {
    if (!guildName) {
      alert('길드 이름을 입력해주세요.');
      return;
    }

    if ((player.gold || 0) < 50000) {
      alert('길드 창설에는 50,000 골드가 필요합니다.');
      return;
    }

    const newGuild: Guild = {
      id: `guild_${Date.now()}`,
      name: guildName,
      description: '새로 창설된 길드',
      icon: '⚔️',
      level: 1,
      exp: 0,
      maxExp: 1000,
      members: [{
        id: player.id || 'player',
        name: player.name,
        role: 'leader',
        level: player.level,
        contribution: 0,
        joinDate: new Date().toISOString(),
        avatar: '👤'
      }],
      maxMembers: 20,
      benefits: ['길드 창설자 버프'],
      treasury: 0,
      ranking: 999
    };

    setPlayerGuild(newGuild);
    updatePlayer({ gold: (player.gold || 0) - 50000 });
    soundManager.playSuccessSound();
    setShowCreateGuild(false);
  };

  const joinGuild = (guild: Guild) => {
    const newMember: GuildMember = {
      id: player.id || 'player',
      name: player.name,
      role: 'member',
      level: player.level,
      contribution: 0,
      joinDate: new Date().toISOString(),
      avatar: '👤'
    };

    guild.members.push(newMember);
    setPlayerGuild(guild);
    soundManager.playSuccessSound();
    alert(`${guild.name} 길드에 가입했습니다!`);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      case 'legendary': return 'text-purple-400';
      default: return 'text-white';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-black/30 backdrop-blur rounded-xl p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white">⚔️ 길드 시스템</h1>
            <button
              onClick={() => window.history.back()}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all"
            >
              돌아가기
            </button>
          </div>
        </div>

        {!playerGuild ? (
          // Guild Selection
          <div className="space-y-6">
            <div className="bg-black/30 backdrop-blur rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4">길드 가입/창설</h2>

              <button
                onClick={() => setShowCreateGuild(true)}
                className="w-full mb-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-bold hover:shadow-lg transition-all"
              >
                🏰 길드 창설 (50,000 골드)
              </button>

              <div className="grid gap-4">
                {availableGuilds.map(guild => (
                  <div key={guild.id} className="bg-white/10 rounded-lg p-4 border border-white/20">
                    <div className="flex items-start gap-4">
                      <div className="text-5xl">{guild.icon}</div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-white">{guild.name}</h3>
                        <p className="text-white/70 mb-2">{guild.description}</p>
                        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                          <div className="text-white/80">
                            <span className="text-yellow-400">Lv.{guild.level}</span> |
                            <span className="text-blue-400"> 랭킹 #{guild.ranking}</span>
                          </div>
                          <div className="text-white/80">
                            멤버: {guild.members.length}/{guild.maxMembers}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {guild.benefits.map((benefit, idx) => (
                            <span key={idx} className="bg-purple-500/30 px-2 py-1 rounded text-xs text-purple-300">
                              {benefit}
                            </span>
                          ))}
                        </div>
                        <button
                          onClick={() => joinGuild(guild)}
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-bold hover:shadow-lg transition-all"
                        >
                          가입하기
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Create Guild Modal */}
            {showCreateGuild && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                <div className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-xl p-6 max-w-md w-full">
                  <h3 className="text-2xl font-bold text-white mb-4">길드 창설</h3>
                  <input
                    type="text"
                    value={guildName}
                    onChange={(e) => setGuildName(e.target.value)}
                    placeholder="길드 이름 입력"
                    className="w-full p-3 rounded-lg bg-black/30 text-white placeholder-white/50 mb-4"
                    maxLength={20}
                  />
                  <div className="text-white/70 mb-4">
                    <p>• 창설 비용: 50,000 골드</p>
                    <p>• 초기 멤버 제한: 20명</p>
                    <p>• 길드 레벨업으로 확장 가능</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={createGuild}
                      className="flex-1 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg font-bold"
                    >
                      창설하기
                    </button>
                    <button
                      onClick={() => setShowCreateGuild(false)}
                      className="flex-1 py-2 bg-gray-600 text-white rounded-lg font-bold"
                    >
                      취소
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Guild Management
          <div className="space-y-6">
            {/* Guild Info */}
            <div className="bg-black/30 backdrop-blur rounded-xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-6xl">{playerGuild.icon}</div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-white">{playerGuild.name}</h2>
                  <p className="text-white/70">{playerGuild.description}</p>
                  <div className="flex gap-4 mt-2">
                    <span className="text-yellow-400">Lv.{playerGuild.level}</span>
                    <span className="text-blue-400">랭킹 #{playerGuild.ranking}</span>
                    <span className="text-green-400">멤버 {playerGuild.members.length}/{playerGuild.maxMembers}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-white/80">길드 금고</div>
                  <div className="text-2xl font-bold text-yellow-400">{playerGuild.treasury.toLocaleString()} G</div>
                </div>
              </div>

              {/* EXP Bar */}
              <div className="bg-black/20 rounded-lg p-2">
                <div className="flex justify-between text-sm text-white/80 mb-1">
                  <span>길드 경험치</span>
                  <span>{playerGuild.exp} / {playerGuild.maxExp}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-purple-400 to-pink-400 h-full rounded-full"
                    style={{ width: `${(playerGuild.exp / playerGuild.maxExp) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-black/30 backdrop-blur rounded-xl p-4">
              <div className="flex gap-2">
                {(['overview', 'members', 'quests', 'shop'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setSelectedTab(tab)}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      selectedTab === tab
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {tab === 'overview' && '📊 개요'}
                    {tab === 'members' && '👥 멤버'}
                    {tab === 'quests' && '📜 퀘스트'}
                    {tab === 'shop' && '🏪 상점'}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-black/30 backdrop-blur rounded-xl p-6">
              {selectedTab === 'overview' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white mb-3">길드 혜택</h3>
                  <div className="grid gap-2">
                    {playerGuild.benefits.map((benefit, idx) => (
                      <div key={idx} className="bg-purple-500/20 rounded-lg p-3 text-purple-300">
                        ✨ {benefit}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTab === 'members' && (
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-white mb-3">길드 멤버</h3>
                  <div className="space-y-2">
                    {playerGuild.members.map(member => (
                      <div key={member.id} className="bg-white/10 rounded-lg p-3 flex items-center gap-3">
                        <div className="text-2xl">{member.avatar}</div>
                        <div className="flex-1">
                          <div className="font-bold text-white">{member.name}</div>
                          <div className="text-sm text-white/70">
                            Lv.{member.level} | {member.role === 'leader' ? '👑 길드장' : member.role === 'officer' ? '⚔️ 간부' : '👤 멤버'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-white/60">기여도</div>
                          <div className="text-yellow-400 font-bold">{member.contribution}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTab === 'quests' && (
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-white mb-3">길드 퀘스트</h3>
                  <div className="grid gap-3">
                    {guildQuests.map(quest => (
                      <div key={quest.id} className="bg-white/10 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-bold text-white">{quest.name}</div>
                            <div className="text-sm text-white/70">{quest.description}</div>
                            <div className={`text-sm mt-1 ${getDifficultyColor(quest.difficulty)}`}>
                              난이도: {quest.difficulty.toUpperCase()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-white/60">보상</div>
                            <div className="text-yellow-400">+{quest.reward.guildExp} EXP</div>
                            <div className="text-green-400">+{quest.reward.treasury} G</div>
                          </div>
                        </div>
                        <div className="bg-black/20 rounded-lg p-2">
                          <div className="flex justify-between text-sm text-white/80 mb-1">
                            <span>진행도</span>
                            <span>{quest.progress} / {quest.maxProgress}</span>
                          </div>
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-400 to-cyan-400 h-full rounded-full"
                              style={{ width: `${(quest.progress / quest.maxProgress) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedTab === 'shop' && (
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-white mb-3">길드 상점</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {guildShopItems.map(item => (
                      <div key={item.id} className="bg-white/10 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="text-3xl">{item.icon}</div>
                          <div className="flex-1">
                            <div className="font-bold text-white">{item.name}</div>
                            <div className="text-sm text-white/70">{item.description}</div>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-yellow-400 font-bold">{item.cost} G</span>
                              <button className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-sm font-bold hover:shadow-lg transition-all">
                                구매
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GuildSystem;