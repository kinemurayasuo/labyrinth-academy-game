import React from 'react';

interface HPMPDisplayProps {
  hp?: number;
  maxHp?: number;
  mp?: number;
  maxMp?: number;
}

const HPMPDisplay: React.FC<HPMPDisplayProps> = ({
  hp = 100,
  maxHp = 100,
  mp = 50,
  maxMp = 50
}) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-black/90 backdrop-blur-sm p-4 shadow-2xl">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-2 gap-4">
          {/* HP Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-3xl">❤️</span>
                <span className="text-white font-bold text-lg">HP</span>
              </div>
              <div className="text-white font-bold text-xl">
                {hp}/{maxHp}
              </div>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-8 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-red-600 to-red-400 h-full flex items-center justify-center transition-all duration-300"
                style={{ width: `${(hp / maxHp) * 100}%` }}
              >
                <span className="text-white text-sm font-bold drop-shadow">
                  {Math.round((hp / maxHp) * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* MP Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-3xl">💙</span>
                <span className="text-white font-bold text-lg">MP</span>
              </div>
              <div className="text-white font-bold text-xl">
                {mp}/{maxMp}
              </div>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-8 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-blue-600 to-blue-400 h-full flex items-center justify-center transition-all duration-300"
                style={{ width: `${(mp / maxMp) * 100}%` }}
              >
                <span className="text-white text-sm font-bold drop-shadow">
                  {Math.round((mp / maxMp) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HPMPDisplay;