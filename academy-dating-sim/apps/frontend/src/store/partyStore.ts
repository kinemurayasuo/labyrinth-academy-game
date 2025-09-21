import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { PartyState, PartyMember, PartyPosition, HeroinePartyData } from '../types/party';

// Available heroines for party recruitment
const AVAILABLE_HEROINES: HeroinePartyData[] = [
  {
    characterId: 'sakura',
    name: '사쿠라',
    unlocked: false,
    recruitmentRequirements: {
      minAffection: 40,
      playerLevel: 5,
    },
    baseStats: {
      strength: 15,
      intelligence: 25,
      agility: 18,
      defense: 12,
      charm: 20,
    },
    startingLevel: 5,
    role: 'healer',
    specialSkills: [
      {
        id: 'healing_blossom',
        name: '벚꽃 치유',
        type: 'heal',
        mpCost: 20,
        healing: 50,
        targetType: 'party',
        cooldown: 3,
        currentCooldown: 0,
        description: '파티 전체를 치유하는 벚꽃의 축복',
        icon: '🌸',
      },
    ],
    awakeningLevel: 0,
  },
  {
    characterId: 'yuki',
    name: '유키',
    unlocked: false,
    recruitmentRequirements: {
      minAffection: 40,
      playerLevel: 5,
    },
    baseStats: {
      strength: 20,
      intelligence: 18,
      agility: 22,
      defense: 15,
      charm: 15,
    },
    startingLevel: 5,
    role: 'dps',
    specialSkills: [
      {
        id: 'ice_blade',
        name: '얼음 검',
        type: 'attack',
        mpCost: 15,
        damage: 80,
        targetType: 'single',
        cooldown: 2,
        currentCooldown: 0,
        description: '얼음의 힘이 깃든 강력한 일격',
        icon: '❄️',
      },
    ],
    awakeningLevel: 0,
  },
  {
    characterId: 'luna',
    name: '루나',
    unlocked: false,
    recruitmentRequirements: {
      minAffection: 40,
      playerLevel: 5,
    },
    baseStats: {
      strength: 12,
      intelligence: 28,
      agility: 15,
      defense: 10,
      charm: 25,
    },
    startingLevel: 5,
    role: 'dps',
    specialSkills: [
      {
        id: 'moonlight_burst',
        name: '달빛 폭발',
        type: 'attack',
        mpCost: 25,
        damage: 100,
        targetType: 'all',
        cooldown: 4,
        currentCooldown: 0,
        description: '달의 힘으로 모든 적을 공격',
        icon: '🌙',
      },
    ],
    awakeningLevel: 0,
  },
  {
    characterId: 'aria',
    name: '아리아',
    unlocked: false,
    recruitmentRequirements: {
      minAffection: 50,
      playerLevel: 8,
    },
    baseStats: {
      strength: 14,
      intelligence: 20,
      agility: 16,
      defense: 18,
      charm: 22,
    },
    startingLevel: 8,
    role: 'support',
    specialSkills: [
      {
        id: 'inspiring_melody',
        name: '격려의 멜로디',
        type: 'buff',
        mpCost: 15,
        targetType: 'party',
        cooldown: 5,
        currentCooldown: 0,
        description: '파티 전체의 능력치를 상승시키는 노래',
        icon: '🎵',
      },
    ],
    awakeningLevel: 0,
  },
];

interface PartyStore {
  party: PartyState;
  availableHeroines: HeroinePartyData[];

  // Party Management Actions
  addMemberToParty: (member: PartyMember, position: PartyPosition) => void;
  removeMemberFromParty: (position: PartyPosition) => void;
  swapPartyPositions: (pos1: PartyPosition, pos2: PartyPosition) => void;
  setFormation: (frontRow: [PartyPosition, PartyPosition], backRow: [PartyPosition, PartyPosition]) => void;
  setPartyLeader: (position: PartyPosition) => void;

  // Battle Actions
  updateMemberHP: (position: PartyPosition, hp: number) => void;
  updateMemberMP: (position: PartyPosition, mp: number) => void;
  healParty: (amount: number) => void;
  restorePartyMP: (amount: number) => void;
  applyStatusEffect: (position: PartyPosition, effect: any) => void;

  // Heroine Recruitment
  recruitHeroine: (characterId: string) => boolean;
  unlockHeroine: (characterId: string) => void;
  upgradeHeroineAwakening: (characterId: string) => void;

  // Utility
  calculatePartySynergy: () => number;
  getPartyMember: (position: PartyPosition) => PartyMember | null;
  isPartyFull: () => boolean;
  canRecruitHeroine: (characterId: string, playerLevel: number, affection: number) => boolean;

  // Save/Load
  savePartyState: () => void;
  loadPartyState: () => void;
  resetParty: () => void;
}

export const usePartyStore = create<PartyStore>()(
  devtools(
    persist(
      (set, get) => ({
        party: {
          members: [null, null, null, null],
          formation: {
            frontRow: [0, 1],
            backRow: [2, 3],
          },
          leader: 0,
          activeInDungeon: false,
          totalBattles: 0,
          synergy: 0,
        },

        availableHeroines: AVAILABLE_HEROINES,

        addMemberToParty: (member, position) => {
          set((state) => {
            const newMembers = [...state.party.members];
            newMembers[position] = { ...member, position };
            return {
              party: {
                ...state.party,
                members: newMembers,
                synergy: get().calculatePartySynergy(),
              },
            };
          });
        },

        removeMemberFromParty: (position) => {
          set((state) => {
            const newMembers = [...state.party.members];
            newMembers[position] = null;
            return {
              party: {
                ...state.party,
                members: newMembers,
                synergy: get().calculatePartySynergy(),
              },
            };
          });
        },

        swapPartyPositions: (pos1, pos2) => {
          set((state) => {
            const newMembers = [...state.party.members];
            const temp = newMembers[pos1];
            newMembers[pos1] = newMembers[pos2];
            newMembers[pos2] = temp;

            // Update positions
            if (newMembers[pos1]) newMembers[pos1].position = pos1;
            if (newMembers[pos2]) newMembers[pos2].position = pos2;

            return {
              party: {
                ...state.party,
                members: newMembers,
              },
            };
          });
        },

        setFormation: (frontRow, backRow) => {
          set((state) => ({
            party: {
              ...state.party,
              formation: { frontRow, backRow },
            },
          }));
        },

        setPartyLeader: (position) => {
          set((state) => ({
            party: {
              ...state.party,
              leader: position,
            },
          }));
        },

        updateMemberHP: (position, hp) => {
          set((state) => {
            const newMembers = [...state.party.members];
            if (newMembers[position]) {
              newMembers[position] = {
                ...newMembers[position]!,
                hp: Math.max(0, Math.min(hp, newMembers[position]!.maxHp)),
              };
            }
            return {
              party: {
                ...state.party,
                members: newMembers,
              },
            };
          });
        },

        updateMemberMP: (position, mp) => {
          set((state) => {
            const newMembers = [...state.party.members];
            if (newMembers[position]) {
              newMembers[position] = {
                ...newMembers[position]!,
                mp: Math.max(0, Math.min(mp, newMembers[position]!.maxMp)),
              };
            }
            return {
              party: {
                ...state.party,
                members: newMembers,
              },
            };
          });
        },

        healParty: (amount) => {
          set((state) => {
            const newMembers = state.party.members.map((member) =>
              member
                ? {
                    ...member,
                    hp: Math.min(member.hp + amount, member.maxHp),
                  }
                : null
            );
            return {
              party: {
                ...state.party,
                members: newMembers,
              },
            };
          });
        },

        restorePartyMP: (amount) => {
          set((state) => {
            const newMembers = state.party.members.map((member) =>
              member
                ? {
                    ...member,
                    mp: Math.min(member.mp + amount, member.maxMp),
                  }
                : null
            );
            return {
              party: {
                ...state.party,
                members: newMembers,
              },
            };
          });
        },

        applyStatusEffect: (position, effect) => {
          set((state) => {
            const newMembers = [...state.party.members];
            if (newMembers[position]) {
              newMembers[position] = {
                ...newMembers[position]!,
                status: [...newMembers[position]!.status, effect],
              };
            }
            return {
              party: {
                ...state.party,
                members: newMembers,
              },
            };
          });
        },

        recruitHeroine: (characterId) => {
          const heroine = get().availableHeroines.find((h) => h.characterId === characterId);
          if (!heroine || !heroine.unlocked) return false;

          // Find empty slot
          const emptySlot = get().party.members.findIndex((m) => m === null);
          if (emptySlot === -1) return false;

          // Create party member from heroine data
          const newMember: PartyMember = {
            characterId: heroine.characterId,
            name: heroine.name,
            level: heroine.startingLevel,
            hp: 100,
            maxHp: 100,
            mp: 50,
            maxMp: 50,
            stats: { ...heroine.baseStats },
            equipment: {},
            skills: [...heroine.specialSkills],
            position: emptySlot as PartyPosition,
            role: heroine.role,
            affection: heroine.recruitmentRequirements.minAffection,
            isHeroine: true,
            portrait: `/images/characters/${heroine.characterId}.png`,
            status: [],
          };

          get().addMemberToParty(newMember, emptySlot as PartyPosition);
          return true;
        },

        unlockHeroine: (characterId) => {
          set((state) => {
            const newHeroines = state.availableHeroines.map((h) =>
              h.characterId === characterId ? { ...h, unlocked: true } : h
            );
            return { availableHeroines: newHeroines };
          });
        },

        upgradeHeroineAwakening: (characterId) => {
          set((state) => {
            const newHeroines = state.availableHeroines.map((h) =>
              h.characterId === characterId
                ? { ...h, awakeningLevel: Math.min(h.awakeningLevel + 1, 5) }
                : h
            );
            return { availableHeroines: newHeroines };
          });
        },

        calculatePartySynergy: () => {
          const members = get().party.members.filter((m) => m !== null);
          if (members.length < 2) return 0;

          let synergy = members.length * 10; // Base synergy

          // Check for role diversity
          const roles = new Set(members.map((m) => m!.role));
          synergy += roles.size * 15;

          // Check for heroine combinations
          const heroineCount = members.filter((m) => m!.isHeroine).length;
          synergy += heroineCount * 10;

          return Math.min(synergy, 100);
        },

        getPartyMember: (position) => {
          return get().party.members[position];
        },

        isPartyFull: () => {
          return get().party.members.every((m) => m !== null);
        },

        canRecruitHeroine: (characterId, playerLevel, affection) => {
          const heroine = get().availableHeroines.find((h) => h.characterId === characterId);
          if (!heroine) return false;

          const req = heroine.recruitmentRequirements;
          return (
            affection >= req.minAffection &&
            (!req.playerLevel || playerLevel >= req.playerLevel) &&
            heroine.unlocked
          );
        },

        savePartyState: () => {
          const state = get().party;
          localStorage.setItem('academyDatingSimParty', JSON.stringify(state));
        },

        loadPartyState: () => {
          const saved = localStorage.getItem('academyDatingSimParty');
          if (saved) {
            const party = JSON.parse(saved);
            set({ party });
          }
        },

        resetParty: () => {
          set({
            party: {
              members: [null, null, null, null],
              formation: {
                frontRow: [0, 1],
                backRow: [2, 3],
              },
              leader: 0,
              activeInDungeon: false,
              totalBattles: 0,
              synergy: 0,
            },
          });
        },
      }),
      {
        name: 'party-storage',
      }
    )
  )
);