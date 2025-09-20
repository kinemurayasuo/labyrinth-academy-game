import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/useGameStore';
import clubsData from '../../data/clubs.json';
import charactersData from '../../data/characters.json';

const clubs = clubsData.clubs;
const characters = charactersData as Record<string, any>;

interface Club {
  id: string;
  name: string;
  description: string;
  leader: string;
  members: string[];
  maxMembers: number;
  requirements: {
    stats?: Record<string, number>;
    level?: number;
  };
  schedule: Record<string, { time: string; activity: string }>;
  benefits: {
    daily?: { stats?: Record<string, number>; exp?: number };
    weekly?: { items?: string[]; money?: number };
  };
  activities: Array<{
    id: string;
    name: string;
    description: string;
    rewards: { exp?: number; stats?: Record<string, number>; money?: number; item?: string };
  }>;
}

const ClubSystem: React.FC = () => {
  const navigate = useNavigate();
  const player = useGameStore((state: any) => state.player);
  const { updateStats, updatePlayer, addItem, updateMoney } = useGameStore((state: any) => state.actions);

  const [selectedClub, setSelectedClub] = useState<string | null>(null);
  const [playerClub, setPlayerClub] = useState<string | null>(player.currentClub || null);
  const [clubActivities, setClubActivities] = useState<Record<string, boolean>>({});

  const canJoinClub = (club: Club): boolean => {
    if (playerClub) return false; // Already in a club

    // Check level requirement
    if (club.requirements.level && player.level < club.requirements.level) {
      return false;
    }

    // Check stat requirements
    if (club.requirements.stats) {
      for (const [stat, value] of Object.entries(club.requirements.stats)) {
        if ((player.stats as any)[stat] < value) {
          return false;
        }
      }
    }

    return true;
  };

  const handleJoinClub = (clubId: string) => {
    const club = clubs.find(c => c.id === clubId);
    if (!club || !canJoinClub(club)) return;

    setPlayerClub(clubId);
    updatePlayer({ currentClub: clubId, clubJoinDate: player.day });
    alert(`${club.name}에 가입했습니다!`);
  };

  const handleLeaveClub = () => {
    if (!playerClub) return;

    if (confirm('정말로 동아리를 탈퇴하시겠습니까?')) {
      setPlayerClub(null);
      updatePlayer({ currentClub: null, clubJoinDate: null });
      alert('동아리를 탈퇴했습니다.');
    }
  };

  const handleActivity = (clubId: string, activityId: string) => {
    const club = clubs.find(c => c.id === clubId);
    const activity = club?.activities.find(a => a.id === activityId);

    if (!club || !activity) return;

    // Check if already done today
    const activityKey = `${clubId}_${activityId}_${player.day}`;
    if (clubActivities[activityKey]) {
      alert('오늘은 이미 이 활동을 했습니다!');
      return;
    }

    // Apply rewards
    if (activity.rewards.exp) {
      updatePlayer({ experience: player.experience + activity.rewards.exp });
    }

    if (activity.rewards.stats) {
      updateStats(activity.rewards.stats);
    }

    if (activity.rewards.money) {
      updateMoney(activity.rewards.money);
    }

    if (activity.rewards.item) {
      addItem(activity.rewards.item);
    }

    setClubActivities(prev => ({ ...prev, [activityKey]: true }));
    alert(`${activity.name} 활동을 완료했습니다!`);
  };

  const getTodaySchedule = (club: Club): string | null => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayIndex = (player.day - 1) % 7;
    const today = days[todayIndex];

    const schedule = (club.schedule as any)[today];
    return schedule ? `${schedule.time}에 ${schedule.activity}` : null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="glass-card p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gradient mb-2">
                🎭 동아리 활동
              </h1>
              <p className="text-text-secondary">
                동아리에 가입하여 특별한 혜택을 받아보세요!
              </p>
              {playerClub && (
                <div className="mt-2 badge badge-primary">
                  현재 동아리: {clubs.find(c => c.id === playerClub)?.name}
                </div>
              )}
            </div>
            <button
              onClick={() => navigate('/game')}
              className="btn-ghost px-6 py-3 rounded-xl font-semibold"
            >
              돌아가기
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Club List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-bold text-text-primary mb-4">동아리 목록</h2>
            {clubs.map((club) => {
              const isMyClub = playerClub === club.id;
              const canJoin = canJoinClub(club);
              const leader = characters[club.leader];

              return (
                <div
                  key={club.id}
                  className={`glass-card p-6 cursor-pointer transition-all duration-300 ${
                    selectedClub === club.id ? 'ring-2 ring-primary' : ''
                  } ${isMyClub ? 'border-2 border-accent' : ''}`}
                  onClick={() => setSelectedClub(club.id)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                        {club.name}
                        {isMyClub && <span className="badge badge-accent">내 동아리</span>}
                      </h3>
                      <p className="text-text-secondary mt-1">{club.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-text-secondary">부장</div>
                      <div className="font-medium text-text-primary">
                        {leader?.name || club.leader}
                      </div>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="mb-4">
                    <h4 className="font-semibold text-text-primary mb-2">가입 조건</h4>
                    <div className="flex flex-wrap gap-2">
                      {club.requirements.level && (
                        <span className={`badge ${player.level >= club.requirements.level ? 'badge-success' : 'badge-error'}`}>
                          레벨 {club.requirements.level}
                        </span>
                      )}
                      {club.requirements.stats && Object.entries(club.requirements.stats).map(([stat, value]) => (
                        <span
                          key={stat}
                          className={`badge ${(player.stats as any)[stat] >= value ? 'badge-success' : 'badge-error'}`}
                        >
                          {stat} {value}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Members */}
                  <div className="mb-4">
                    <div className="text-sm text-text-secondary">
                      부원: {club.members.length}/{club.maxMembers}명
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {club.members.slice(0, 5).map((memberId) => {
                        const member = characters[memberId];
                        return member ? (
                          <span key={memberId} className="badge badge-primary">
                            {member.name}
                          </span>
                        ) : null;
                      })}
                      {club.members.length > 5 && (
                        <span className="badge">+{club.members.length - 5}</span>
                      )}
                    </div>
                  </div>

                  {/* Today's Schedule */}
                  {getTodaySchedule(club) && (
                    <div className="mb-4 p-3 bg-primary/20 rounded-lg">
                      <div className="text-sm font-semibold text-primary">오늘의 일정</div>
                      <div className="text-text-primary">{getTodaySchedule(club)}</div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    {!playerClub && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleJoinClub(club.id);
                        }}
                        disabled={!canJoin}
                        className={`btn ${canJoin ? 'btn-primary' : 'btn-ghost opacity-50'} px-4 py-2`}
                      >
                        가입하기
                      </button>
                    )}
                    {isMyClub && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLeaveClub();
                          }}
                          className="btn btn-secondary px-4 py-2"
                        >
                          탈퇴하기
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Selected Club Details */}
          <div className="glass-card p-6">
            <h3 className="text-xl font-bold text-text-primary mb-4">동아리 상세</h3>
            {selectedClub ? (
              (() => {
                const club = clubs.find(c => c.id === selectedClub);
                if (!club) return null;

                return (
                  <>
                    {/* Benefits */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-text-primary mb-2">혜택</h4>
                      <div className="space-y-2 text-sm">
                        {club.benefits.daily && (
                          <div className="p-2 bg-surface/50 rounded">
                            <div className="font-medium text-accent">일일 보상</div>
                            {club.benefits.daily.exp && <div>경험치 +{club.benefits.daily.exp}</div>}
                            {club.benefits.daily.stats && Object.entries(club.benefits.daily.stats).map(([stat, value]) => (
                              <div key={stat}>{stat} +{value}</div>
                            ))}
                          </div>
                        )}
                        {club.benefits.weekly && (
                          <div className="p-2 bg-surface/50 rounded">
                            <div className="font-medium text-accent">주간 보상</div>
                            {club.benefits.weekly.money && <div>골드 +{club.benefits.weekly.money}</div>}
                            {club.benefits.weekly.items && club.benefits.weekly.items.map(item => (
                              <div key={item}>{item}</div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Activities */}
                    {playerClub === selectedClub && (
                      <div>
                        <h4 className="font-semibold text-text-primary mb-2">활동</h4>
                        <div className="space-y-2">
                          {club.activities.map((activity) => {
                            const isDone = clubActivities[`${club.id}_${activity.id}_${player.day}`];

                            return (
                              <div key={activity.id} className="p-3 bg-surface/50 rounded">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <div className="font-medium text-text-primary">{activity.name}</div>
                                    <div className="text-xs text-text-secondary">{activity.description}</div>
                                  </div>
                                  {isDone && <span className="badge badge-success">완료</span>}
                                </div>
                                {!isDone && (
                                  <button
                                    onClick={() => handleActivity(club.id, activity.id)}
                                    className="btn btn-primary btn-sm w-full"
                                  >
                                    참여하기
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()
            ) : (
              <p className="text-text-secondary">동아리를 선택하세요</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubSystem;