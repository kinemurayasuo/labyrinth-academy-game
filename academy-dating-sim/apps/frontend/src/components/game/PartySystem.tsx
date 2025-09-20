import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';
import charactersData from '../../data/characters.json';

interface PartyMember {
  id: string;
  name: string;
  role: string;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  stats: {
    attack: number;
    defense: number;
    speed: number;
    magic: number;
  };
  skills: string[];
  equipment: {
    weapon?: string;
    armor?: string;
    accessory?: string;
  };
  affection: number;
  icon: string;
}

const PartySystem: React.FC = () => {
  const player = useGameStore(state => state.player);
  const [party, setParty] = useState<PartyMember[]>([]);
  const [availableMembers, setAvailableMembers] = useState<PartyMember[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  // Initialize heroines as party members
  useEffect(() => {
    const heroines: PartyMember[] = [
      {
        id: 'sakura',
        name: '사쿠라',
        role: '마법사',
        hp: 80,
        maxHp: 80,
        mp: 120,
        maxMp: 120,
        stats: { attack: 15, defense: 10, speed: 12, magic: 25 },
        skills: ['파이어볼', '아이스 스피어', '힐링'],
        equipment: {},
        affection: player.affection.sakura || 0,
        icon: '🌸'
      },
      {
        id: 'yuki',
        name: '유키',
        role: '검사',
        hp: 120,
        maxHp: 120,
        mp: 40,
        maxMp: 40,
        stats: { attack: 25, defense: 20, speed: 15, magic: 8 },
        skills: ['슬래시', '방어태세', '버서크'],
        equipment: {},
        affection: player.affection.yuki || 0,
        icon: '❄️'
      },
      {
        id: 'haruka',
        name: '하루카',
        role: '힐러',
        hp: 70,
        maxHp: 70,
        mp: 150,
        maxMp: 150,
        stats: { attack: 8, defense: 12, speed: 10, magic: 20 },
        skills: ['힐', '리제네레이션', '부활'],
        equipment: {},
        affection: player.affection.haruka || 0,
        icon: '🌻'
      },
      {
        id: 'ayumi',
        name: '아유미',
        role: '학자',
        hp: 75,
        maxHp: 75,
        mp: 130,
        maxMp: 130,
        stats: { attack: 10, defense: 8, speed: 14, magic: 22 },
        skills: ['분석', '약화', '속성 강화'],
        equipment: {},
        affection: player.affection.ayumi || 0,
        icon: '📚'
      },
      {
        id: 'miku',
        name: '미쿠',
        role: '바드',
        hp: 85,
        maxHp: 85,
        mp: 100,
        maxMp: 100,
        stats: { attack: 12, defense: 10, speed: 18, magic: 15 },
        skills: ['응원가', '진정곡', '전투의 노래'],
        equipment: {},
        affection: player.affection.miku || 0,
        icon: '🎵'
      },
      {
        id: 'rina',
        name: '리나',
        role: '전사',
        hp: 150,
        maxHp: 150,
        mp: 30,
        maxMp: 30,
        stats: { attack: 30, defense: 25, speed: 8, magic: 5 },
        skills: ['강타', '도발', '철벽'],
        equipment: {},
        affection: player.affection.rina || 0,
        icon: '🗡️'
      },
      {
        id: 'luna',
        name: '루나',
        role: '점술사',
        hp: 90,
        maxHp: 90,
        mp: 110,
        maxMp: 110,
        stats: { attack: 14, defense: 11, speed: 13, magic: 18 },
        skills: ['예언', '운명조작', '별의 가호'],
        equipment: {},
        affection: player.affection.luna || 0,
        icon: '🌙'
      },
      {
        id: 'nova',
        name: '노바',
        role: '연금술사',
        hp: 95,
        maxHp: 95,
        mp: 90,
        maxMp: 90,
        stats: { attack: 16, defense: 14, speed: 11, magic: 17 },
        skills: ['폭탄 투척', '물약 제조', '원소 변환'],
        equipment: {},
        affection: player.affection.nova || 0,
        icon: '⭐'
      },
      {
        id: 'aria',
        name: '아리아',
        role: '귀족검사',
        hp: 100,
        maxHp: 100,
        mp: 60,
        maxMp: 60,
        stats: { attack: 22, defense: 18, speed: 20, magic: 12 },
        skills: ['우아한 일격', '귀족의 품격', '심판'],
        equipment: {},
        affection: player.affection.aria || 0,
        icon: '🎭'
      }
    ];

    // Filter available members based on affection (must have met them)
    const available = heroines.filter(h => (player.affection[h.id] || 0) > 0);
    setAvailableMembers(available);

    // Set initial party (first 3 available heroines)
    if (party.length === 0 && available.length > 0) {
      setParty(available.slice(0, 3));
    }
  }, [player.affection]);

  const handleAddToParty = (member: PartyMember, slot: number) => {
    if (party.some(p => p.id === member.id)) {
      alert('이미 파티에 있는 멤버입니다!');
      return;
    }

    const newParty = [...party];
    if (slot < 3) {
      newParty[slot] = member;
      setParty(newParty);
      setSelectedSlot(null);
    }
  };

  const handleRemoveFromParty = (slot: number) => {
    const newParty = party.filter((_, index) => index !== slot);
    setParty(newParty);
  };

  const getStatBonus = (affection: number) => {
    if (affection >= 80) return 10;
    if (affection >= 60) return 7;
    if (affection >= 40) return 5;
    if (affection >= 20) return 3;
    return 0;
  };

  return (
    <div className="bg-black/30 backdrop-blur-md rounded-lg p-6 border border-purple-500/30">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <span>⚔️</span>
        파티 구성 (4인 파티)
      </h2>

      {/* Current Party */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-purple-300 mb-4">현재 파티</h3>
        <div className="grid grid-cols-4 gap-4">
          {/* Player Slot (Always first) */}
          <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 rounded-lg p-4 border-2 border-blue-500">
            <div className="text-center">
              <div className="text-3xl mb-2">👤</div>
              <div className="font-bold text-white">{player.name}</div>
              <div className="text-xs text-blue-300">주인공 (리더)</div>
              <div className="mt-2 text-xs">
                <div className="text-yellow-300">Lv.{player.level}</div>
                <div className="text-red-300">HP: {player.hp}/{player.maxHp}</div>
                <div className="text-blue-300">MP: {player.mp}/{player.maxMp}</div>
              </div>
            </div>
          </div>

          {/* Party Member Slots */}
          {[0, 1, 2].map(slot => {
            const member = party[slot];
            return (
              <div
                key={slot}
                onClick={() => setSelectedSlot(slot)}
                className={`bg-gradient-to-br rounded-lg p-4 border-2 cursor-pointer transition-all hover:scale-105 ${
                  member
                    ? 'from-purple-900/50 to-pink-900/50 border-purple-500'
                    : 'from-gray-800/50 to-gray-700/50 border-gray-600 border-dashed'
                } ${selectedSlot === slot ? 'ring-2 ring-yellow-400' : ''}`}
              >
                {member ? (
                  <div className="text-center">
                    <div className="text-3xl mb-2">{member.icon}</div>
                    <div className="font-bold text-white">{member.name}</div>
                    <div className="text-xs text-purple-300">{member.role}</div>
                    <div className="mt-2 text-xs">
                      <div className="text-pink-300">호감도: {member.affection}</div>
                      <div className="text-red-300">HP: {member.hp}/{member.maxHp}</div>
                      <div className="text-blue-300">MP: {member.mp}/{member.maxMp}</div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveFromParty(slot);
                      }}
                      className="mt-2 text-xs bg-red-600 hover:bg-red-500 px-2 py-1 rounded"
                    >
                      제외
                    </button>
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <div className="text-3xl mb-2">➕</div>
                    <div>빈 슬롯</div>
                    <div className="text-xs mt-2">클릭해서 추가</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Available Members */}
      {selectedSlot !== null && (
        <div className="bg-black/20 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-purple-300 mb-4">
            파티에 추가 가능한 멤버 (슬롯 {selectedSlot + 2} 선택 중)
          </h3>
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {availableMembers
              .filter(m => !party.some(p => p.id === m.id))
              .map(member => {
                const bonus = getStatBonus(member.affection);
                return (
                  <button
                    key={member.id}
                    onClick={() => handleAddToParty(member, selectedSlot)}
                    className="bg-gradient-to-br from-purple-800/50 to-pink-800/50 p-3 rounded-lg hover:scale-105 transition-all border border-purple-500/50"
                  >
                    <div className="text-2xl mb-1">{member.icon}</div>
                    <div className="font-bold text-sm text-white">{member.name}</div>
                    <div className="text-xs text-purple-300">{member.role}</div>
                    <div className="text-xs text-pink-300 mt-1">
                      호감도: {member.affection}
                    </div>
                    {bonus > 0 && (
                      <div className="text-xs text-yellow-300">
                        보너스: +{bonus}
                      </div>
                    )}
                  </button>
                );
              })}
          </div>
          <button
            onClick={() => setSelectedSlot(null)}
            className="mt-4 w-full bg-gray-600 hover:bg-gray-500 text-white py-2 rounded-lg"
          >
            취소
          </button>
        </div>
      )}

      {/* Party Stats Summary */}
      <div className="mt-6 bg-purple-900/20 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-purple-300 mb-3">파티 능력치 총합</h3>
        <div className="grid grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-red-400 font-bold">
              ⚔️ 공격력: {
                player.stats.strength +
                party.reduce((sum, m) => sum + m.stats.attack + getStatBonus(m.affection), 0)
              }
            </div>
          </div>
          <div className="text-center">
            <div className="text-blue-400 font-bold">
              🛡️ 방어력: {
                10 +
                party.reduce((sum, m) => sum + m.stats.defense + getStatBonus(m.affection), 0)
              }
            </div>
          </div>
          <div className="text-center">
            <div className="text-green-400 font-bold">
              💨 속도: {
                player.stats.agility +
                party.reduce((sum, m) => sum + m.stats.speed, 0)
              }
            </div>
          </div>
          <div className="text-center">
            <div className="text-purple-400 font-bold">
              ✨ 마법력: {
                player.stats.intelligence +
                party.reduce((sum, m) => sum + m.stats.magic + getStatBonus(m.affection), 0)
              }
            </div>
          </div>
        </div>
      </div>

      {/* Party Skills */}
      <div className="mt-4 bg-blue-900/20 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-300 mb-3">파티 스킬</h3>
        <div className="flex flex-wrap gap-2">
          {party.flatMap(m => m.skills).map((skill, index) => (
            <span key={index} className="bg-blue-600/50 px-3 py-1 rounded-full text-sm text-white">
              {skill}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PartySystem;