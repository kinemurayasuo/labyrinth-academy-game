import {
  RelationshipState,
  AffinityLevel,
  AFFINITY_THRESHOLDS,
  Memory,
  EmotionType,
  EmotionState,
  EmotionTrigger
} from '../types/advanced-game';

export class RelationshipManager {
  private relationships: Map<string, RelationshipState> = new Map();
  private emotions: Map<string, EmotionState> = new Map();

  constructor() {
    this.initializeRelationships();
  }

  private initializeRelationships() {
    const characters = ['sakura', 'yuki', 'luna', 'mystery', 'akane', 'hana', 'rin', 'mei', 'sora'];

    characters.forEach(characterId => {
      this.relationships.set(characterId, {
        characterId,
        affinity: 0,
        level: AffinityLevel.STRANGER,
        unlockedEvents: [],
        completedEvents: [],
        gifts: [],
        memories: [],
        flags: {},
        route: 'normal',
        jealousyLevel: 0,
        trustLevel: 0
      });

      this.emotions.set(characterId, {
        characterId,
        current: 'neutral',
        intensity: 0,
        triggers: [],
        duration: 0
      });
    });
  }

  updateAffinity(characterId: string, change: number, reason?: string): void {
    const relationship = this.relationships.get(characterId);
    if (!relationship) return;

    const oldAffinity = relationship.affinity;
    const newAffinity = Math.max(0, Math.min(100, oldAffinity + change));

    relationship.affinity = newAffinity;
    relationship.level = this.getAffinityLevel(newAffinity);

    if (change > 0) {
      this.updateEmotion(characterId, 'happy', Math.abs(change), reason || 'Positive interaction');
    } else if (change < 0) {
      this.updateEmotion(characterId, 'disappointed', Math.abs(change), reason || 'Negative interaction');
    }

    this.checkLevelUpEvents(characterId, oldAffinity, newAffinity);
    this.updateRelationshipDynamics(characterId, change);
  }

  private getAffinityLevel(affinity: number): AffinityLevel {
    const levels = Object.entries(AFFINITY_THRESHOLDS).reverse();

    for (const [level, threshold] of levels) {
      if (affinity >= threshold) {
        return level as AffinityLevel;
      }
    }

    return AffinityLevel.STRANGER;
  }

  private checkLevelUpEvents(characterId: string, oldAffinity: number, newAffinity: number) {
    const relationship = this.relationships.get(characterId);
    if (!relationship) return;

    const thresholds = [10, 25, 45, 65, 85, 100];

    for (const threshold of thresholds) {
      if (oldAffinity < threshold && newAffinity >= threshold) {
        this.triggerLevelUpEvent(characterId, threshold);
      }
    }
  }

  private triggerLevelUpEvent(characterId: string, threshold: number) {
    const eventId = `${characterId}_level_${threshold}`;
    const relationship = this.relationships.get(characterId);

    if (relationship && !relationship.unlockedEvents.includes(eventId)) {
      relationship.unlockedEvents.push(eventId);
      this.createMemory(characterId, 'special', `Reached ${threshold} affinity`, threshold);
    }
  }

  private updateRelationshipDynamics(characterId: string, change: number) {
    if (change <= 0) return;

    const otherCharacters = Array.from(this.relationships.keys()).filter(id => id !== characterId);

    otherCharacters.forEach(otherId => {
      const otherRelationship = this.relationships.get(otherId);
      if (!otherRelationship) return;

      const jealousyChance = Math.random();
      if (otherRelationship.affinity > 60 && jealousyChance < 0.3) {
        otherRelationship.jealousyLevel = Math.min(100, otherRelationship.jealousyLevel + change * 0.5);
        this.updateEmotion(otherId, 'jealous', change * 0.5, `Jealous of interaction with ${characterId}`);
      }
    });
  }

  giveGift(characterId: string, itemId: string, preference: 'love' | 'like' | 'neutral' | 'dislike'): void {
    const relationship = this.relationships.get(characterId);
    if (!relationship) return;

    const affinityChange = {
      'love': 10,
      'like': 5,
      'neutral': 2,
      'dislike': -5
    }[preference];

    relationship.gifts.push({
      itemId,
      date: Date.now(),
      reaction: preference
    });

    this.updateAffinity(characterId, affinityChange, `Received gift: ${itemId}`);

    if (preference === 'love') {
      this.updateEmotion(characterId, 'love', 10, 'Loved the gift!');
      relationship.trustLevel = Math.min(100, relationship.trustLevel + 5);
    }
  }

  private createMemory(characterId: string, type: Memory['type'], description: string, affectionChange: number) {
    const relationship = this.relationships.get(characterId);
    if (!relationship) return;

    const memory: Memory = {
      id: `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      date: Date.now(),
      location: 'Academy',
      description,
      affectionChange
    };

    relationship.memories.push(memory);
  }

  updateEmotion(characterId: string, emotion: EmotionType, intensity: number, reason: string) {
    const emotionState = this.emotions.get(characterId);
    if (!emotionState) return;

    emotionState.current = emotion;
    emotionState.intensity = Math.min(100, intensity);
    emotionState.duration = intensity * 60;
    emotionState.triggers.push({
      event: reason,
      change: intensity,
      reason
    });
  }

  getRelationship(characterId: string): RelationshipState | undefined {
    return this.relationships.get(characterId);
  }

  getEmotion(characterId: string): EmotionState | undefined {
    return this.emotions.get(characterId);
  }

  getAllRelationships(): RelationshipState[] {
    return Array.from(this.relationships.values());
  }

  checkRouteConditions(characterId: string): string {
    const relationship = this.relationships.get(characterId);
    if (!relationship) return 'normal';

    if (relationship.affinity >= 80 && relationship.trustLevel >= 70) {
      relationship.route = 'romance';
    } else if (relationship.affinity >= 60 && relationship.jealousyLevel < 30) {
      relationship.route = 'friendship';
    } else if (relationship.jealousyLevel >= 70) {
      relationship.route = 'rival';
    }

    return relationship.route;
  }

  processTimePassage(hours: number) {
    this.emotions.forEach(emotion => {
      emotion.duration = Math.max(0, emotion.duration - hours);
      if (emotion.duration === 0) {
        emotion.current = 'neutral';
        emotion.intensity = 0;
      }
    });

    this.relationships.forEach(relationship => {
      if (relationship.jealousyLevel > 0) {
        relationship.jealousyLevel = Math.max(0, relationship.jealousyLevel - hours * 0.5);
      }
    });
  }

  getCompatibleCharacters(characterId: string): string[] {
    const relationship = this.relationships.get(characterId);
    if (!relationship || relationship.affinity < 40) return [];

    return Array.from(this.relationships.entries())
      .filter(([id, rel]) =>
        id !== characterId &&
        rel.affinity > 30 &&
        rel.jealousyLevel < 50
      )
      .map(([id]) => id);
  }

  triggerJealousyEvent(characterId: string, rivalId: string) {
    const relationship = this.relationships.get(characterId);
    const rivalRelationship = this.relationships.get(rivalId);

    if (!relationship || !rivalRelationship) return;

    if (relationship.jealousyLevel > 60 && rivalRelationship.affinity > relationship.affinity) {
      this.updateEmotion(characterId, 'angry', 20, `Jealous of ${rivalId}`);
      relationship.jealousyLevel = Math.min(100, relationship.jealousyLevel + 10);

      return {
        type: 'jealousy',
        characterId,
        rivalId,
        intensity: relationship.jealousyLevel
      };
    }

    return null;
  }

  export(): any {
    return {
      relationships: Array.from(this.relationships.entries()),
      emotions: Array.from(this.emotions.entries())
    };
  }

  import(data: any) {
    if (data.relationships) {
      this.relationships = new Map(data.relationships);
    }
    if (data.emotions) {
      this.emotions = new Map(data.emotions);
    }
  }
}