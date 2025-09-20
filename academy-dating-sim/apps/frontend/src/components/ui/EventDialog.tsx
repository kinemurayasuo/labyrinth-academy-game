import React from 'react';
import type { GameEvent, Player } from '../../types/game';

interface EventDialogProps {
  event: GameEvent;
  player: Player;
  onChoice: (event: GameEvent, choiceIndex: number) => void;
  onClose: () => void;
}

const EventDialog: React.FC<EventDialogProps> = ({
  event,
  player,
  onChoice,
  onClose,
}) => {
  const getEventIcon = (eventName: string) => {
    if (eventName.includes('만남')) return '🤝';
    if (eventName.includes('공부') || eventName.includes('시험')) return '📚';
    if (eventName.includes('축제') || eventName.includes('파티')) return '🎉';
    if (eventName.includes('비밀') || eventName.includes('미스터리')) return '🔍';
    if (eventName.includes('선물') || eventName.includes('프레젠트')) return '🎁';
    if (eventName.includes('데이트')) return '💕';
    if (eventName.includes('위기') || eventName.includes('문제')) return '⚠️';
    if (eventName.includes('성공') || eventName.includes('성취')) return '🏆';
    return '⭐';
  };

  const canSelectChoice = (choice: any) => {
    if (!choice.condition) return true;

    if (choice.condition.minIntelligence && player.stats.intelligence < choice.condition.minIntelligence) {
      return false;
    }
    if (choice.condition.minCharm && player.stats.charm < choice.condition.minCharm) {
      return false;
    }
    if (choice.condition.minStamina && player.stats.stamina < choice.condition.minStamina) {
      return false;
    }
    if (choice.condition.hasItem && !player.inventory.includes(choice.condition.hasItem)) {
      return false;
    }

    return true;
  };

  const getChoiceRequirementText = (choice: any) => {
    if (!choice.condition) return null;

    const requirements = [];
    if (choice.condition.minIntelligence) {
      requirements.push(`지력 ${choice.condition.minIntelligence} 필요`);
    }
    if (choice.condition.minCharm) {
      requirements.push(`매력 ${choice.condition.minCharm} 필요`);
    }
    if (choice.condition.minStamina) {
      requirements.push(`체력 ${choice.condition.minStamina} 필요`);
    }
    if (choice.condition.hasItem) {
      requirements.push(`${choice.condition.hasItem} 필요`);
    }

    return requirements.join(', ');
  };

  const getChoiceEffectPreview = (choice: any) => {
    const effects = [];

    if (choice.effects.affection) {
      Object.entries(choice.effects.affection).forEach(([char, amount]: [string, any]) => {
        effects.push(`${char} 호감도 ${amount > 0 ? '+' : ''}${amount}`);
      });
    }

    if (choice.effects.stats) {
      Object.entries(choice.effects.stats).forEach(([stat, amount]: [string, any]) => {
        const statName = stat === 'intelligence' ? '지력' : stat === 'charm' ? '매력' : '체력';
        effects.push(`${statName} ${amount > 0 ? '+' : ''}${amount}`);
      });
    }

    if (choice.effects.money) {
      effects.push(`돈 ${choice.effects.money > 0 ? '+' : ''}${choice.effects.money}`);
    }

    if (choice.effects.item) {
      effects.push(`아이템 획득: ${choice.effects.item}`);
    }

    return effects;
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-purple-900 via-pink-800 to-purple-900 text-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-800 to-pink-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{getEventIcon(event.name)}</span>
              <div>
                <h2 className="text-xl font-bold text-pink-200">{event.name}</h2>
                <div className="text-sm text-purple-300">
                  {event.trigger.character && `${event.trigger.character}와의 이벤트`}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-purple-300 hover:text-white text-2xl transition-colors duration-200"
            >
              ×
            </button>
          </div>
        </div>

        {/* Event Description */}
        <div className="p-6">
          <div className="bg-purple-900/40 rounded-lg p-4 mb-6">
            <p className="text-purple-100 leading-relaxed">{event.description}</p>
          </div>

          {/* Choices */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-pink-200 mb-4">선택지</h3>

            {event.choices.map((choice, index) => {
              const canSelect = canSelectChoice(choice);
              const requirementText = getChoiceRequirementText(choice);
              const effectPreview = getChoiceEffectPreview(choice);

              return (
                <button
                  key={index}
                  onClick={() => onChoice(event, index)}
                  disabled={!canSelect}
                  className={`w-full text-left p-4 rounded-lg transition-all duration-200 ${
                    canSelect
                      ? 'bg-purple-800/60 hover:bg-purple-700/60 hover:scale-105 cursor-pointer border border-purple-600/50 hover:border-purple-500/70'
                      : 'bg-gray-800/40 cursor-not-allowed opacity-50 border border-gray-600/30'
                  }`}
                >
                  <div className="space-y-2">
                    {/* Choice Text */}
                    <div className={`font-medium ${canSelect ? 'text-white' : 'text-gray-400'}`}>
                      {choice.text}
                    </div>

                    {/* Requirements */}
                    {requirementText && (
                      <div className={`text-xs ${canSelect ? 'text-purple-300' : 'text-red-400'}`}>
                        📋 {requirementText}
                      </div>
                    )}

                    {/* Effect Preview */}
                    {effectPreview.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {effectPreview.map((effect, effectIndex) => (
                          <span
                            key={effectIndex}
                            className={`text-xs px-2 py-1 rounded-full ${
                              canSelect
                                ? 'bg-purple-700/60 text-purple-200'
                                : 'bg-gray-700/40 text-gray-400'
                            }`}
                          >
                            {effect}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Cannot Select Warning */}
                    {!canSelect && (
                      <div className="text-xs text-red-400 font-medium">
                        ⚠️ 조건을 만족하지 않습니다
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Event Info */}
          <div className="mt-6 pt-4 border-t border-purple-700/50">
            <div className="text-xs text-purple-400 space-y-1">
              {event.trigger.once && (
                <div>🔒 일회성 이벤트</div>
              )}
              {event.trigger.minDay && (
                <div>📅 {event.trigger.minDay}일차 이후</div>
              )}
              {event.trigger.minAffection && event.trigger.character && (
                <div>💕 {event.trigger.character} 호감도 {event.trigger.minAffection} 이상</div>
              )}
              {event.trigger.totalAffection && (
                <div>🌟 총 호감도 {event.trigger.totalAffection} 이상</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDialog;