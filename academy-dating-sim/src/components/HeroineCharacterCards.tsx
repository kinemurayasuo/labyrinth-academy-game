import React, { useState } from 'react';
import type { Character, Player } from '../types/game';

interface HeroineCharacterCardsProps {
  characters: Record<string, Character>;
  player: Player;
  unlockedCharacters: string[];
  onClose: () => void;
  onInteract?: (characterId: string) => void;
}

const HeroineCharacterCards: React.FC<HeroineCharacterCardsProps> = ({
  characters,
  player,
  unlockedCharacters,
  onClose,
  onInteract,
}) => {
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);

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
        return character.dialogues[threshold.toString()];
      }
    }
    return character.dialogues['0'] || "...";
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

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="max-w-6xl w-full max-h-[95vh] overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold text-white">캐릭터 카드</h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Character Selection */}
        <div className="flex gap-4 mb-6 justify-center">
          {unlockedCharacters.map(characterId => {
            const character = characters[characterId];
            if (!character) return null;

            return (
              <button
                key={characterId}
                onClick={() => setSelectedCharacter(characterId)}
                className={`p-3 rounded-lg transition-all ${
                  selectedCharacter === characterId
                    ? 'bg-purple-600 text-white scale-110'
                    : 'bg-white/20 text-white/80 hover:bg-white/30'
                }`}
              >
                <div className="text-3xl mb-1">{character.sprite}</div>
                <div className="text-sm font-medium">{character.name}</div>
              </button>
            );
          })}
        </div>

        {/* Selected Character Card */}
        {selectedCharacter && characters[selectedCharacter] && (
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 min-h-[600px]">
              {/* Character Portrait Side */}
              <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-8 flex flex-col items-center justify-center">
                <div className="w-48 h-48 bg-gradient-to-br from-purple-300 to-pink-300 rounded-full flex items-center justify-center text-6xl mb-4 shadow-lg">
                  {characters[selectedCharacter].sprite}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">
                  {characters[selectedCharacter].name}
                </h3>
                <p className="text-purple-600 font-medium">
                  {characters[selectedCharacter].role}
                </p>
              </div>

              {/* Character Info */}
              <div className="lg:col-span-2 p-8">
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Location:</div>
                    <div className="font-medium">{getCharacterLocation(selectedCharacter)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Status:</div>
                    <div className="font-medium">{getCharacterStatus(selectedCharacter)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Outfit:</div>
                    <div className="font-medium">{getCharacterOutfit(selectedCharacter)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Relations:</div>
                    <div className="font-medium">{getRelationStatus(selectedCharacter)}</div>
                  </div>
                </div>

                {/* Status Bars */}
                <div className="space-y-4 mb-6">
                  {Object.entries(getCharacterStats(selectedCharacter)).map(([stat, value]) => {
                    const statInfo = {
                      poise: { icon: '🧘', label: 'Poise', color: 'blue' },
                      stress: { icon: '😰', label: 'Stress', color: 'orange' },
                      arousal: { icon: '💕', label: 'Arousal', color: 'pink' },
                      affection: { icon: '💖', label: 'Affection', color: 'red' }
                    };

                    const info = statInfo[stat as keyof typeof statInfo];
                    if (!info) return null;

                    return (
                      <div key={stat}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium flex items-center gap-1">
                            <span>{info.icon}</span>
                            <span>{info.label}</span>
                          </span>
                          <span className="text-sm font-bold">{value}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className={`h-3 rounded-full bg-gradient-to-r ${
                              info.color === 'blue' ? 'from-blue-400 to-blue-600' :
                              info.color === 'orange' ? 'from-orange-400 to-orange-600' :
                              info.color === 'pink' ? 'from-pink-400 to-pink-600' :
                              'from-red-400 to-red-600'
                            } transition-all duration-500`}
                            style={{ width: `${Math.max(value, 0)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Character Dialogue */}
                <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-purple-400 mb-6">
                  <div className="flex items-start gap-2">
                    <span className="text-xl">💭</span>
                    <p className="text-gray-700 italic leading-relaxed">
                      "{getCurrentDialogue(characters[selectedCharacter], selectedCharacter)}"
                    </p>
                  </div>
                </div>

                {/* Inventory/Likes */}
                <div className="mb-6">
                  <div className="text-sm text-gray-500 mb-2">Inventory:</div>
                  <div className="flex flex-wrap gap-2">
                    {characters[selectedCharacter].likes.slice(0, 6).map((item, index) => (
                      <span key={index} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Date/Time Footer */}
                <div className="border-t pt-4 flex justify-between items-center text-sm text-gray-500">
                  <div className="flex items-center gap-4">
                    <span>📅 {formatDate()}</span>
                    <span>🕐 {formatTime()}</span>
                  </div>
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Day {player.day}</span>
                </div>

                {/* Interaction Button */}
                {onInteract && (
                  <div className="mt-6">
                    <button
                      onClick={() => onInteract(selectedCharacter)}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
                    >
                      💬 대화하기
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroineCharacterCards;