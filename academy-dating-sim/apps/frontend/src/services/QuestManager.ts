import { Quest, QuestObjective, QuestReward } from '../types/advanced-game';
import { Player } from '../types/game';
import { RelationshipManager } from './RelationshipManager';

export class QuestManager {
  private quests: Map<string, Quest> = new Map();
  private activeQuests: Set<string> = new Set();
  private completedQuests: Set<string> = new Set();
  private questProgress: Map<string, Map<string, number>> = new Map();

  constructor() {
    this.initializeQuests();
  }

  private initializeQuests() {
    const mainQuests: Quest[] = [
      {
        id: 'main_intro',
        name: '새로운 시작',
        description: '아카데미에서의 첫 날을 시작하자',
        type: 'main',
        objectives: [
          {
            id: 'meet_characters',
            description: '3명의 히로인과 만나기',
            type: 'talk',
            target: 'any_heroine',
            current: 0,
            required: 3,
            completed: false
          }
        ],
        rewards: [
          { type: 'exp', value: 100 },
          { type: 'money', value: 1000 }
        ],
        status: 'available'
      },
      {
        id: 'main_first_date',
        name: '첫 데이트',
        description: '마음에 드는 히로인과 첫 데이트를 하자',
        type: 'main',
        objectives: [
          {
            id: 'reach_affinity',
            description: '한 명의 히로인과 호감도 30 달성',
            type: 'achieve',
            target: 'affinity_30',
            current: 0,
            required: 1,
            completed: false
          },
          {
            id: 'go_on_date',
            description: '데이트 장소 방문하기',
            type: 'reach',
            target: 'date_spot',
            current: 0,
            required: 1,
            completed: false
          }
        ],
        rewards: [
          { type: 'exp', value: 200 },
          { type: 'item', value: 'date_ticket' },
          { type: 'unlock', value: 'date_spots' }
        ],
        prerequisites: { quests: ['main_intro'] },
        status: 'locked'
      },
      {
        id: 'main_confession',
        name: '마음을 전하다',
        description: '진심을 고백할 시간이다',
        type: 'main',
        objectives: [
          {
            id: 'max_affinity',
            description: '한 명의 히로인과 호감도 80 달성',
            type: 'achieve',
            target: 'affinity_80',
            current: 0,
            required: 1,
            completed: false
          },
          {
            id: 'confession_event',
            description: '고백 이벤트 발생시키기',
            type: 'achieve',
            target: 'confession',
            current: 0,
            required: 1,
            completed: false
          }
        ],
        rewards: [
          { type: 'exp', value: 500 },
          { type: 'unlock', value: 'true_ending_route' }
        ],
        prerequisites: { quests: ['main_first_date'] },
        status: 'locked'
      }
    ];

    const sideQuests: Quest[] = [
      {
        id: 'side_sakura_training',
        name: '사쿠라의 특훈',
        description: '사쿠라와 함께 특별 훈련을 완수하자',
        type: 'character',
        giver: 'sakura',
        objectives: [
          {
            id: 'train_days',
            description: '5일 연속 훈련하기',
            type: 'achieve',
            target: 'consecutive_training',
            current: 0,
            required: 5,
            completed: false
          },
          {
            id: 'win_sparring',
            description: '사쿠라와의 대련에서 승리',
            type: 'defeat',
            target: 'sakura_sparring',
            current: 0,
            required: 1,
            completed: false
          }
        ],
        rewards: [
          { type: 'affinity', value: 20, characterId: 'sakura' },
          { type: 'item', value: 'training_sword' },
          { type: 'exp', value: 150 }
        ],
        prerequisites: {
          affinity: { characterId: 'sakura', min: 30 }
        },
        status: 'locked'
      },
      {
        id: 'side_yuki_library',
        name: '유키의 도서관 프로젝트',
        description: '유키를 도와 도서관을 정리하자',
        type: 'character',
        giver: 'yuki',
        objectives: [
          {
            id: 'collect_books',
            description: '흩어진 책 10권 수집',
            type: 'collect',
            target: 'lost_book',
            current: 0,
            required: 10,
            completed: false
          },
          {
            id: 'organize_shelves',
            description: '서가 정리 돕기',
            type: 'achieve',
            target: 'library_organization',
            current: 0,
            required: 3,
            completed: false
          }
        ],
        rewards: [
          { type: 'affinity', value: 15, characterId: 'yuki' },
          { type: 'item', value: 'rare_book' },
          { type: 'exp', value: 100 }
        ],
        prerequisites: {
          affinity: { characterId: 'yuki', min: 20 }
        },
        status: 'locked'
      },
      {
        id: 'side_luna_magic',
        name: '루나의 마법 실험',
        description: '루나의 비밀 마법 실험을 도와주자',
        type: 'character',
        giver: 'luna',
        objectives: [
          {
            id: 'gather_materials',
            description: '마법 재료 5종 수집',
            type: 'collect',
            target: 'magic_material',
            current: 0,
            required: 5,
            completed: false
          },
          {
            id: 'cast_spell',
            description: '마법 주문 성공시키기',
            type: 'achieve',
            target: 'spell_success',
            current: 0,
            required: 1,
            completed: false
          }
        ],
        rewards: [
          { type: 'affinity', value: 18, characterId: 'luna' },
          { type: 'item', value: 'magic_crystal' },
          { type: 'unlock', value: 'magic_skill' }
        ],
        prerequisites: {
          affinity: { characterId: 'luna', min: 25 },
          level: 10
        },
        status: 'locked'
      },
      {
        id: 'side_hana_cooking',
        name: '하나의 요리 대회',
        description: '하나와 함께 요리 대회에 참가하자',
        type: 'character',
        giver: 'hana',
        objectives: [
          {
            id: 'gather_ingredients',
            description: '특별한 재료 모으기',
            type: 'collect',
            target: 'special_ingredient',
            current: 0,
            required: 7,
            completed: false
          },
          {
            id: 'cook_dish',
            description: '완벽한 요리 만들기',
            type: 'achieve',
            target: 'perfect_dish',
            current: 0,
            required: 1,
            completed: false
          }
        ],
        rewards: [
          { type: 'affinity', value: 20, characterId: 'hana' },
          { type: 'item', value: 'golden_spatula' },
          { type: 'money', value: 2000 }
        ],
        prerequisites: {
          affinity: { characterId: 'hana', min: 35 }
        },
        status: 'locked'
      }
    ];

    const dailyQuests: Quest[] = [
      {
        id: 'daily_training',
        name: '일일 훈련',
        description: '오늘의 훈련을 완료하자',
        type: 'daily',
        objectives: [
          {
            id: 'complete_training',
            description: '훈련 1회 완료',
            type: 'achieve',
            target: 'training_session',
            current: 0,
            required: 1,
            completed: false
          }
        ],
        rewards: [
          { type: 'exp', value: 50 },
          { type: 'money', value: 100 }
        ],
        timeLimit: 24,
        status: 'available'
      },
      {
        id: 'daily_social',
        name: '친목 도모',
        description: '히로인들과 교류하자',
        type: 'daily',
        objectives: [
          {
            id: 'talk_heroines',
            description: '2명의 히로인과 대화',
            type: 'talk',
            target: 'any_heroine',
            current: 0,
            required: 2,
            completed: false
          }
        ],
        rewards: [
          { type: 'exp', value: 30 },
          { type: 'item', value: 'gift_box' }
        ],
        timeLimit: 24,
        status: 'available'
      }
    ];

    [...mainQuests, ...sideQuests, ...dailyQuests].forEach(quest => {
      this.quests.set(quest.id, quest);
      this.questProgress.set(quest.id, new Map());
    });
  }

