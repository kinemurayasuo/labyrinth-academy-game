import React from 'react';
import characterLoreData from '../../data/character-lore.json';

interface CharacterRelationshipMapProps {
  currentCharacter: string;
  onCharacterSelect?: (characterId: string) => void;
}

const CharacterRelationshipMap: React.FC<CharacterRelationshipMapProps> = ({ 
  currentCharacter, 
  onCharacterSelect 
}) => {
  const characterLore = characterLoreData as Record<string, any>;
  const currentLore = characterLore[currentCharacter];

  if (!currentLore || !currentLore.relationships) {
    return null;
  }

  const characterEmojis: Record<string, string> = {
    sakura: '🌸',
    yuki: '❄️', 
    luna: '🌙',
    mystery: '❓',
    akane: '💼',
    hana: '🌺',
    rin: '⚡',
    mei: '🎨',
    sora: '🔬'
  };

  const characterNames: Record<string, string> = {
    sakura: '사쿠라',
    yuki: '유키',
    luna: '루나',
    mystery: '미스터리',
    akane: '아카네',
    hana: '하나',
    rin: '린',
    mei: '메이',
    sora: '소라'
  };

  return (
    <div className="bg-black/20 backdrop-blur-sm rounded-lg p-4">
      <h5 className="text-md font-semibold mb-3 text-secondary flex items-center gap-2">
        🔗 캐릭터 관계도
      </h5>
      
      <div className="space-y-3">
        {Object.entries(currentLore.relationships).map(([relatedCharId, relationship]: [string, any]) => (
          <div key={relatedCharId} className="flex items-center gap-3 p-3 bg-black/30 rounded-lg hover:bg-black/40 transition-colors">
            {/* Character Avatar */}
            <div 
              className={`w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-xl border-2 border-primary/30 ${onCharacterSelect ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
              onClick={() => onCharacterSelect?.(relatedCharId)}
            >
              {characterEmojis[relatedCharId] || '👤'}
            </div>

            {/* Character Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-accent">
                  {characterNames[relatedCharId] || relatedCharId}
                </span>
                {onCharacterSelect && (
                  <button 
                    onClick={() => onCharacterSelect(relatedCharId)}
                    className="text-xs bg-primary/20 text-primary px-2 py-1 rounded hover:bg-primary/30 transition-colors"
                  >
                    보기
                  </button>
                )}
              </div>
              <p className="text-sm text-text-primary leading-relaxed">
                {relationship}
              </p>
            </div>

            {/* Relationship Indicator */}
            <div className="text-right">
              <div className="w-3 h-3 bg-gradient-to-r from-pink-400 to-red-400 rounded-full animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Mutual Relationships */}
      <div className="mt-4 pt-3 border-t border-border/30">
        <h6 className="text-sm font-medium text-text-secondary mb-2">🤝 상호 관계</h6>
        <div className="grid grid-cols-1 gap-2">
          {Object.keys(currentLore.relationships).map((relatedCharId) => {
            const relatedLore = characterLore[relatedCharId];
            const mutualRelationship = relatedLore?.relationships?.[currentCharacter];
            
            if (!mutualRelationship) return null;

            return (
              <div key={relatedCharId} className="flex items-center gap-2 text-xs p-2 bg-black/20 rounded">
                <span className="text-accent">{characterNames[relatedCharId]}의 시각:</span>
                <span className="text-text-primary flex-1">{mutualRelationship}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CharacterRelationshipMap;