import React from 'react';
import type { Location, Player, Character } from '../types/game';

interface LocationViewProps {
  currentLocation: Location;
  player: Player;
  onPerformActivity: (activityName: string) => void;
  onMoveToLocation: (locationId: string) => void;
  availableLocations: Record<string, Location>;
  characters: Record<string, Character>;
  onInteractCharacter?: (characterId: string) => void;
}

const LocationView: React.FC<LocationViewProps> = ({
  currentLocation,
  player,
  onPerformActivity,
  onMoveToLocation,
  availableLocations,
  characters,
  onInteractCharacter,
}) => {
  const getActivityIcon = (activityName: string) => {
    const icons: Record<string, string> = {
      '공부하기': '📚',
      '운동하기': '🏃‍♂️',
      '사교활동': '🗣️',
      '휴식하기': '😴',
      '독서하기': '📖',
      '명상하기': '🧘‍♂️',
      '요리하기': '👨‍🍳',
      '음식 먹기': '🍽️',
      '쇼핑하기': '🛍️',
      '구경하기': '👀',
      '산책하기': '🚶‍♂️',
      '벤치에 앉기': '🪑',
    };
    return icons[activityName] || '⭐';
  };

  const getLocationIcon = (locationId: string) => {
    const icons: Record<string, string> = {
      classroom: '🏫',
      library: '📚',
      cafeteria: '🍽️',
      gym: '🏃‍♂️',
      garden: '🌸',
      shopping: '🛍️',
      secret: '🔒',
    };
    return icons[locationId] || '📍';
  };

  const canPerformActivity = (activity: any) => {
    if (activity.time !== 'any' && activity.time !== player.timeOfDay) {
      return false;
    }
    // Rest activities don't require stamina
    if (activity.name === '휴식하기' || activity.name === '휴식') {
      return true;
    }
    // Non-activity pages like shopping don't require stamina
    if (activity.name === '쇼핑하기' || activity.name === '구경하기' || activity.name === '벤치에 앉기') {
      return true;
    }
    return player.stats.stamina > 0;
  };

  const canAccessLocation = (location: Location) => {
    if (!location.unlockCondition) return true;

    if (location.unlockCondition.item && !player.inventory.includes(location.unlockCondition.item)) {
      return false;
    }

    if (location.unlockCondition.flag && !player.flags[location.unlockCondition.flag]) {
      return false;
    }

    return true;
  };

  return (
    <div className="bg-black/30 backdrop-blur-md text-text-primary rounded-lg shadow-lg p-6 border border-border">
      {/* Current Location Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{getLocationIcon(currentLocation.id)}</span>
          <div>
            <h2 className="text-2xl font-bold text-secondary">{currentLocation.name}</h2>
            <p className="text-text-secondary text-sm">{currentLocation.description}</p>
          </div>
        </div>
        <div className="text-sm text-text-secondary italic">
            {player.timeOfDay === 'morning' && '아침의 상쾌한 공기가 감돕니다.'}
            {player.timeOfDay === 'noon' && '점심시간의 활기찬 분위기입니다.'}
            {player.timeOfDay === 'afternoon' && '오후의 나른한 햇살이 내리쬐고 있습니다.'}
            {player.timeOfDay === 'evening' && '저녁 노을이 지고 있습니다.'}
            {player.timeOfDay === 'night' && '밤의 정적이 감돌고 있습니다.'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activities */}
        <div className="bg-purple-900/40 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-pink-200 mb-4 flex items-center gap-2">
            <span>⚡</span>
            활동
          </h3>

          {currentLocation.activities.length > 0 ? (
            <div className="space-y-3">
              {currentLocation.activities.map((activity, index) => {
                const canPerform = canPerformActivity(activity);

                return (
                  <button
                    key={index}
                    onClick={() => onPerformActivity(activity.name)}
                    disabled={!canPerform}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                      canPerform
                        ? 'bg-purple-800/60 hover:bg-purple-700/60 hover:scale-105 cursor-pointer'
                        : 'bg-gray-800/40 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{getActivityIcon(activity.name)}</span>
                        <div>
                          <div className="font-medium text-white">{activity.name}</div>
                          <div className="text-xs text-purple-300">
                            {activity.time !== 'any' && `${activity.time}에만 가능`}
                          </div>
                        </div>
                      </div>

                      {/* Effect Preview */}
                      <div className="text-xs space-y-1">
                        {Object.entries(activity.effect).map(([stat, value]) => (
                          <div key={stat} className="flex items-center gap-1">
                            <span className={value > 0 ? 'text-green-400' : 'text-red-400'}>
                              {value > 0 ? '+' : ''}{value}
                            </span>
                            <span className="text-purple-300 capitalize">{stat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-purple-400 text-sm italic">이곳에서 할 수 있는 활동이 없습니다.</p>
          )}
        </div>

        {/* Available Locations */}
        <div className="bg-purple-900/40 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-pink-200 mb-4 flex items-center gap-2">
            <span>🗺️</span>
            이동
          </h3>

          <div className="space-y-3">
            {Object.entries(availableLocations)
              .filter(([id]) => id !== currentLocation.id)
              .map(([locationId, location]) => {
                const canAccess = canAccessLocation(location);

                return (
                  <button
                    key={locationId}
                    onClick={() => onMoveToLocation(locationId)}
                    disabled={!canAccess}
                    className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                      canAccess
                        ? 'bg-purple-800/60 hover:bg-purple-700/60 hover:scale-105 cursor-pointer'
                        : 'bg-gray-800/40 cursor-not-allowed opacity-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{getLocationIcon(locationId)}</span>
                      <div>
                        <div className="font-medium text-white">{location.name}</div>
                        <div className="text-xs text-purple-300">
                          {!canAccess && location.unlockCondition && (
                            <span className="text-red-400">
                              {location.unlockCondition.item && '아이템 필요'}
                              {location.unlockCondition.flag && '조건 미달성'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
          </div>
        </div>
      </div>

      {/* Present Characters */}
      {(() => {
        const presentCharacters = currentLocation.characterSchedule
          ? currentLocation.characterSchedule[player.timeOfDay] || []
          : currentLocation.characters || [];

        return presentCharacters.length > 0 && (
          <div className="mt-6 bg-black/20 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-secondary mb-4 flex items-center gap-2">
              <span>👥</span>
              현재 위치한 캐릭터
            </h3>

            <div className="flex flex-wrap gap-3">
              {presentCharacters.map((characterId) => {
                  const character = characters[characterId];
                  if (!character) return null;
                  return (
                      <button
                          key={characterId}
                          onClick={() => onInteractCharacter?.(characterId)}
                          className="bg-primary/20 px-4 py-2 rounded-full text-sm font-medium text-text-primary border border-border flex items-center gap-2 hover:bg-primary/30 hover:scale-105 transition-all duration-200 cursor-pointer"
                      >
                          <span className='text-xl'>{character.sprite}</span>
                          <span>{character.name}</span>
                          <span className='text-xs text-pink-300'>💕</span>
                      </button>
                  )
              })}
            </div>
          </div>
        );
      })()}

      {/* Time and Stamina Warning */}
      <div className="mt-4 flex justify-between items-center text-xs text-text-secondary">
        <div>
          {player.stats.stamina <= 2 && (
            <span className="text-red-400 font-medium">⚠️ 체력이 부족합니다!</span>
          )}
        </div>
        <div>
          활동 후 시간이 경과합니다
        </div>
      </div>
    </div>
  );
};

export default LocationView;