  checkQuestAvailability(player: Player, relationshipManager: RelationshipManager) {
    this.quests.forEach(quest => {
      if (quest.status === 'locked' && this.checkPrerequisites(quest, player, relationshipManager)) {
        quest.status = 'available';
        this.notifyQuestUnlocked(quest);
      }
    });
  }

  private checkPrerequisites(
    quest: Quest,
    player: Player,
    relationshipManager: RelationshipManager
  ): boolean {
    if (!quest.prerequisites) return true;

    if (quest.prerequisites.quests) {
      for (const questId of quest.prerequisites.quests) {
        if (!this.completedQuests.has(questId)) return false;
      }
    }

    if (quest.prerequisites.level && player.level < quest.prerequisites.level) {
      return false;
    }

    if (quest.prerequisites.affinity) {
      const relationship = relationshipManager.getRelationship(quest.prerequisites.affinity.characterId);
      if (!relationship || relationship.affinity < quest.prerequisites.affinity.min) {
        return false;
      }
    }

    return true;
  }

  startQuest(questId: string): boolean {
    const quest = this.quests.get(questId);
    if (!quest || quest.status !== 'available') return false;

    quest.status = 'active';
    this.activeQuests.add(questId);
    return true;
  }

  updateProgress(questId: string, objectiveId: string, amount: number = 1) {
    const quest = this.quests.get(questId);
    if (!quest || quest.status !== 'active') return;

    const objective = quest.objectives.find(obj => obj.id === objectiveId);
    if (!objective || objective.completed) return;

    objective.current = Math.min(objective.current + amount, objective.required);

    if (objective.current >= objective.required) {
      objective.completed = true;
      this.checkQuestCompletion(questId);
    }
  }

  private checkQuestCompletion(questId: string) {
    const quest = this.quests.get(questId);
    if (!quest) return;

    const allCompleted = quest.objectives.every(obj => obj.completed);
    if (allCompleted) {
      quest.status = 'completed';
      this.activeQuests.delete(questId);
      this.completedQuests.add(questId);
      this.notifyQuestCompleted(quest);
    }
  }

  claimRewards(questId: string): QuestReward[] | null {
    const quest = this.quests.get(questId);
    if (!quest || quest.status !== 'completed') return null;

    return quest.rewards;
  }

  getActiveQuests(): Quest[] {
    return Array.from(this.activeQuests).map(id => this.quests.get(id)!);
  }

  getAvailableQuests(): Quest[] {
    return Array.from(this.quests.values()).filter(q => q.status === 'available');
  }

  getCompletedQuests(): Quest[] {
    return Array.from(this.completedQuests).map(id => this.quests.get(id)!);
  }

  getQuestsByType(type: Quest['type']): Quest[] {
    return Array.from(this.quests.values()).filter(q => q.type === type);
  }

  getCharacterQuests(characterId: string): Quest[] {
    return Array.from(this.quests.values()).filter(
      q => q.type === 'character' && q.giver === characterId
    );
  }

  resetDailyQuests() {
    this.getQuestsByType('daily').forEach(quest => {
      quest.status = 'available';
      quest.objectives.forEach(obj => {
        obj.current = 0;
        obj.completed = false;
      });
      this.activeQuests.delete(quest.id);
    });
  }

  private notifyQuestUnlocked(quest: Quest) {
    console.log(`New quest available: ${quest.name}`);
  }

  private notifyQuestCompleted(quest: Quest) {
    console.log(`Quest completed: ${quest.name}`);
  }

  export() {
    return {
      activeQuests: Array.from(this.activeQuests),
      completedQuests: Array.from(this.completedQuests),
      questProgress: Array.from(this.questProgress.entries()),
      quests: Array.from(this.quests.entries())
    };
  }

  import(data: any) {
    if (data.activeQuests) this.activeQuests = new Set(data.activeQuests);
    if (data.completedQuests) this.completedQuests = new Set(data.completedQuests);
    if (data.questProgress) this.questProgress = new Map(data.questProgress);
    if (data.quests) {
      data.quests.forEach(([id, quest]: [string, Quest]) => {
        this.quests.set(id, quest);
      });
    }
  }
}