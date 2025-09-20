// Domain Entity: Character

export interface CharacterState {
  id: string;
  name: string;
  fullName: string;
  age: number | string;
  role: string;
  sprite: string;
  background: string;
  personality: string;
  specialSkills: string[];
  weakness: string;
  dream: string;
  secretStory: string;
  relationships: Record<string, string>;
  hobby: string[];
  favorite: string[];
  dislike: string[];
  birthday: string;
  height: string;
  bloodType: string;
  affectionStart: number;
  maxAffection: number;
  dialogues: Record<string, string>;
}

export const CharacterEntity = {
  create(data: Partial<CharacterState> & { id: string; name: string }): CharacterState {
    return {
      id: data.id,
      name: data.name,
      fullName: data.fullName || data.name,
      age: data.age || 18,
      role: data.role || '학생',
      sprite: data.sprite || '👤',
      background: data.background || '',
      personality: data.personality || '',
      specialSkills: data.specialSkills || [],
      weakness: data.weakness || '',
      dream: data.dream || '',
      secretStory: data.secretStory || '',
      relationships: data.relationships || {},
      hobby: data.hobby || [],
      favorite: data.favorite || [],
      dislike: data.dislike || [],
      birthday: data.birthday || '',
      height: data.height || '',
      bloodType: data.bloodType || '',
      affectionStart: data.affectionStart || 0,
      maxAffection: data.maxAffection || 100,
      dialogues: data.dialogues || {}
    };
  },

  // Business logic for character interactions
  canInteract(character: CharacterState, playerAffection: number, minAffection: number = 0): boolean {
    return playerAffection >= minAffection;
  },

  getDialogue(character: CharacterState, affectionLevel: number): string {
    const thresholds = Object.keys(character.dialogues)
      .map(Number)
      .sort((a, b) => b - a);

    for (const threshold of thresholds) {
      if (affectionLevel >= threshold) {
        return character.dialogues[threshold.toString()] || '...';
      }
    }
    
    return character.dialogues['0'] || '안녕하세요!';
  },

  getRelationshipWith(character: CharacterState, targetCharacterId: string): string | null {
    return character.relationships[targetCharacterId] || null;
  },

  // Character development based on affection
  getCharacterMood(character: CharacterState, affectionLevel: number): CharacterMood {
    if (affectionLevel >= 80) return 'love';
    if (affectionLevel >= 60) return 'happy';
    if (affectionLevel >= 40) return 'friendly';
    if (affectionLevel >= 20) return 'neutral';
    return 'distant';
  },

  // Check if secret story should be revealed
  shouldRevealSecret(character: CharacterState, affectionLevel: number): boolean {
    return affectionLevel >= 50 && character.secretStory.length > 0;
  },

  // Get available activities with this character
  getAvailableActivities(character: CharacterState, affectionLevel: number): CharacterActivity[] {
    const baseActivities: CharacterActivity[] = [
      { id: 'talk', name: '대화하기', minAffection: 0, type: 'social' },
      { id: 'compliment', name: '칭찬하기', minAffection: 10, type: 'social' }
    ];

    const advancedActivities: CharacterActivity[] = [
      { id: 'study_together', name: '함께 공부하기', minAffection: 30, type: 'activity' },
      { id: 'date', name: '데이트하기', minAffection: 50, type: 'romantic' },
      { id: 'confess', name: '고백하기', minAffection: 70, type: 'romantic' }
    ];

    return [...baseActivities, ...advancedActivities].filter(
      activity => affectionLevel >= activity.minAffection
    );
  },

  // Validate character data
  isValid(character: CharacterState): boolean {
    return (
      character.id.length > 0 &&
      character.name.length > 0 &&
      character.maxAffection > 0 &&
      character.affectionStart >= 0 &&
      character.affectionStart <= character.maxAffection
    );
  }
};

// Supporting types
export type CharacterMood = 'love' | 'happy' | 'friendly' | 'neutral' | 'distant';

export interface CharacterActivity {
  id: string;
  name: string;
  minAffection: number;
  type: 'social' | 'activity' | 'romantic';
}