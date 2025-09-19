import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Character, Player } from '../types/game';

interface CharacterCardPageProps {
  characters: Record<string, Character>;
  player: Player;
  unlockedCharacters: string[];
}

const CharacterCardPage: React.FC<CharacterCardPageProps> = ({
  characters,
  player,
  unlockedCharacters,
}) => {
  const navigate = useNavigate();
  const [selectedCharacter, setSelectedCharacter] = useState<string>(unlockedCharacters[0] || 'sakura');

  const getCharacterStats = (characterId: string) => {
    const affectionLevel = player.affection[characterId] || 0;

    return {
      poise: Math.max(60 + Math.floor(affectionLevel / 5), 0),
      stress: Math.max(40 - Math.floor(affectionLevel / 3), 0),
      arousal: Math.min(20 + Math.floor(affectionLevel / 8), 100),
      affection: affectionLevel
    };
  };

  const getCharacterLocation = (characterId: string) => {
    const locationMap: Record<string, string> = {
      sakura: "검도장",
      yuki: "도서관",
      luna: "마법학부",
      mystery: "???"
    };
    return locationMap[characterId] || "학교 본관";
  };

  const getCharacterStatus = (characterId: string) => {
    const affection = player.affection[characterId] || 0;
    const timeStatus = {
      morning: "수업 준비 중",
      noon: "점심시간",
      afternoon: "동아리 활동",
      evening: "자유시간",
      night: "휴식 중"
    };

    if (affection >= 70) return "당신을 기다리는 중";
    return timeStatus[player.timeOfDay] || "대화 가능";
  };

  const getCharacterOutfit = (characterId: string) => {
    const affection = player.affection[characterId] || 0;
    if (affection >= 80) return "특별한 의상";
    if (affection >= 60) return "캐주얼 복장";
    if (affection >= 40) return "학교 복장 (편안)";
    return "학교 복장";
  };

  const getRelationStatus = (characterId: string) => {
    const affection = player.affection[characterId] || 0;
    if (affection >= 90) return "연인";
    if (affection >= 75) return "매우 친밀";
    if (affection >= 60) return "친밀한 친구";
    if (affection >= 40) return "친구";
    if (affection >= 20) return "지인";
    return "낯선 사람";
  };

  const getCurrentDialogue = (character: Character, characterId: string) => {
    const affectionLevel = player.affection[characterId] || 0;
    const thresholds = Object.keys(character.dialogues)
      .map(Number)
      .sort((a, b) => b - a);

    for (const threshold of thresholds) {
      if (affectionLevel >= threshold) {
        const dialogue = character.dialogues[threshold.toString()];
        return dialogue || "최근 대화가 없습니다. 만남을 가지세요.";
      }
    }
    return character.dialogues['0'] || "최근 대화가 없습니다. 만남을 가지세요.";
  };

  const formatTime = () => {
    const timeMap = {
      morning: '8:30 AM',
      noon: '12:00 PM',
      afternoon: '3:00 PM',
      evening: '6:30 PM',
      night: '10:00 PM'
    };
    return timeMap[player.timeOfDay] || 'Unknown';
  };

  const formatDate = () => {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayName = dayNames[today.getDay()];

    return `${today.getFullYear()}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${dayName}`;
  };

  const selectedCharacterData = characters[selectedCharacter];

  return (
    <div className="min-h-screen bg-background p-4 text-text-primary">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-black/30 backdrop-blur-md rounded-lg shadow-lg p-4 mb-4 border border-border">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              👥 캐릭터 카드
            </h1>
            <button
              onClick={() => navigate('/game')}
              className="px-4 py-2 bg-primary hover:bg-secondary text-white rounded-lg transition"
            >
              🏠 게임으로 돌아가기
            </button>
          </div>
        </div>

                <div className="bg-black/30 backdrop-blur-md rounded-lg shadow-lg p-4 mb-4 border border-border">
                  <h3 className="text-lg font-bold mb-4 text-text-primary">캐릭터 선택</h3>
                  <div className="flex gap-4 justify-center overflow-x-auto">
                    {unlockedCharacters.map(characterId => {
                      const character = characters[characterId];
                      if (!character) return null;
        
                      return (
                        <button
                          key={characterId}
                          onClick={() => setSelectedCharacter(characterId)}
                          className={`px-6 py-3 rounded-lg transition-all border-2 flex flex-col items-center gap-2 min-w-[120px] ${
                            selectedCharacter === characterId
                              ? 'border-primary bg-primary/20 scale-105 shadow-lg'
                              : 'border-border hover:border-primary hover:bg-primary/10 hover:shadow-md'
                          }`}
                        >
                          <span className="text-3xl">{character.sprite}</span>
                          <div className="font-bold text-text-primary text-sm whitespace-nowrap">{character.name}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
        
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  {/* Main Character Card */}
                  <div className="lg:col-span-4">            {selectedCharacterData && (
              <div className="bg-black/30 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-border">
                <div className="grid grid-cols-1 lg:grid-cols-3 min-h-[700px]">
                  {/* Character Portrait Section */}
                  <div className="bg-black/20 p-8 flex flex-col items-center justify-center relative">
                    {/* Background decoration */}
                    <div className="absolute top-4 right-4 text-6xl opacity-10">
                      {selectedCharacterData.sprite}
                    </div>

                    <div className="w-56 h-56 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-8xl mb-6 shadow-xl border-4 border-white relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                      <span className="relative z-10">{selectedCharacterData.sprite}</span>
                    </div>

                    <h2 className="text-3xl font-bold text-text-primary mb-2 text-center">
                      {selectedCharacterData.name}
                    </h2>
                    <p className="text-secondary font-medium text-lg mb-4">
                      {selectedCharacterData.role}
                    </p>

                    {/* Quick Stats */}
                    <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4 w-full">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-secondary">
                            {getCharacterStats(selectedCharacter).affection}
                          </div>
                          <div className="text-sm text-text-secondary">호감도</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-primary">
                            {getRelationStatus(selectedCharacter)}
                          </div>
                          <div className="text-sm text-text-secondary">관계</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Character Information Section */}
                  <div className="lg:col-span-2 p-8">
                    {/* Basic Info Grid */}
                    <div className="grid grid-cols-2 gap-6 mb-8">
                      <div className="space-y-4">
                        <div>
                          <div className="text-sm text-text-secondary mb-1">📍 위치</div>
                          <div className="font-medium text-lg text-text-primary">{getCharacterLocation(selectedCharacter)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-text-secondary mb-1">👔 복장</div>
                          <div className="font-medium text-lg text-text-primary">{getCharacterOutfit(selectedCharacter)}</div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <div className="text-sm text-text-secondary mb-1">💭 상태</div>
                          <div className="font-medium text-lg text-text-primary">{getCharacterStatus(selectedCharacter)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-text-secondary mb-1">💕 관계</div>
                          <div className="font-medium text-lg text-text-primary">{getRelationStatus(selectedCharacter)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Status Bars */}
                    <div className="mb-8">
                      <h4 className="text-lg font-bold mb-4 text-text-primary">📊 상태</h4>
                      <div className="space-y-4">
                        {Object.entries(getCharacterStats(selectedCharacter)).map(([stat, value]) => {
                          const statInfo = {
                            poise: { icon: '🧘', label: '침착함', color: 'from-blue-400 to-blue-600' },
                            stress: { icon: '😰', label: '스트레스', color: 'from-orange-400 to-orange-600' },
                            arousal: { icon: '💕', label: '흥분', color: 'from-pink-400 to-pink-600' },
                            affection: { icon: '💖', label: '호감도', color: 'from-red-400 to-red-600' }
                          };

                          const info = statInfo[stat as keyof typeof statInfo];
                          if (!info) return null;

                          return (
                            <div key={stat} className="bg-black/20 rounded-lg p-4">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium flex items-center gap-2 text-text-primary">
                                  <span className="text-xl">{info.icon}</span>
                                  <span>{info.label}</span>
                                </span>
                                <span className="font-bold text-lg text-text-primary">{value}%</span>
                              </div>
                              <div className="w-full bg-black/50 rounded-full h-4 overflow-hidden">
                                <div
                                  className={`h-4 rounded-full bg-gradient-to-r ${info.color} transition-all duration-1000 ease-out relative`}
                                  style={{ width: `${Math.max(value, 0)}%` }}
                                >
                                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full"></div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Recent Dialogue */}
                    <div className="mb-8">
                      <h4 className="text-lg font-bold mb-4 text-text-primary">💬 최근 대화</h4>
                      <div className="bg-black/20 rounded-lg p-6 border-l-4 border-primary">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{selectedCharacterData.sprite}</span>
                          <div className="flex-1">
                            <div className="font-medium text-primary mb-2">{selectedCharacterData.name}</div>
                            <p className="text-text-secondary italic leading-relaxed">
                              "{getCurrentDialogue(selectedCharacterData, selectedCharacter)}"
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Preferences */}
                    <div className="mb-8">
                      <h4 className="text-lg font-bold mb-4 text-text-primary">❤️ 좋아하는 것들</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedCharacterData.likes.slice(0, 8).map((item, index) => (
                          <span key={index} className="bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-medium border border-primary/50">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-border pt-6 flex justify-between items-center">
                      <div className="flex items-center gap-6 text-sm text-text-secondary">
                        <div className="flex items-center gap-2">
                          <span>📅</span>
                          <span>{formatDate()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span>🕐</span>
                          <span>{formatTime()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="bg-accent text-background px-3 py-1 rounded-full text-sm font-medium">
                          Day {player.day}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharacterCardPage;