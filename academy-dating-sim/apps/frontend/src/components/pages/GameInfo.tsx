import React from 'react';
import { useNavigate } from 'react-router-dom';

const GameInfo: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-purple-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            게임 정보
          </h1>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
          >
            ← 메인으로
          </button>
        </div>

        {/* Game Overview */}
        <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            🎮 게임 개요
          </h2>
          <div className="text-purple-200 space-y-3">
            <p>
              <strong>Labyrinth Academy</strong>는 마법과 모험이 가득한 학원을 배경으로 한 데이팅 시뮬레이션 게임입니다.
            </p>
            <p>
              플레이어는 학원 학생이 되어 다양한 히로인들과 관계를 쌓고, 던전을 탐험하며,
              자신만의 스토리를 만들어 나갑니다.
            </p>
            <p>
              총 30일의 학원 생활 동안 어떤 결말을 맞이할지는 당신의 선택에 달려있습니다!
            </p>
          </div>
        </div>

        {/* Game Controls */}
        <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            🎯 조작법 및 컨트롤
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-purple-200">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">기본 조작</h3>
              <ul className="space-y-2">
                <li>• <strong>이동:</strong> 화면 우측의 위치 버튼 클릭</li>
                <li>• <strong>시간 진행:</strong> "시간 진행" 버튼 클릭</li>
                <li>• <strong>활동:</strong> 각 장소에서 활동 선택</li>
                <li>• <strong>대화:</strong> 캐릭터 탭에서 대화 상대 선택</li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">게임 진행</h3>
              <ul className="space-y-2">
                <li>• <strong>저장/불러오기:</strong> 상단 버튼 사용</li>
                <li>• <strong>인벤토리:</strong> 아이템 사용 및 관리</li>
                <li>• <strong>던전:</strong> "던전 입장" 버튼으로 탐험</li>
                <li>• <strong>캐릭터 카드:</strong> 히로인 상세 정보 확인</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Game Systems */}
        <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            ⚙️ 게임 시스템
          </h2>
          <div className="space-y-6">
            {/* Affection System */}
            <div>
              <h3 className="text-lg font-semibold text-pink-300 mb-3">💕 호감도 시스템</h3>
              <div className="text-purple-200 space-y-2">
                <p>• 캐릭터와의 대화나 선물을 통해 호감도가 상승합니다</p>
                <p>• 호감도에 따라 다른 대화와 이벤트가 발생합니다</p>
                <p>• 높은 호감도는 특별한 엔딩으로 이어질 수 있습니다</p>
              </div>
            </div>

            {/* Stats System */}
            <div>
              <h3 className="text-lg font-semibold text-blue-300 mb-3">📊 스탯 시스템</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-purple-200">
                <div>
                  <div className="font-medium text-white">지력 (Intelligence)</div>
                  <div className="text-sm">학습 활동의 효과 증가</div>
                </div>
                <div>
                  <div className="font-medium text-white">매력 (Charm)</div>
                  <div className="text-sm">캐릭터와의 관계 개선</div>
                </div>
                <div>
                  <div className="font-medium text-white">체력 (Stamina)</div>
                  <div className="text-sm">활동 지속 능력</div>
                </div>
                <div>
                  <div className="font-medium text-white">힘 (Strength)</div>
                  <div className="text-sm">던전 탐험 및 전투</div>
                </div>
                <div>
                  <div className="font-medium text-white">민첩 (Agility)</div>
                  <div className="text-sm">회피 및 속도</div>
                </div>
                <div>
                  <div className="font-medium text-white">운 (Luck)</div>
                  <div className="text-sm">특별 이벤트 발생률</div>
                </div>
              </div>
            </div>

            {/* Time System */}
            <div>
              <h3 className="text-lg font-semibold text-yellow-300 mb-3">⏰ 시간 시스템</h3>
              <div className="text-purple-200 space-y-2">
                <p>• 하루는 4개의 시간대로 나뉩니다: 아침, 오후, 저녁, 밤</p>
                <p>• 각 시간대마다 다른 활동과 캐릭터를 만날 수 있습니다</p>
                <p>• 밤 시간에는 기숙사에서만 활동 가능합니다</p>
                <p>• 스태미나를 관리하며 효율적으로 시간을 사용해야 합니다</p>
              </div>
            </div>
          </div>
        </div>

{/* Tips */}
        <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            💡 게임 팁
          </h2>
          <div className="text-purple-200 space-y-3">
            <div className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">▶</span>
              <p>각 캐릭터는 선호하는 시간대와 장소가 있습니다. 캐릭터의 일정을 파악해보세요!</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">▶</span>
              <p>스탯을 균형 있게 키우는 것보다는 목표에 맞게 집중하는 것이 효과적입니다.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">▶</span>
              <p>선물을 주기 전에 각 캐릭터가 좋아하는 아이템을 확인해보세요.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">▶</span>
              <p>던전에서는 좋은 아이템을 얻을 수 있지만, 충분한 준비가 필요합니다.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">▶</span>
              <p>이벤트는 특정 조건에서 발생합니다. 다양한 선택을 시도해보세요!</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-yellow-400 mt-1">▶</span>
              <p>게임을 자주 저장하여 다양한 선택지를 실험해볼 수 있습니다.</p>
            </div>
          </div>
        </div>

        {/* Endings */}
        <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            🏆 엔딩 정보
          </h2>
          <div className="text-purple-200 space-y-3">
            <p>게임에는 여러 가지 엔딩이 준비되어 있습니다:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-pink-500/20 p-3 rounded border border-pink-400/30">
                <div className="font-semibold text-pink-300">💖 캐릭터 엔딩</div>
                <div className="text-sm">특정 캐릭터와 높은 호감도 달성</div>
              </div>
              <div className="bg-green-500/20 p-3 rounded border border-green-400/30">
                <div className="font-semibold text-green-300">😊 굿 엔딩</div>
                <div className="text-sm">전반적으로 좋은 성과 달성</div>
              </div>
              <div className="bg-blue-500/20 p-3 rounded border border-blue-400/30">
                <div className="font-semibold text-blue-300">😐 노멀 엔딩</div>
                <div className="text-sm">평범한 학원 생활 완주</div>
              </div>
              <div className="bg-gray-500/20 p-3 rounded border border-gray-400/30">
                <div className="font-semibold text-gray-300">😞 솔로 엔딩</div>
                <div className="text-sm">낮은 호감도로 게임 종료</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameInfo;