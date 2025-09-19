import React, { useState } from 'react';
import type { Character, Player, Item } from '../types/game';

interface CharacterInteractionProps {
  characters: Record<string, Character>;
  unlockedCharacters: string[];
  player: Player;
  items: Record<string, Item>;
  onUseItem: (itemId: string, targetCharacter: string) => void;
  onUpdateAffection: (character: string, amount: number) => void;
}

const CharacterInteraction: React.FC<CharacterInteractionProps> = ({
  characters,
  unlockedCharacters,
  player,
  items,
  onUseItem,
  onUpdateAffection,
}) => {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [showGiftMenu, setShowGiftMenu] = useState(false);

  const getCharacterEmoji = (characterId: string) => {
    const emojis: Record<string, string> = {
      sakura: '🌸',
      yuki: '❄️',
      luna: '🌙',
      mystery: '❓',
    };
    return emojis[characterId] || '👤';
  };

  const getAffectionLevel = (affection: number) => {
    if (affection >= 80) return { level: '매우 친밀', color: 'text-pink-400', bgColor: 'bg-pink-500/20' };
    if (affection >= 60) return { level: '친밀', color: 'text-purple-400', bgColor: 'bg-purple-500/20' };
    if (affection >= 40) return { level: '친근', color: 'text-blue-400', bgColor: 'bg-blue-500/20' };
    if (affection >= 20) return { level: '보통', color: 'text-green-400', bgColor: 'bg-green-500/20' };
    return { level: '낯선', color: 'text-gray-400', bgColor: 'bg-gray-500/20' };
  };

  const handleTalk = (character: Character) => {
    // Simple dialogue system based on affection (dialogue display not implemented yet)

    // Small affection gain from talking
    onUpdateAffection(character.id, 1);
  };

  const handleGift = (character: Character, itemId: string) => {
    onUseItem(itemId, character.id);
    setShowGiftMenu(false);
  };

  const availableGifts = player.inventory
    .map(itemId => items[itemId])
    .filter(item => item && item.type === 'gift');

  const getCharacterBackground = (characterId: string) => {
    const backgrounds: Record<string, string> = {
      sakura: 'from-pink-600 via-rose-500 to-pink-600',
      yuki: 'from-blue-600 via-cyan-500 to-blue-600',
      luna: 'from-purple-600 via-indigo-500 to-purple-600',
      mystery: 'from-gray-600 via-slate-500 to-gray-600',
    };
    return backgrounds[characterId] || 'from-purple-600 via-pink-500 to-purple-600';
  };

  return (
    <div className="bg-black/30 backdrop-blur-md text-text-primary rounded-lg shadow-lg p-6 border border-border">
      <h2 className="text-2xl font-bold text-pink-200 mb-6 flex items-center gap-2">
        <span>👥</span>
        캐릭터 상호작용
      </h2>

      {/* Character Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {unlockedCharacters.map(characterId => {
          const character = characters[characterId];
          if (!character) return null;

          const affection = player.affection[characterId] || 0;
          const affectionInfo = getAffectionLevel(affection);

          return (
            <button
              key={characterId}
              onClick={() => setSelectedCharacter(character)}
              className={`p-4 rounded-lg transition-all duration-200 hover:scale-105 bg-gradient-to-br ${getCharacterBackground(characterId)} hover:brightness-110`}
            >
              <div className="text-center">
                <div className="text-4xl mb-2">{getCharacterEmoji(characterId)}</div>
                <h3 className="font-bold text-lg text-white">{character.name}</h3>
                <p className="text-xs text-gray-200 mb-2">{character.role}</p>

                {/* Affection Display */}
                <div className={`text-xs px-2 py-1 rounded-full ${affectionInfo.bgColor} ${affectionInfo.color} font-medium`}>
                  {affectionInfo.level} ({affection}/100)
                </div>

                {/* Affection Bar */}
                <div className="w-full bg-black/20 rounded-full h-2 mt-2">
                  <div
                    className="bg-gradient-to-r from-pink-400 to-purple-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${affection}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Character Interaction Panel */}
      {selectedCharacter && (
        <div className={`bg-gradient-to-r ${getCharacterBackground(selectedCharacter.id)} rounded-lg p-6 shadow-inner`}>
          <div className="text-center mb-6">
            <div className="text-6xl mb-3">{getCharacterEmoji(selectedCharacter.id)}</div>
            <h3 className="text-2xl font-bold text-white">{selectedCharacter.name}</h3>
            <p className="text-gray-200">{selectedCharacter.role}</p>
          </div>

          {/* Character Info */}
          <div className="bg-black/20 rounded-lg p-4 mb-4">
            <div className="text-sm text-gray-200 mb-3">
              {selectedCharacter.baseText}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <h4 className="font-semibold text-green-300 mb-1">좋아하는 것:</h4>
                <div className="space-y-1">
                  {selectedCharacter.likes.map((like, index) => (
                    <div key={index} className="text-green-200">• {like}</div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-red-300 mb-1">싫어하는 것:</h4>
                <div className="space-y-1">
                  {selectedCharacter.dislikes.map((dislike, index) => (
                    <div key={index} className="text-red-200">• {dislike}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => handleTalk(selectedCharacter)}
              className="bg-blue-600/80 hover:bg-blue-500/80 px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 flex items-center gap-2"
            >
              <span>💬</span>
              대화하기
            </button>

            <button
              onClick={() => setShowGiftMenu(!showGiftMenu)}
              disabled={availableGifts.length === 0}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 flex items-center gap-2 ${
                availableGifts.length > 0
                  ? 'bg-pink-600/80 hover:bg-pink-500/80'
                  : 'bg-gray-600/50 cursor-not-allowed opacity-50'
              }`}
            >
              <span>🎁</span>
              선물하기 ({availableGifts.length})
            </button>
          </div>

          {/* Gift Menu */}
          {showGiftMenu && availableGifts.length > 0 && (
            <div className="mt-4 bg-black/30 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-pink-200 mb-3">선물 선택</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableGifts.map((item) => {
                  const isPreferred = item.preferredBy?.includes(selectedCharacter.id);

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleGift(selectedCharacter, item.id)}
                      className={`p-3 rounded-lg text-left transition-all duration-200 hover:scale-105 ${
                        isPreferred
                          ? 'bg-yellow-600/60 hover:bg-yellow-500/60 border border-yellow-400/50'
                          : 'bg-purple-800/60 hover:bg-purple-700/60'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-white">{item.name}</div>
                          <div className="text-xs text-gray-300">{item.description}</div>
                          {isPreferred && (
                            <div className="text-xs text-yellow-300 font-medium mt-1">
                              ⭐ 선호 아이템!
                            </div>
                          )}
                        </div>
                        <div className="text-lg">🎁</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setShowGiftMenu(false)}
                className="mt-3 w-full bg-gray-600/60 hover:bg-gray-500/60 px-4 py-2 rounded-lg text-sm transition-all duration-200"
              >
                닫기
              </button>
            </div>
          )}
        </div>
      )}

      {!selectedCharacter && (
        <div className="text-center text-purple-300 py-8">
          <div className="text-4xl mb-3">👆</div>
          <p>상호작용할 캐릭터를 선택하세요</p>
        </div>
      )}
    </div>
  );
};

export default CharacterInteraction;