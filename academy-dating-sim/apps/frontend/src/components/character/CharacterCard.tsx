import React from 'react';
import type { Character, Player } from '../../types/game';

interface CharacterCardProps {
  character: Character;
  player: Player;
  onInteract?: () => void;
  currentLocation?: string;
}

interface CharacterStats {
  poise: number;
  stress: number;
  arousal: number;
  affection: number;
}

const CharacterCard: React.FC<CharacterCardProps> = ({
  character,
  player,
  onInteract,
  currentLocation = "학교 본관"
}) => {
  const affectionLevel = player.affection[character.id] || character.affectionStart;

  // Calculate character stats based on affection and player stats
  const getCharacterStats = (): CharacterStats => {
    const baseStats = {
      poise: Math.max(60 + Math.floor(affectionLevel / 5), 0),
      stress: Math.max(40 - Math.floor(affectionLevel / 3), 0),
      arousal: Math.min(20 + Math.floor(affectionLevel / 8), 100),
      affection: affectionLevel
    };

    // Modify based on time of day
    if (player.timeOfDay === 'night') {
      baseStats.stress += 10;
      baseStats.poise -= 5;
    }

    return {
      poise: Math.min(Math.max(baseStats.poise, 0), 100),
      stress: Math.min(Math.max(baseStats.stress, 0), 100),
      arousal: Math.min(Math.max(baseStats.arousal, 0), 100),
      affection: Math.min(Math.max(baseStats.affection, 0), 100)
    };
  };

  const characterStats = getCharacterStats();

  const getStatusColor = (value: number, inverted = false) => {
    if (inverted) {
      if (value >= 75) return 'from-red-500 to-red-400';
      if (value >= 50) return 'from-yellow-500 to-yellow-400';
      if (value >= 25) return 'from-green-500 to-green-400';
      return 'from-green-600 to-green-500';
    } else {
      if (value >= 75) return 'from-green-500 to-green-400';
      if (value >= 50) return 'from-yellow-500 to-yellow-400';
      if (value >= 25) return 'from-orange-500 to-orange-400';
      return 'from-red-500 to-red-400';
    }
  };

  const getCurrentDialogue = () => {
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

  const getCharacterOutfit = () => {
    if (affectionLevel >= 80) return "특별한 의상";
    if (affectionLevel >= 60) return "캐주얼 복장";
    if (affectionLevel >= 40) return "학교 복장 (편안)";
    if (affectionLevel >= 20) return "학교 복장";
    return "학교 복장 (단정)";
  };

  const getRelationStatus = () => {
    if (affectionLevel >= 90) return "연인";
    if (affectionLevel >= 75) return "매우 친밀";
    if (affectionLevel >= 60) return "친밀한 친구";
    if (affectionLevel >= 40) return "친구";
    if (affectionLevel >= 20) return "지인";
    return "낯선 사람";
  };

  const formatTime = () => {
    const timeMap = {
      morning: '오전 8:30',
      noon: '오후 12:00',
      afternoon: '오후 3:00',
      evening: '오후 6:30',
      night: '오후 10:00'
    };
    return timeMap[player.timeOfDay] || '알 수 없음';
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/80 to-pink-800/80 backdrop-blur-sm rounded-2xl border border-purple-400/30 shadow-2xl overflow-hidden">
      {/* Header with character portrait */}
      <div className="relative p-6 bg-gradient-to-r from-purple-800/50 to-pink-700/50">
        <div className="flex items-start gap-4">
          {/* Character Portrait */}
          <div className="relative">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-4xl shadow-lg">
              {character.sprite}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
          </div>

          {/* Character Info */}
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-white mb-1">{character.name}</h3>
            <p className="text-purple-200 text-sm mb-2">{character.role}</p>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-purple-700/50 px-2 py-1 rounded-full text-purple-200">
                위치: {currentLocation}
              </span>
              <span className="bg-blue-700/50 px-2 py-1 rounded-full text-blue-200">
                상태: 대화 가능
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Character Details */}
      <div className="p-6 space-y-4">
        {/* Outfit and Relations */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-purple-300">복장:</span>
            <span className="text-white ml-2">{getCharacterOutfit()}</span>
          </div>
          <div>
            <span className="text-purple-300">관계:</span>
            <span className="text-white ml-2">{getRelationStatus()}</span>
          </div>
        </div>

        {/* Status Bars */}
        <div className="space-y-3">
          {/* Poise */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-purple-300 flex items-center gap-1">
                🧘 침착
              </span>
              <span className="text-xs text-white font-medium">{characterStats.poise}%</span>
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-2">
              <div
                className={`h-2 rounded-full bg-gradient-to-r ${getStatusColor(characterStats.poise)} transition-all duration-500`}
                style={{ width: `${characterStats.poise}%` }}
              />
            </div>
          </div>

          {/* Stress */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-purple-300 flex items-center gap-1">
                😰 스트레스
              </span>
              <span className="text-xs text-white font-medium">{characterStats.stress}%</span>
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-2">
              <div
                className={`h-2 rounded-full bg-gradient-to-r ${getStatusColor(characterStats.stress, true)} transition-all duration-500`}
                style={{ width: `${characterStats.stress}%` }}
              />
            </div>
          </div>

          {/* Arousal */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-purple-300 flex items-center gap-1">
                💕 호감도
              </span>
              <span className="text-xs text-white font-medium">{characterStats.arousal}%</span>
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-2">
              <div
                className={`h-2 rounded-full bg-gradient-to-r ${getStatusColor(characterStats.arousal)} transition-all duration-500`}
                style={{ width: `${characterStats.arousal}%` }}
              />
            </div>
          </div>

          {/* Affection */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-purple-300 flex items-center gap-1">
                💖 애정도
              </span>
              <span className="text-xs text-white font-medium">{affectionLevel}%</span>
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-2">
              <div
                className={`h-2 rounded-full bg-gradient-to-r from-pink-500 to-red-400 transition-all duration-500`}
                style={{ width: `${affectionLevel}%` }}
              />
            </div>
          </div>
        </div>

        {/* Character Dialogue */}
        <div className="bg-black/30 rounded-lg p-4 border-l-4 border-purple-400">
          <p className="text-white text-sm italic leading-relaxed">
            "{getCurrentDialogue()}"
          </p>
        </div>

        {/* Inventory Preview */}
        <div className="text-sm">
          <span className="text-purple-300">소지품:</span>
          <div className="flex gap-2 mt-2">
            {character.likes.slice(0, 3).map((item, index) => (
              <span key={index} className="bg-purple-700/30 px-2 py-1 rounded text-xs text-purple-200">
                {item}
              </span>
            ))}
            {character.likes.length > 3 && (
              <span className="text-xs text-purple-400">+{character.likes.length - 3} 더</span>
            )}
          </div>
        </div>

        {/* Date/Time Display */}
        <div className="border-t border-purple-500/30 pt-4 flex justify-between items-center text-sm">
          <span className="text-purple-300">
            📅 {player.day}일차
          </span>
          <span className="text-purple-300">
            🕐 {formatTime()}
          </span>
        </div>

        {/* Interaction Button */}
        {onInteract && (
          <button
            onClick={onInteract}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500
                     text-white font-medium py-3 px-4 rounded-lg transition-all duration-300
                     transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            💬 대화하기
          </button>
        )}
      </div>
    </div>
  );
};

export default CharacterCard;