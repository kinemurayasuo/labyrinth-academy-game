import React from 'react';

interface HeroineData {
  id: string;
  name: string;
  role: string;
  likes: string[];
  dislikes: string[];
  baseText: string;
  sprite: string;
  unlockCondition?: {
    day?: number;
    totalAffection?: number;
  };
}

const heroines: HeroineData[] = [
  {
    id: "sakura",
    name: "사쿠라",
    role: "검술부 에이스",
    likes: ["훈련", "도전", "정직함"],
    dislikes: ["거짓말", "나태함"],
    baseText: "쿨하고 실력 지상주의자. 강한 상대를 찾고 있다.",
    sprite: "🗡️"
  },
  {
    id: "yuki",
    name: "유키",
    role: "도서부 부장",
    likes: ["책", "조용함", "차"],
    dislikes: ["시끄러움", "무례함"],
    baseText: "수줍고 차분한 도서위원. 책 속 세계를 사랑한다.",
    sprite: "📚"
  },
  {
    id: "luna",
    name: "루나",
    role: "마법학부 수석",
    likes: ["마법", "별", "음악"],
    dislikes: ["규칙", "억압"],
    baseText: "밝고 사교적. 명문 마법 가문 출신이지만 자유로운 영혼.",
    sprite: "✨"
  },
  {
    id: "mystery",
    name: "???",
    role: "수수께끼의 전학생",
    likes: ["비밀", "밤", "고양이"],
    dislikes: ["거짓", "배신"],
    baseText: "정체불명의 전학생. 특별한 조건을 만족해야 만날 수 있다.",
    sprite: "🌙",
    unlockCondition: {
      day: 10,
      totalAffection: 150
    }
  },
  {
    id: "akane",
    name: "아카네",
    role: "학생회장",
    likes: ["질서", "책임감", "리더십"],
    dislikes: ["무책임", "규칙 위반", "게으름"],
    baseText: "카리스마 넘치는 학생회장. 완벽주의자지만 내면은 따뜻하다.",
    sprite: "👑"
  },
  {
    id: "hana",
    name: "하나",
    role: "요리부 부장",
    likes: ["요리", "디저트", "가족"],
    dislikes: ["음식 낭비", "편식", "인스턴트"],
    baseText: "따뜻하고 모성애 넘치는 성격. 모두를 먹이려 한다.",
    sprite: "🍰"
  },
  {
    id: "rin",
    name: "린",
    role: "육상부 스타",
    likes: ["달리기", "아침 햇살", "스포츠 음료"],
    dislikes: ["비 오는 날", "포기", "변명"],
    baseText: "활발하고 긍정적인 에너지. 항상 웃는 햇살 같은 소녀.",
    sprite: "🏃‍♀️"
  },
  {
    id: "mei",
    name: "메이",
    role: "미술부 천재",
    likes: ["그림", "고요함", "영감"],
    dislikes: ["소음", "방해", "틀에 박힌 것"],
    baseText: "예술적 감성이 풍부한 소녀. 자신만의 세계에 빠져있다.",
    sprite: "🎨"
  },
  {
    id: "sora",
    name: "소라",
    role: "과학부 천재",
    likes: ["실험", "발명", "논리"],
    dislikes: ["미신", "비과학적 사고", "실패"],
    baseText: "논리적이고 분석적. 감정보다 이성을 중시한다.",
    sprite: "🔬"
  }
];

const HeroineInfo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          히로인 캐릭터 정보
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {heroines.map((heroine) => (
            <div
              key={heroine.id}
              className="bg-black/30 backdrop-blur-md rounded-xl p-6 border border-border hover:scale-105 transition-transform duration-300"
            >
              <div className="flex items-center gap-4 mb-4">
                <span className="text-5xl">{heroine.sprite}</span>
                <div>
                  <h2 className="text-xl font-bold text-white">{heroine.name}</h2>
                  <p className="text-secondary text-sm">{heroine.role}</p>
                </div>
              </div>

              <p className="text-text-primary text-sm mb-4">{heroine.baseText}</p>

              <div className="space-y-3">
                <div className="bg-green-500/20 rounded-lg p-3">
                  <p className="text-green-300 text-xs font-semibold mb-1">좋아하는 것</p>
                  <p className="text-white text-sm">{heroine.likes.join(", ")}</p>
                </div>

                <div className="bg-red-500/20 rounded-lg p-3">
                  <p className="text-red-300 text-xs font-semibold mb-1">싫어하는 것</p>
                  <p className="text-white text-sm">{heroine.dislikes.join(", ")}</p>
                </div>

                {heroine.unlockCondition && (
                  <div className="bg-purple-500/20 rounded-lg p-3">
                    <p className="text-purple-300 text-xs font-semibold mb-1">해금 조건</p>
                    <p className="text-white text-xs">
                      {heroine.unlockCondition.day && `${heroine.unlockCondition.day}일차 이후`}
                      {heroine.unlockCondition.day && heroine.unlockCondition.totalAffection && " & "}
                      {heroine.unlockCondition.totalAffection && `총 호감도 ${heroine.unlockCondition.totalAffection} 이상`}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-black/30 backdrop-blur-md rounded-xl p-6 border border-border">
          <h2 className="text-2xl font-bold text-white mb-4">게임 팁</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-text-primary">
            <div>
              <h3 className="text-secondary font-semibold mb-2">호감도 시스템</h3>
              <ul className="text-sm space-y-1">
                <li>• 각 캐릭터의 호감도는 0부터 시작합니다</li>
                <li>• 대화와 선물로 호감도를 올릴 수 있습니다</li>
                <li>• 호감도 100 달성 시 특별 엔딩 해금</li>
              </ul>
            </div>
            <div>
              <h3 className="text-secondary font-semibold mb-2">캐릭터 공략</h3>
              <ul className="text-sm space-y-1">
                <li>• 좋아하는 것과 관련된 선택지를 고르세요</li>
                <li>• 싫어하는 것은 피하는 것이 좋습니다</li>
                <li>• 시간대별로 캐릭터 위치가 변경됩니다</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroineInfo;