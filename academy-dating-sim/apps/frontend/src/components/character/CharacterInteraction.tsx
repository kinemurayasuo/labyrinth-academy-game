import React, { useState } from 'react';
import type { Character, Item } from '../../types/game';
import { useGameStore } from '../../store/useGameStore';

interface CharacterInteractionProps {
  characters: Record<string, Character>;
  items: Record<string, Item>;
}

const CharacterInteraction: React.FC<CharacterInteractionProps> = ({
  characters,
  items,
}) => {
  const { player, unlockedCharacters } = useGameStore();
  const useItemAction = useGameStore((state) => state.actions.useItem);
  const updateAffection = useGameStore((state) => state.actions.updateAffection);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [showGiftMenu, setShowGiftMenu] = useState(false);
  const [dialogueState, setDialogueState] = useState<{
    active: boolean;
    messages: Array<{ speaker: string; text: string; isPlayer?: boolean }>;
    choices?: Array<{ text: string; affectionChange: number }>;
  }>({ active: false, messages: [] });

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

  const getAffectionLevel = (affection: number) => {
    if (affection >= 80) return { level: '매우 친밀', color: 'text-pink-400', bgColor: 'bg-pink-500/20' };
    if (affection >= 60) return { level: '친밀', color: 'text-purple-400', bgColor: 'bg-purple-500/20' };
    if (affection >= 40) return { level: '친근', color: 'text-blue-400', bgColor: 'bg-blue-500/20' };
    if (affection >= 20) return { level: '보통', color: 'text-green-400', bgColor: 'bg-green-500/20' };
    return { level: '낯선', color: 'text-gray-400', bgColor: 'bg-gray-500/20' };
  };

  const getDialogueBasedOnAffection = (character: Character, affection: number) => {
    const dialogues = {
      low: [
        {
          heroine: `안녕... ${player.name}님?`,
          choices: [
            { text: "안녕! 오늘 기분 어때?", affectionChange: 2 },
            { text: "음... 안녕", affectionChange: 0 },
            { text: "귀찮게 하지마", affectionChange: -3 }
          ]
        },
        {
          heroine: "오늘 날씨가 좋네요...",
          choices: [
            { text: "정말 그렇네! 같이 산책할래?", affectionChange: 3 },
            { text: "그래, 날씨 좋네", affectionChange: 1 },
            { text: "그게 뭐 중요해?", affectionChange: -2 }
          ]
        }
      ],
      medium: [
        {
          heroine: `${player.name}님! 기다리고 있었어요!`,
          choices: [
            { text: "나도 너를 보고 싶었어!", affectionChange: 4 },
            { text: "응, 나도 왔어", affectionChange: 2 },
            { text: "별로 기대하지 않았는데", affectionChange: -2 }
          ]
        },
        {
          heroine: "요즘 뭐하고 지내요?",
          choices: [
            { text: "너 생각하면서 지냈지!", affectionChange: 5 },
            { text: "평소처럼 공부하고 운동하고...", affectionChange: 2 },
            { text: "네가 알 필요 있어?", affectionChange: -3 }
          ]
        }
      ],
      high: [
        {
          heroine: `${player.name}님... 보고 싶었어요...`,
          choices: [
            { text: "나도 정말 보고 싶었어. 사랑해", affectionChange: 6 },
            { text: "나도 보고 싶었어", affectionChange: 3 },
            { text: "어... 그래", affectionChange: -1 }
          ]
        },
        {
          heroine: "오늘 특별한 이야기가 있어요...",
          choices: [
            { text: "뭐든 말해봐. 다 들어줄게", affectionChange: 5 },
            { text: "무슨 이야기?", affectionChange: 2 },
            { text: "나중에 들을게", affectionChange: -2 }
          ]
        }
      ]
    };

    let dialogueSet;
    if (affection < 30) dialogueSet = dialogues.low;
    else if (affection < 70) dialogueSet = dialogues.medium;
    else dialogueSet = dialogues.high;

    return dialogueSet[Math.floor(Math.random() * dialogueSet.length)];
  };

  const handleTalk = (character: Character) => {
    const affection = player.affection[character.id] || 0;
    const dialogue = getDialogueBasedOnAffection(character, affection);

    setDialogueState({
      active: true,
      messages: [
        { speaker: character.name, text: dialogue.heroine, isPlayer: false }
      ],
      choices: dialogue.choices
    });
  };

  const handleDialogueChoice = (choice: { text: string; affectionChange: number }) => {
    if (!selectedCharacter) return;

    // Add player's response to dialogue
    setDialogueState(prev => ({
      ...prev,
      messages: [
        ...prev.messages,
        { speaker: player.name, text: choice.text, isPlayer: true }
      ],
      choices: undefined
    }));

    // Apply affection change
    if (choice.affectionChange !== 0) {
      updateAffection(selectedCharacter.id, choice.affectionChange);
    }

    // Show reaction based on affection change
    setTimeout(() => {
      let reaction;
      if (choice.affectionChange > 3) {
        reaction = "정말 기뻐요! 💕";
      } else if (choice.affectionChange > 0) {
        reaction = "고마워요... ☺️";
      } else if (choice.affectionChange < 0) {
        reaction = "그렇게 말하지 마세요... 😢";
      } else {
        reaction = "네... 알겠어요.";
      }

      setDialogueState(prev => ({
        ...prev,
        messages: [
          ...prev.messages,
          { speaker: selectedCharacter.name, text: reaction, isPlayer: false }
        ]
      }));

      // Close dialogue after showing reaction
      setTimeout(() => {
        setDialogueState({ active: false, messages: [] });
      }, 2000);
    }, 1000);
  };

  const handleGift = (character: Character, itemId: string) => {
    useItemAction(itemId, character.id);
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
      akane: 'from-red-600 via-orange-500 to-red-600',
      hana: 'from-yellow-500 via-amber-400 to-yellow-500',
      rin: 'from-violet-600 via-purple-500 to-violet-600',
      mei: 'from-emerald-600 via-green-500 to-emerald-600',
      sora: 'from-sky-500 via-blue-400 to-sky-500',
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

      {/* Dialogue System */}
      {dialogueState.active && selectedCharacter && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-purple-900 via-pink-800 to-purple-900 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-white mb-2">대화 중...</h3>
            </div>

            {/* Dialogue Messages */}
            <div className="space-y-3 mb-4">
              {dialogueState.messages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    msg.isPlayer
                      ? 'bg-blue-600/50 ml-8 text-right'
                      : 'bg-purple-600/50 mr-8'
                  }`}
                >
                  <div className="font-semibold text-white mb-1">
                    {msg.speaker}
                  </div>
                  <div className="text-gray-100">{msg.text}</div>
                </div>
              ))}
            </div>

            {/* Dialogue Choices */}
            {dialogueState.choices && (
              <div className="space-y-2">
                <div className="text-sm text-gray-300 mb-2">선택지를 고르세요:</div>
                {dialogueState.choices.map((choice, index) => (
                  <button
                    key={index}
                    onClick={() => handleDialogueChoice(choice)}
                    className="w-full p-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-lg text-white text-left transition-all duration-200 hover:scale-[1.02]"
                  >
                    {choice.text}
                    {choice.affectionChange > 0 && (
                      <span className="ml-2 text-xs text-green-300">
                        (호감도 +{choice.affectionChange})
                      </span>
                    )}
                    {choice.affectionChange < 0 && (
                      <span className="ml-2 text-xs text-red-300">
                        (호감도 {choice.affectionChange})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Close button when dialogue is finished */}
            {!dialogueState.choices && dialogueState.messages.length > 1 && (
              <button
                onClick={() => setDialogueState({ active: false, messages: [] })}
                className="mt-4 w-full bg-gray-600 hover:bg-gray-500 p-2 rounded-lg text-white transition-all duration-200"
              >
                대화 종료
              </button>
            )}
          </div>
        </div>
      )}

      {/* Character Interaction Panel */}
      {selectedCharacter && !dialogueState.active && (
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