import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface GameSettings {
  masterVolume: number;
  musicVolume: number;
  soundVolume: number;
  voiceVolume: number;
  difficulty: 'easy' | 'normal' | 'hard';
  autoSave: boolean;
  fastText: boolean;
  skipRead: boolean;
  fullscreen: boolean;
  animations: boolean;
}

const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 80,
  musicVolume: 70,
  soundVolume: 80,
  voiceVolume: 80,
  difficulty: 'normal',
  autoSave: true,
  fastText: false,
  skipRead: false,
  fullscreen: false,
  animations: true,
};

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('academyDatingSimSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    }
  }, []);

  const handleSettingChange = (key: keyof GameSettings, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    setHasUnsavedChanges(true);
  };

  const saveSettings = () => {
    localStorage.setItem('academyDatingSimSettings', JSON.stringify(settings));
    setHasUnsavedChanges(false);
    alert('설정이 저장되었습니다!');
  };

  const resetSettings = () => {
    if (confirm('모든 설정을 기본값으로 되돌리시겠습니까?')) {
      setSettings(DEFAULT_SETTINGS);
      setHasUnsavedChanges(true);
    }
  };

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'academy-dating-sim-settings.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          setSettings({ ...DEFAULT_SETTINGS, ...imported });
          setHasUnsavedChanges(true);
          alert('설정을 불러왔습니다!');
        } catch (error) {
          alert('설정 파일을 읽을 수 없습니다.');
        }
      };
      reader.readAsText(file);
    }
  };

  const clearAllData = () => {
    if (confirm('정말로 모든 게임 데이터를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      if (confirm('진짜로 확실하시나요? 저장된 게임, 설정 등 모든 데이터가 삭제됩니다.')) {
        localStorage.removeItem('academyDatingSim');
        localStorage.removeItem('academyDatingSimSettings');
        alert('모든 데이터가 삭제되었습니다.');
        navigate('/');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-purple-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            게임 설정
          </h1>
          <div className="flex gap-2">
            {hasUnsavedChanges && (
              <button
                onClick={saveSettings}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
              >
                💾 저장
              </button>
            )}
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
            >
              ← 메인으로
            </button>
          </div>
        </div>

        {/* Audio Settings */}
        <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            🔊 오디오 설정
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-white font-medium mb-2">
                마스터 볼륨: {settings.masterVolume}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.masterVolume}
                onChange={(e) => handleSettingChange('masterVolume', parseInt(e.target.value))}
                className="w-full h-2 bg-purple-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-white font-medium mb-2">
                음악 볼륨: {settings.musicVolume}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.musicVolume}
                onChange={(e) => handleSettingChange('musicVolume', parseInt(e.target.value))}
                className="w-full h-2 bg-purple-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-white font-medium mb-2">
                효과음 볼륨: {settings.soundVolume}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.soundVolume}
                onChange={(e) => handleSettingChange('soundVolume', parseInt(e.target.value))}
                className="w-full h-2 bg-purple-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-white font-medium mb-2">
                음성 볼륨: {settings.voiceVolume}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.voiceVolume}
                onChange={(e) => handleSettingChange('voiceVolume', parseInt(e.target.value))}
                className="w-full h-2 bg-purple-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Gameplay Settings */}
        <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            🎮 게임플레이 설정
          </h2>
          <div className="space-y-6">
            {/* Difficulty */}
            <div>
              <label className="block text-white font-medium mb-3">난이도</label>
              <div className="grid grid-cols-3 gap-3">
                {['easy', 'normal', 'hard'].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => handleSettingChange('difficulty', diff)}
                    className={`p-3 rounded-lg border transition ${
                      settings.difficulty === diff
                        ? 'bg-purple-600 border-purple-400 text-white'
                        : 'bg-purple-800/30 border-purple-600/30 text-purple-200 hover:bg-purple-700/40'
                    }`}
                  >
                    {diff === 'easy' && '🟢 쉬움'}
                    {diff === 'normal' && '🟡 보통'}
                    {diff === 'hard' && '🔴 어려움'}
                  </button>
                ))}
              </div>
            </div>

            {/* Boolean Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center space-x-3 text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoSave}
                  onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
                  className="form-checkbox h-5 w-5 text-purple-600 rounded"
                />
                <span>자동 저장</span>
              </label>

              <label className="flex items-center space-x-3 text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.fastText}
                  onChange={(e) => handleSettingChange('fastText', e.target.checked)}
                  className="form-checkbox h-5 w-5 text-purple-600 rounded"
                />
                <span>빠른 텍스트</span>
              </label>

              <label className="flex items-center space-x-3 text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.skipRead}
                  onChange={(e) => handleSettingChange('skipRead', e.target.checked)}
                  className="form-checkbox h-5 w-5 text-purple-600 rounded"
                />
                <span>읽은 텍스트 건너뛰기</span>
              </label>

              <label className="flex items-center space-x-3 text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.animations}
                  onChange={(e) => handleSettingChange('animations', e.target.checked)}
                  className="form-checkbox h-5 w-5 text-purple-600 rounded"
                />
                <span>애니메이션 효과</span>
              </label>
            </div>
          </div>
        </div>

        {/* Display Settings */}
        <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            🖥️ 화면 설정
          </h2>
          <div className="space-y-4">
            <label className="flex items-center space-x-3 text-white cursor-pointer">
              <input
                type="checkbox"
                checked={settings.fullscreen}
                onChange={(e) => handleSettingChange('fullscreen', e.target.checked)}
                className="form-checkbox h-5 w-5 text-purple-600 rounded"
              />
              <span>전체화면 모드</span>
            </label>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-white/20 mb-6">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            📁 데이터 관리
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={exportSettings}
              className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex items-center justify-center gap-2"
            >
              📤 설정 내보내기
            </button>

            <label className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center justify-center gap-2 cursor-pointer">
              📥 설정 가져오기
              <input
                type="file"
                accept=".json"
                onChange={importSettings}
                className="hidden"
              />
            </label>

            <button
              onClick={resetSettings}
              className="px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition flex items-center justify-center gap-2"
            >
              🔄 기본값으로
            </button>

            <button
              onClick={clearAllData}
              className="px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition flex items-center justify-center gap-2"
            >
              🗑️ 모든 데이터 삭제
            </button>
          </div>
        </div>

        {/* Save/Load Game */}
        <div className="bg-black/30 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            💾 저장/불러오기
          </h2>
          <div className="text-purple-200 space-y-4">
            <p>게임 저장과 불러오기는 게임 화면에서 사용할 수 있습니다.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-purple-500/20 p-4 rounded-lg">
                <h3 className="font-semibold text-white mb-2">자동 저장</h3>
                <p className="text-sm">주요 이벤트마다 자동으로 게임이 저장됩니다.</p>
              </div>
              <div className="bg-purple-500/20 p-4 rounded-lg">
                <h3 className="font-semibold text-white mb-2">수동 저장</h3>
                <p className="text-sm">게임 화면에서 언제든지 저장 버튼을 눌러 저장할 수 있습니다.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Unsaved Changes Warning */}
        {hasUnsavedChanges && (
          <div className="fixed bottom-4 right-4 bg-orange-600 text-white p-4 rounded-lg shadow-lg">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span>저장되지 않은 변경사항이 있습니다</span>
              <button
                onClick={saveSettings}
                className="ml-2 px-3 py-1 bg-white text-orange-600 rounded hover:bg-gray-100 transition"
              >
                저장
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;