import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/useGameStore';

const GameIntro: React.FC = () => {
  const navigate = useNavigate();
  const player = useGameStore(state => state.player);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "마법학원 아카데미아",
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            당신은 명문 마법학원 '아카데미아'에 입학한 신입생입니다.
          </p>
          <p className="text-lg">
            이곳은 마법과 현대 기술이 공존하는 특별한 학교로,
            다양한 재능을 가진 학생들이 모여 있습니다.
          </p>
          <div className="bg-purple-900/30 p-4 rounded-lg mt-4">
            <h3 className="font-bold text-xl mb-2">🏫 학원 정보</h3>
            <ul className="space-y-2 text-sm">
              <li>• 설립: 100년 전</li>
              <li>• 위치: 마법의 섬 크리스탈리아</li>
              <li>• 학생 수: 약 1,000명</li>
              <li>• 특징: 마법과 과학의 융합 교육</li>
            </ul>
          </div>
        </div>
      ),
      emoji: "🏰"
    },
    {
      title: "당신의 목표",
      content: (
        <div className="space-y-4">
          <p className="text-lg font-bold text-yellow-300">
            30일 동안 학원 생활을 하며 다음 목표를 달성하세요:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-pink-900/30 p-4 rounded-lg">
              <h3 className="font-bold text-xl mb-2">💕 연애 목표</h3>
              <ul className="space-y-2 text-sm">
                <li>• 9명의 히로인과 친해지기</li>
                <li>• 특별한 인연 만들기</li>
                <li>• 호감도 80 이상 달성</li>
                <li>• 고백 이벤트 성공</li>
              </ul>
            </div>
            <div className="bg-blue-900/30 p-4 rounded-lg">
              <h3 className="font-bold text-xl mb-2">📚 성장 목표</h3>
              <ul className="space-y-2 text-sm">
                <li>• 능력치 향상시키기</li>
                <li>• 레벨 20 달성</li>
                <li>• 던전 최고층 도달</li>
                <li>• 모든 업적 달성</li>
              </ul>
            </div>
            <div className="bg-green-900/30 p-4 rounded-lg">
              <h3 className="font-bold text-xl mb-2">🎮 모험 목표</h3>
              <ul className="space-y-2 text-sm">
                <li>• 던전 탐험하기</li>
                <li>• 보스 몬스터 처치</li>
                <li>• 레어 아이템 수집</li>
                <li>• 펫 육성하기</li>
              </ul>
            </div>
            <div className="bg-yellow-900/30 p-4 rounded-lg">
              <h3 className="font-bold text-xl mb-2">🏆 수집 목표</h3>
              <ul className="space-y-2 text-sm">
                <li>• 모든 엔딩 보기</li>
                <li>• 도감 완성하기</li>
                <li>• 10,000골드 모으기</li>
                <li>• 히든 이벤트 발견</li>
              </ul>
            </div>
          </div>
        </div>
      ),
      emoji: "🎯"
    },
    {
      title: "게임 시스템",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-purple-900/30 p-4 rounded-lg">
              <h3 className="font-bold text-xl mb-2">⏰ 시간 시스템</h3>
              <ul className="space-y-2 text-sm">
                <li>• 총 30일의 제한 시간</li>
                <li>• 하루 2번의 주요 활동</li>
                <li>• 오전/오후로 나뉜 일과</li>
                <li>• 매일 스테미나 회복</li>
              </ul>
            </div>
            <div className="bg-blue-900/30 p-4 rounded-lg">
              <h3 className="font-bold text-xl mb-2">💪 스테미나 시스템</h3>
              <ul className="space-y-2 text-sm">
                <li>• 모든 활동에 스테미나 소모</li>
                <li>• 휴식으로 회복 가능</li>
                <li>• 다음날 완전 회복</li>
                <li>• 최대치 증가 가능</li>
              </ul>
            </div>
            <div className="bg-green-900/30 p-4 rounded-lg">
              <h3 className="font-bold text-xl mb-2">📊 스탯 시스템</h3>
              <ul className="space-y-2 text-sm">
                <li>• 지력: 학습과 마법</li>
                <li>• 매력: 대인관계</li>
                <li>• 힘: 물리 공격력</li>
                <li>• 민첩: 회피와 속도</li>
                <li>• 행운: 아이템 드롭률</li>
              </ul>
            </div>
            <div className="bg-pink-900/30 p-4 rounded-lg">
              <h3 className="font-bold text-xl mb-2">💕 호감도 시스템</h3>
              <ul className="space-y-2 text-sm">
                <li>• 대화 선택지로 변화</li>
                <li>• 선물로 상승</li>
                <li>• 이벤트 발생 조건</li>
                <li>• 엔딩 분기 결정</li>
              </ul>
            </div>
          </div>
        </div>
      ),
      emoji: "⚙️"
    },
    {
      title: "히로인 소개",
      content: (
        <div className="space-y-4">
          <p className="text-lg">
            9명의 매력적인 히로인들이 당신을 기다립니다!
          </p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { name: '사쿠라', emoji: '🌸', type: '츤데레 마법사' },
              { name: '유키', emoji: '❄️', type: '쿨데레 검사' },
              { name: '하루카', emoji: '🌻', type: '밝은 힐러' },
              { name: '아유미', emoji: '📚', type: '지적인 학자' },
              { name: '미쿠', emoji: '🎵', type: '천재 아티스트' },
              { name: '리나', emoji: '🗡️', type: '강한 전사' },
              { name: '루나', emoji: '🌙', type: '신비로운 점술사' },
              { name: '노바', emoji: '⭐', type: '활발한 연금술사' },
              { name: '아리아', emoji: '🎭', type: '우아한 귀족' }
            ].map(heroine => (
              <div key={heroine.name} className="bg-pink-900/30 p-3 rounded-lg text-center">
                <div className="text-3xl mb-1">{heroine.emoji}</div>
                <div className="font-bold">{heroine.name}</div>
                <div className="text-xs text-pink-300">{heroine.type}</div>
              </div>
            ))}
          </div>
          <p className="text-sm text-yellow-300 text-center">
            각 히로인마다 고유한 성격과 스토리가 있습니다!
          </p>
        </div>
      ),
      emoji: "👥"
    },
    {
      title: "팁과 조언",
      content: (
        <div className="space-y-4">
          <div className="bg-yellow-900/30 p-4 rounded-lg">
            <h3 className="font-bold text-xl mb-2">💡 초보자 팁</h3>
            <ul className="space-y-2">
              <li>📌 매일 스테미나를 효율적으로 사용하세요</li>
              <li>📌 히로인과의 대화 선택지를 신중히 고르세요</li>
              <li>📌 균형잡힌 스탯 성장이 중요합니다</li>
              <li>📌 던전 탐험으로 골드와 아이템을 획득하세요</li>
              <li>📌 펫은 전투에 큰 도움이 됩니다</li>
            </ul>
          </div>
          <div className="bg-red-900/30 p-4 rounded-lg">
            <h3 className="font-bold text-xl mb-2">⚠️ 주의사항</h3>
            <ul className="space-y-2 text-sm">
              <li>• 30일이 지나면 엔딩이 결정됩니다</li>
              <li>• 스테미나가 없으면 활동할 수 없습니다</li>
              <li>• 일부 이벤트는 한 번만 발생합니다</li>
              <li>• 호감도가 낮으면 배드 엔딩이 될 수 있습니다</li>
            </ul>
          </div>
        </div>
      ),
      emoji: "💡"
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      navigate('/game');
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const skipIntro = () => {
    navigate('/game');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-purple-900 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="bg-black/40 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
          {/* Progress Bar */}
          <div className="flex justify-between mb-6">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`flex-1 h-2 mx-1 rounded-full transition-all ${
                  index <= currentSlide ? 'bg-gradient-to-r from-purple-400 to-pink-400' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{slides[currentSlide].emoji}</div>
            <h2 className="text-3xl font-bold text-white mb-6">
              {slides[currentSlide].title}
            </h2>
            <div className="text-gray-100">
              {slides[currentSlide].content}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className={`px-6 py-3 rounded-lg font-bold transition-all ${
                currentSlide === 0
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg'
              }`}
            >
              이전
            </button>

            <button
              onClick={skipIntro}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              건너뛰기
            </button>

            <button
              onClick={nextSlide}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:shadow-lg transition-all"
            >
              {currentSlide === slides.length - 1 ? '게임 시작!' : '다음'}
            </button>
          </div>
        </div>

        {/* Current Player Info */}
        <div className="mt-4 text-center text-white/70">
          <p>플레이어: {player.name} | Day {player.day}/30</p>
        </div>
      </div>
    </div>
  );
};

export default GameIntro;