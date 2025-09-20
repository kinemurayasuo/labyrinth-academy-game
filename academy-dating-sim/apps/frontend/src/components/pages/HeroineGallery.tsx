import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/useGameStore';
import charactersData from '../../data/characters.json';
import dialoguesData from '../../data/dialogues.json';

const characters = charactersData as Record<string, any>;
const dialogues = dialoguesData as Record<string, any>;

const HeroineGallery: React.FC = () => {
  const navigate = useNavigate();
  const player = useGameStore((state: any) => state.player);
  const unlockedCharacters = useGameStore((state: any) => state.unlockedCharacters);
  const [selectedHeroine, setSelectedHeroine] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'gallery' | 'detail'>('gallery');

  const getCharacterEmoji = (characterId: string) => {
    const emojis: Record<string, string> = {
      sakura: '🌸',
      yuki: '❄️',
      luna: '🌙',
      mystery: '❓',
      akane: '🔥',
      hana: '🌺',
      rin: '⚡',
      mei: '🎨',
      sora: '☁️',
    };
    return emojis[characterId] || '👤';
  };

  const getCharacterBackground = (characterId: string) => {
    const backgrounds: Record<string, string> = {
      sakura: 'from-pink-600 via-rose-500 to-pink-600',
      yuki: 'from-blue-600 via-cyan-500 to-blue-600',
      luna: 'from-purple-600 via-indigo-500 to-purple-600',
      mystery: 'from-gray-600 via-slate-500 to-gray-600',
      akane: 'from-red-600 via-orange-500 to-red-600',
      hana: 'from-yellow-500 via-amber-400 to-yellow-500',
      rin: 'from-violet-600 via-purple-500 to-violet-600',
      mei: 'from-emerald-600 via-green-500 to-emerald-600',
      sora: 'from-sky-500 via-blue-400 to-sky-500',
    };
    return backgrounds[characterId] || 'from-purple-600 via-pink-500 to-purple-600';
  };

  const getAffectionLevel = (affection: number) => {
    if (affection >= 80) return { level: '연인', color: 'text-pink-400', stars: '★★★★★' };
    if (affection >= 60) return { level: '친밀', color: 'text-purple-400', stars: '★★★★☆' };
    if (affection >= 40) return { level: '친근', color: 'text-blue-400', stars: '★★★☆☆' };
    if (affection >= 20) return { level: '보통', color: 'text-green-400', stars: '★★☆☆☆' };
    return { level: '낯선', color: 'text-gray-400', stars: '★☆☆☆☆' };
  };

  const getUnlockStatus = (characterId: string) => {
    if (!unlockedCharacters.includes(characterId)) {
      const character = characters[characterId];
      if (character?.unlockCondition) {
        return {
          locked: true,
          reason: `Day ${character.unlockCondition.day || 0} 이후, 총 호감도 ${character.unlockCondition.totalAffection || 0} 필요`
        };
      }
      return { locked: true, reason: '아직 만나지 못함' };
    }
    return { locked: false };
  };

  const selectedCharacter = selectedHeroine ? characters[selectedHeroine] : null;
  const selectedAffection = selectedHeroine ? (player.affection[selectedHeroine] || 0) : 0;
  const selectedDialogues = selectedHeroine ? dialogues[selectedHeroine]?.conversations : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-purple-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="glass-card p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gradient mb-2">
                💕 히로인 갤러리
              </h1>
              <p className="text-text-secondary">
                모든 히로인들의 정보와 관계도를 확인하세요
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setViewMode(viewMode === 'gallery' ? 'detail' : 'gallery')}
                className="btn-secondary px-6 py-3 rounded-xl font-semibold"
              >
                {viewMode === 'gallery' ? '상세 보기' : '갤러리 보기'}
              </button>
              <button
                onClick={() => navigate('/game')}
                className="btn-primary px-6 py-3 rounded-xl font-semibold"
              >
                게임으로 돌아가기
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'gallery' ? (
          /* Gallery View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.values(characters).map((character: any) => {
              const affection = player.affection[character.id] || 0;
              const affectionInfo = getAffectionLevel(affection);
              const unlockStatus = getUnlockStatus(character.id);
              const isUnlocked = unlockedCharacters.includes(character.id);

              return (
                <div
                  key={character.id}
                  onClick={() => {
                    if (isUnlocked) {
                      setSelectedHeroine(character.id);
                      setViewMode('detail');
                    }
                  }}
                  className={`glass-card p-6 transition-all duration-300 ${
                    isUnlocked ? 'hover:scale-105 cursor-pointer' : 'opacity-50'
                  }`}
                >
                  {/* Character Card Header */}
                  <div className={`bg-gradient-to-br ${getCharacterBackground(character.id)} p-4 rounded-xl mb-4`}>
                    <div className="text-center">
                      <div className="text-6xl mb-2">{getCharacterEmoji(character.id)}</div>
                      <h3 className="text-2xl font-bold text-white">{character.name}</h3>
                      <p className="text-white/80">{character.role}</p>
                    </div>
                  </div>

                  {/* Character Info */}
                  {isUnlocked ? (
                    <>
                      {/* Affection Status */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-text-secondary">호감도</span>
                          <span className={`font-bold ${affectionInfo.color}`}>
                            {affectionInfo.level}
                          </span>
                        </div>
                        <div className="w-full bg-background-dark rounded-full h-3 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500"
                            style={{ width: `${affection}%` }}
                          />
                        </div>
                        <div className="text-center mt-2 text-yellow-400 text-lg">
                          {affectionInfo.stars}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-background-dark p-2 rounded-lg">
                          <div className="text-xs text-text-secondary">만난 횟수</div>
                          <div className="text-lg font-bold text-text-primary">
                            {player.metHeroines?.filter((id: string) => id === character.id).length || 0}
                          </div>
                        </div>
                        <div className="bg-background-dark p-2 rounded-lg">
                          <div className="text-xs text-text-secondary">호감도</div>
                          <div className="text-lg font-bold text-text-primary">
                            {affection}/100
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-text-secondary mb-4 line-clamp-2">
                        {character.baseText}
                      </p>

                      {/* View Details Button */}
                      <button className="w-full btn-primary py-2 rounded-lg font-semibold">
                        자세히 보기 →
                      </button>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-3">🔒</div>
                      <p className="text-text-secondary font-semibold">미해금 캐릭터</p>
                      <p className="text-xs text-text-secondary mt-2">{unlockStatus.reason}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Detail View */
          selectedCharacter && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Character Profile */}
              <div className="lg:col-span-1">
                <div className="glass-card p-6 sticky top-4">
                  <div className={`bg-gradient-to-br ${getCharacterBackground(selectedHeroine!)} p-6 rounded-xl mb-6`}>
                    <div className="text-center">
                      <div className="text-8xl mb-3">{getCharacterEmoji(selectedHeroine!)}</div>
                      <h2 className="text-3xl font-bold text-white mb-2">{selectedCharacter.name}</h2>
                      <p className="text-xl text-white/90">{selectedCharacter.role}</p>
                    </div>
                  </div>

                  {/* Affection Progress */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-text-primary mb-3">관계도</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-text-secondary">현재 호감도</span>
                          <span className="text-sm font-bold text-text-primary">
                            {selectedAffection}/100
                          </span>
                        </div>
                        <div className="w-full bg-background-dark rounded-full h-4 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-500"
                            style={{ width: `${selectedAffection}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-center">
                        <span className={`text-2xl font-bold ${getAffectionLevel(selectedAffection).color}`}>
                          {getAffectionLevel(selectedAffection).level}
                        </span>
                        <div className="text-yellow-400 text-xl mt-1">
                          {getAffectionLevel(selectedAffection).stars}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Character Traits */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-green-400 mb-2">좋아하는 것</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedCharacter.likes.map((like: string, idx: number) => (
                          <span key={idx} className="badge badge-success">
                            {like}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-400 mb-2">싫어하는 것</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedCharacter.dislikes.map((dislike: string, idx: number) => (
                          <span key={idx} className="badge badge-error">
                            {dislike}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Character Details & Dialogues */}
              <div className="lg:col-span-2 space-y-6">
                {/* Character Story */}
                <div className="glass-card p-6">
                  <h3 className="text-2xl font-bold text-text-primary mb-4">캐릭터 스토리</h3>
                  <div className="prose prose-invert max-w-none">
                    <p className="text-text-secondary leading-relaxed">
                      {selectedCharacter.baseText}
                    </p>
                    {selectedCharacter.backstory && (
                      <div className="mt-4 p-4 bg-background-dark rounded-lg">
                        <h4 className="text-lg font-semibold text-text-primary mb-2">배경 이야기</h4>
                        <p className="text-text-secondary">{selectedCharacter.backstory}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Dialogue Collection */}
                <div className="glass-card p-6">
                  <h3 className="text-2xl font-bold text-text-primary mb-4">대화 컬렉션</h3>
                  <div className="space-y-3">
                    {selectedCharacter.dialogues && Object.entries(selectedCharacter.dialogues).map(([affectionLevel, dialogue]: [string, any]) => {
                      const level = parseInt(affectionLevel);
                      const isUnlocked = selectedAffection >= level;

                      return (
                        <div
                          key={affectionLevel}
                          className={`p-4 rounded-lg transition-all ${
                            isUnlocked
                              ? 'bg-background-dark border border-primary/30'
                              : 'bg-background-dark/50 opacity-50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-primary">
                              호감도 {affectionLevel}
                            </span>
                            {isUnlocked ? (
                              <span className="badge badge-success">해금</span>
                            ) : (
                              <span className="badge">🔒 미해금</span>
                            )}
                          </div>
                          <p className={`text-text-secondary ${!isUnlocked && 'blur-sm'}`}>
                            "{isUnlocked ? dialogue : '???'}"
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Special Events */}
                {selectedDialogues && selectedDialogues.length > 0 && (
                  <div className="glass-card p-6">
                    <h3 className="text-2xl font-bold text-text-primary mb-4">특별 이벤트</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedDialogues.map((conv: any, idx: number) => {
                        const isUnlocked = selectedAffection >= (conv.requiredAffection || 0);

                        return (
                          <div
                            key={idx}
                            className={`p-4 rounded-lg border ${
                              isUnlocked
                                ? 'bg-gradient-to-br from-primary/20 to-accent/20 border-primary/50'
                                : 'bg-background-dark/50 border-border opacity-50'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-text-primary">
                                {conv.title || `이벤트 ${idx + 1}`}
                              </h4>
                              {isUnlocked ? (
                                <span className="text-green-400">✓</span>
                              ) : (
                                <span className="text-gray-400">🔒</span>
                              )}
                            </div>
                            <p className="text-sm text-text-secondary">
                              필요 호감도: {conv.requiredAffection || 0}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      navigate('/game');
                      // Can add logic to auto-select this character in game
                    }}
                    className="flex-1 btn-primary px-6 py-3 rounded-xl font-semibold"
                  >
                    이 캐릭터와 대화하기
                  </button>
                  <button
                    onClick={() => setViewMode('gallery')}
                    className="flex-1 btn-secondary px-6 py-3 rounded-xl font-semibold"
                  >
                    갤러리로 돌아가기
                  </button>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default HeroineGallery;