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
        return dialogue || "최근 대화가 없습니다";
      }
    }
    return character.dialogues['0'] || "최근 대화가 없습니다";
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              👥 캐릭터 카드
            </h1>
            <button
              onClick={() => navigate('/game')}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
            >
              🏠 게임으로 돌아가기
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Character Selection Sidebar */}
          <div className="bg-white rounded-lg shadow-lg p-4">
            <h3 className="text-lg font-bold mb-4">캐릭터 선택</h3>
            <div className="space-y-2">
              {unlockedCharacters.map(characterId => {
                const character = characters[characterId];
                if (!character) return null;

                const affection = player.affection[characterId] || 0;

                return (
                  <button
                    key={characterId}
                    onClick={() => setSelectedCharacter(characterId)}
                    className={`w-full p-4 rounded-lg transition-all border-2 ${
                      selectedCharacter === characterId
                        ? 'border-pink-500 bg-pink-50 scale-105'
                        : 'border-gray-200 hover:border-pink-300 hover:bg-pink-25'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{character.sprite}</span>
                      <div className="text-left">
                        <div className="font-bold text-gray-800">{character.name}</div>
                        <div className="text-sm text-gray-600">{character.role}</div>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-red-400">💖</span>
                          <span className="text-sm font-medium">{affection}%</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Character Card */}
          <div className="lg:col-span-3">
            {selectedCharacterData && (
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-3 min-h-[700px]">
                  {/* Character Portrait Section */}
                  <div className="bg-gradient-to-br from-pink-100 via-purple-100 to-indigo-100 p-8 flex flex-col items-center justify-center relative">
                    {/* Background decoration */}
                    <div className="absolute top-4 right-4 text-6xl opacity-10">
                      {selectedCharacterData.sprite}
                    </div>

                    <div className="w-56 h-56 bg-gradient-to-br from-pink-300 via-purple-300 to-indigo-300 rounded-full flex items-center justify-center text-8xl mb-6 shadow-xl border-4 border-white relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                      <span className="relative z-10">{selectedCharacterData.sprite}</span>
                    </div>

                    <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">
                      {selectedCharacterData.name}
                    </h2>
                    <p className="text-purple-600 font-medium text-lg mb-4">
                      {selectedCharacterData.role}
                    </p>

                    {/* Quick Stats */}
                    <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 w-full">
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-pink-600">
                            {getCharacterStats(selectedCharacter).affection}
                          </div>
                          <div className="text-sm text-gray-600">호감도</div>
                        </div>
                        <div>
                          <div className="text-lg font-bold text-purple-600">
                            {getRelationStatus(selectedCharacter)}
                          </div>
                          <div className="text-sm text-gray-600">관계</div>
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
                          <div className="text-sm text-gray-500 mb-1">📍 위치</div>
                          <div className="font-medium text-lg">{getCharacterLocation(selectedCharacter)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 mb-1">👔 복장</div>
                          <div className="font-medium text-lg">{getCharacterOutfit(selectedCharacter)}</div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <div className="text-sm text-gray-500 mb-1">💭 상태</div>
                          <div className="font-medium text-lg">{getCharacterStatus(selectedCharacter)}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 mb-1">💕 관계</div>
                          <div className="font-medium text-lg">{getRelationStatus(selectedCharacter)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Status Bars */}
                    <div className="mb-8">
                      <h4 className="text-lg font-bold mb-4">📊 상태</h4>
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
                            <div key={stat} className="bg-gray-50 rounded-lg p-4">
                              <div className="flex justify-between items-center mb-2">
                                <span className="font-medium flex items-center gap-2">
                                  <span className="text-xl">{info.icon}</span>
                                  <span>{info.label}</span>
                                </span>
                                <span className="font-bold text-lg">{value}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
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
                      <h4 className="text-lg font-bold mb-4">💬 최근 대화</h4>
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border-l-4 border-purple-400">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{selectedCharacterData.sprite}</span>
                          <div className="flex-1">
                            <div className="font-medium text-purple-700 mb-2">{selectedCharacterData.name}</div>
                            <p className="text-gray-700 italic leading-relaxed">
                              "{getCurrentDialogue(selectedCharacterData, selectedCharacter)}"
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Preferences */}
                    <div className="mb-8">
                      <h4 className="text-lg font-bold mb-4">❤️ 좋아하는 것들</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedCharacterData.likes.slice(0, 8).map((item, index) => (
                          <span key={index} className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium border border-purple-200">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 pt-6 flex justify-between items-center">
                      <div className="flex items-center gap-6 text-sm text-gray-500">
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
                        <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
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