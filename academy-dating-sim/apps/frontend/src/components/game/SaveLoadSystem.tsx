import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/useGameStore';

interface SaveSlot {
  id: number;
  isEmpty: boolean;
  data?: {
    playerName: string;
    level: number;
    day: number;
    timeOfDay: string;
    location: string;
    affectionSummary: Record<string, number>;
    saveDate: string;
    playTime: number; // in minutes
  };
}

const SaveLoadSystem: React.FC = () => {
  const navigate = useNavigate();
  const player = useGameStore((state: any) => state.player);
  const unlockedCharacters = useGameStore((state: any) => state.unlockedCharacters);
  const completedEvents = useGameStore((state: any) => state.completedEvents);
  const { saveGame, loadGame } = useGameStore((state: any) => state.actions);

  const [saveSlots, setSaveSlots] = useState<SaveSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [mode, setMode] = useState<'save' | 'load' | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState<() => void>(() => {});
  const [confirmMessage, setConfirmMessage] = useState('');

  const MAX_SAVE_SLOTS = 6;

  // Initialize save slots
  useEffect(() => {
    loadSaveSlots();
  }, []);

  const loadSaveSlots = () => {
    const slots: SaveSlot[] = [];

    for (let i = 1; i <= MAX_SAVE_SLOTS; i++) {
      const saveKey = `academyDatingSim_slot${i}`;
      const saveData = localStorage.getItem(saveKey);

      if (saveData) {
        const parsed = JSON.parse(saveData);
        slots.push({
          id: i,
          isEmpty: false,
          data: {
            playerName: parsed.player.name,
            level: parsed.player.level,
            day: parsed.player.day,
            timeOfDay: parsed.player.timeOfDay,
            location: parsed.player.location,
            affectionSummary: parsed.player.affection || {},
            saveDate: parsed.saveDate || new Date().toLocaleString(),
            playTime: parsed.playTime || 0
          }
        });
      } else {
        slots.push({
          id: i,
          isEmpty: true
        });
      }
    }

    setSaveSlots(slots);
  };

  const handleSave = (slotId: number) => {
    const slot = saveSlots.find(s => s.id === slotId);

    if (slot && !slot.isEmpty) {
      // Confirm overwrite
      setConfirmMessage(`슬롯 ${slotId}의 저장 데이터를 덮어쓰시겠습니까?`);
      setConfirmAction(() => () => performSave(slotId));
      setShowConfirmDialog(true);
    } else {
      performSave(slotId);
    }
  };

  const performSave = (slotId: number) => {
    const saveKey = `academyDatingSim_slot${slotId}`;
    const saveData = {
      player,
      unlockedCharacters,
      completedEvents,
      saveDate: new Date().toLocaleString(),
      playTime: calculatePlayTime()
    };

    localStorage.setItem(saveKey, JSON.stringify(saveData));

    // Update current save slot in main save
    localStorage.setItem('currentSaveSlot', slotId.toString());

    // Refresh slots
    loadSaveSlots();
    setShowConfirmDialog(false);
    alert(`게임이 슬롯 ${slotId}에 저장되었습니다!`);
  };

  const handleLoad = (slotId: number) => {
    const slot = saveSlots.find(s => s.id === slotId);

    if (slot && !slot.isEmpty) {
      setConfirmMessage(`슬롯 ${slotId}의 데이터를 불러오시겠습니까?\n현재 진행 상황은 저장되지 않습니다.`);
      setConfirmAction(() => () => performLoad(slotId));
      setShowConfirmDialog(true);
    }
  };

  const performLoad = (slotId: number) => {
    const saveKey = `academyDatingSim_slot${slotId}`;
    const saveData = localStorage.getItem(saveKey);

    if (saveData) {
      const parsed = JSON.parse(saveData);

      // Load into current game
      localStorage.setItem('academyDatingSim', JSON.stringify({
        player: parsed.player,
        unlockedCharacters: parsed.unlockedCharacters,
        completedEvents: parsed.completedEvents
      }));

      // Set current slot
      localStorage.setItem('currentSaveSlot', slotId.toString());

      // Load game
      loadGame();
      setShowConfirmDialog(false);
      navigate('/game');
    }
  };

  const handleDelete = (slotId: number) => {
    setConfirmMessage(`슬롯 ${slotId}의 데이터를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`);
    setConfirmAction(() => () => performDelete(slotId));
    setShowConfirmDialog(true);
  };

  const performDelete = (slotId: number) => {
    const saveKey = `academyDatingSim_slot${slotId}`;
    localStorage.removeItem(saveKey);
    loadSaveSlots();
    setShowConfirmDialog(false);
    alert(`슬롯 ${slotId}의 데이터가 삭제되었습니다.`);
  };

  const calculatePlayTime = () => {
    // Simple calculation - could be enhanced with actual tracking
    return player.day * 60 + (player.timeOfDay === 'noon' ? 30 : 0);
  };

  const formatPlayTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}시간 ${mins}분`;
  };

  const getTimeIcon = (timeOfDay: string) => {
    const icons: Record<string, string> = {
      morning: '🌅',
      noon: '☀️',
      afternoon: '🌤️',
      evening: '🌆',
      night: '🌙'
    };
    return icons[timeOfDay] || '⏰';
  };

  const getHighestAffection = (affection: Record<string, number>) => {
    const entries = Object.entries(affection);
    if (entries.length === 0) return null;

    const highest = entries.reduce((max, [char, value]) =>
      value > max.value ? { char, value } : max,
      { char: entries[0][0], value: entries[0][1] }
    );

    return highest;
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-black/50 backdrop-blur-md rounded-lg shadow-lg p-6 mb-6 border border-border">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent mb-2">
                💾 저장 & 불러오기
              </h1>
              <p className="text-text-secondary">
                최대 {MAX_SAVE_SLOTS}개의 저장 슬롯을 사용할 수 있습니다
              </p>
            </div>
            <button
              onClick={() => navigate('/game')}
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
            >
              🏠 돌아가기
            </button>
          </div>
        </div>

        {/* Mode Selection */}
        <div className="bg-black/30 backdrop-blur-md rounded-lg p-4 mb-6 border border-border">
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setMode('save')}
              className={`px-6 py-3 rounded-lg font-bold transition ${
                mode === 'save'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              💾 저장하기
            </button>
            <button
              onClick={() => setMode('load')}
              className={`px-6 py-3 rounded-lg font-bold transition ${
                mode === 'load'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              📂 불러오기
            </button>
          </div>
        </div>

        {/* Save Slots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {saveSlots.map(slot => (
            <div
              key={slot.id}
              className={`bg-black/50 backdrop-blur-md rounded-lg border-2 transition-all hover:scale-[1.02] ${
                selectedSlot === slot.id
                  ? 'border-accent shadow-xl'
                  : 'border-border hover:border-primary'
              } ${slot.isEmpty ? 'opacity-60' : ''}`}
            >
              {/* Slot Header */}
              <div className={`p-4 bg-gradient-to-r ${
                slot.isEmpty
                  ? 'from-gray-700 to-gray-600'
                  : 'from-purple-700 to-blue-700'
              }`}>
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-bold text-white">
                    슬롯 {slot.id}
                  </h3>
                  {!slot.isEmpty && (
                    <button
                      onClick={() => handleDelete(slot.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      🗑️ 삭제
                    </button>
                  )}
                </div>
              </div>

              {/* Slot Content */}
              <div className="p-4">
                {slot.isEmpty ? (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2 opacity-50">📭</div>
                    <p className="text-text-secondary">빈 슬롯</p>
                  </div>
                ) : slot.data && (
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">이름:</span>
                      <span className="text-text-primary font-bold">
                        {slot.data.playerName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">레벨:</span>
                      <span className="text-yellow-400 font-bold">
                        Lv.{slot.data.level}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">진행도:</span>
                      <span className="text-text-primary">
                        Day {slot.data.day} - {getTimeIcon(slot.data.timeOfDay)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">위치:</span>
                      <span className="text-text-primary">
                        {slot.data.location}
                      </span>
                    </div>

                    {/* Highest Affection */}
                    {Object.keys(slot.data.affectionSummary).length > 0 && (
                      <div className="bg-pink-900/20 rounded p-2 border border-pink-500/30">
                        <div className="text-xs text-pink-300 mb-1">최고 호감도:</div>
                        {(() => {
                          const highest = getHighestAffection(slot.data.affectionSummary);
                          return highest ? (
                            <div className="text-sm text-pink-200">
                              {highest.char} - {highest.value}%
                            </div>
                          ) : null;
                        })()}
                      </div>
                    )}

                    <div className="pt-2 border-t border-border">
                      <div className="flex justify-between text-xs">
                        <span className="text-text-secondary">저장 시간:</span>
                        <span className="text-text-primary">
                          {slot.data.saveDate}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-text-secondary">플레이 시간:</span>
                        <span className="text-text-primary">
                          {formatPlayTime(slot.data.playTime)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                {mode && (
                  <button
                    onClick={() => {
                      if (mode === 'save') {
                        handleSave(slot.id);
                      } else if (mode === 'load' && !slot.isEmpty) {
                        handleLoad(slot.id);
                      }
                    }}
                    disabled={mode === 'load' && slot.isEmpty}
                    className={`w-full mt-4 py-3 rounded-lg font-bold transition ${
                      mode === 'save'
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : mode === 'load' && !slot.isEmpty
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {mode === 'save' ? '💾 이 슬롯에 저장' : '📂 이 슬롯 불러오기'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Confirmation Dialog */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-xl p-8 max-w-md w-full border border-border">
              <h2 className="text-xl font-bold text-text-primary mb-4">
                확인
              </h2>
              <p className="text-text-secondary mb-6 whitespace-pre-line">
                {confirmMessage}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={confirmAction}
                  className="flex-1 px-4 py-3 bg-primary hover:bg-secondary text-white rounded-lg font-bold transition"
                >
                  확인
                </button>
                <button
                  onClick={() => setShowConfirmDialog(false)}
                  className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold transition"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!mode && (
          <div className="mt-8 bg-black/30 backdrop-blur-md rounded-lg p-6 border border-border">
            <h3 className="text-lg font-bold text-text-primary mb-3">📖 사용 방법</h3>
            <ul className="space-y-2 text-text-secondary">
              <li>• 상단의 "저장하기" 또는 "불러오기" 버튼을 선택하세요</li>
              <li>• 저장: 원하는 슬롯을 선택하여 현재 게임을 저장합니다</li>
              <li>• 불러오기: 저장된 슬롯을 선택하여 게임을 불러옵니다</li>
              <li>• 각 슬롯은 독립적으로 관리되며, 언제든 삭제할 수 있습니다</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default SaveLoadSystem;