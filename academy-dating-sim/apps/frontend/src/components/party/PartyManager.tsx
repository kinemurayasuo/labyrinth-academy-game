import React, { useState, useCallback } from 'react';
import { usePartyStore } from '../../store/partyStore';
import { useGameStore } from '../../store/useGameStore';
import { Button, Card, CardHeader, CardContent, CardTitle } from '../ui';
import { PartyPosition } from '../../types/party';

const PartyManager: React.FC = () => {
  const {
    party,
    availableHeroines,
    addMemberToParty,
    removeMemberFromParty,
    swapPartyPositions,
    setFormation,
    setPartyLeader,
    recruitHeroine,
    canRecruitHeroine,
  } = usePartyStore();

  const playerStats = useGameStore((state) => state.player);
  const heroineAffections = useGameStore((state) => state.heroineAffections);

  const [selectedSlot, setSelectedSlot] = useState<PartyPosition | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedSlot, setDraggedSlot] = useState<PartyPosition | null>(null);

  const handleSlotClick = useCallback((position: PartyPosition) => {
    setSelectedSlot(position);
  }, []);

  const handleRecruitHeroine = useCallback((characterId: string) => {
    const affection = heroineAffections[characterId] || 0;
    const playerLevel = playerStats.level || 1;

    if (canRecruitHeroine(characterId, playerLevel, affection)) {
      const success = recruitHeroine(characterId);
      if (success) {
        alert(`${characterId}가 파티에 합류했습니다!`);
      } else {
        alert('파티가 가득 찼습니다.');
      }
    } else {
      alert('아직 이 캐릭터를 영입할 수 없습니다.');
    }
  }, [heroineAffections, playerStats.level, canRecruitHeroine, recruitHeroine]);

  const handleRemoveMember = useCallback((position: PartyPosition) => {
    if (party.members[position]) {
      if (confirm(`정말로 ${party.members[position]?.name}를 파티에서 제외하시겠습니까?`)) {
        removeMemberFromParty(position);
      }
    }
  }, [party.members, removeMemberFromParty]);

  const handleDragStart = useCallback((position: PartyPosition) => {
    setIsDragging(true);
    setDraggedSlot(position);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((targetPosition: PartyPosition) => {
    if (draggedSlot !== null && draggedSlot !== targetPosition) {
      swapPartyPositions(draggedSlot, targetPosition);
    }
    setIsDragging(false);
    setDraggedSlot(null);
  }, [draggedSlot, swapPartyPositions]);

  const renderPartySlot = (position: PartyPosition) => {
    const member = party.members[position];
    const isLeader = party.leader === position;
    const isFrontRow = party.formation.frontRow.includes(position);

    return (
      <div
        key={position}
        className={`
          relative p-4 rounded-xl border-2 transition-all cursor-pointer
          ${member ? 'bg-surface/80' : 'bg-background/50'}
          ${isLeader ? 'border-accent shadow-glow-sm' : 'border-border'}
          ${selectedSlot === position ? 'ring-2 ring-primary' : ''}
          ${isDragging ? 'hover:border-primary' : ''}
        `}
        onClick={() => handleSlotClick(position)}
        onDragOver={handleDragOver}
        onDrop={() => handleDrop(position)}
        draggable={!!member}
        onDragStart={() => handleDragStart(position)}
      >
        {/* Position Badge */}
        <div className="absolute -top-2 -left-2 z-10">
          <span className={`
            inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold
            ${isFrontRow ? 'bg-red-500' : 'bg-blue-500'} text-white
          `}>
            {position + 1}
          </span>
        </div>

        {/* Leader Badge */}
        {isLeader && (
          <div className="absolute -top-2 -right-2 z-10">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-accent text-white">
              👑
            </span>
          </div>
        )}

        {member ? (
          <div className="space-y-2">
            {/* Character Portrait */}
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <span className="text-3xl">{member.isHeroine ? '👸' : '⚔️'}</span>
            </div>

            {/* Character Info */}
            <div className="text-center">
              <div className="font-bold text-text-primary">{member.name}</div>
              <div className="text-xs text-text-secondary">Lv.{member.level}</div>
              <div className="text-xs text-text-muted capitalize">{member.role}</div>
            </div>

            {/* HP/MP Bars */}
            <div className="space-y-1">
              <div className="relative h-2 bg-background rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-500 to-red-600"
                  style={{ width: `${(member.hp / member.maxHp) * 100}%` }}
                />
              </div>
              <div className="relative h-2 bg-background rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600"
                  style={{ width: `${(member.mp / member.maxMp) * 100}%` }}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-center gap-2 mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setPartyLeader(position);
                }}
                disabled={isLeader}
              >
                리더
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveMember(position);
                }}
              >
                제외
              </Button>
            </div>
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center">
            <div className="text-center text-text-muted">
              <div className="text-3xl mb-2">➕</div>
              <div className="text-sm">빈 슬롯</div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              🎮 파티 관리
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Party Formation */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle>현재 파티 구성</CardTitle>
            <div className="text-sm text-text-secondary">
              파티 시너지: {party.synergy}% | 총 전투: {party.totalBattles}회
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Front Row */}
              <div>
                <div className="text-sm font-semibold text-text-primary mb-2">
                  전열 (Front Row)
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {party.formation.frontRow.map(renderPartySlot)}
                </div>
              </div>

              {/* Back Row */}
              <div>
                <div className="text-sm font-semibold text-text-primary mb-2">
                  후열 (Back Row)
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {party.formation.backRow.map(renderPartySlot)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Heroines */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle>영입 가능한 히로인</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {availableHeroines.map((heroine) => {
                const affection = heroineAffections[heroine.characterId] || 0;
                const playerLevel = playerStats.level || 1;
                const canRecruit = canRecruitHeroine(
                  heroine.characterId,
                  playerLevel,
                  affection
                );
                const isInParty = party.members.some(
                  (m) => m?.characterId === heroine.characterId
                );

                return (
                  <Card
                    key={heroine.characterId}
                    variant={heroine.unlocked ? 'default' : 'outlined'}
                    className={`${!heroine.unlocked ? 'opacity-50' : ''}`}
                  >
                    <CardContent className="text-center p-4">
                      <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-pink-400/20 to-purple-400/20 flex items-center justify-center mb-2">
                        <span className="text-2xl">
                          {heroine.unlocked ? '👸' : '🔒'}
                        </span>
                      </div>
                      <div className="font-bold text-text-primary">{heroine.name}</div>
                      <div className="text-xs text-text-secondary capitalize mb-2">
                        {heroine.role} • Lv.{heroine.startingLevel}
                      </div>

                      {heroine.unlocked && (
                        <div className="text-xs space-y-1 mb-2">
                          <div>호감도: {affection}/{heroine.recruitmentRequirements.minAffection}</div>
                          {heroine.recruitmentRequirements.playerLevel && (
                            <div>
                              필요 레벨: {playerLevel}/{heroine.recruitmentRequirements.playerLevel}
                            </div>
                          )}
                        </div>
                      )}

                      {heroine.unlocked && !isInParty && (
                        <Button
                          variant={canRecruit ? 'primary' : 'ghost'}
                          size="sm"
                          fullWidth
                          onClick={() => handleRecruitHeroine(heroine.characterId)}
                          disabled={!canRecruit || party.members.every((m) => m !== null)}
                        >
                          {canRecruit ? '영입' : '조건 미달'}
                        </Button>
                      )}

                      {isInParty && (
                        <div className="text-xs text-accent font-semibold">
                          파티 멤버
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Party Tips */}
        <Card variant="glass">
          <CardContent>
            <div className="text-center text-text-secondary">
              <p className="mb-2">💡 TIP: 다양한 역할의 캐릭터로 파티를 구성하면 시너지가 상승합니다!</p>
              <p className="text-sm">드래그 앤 드롭으로 파티 위치를 변경할 수 있습니다.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PartyManager;