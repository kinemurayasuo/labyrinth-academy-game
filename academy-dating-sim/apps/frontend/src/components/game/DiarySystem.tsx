import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../../store/useGameStore';

interface DiaryEntry {
  id: string;
  date: string;
  day: number;
  timeOfDay: string;
  title: string;
  content: string;
  mood: string;
  tags: string[];
  memories: string[];
  createdAt: number;
}

const DiarySystem: React.FC = () => {
  const navigate = useNavigate();
  const player = useGameStore((state: any) => state.player);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [isWriting, setIsWriting] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState<string | null>(null);

  // New entry form state
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newMood, setNewMood] = useState('평온함');
  const [newTags, setNewTags] = useState<string[]>([]);
  const [newMemories, setNewMemories] = useState<string[]>([]);

  // Available moods
  const moods = [
    { id: 'happy', label: '행복함', emoji: '😊' },
    { id: 'excited', label: '신남', emoji: '🎉' },
    { id: 'peaceful', label: '평온함', emoji: '😌' },
    { id: 'romantic', label: '설렘', emoji: '💕' },
    { id: 'sad', label: '슬픔', emoji: '😢' },
    { id: 'confused', label: '혼란', emoji: '😕' },
    { id: 'determined', label: '결연함', emoji: '💪' },
    { id: 'nostalgic', label: '그리움', emoji: '🌅' }
  ];

  // Tag suggestions based on player activities
  const getTagSuggestions = () => {
    const suggestions = ['일상', '모험', '친구', '공부', '훈련'];

    // Add heroine names if met
    Object.keys(player.affection).forEach(heroine => {
      if ((player.affection[heroine] || 0) > 0) {
        suggestions.push(heroine);
      }
    });

    // Add location-based tags
    if (player.location) {
      suggestions.push(player.location);
    }

    return [...new Set(suggestions)];
  };

  // Load diary entries from localStorage
  useEffect(() => {
    const savedEntries = localStorage.getItem('diaryEntries');
    if (savedEntries) {
      setDiaryEntries(JSON.parse(savedEntries));
    }
  }, []);

  // Save diary entries to localStorage
  const saveEntries = (entries: DiaryEntry[]) => {
    localStorage.setItem('diaryEntries', JSON.stringify(entries));
    setDiaryEntries(entries);
  };

  // Create new diary entry
  const handleCreateEntry = () => {
    if (!newTitle.trim() || !newContent.trim()) {
      alert('제목과 내용을 입력해주세요!');
      return;
    }

    const newEntry: DiaryEntry = {
      id: `diary-${Date.now()}`,
      date: new Date().toLocaleDateString('ko-KR'),
      day: player.day,
      timeOfDay: player.timeOfDay,
      title: newTitle,
      content: newContent,
      mood: newMood,
      tags: newTags,
      memories: newMemories,
      createdAt: Date.now()
    };

    const updatedEntries = [newEntry, ...diaryEntries];
    saveEntries(updatedEntries);

    // Reset form
    setNewTitle('');
    setNewContent('');
    setNewMood('평온함');
    setNewTags([]);
    setNewMemories([]);
    setIsWriting(false);

    // Add small experience reward for writing
    const { addExperience } = useGameStore.getState().actions;
    addExperience(5);
  };

  // Delete diary entry
  const handleDeleteEntry = (entryId: string) => {
    if (confirm('이 일기를 삭제하시겠습니까?')) {
      const updatedEntries = diaryEntries.filter(entry => entry.id !== entryId);
      saveEntries(updatedEntries);
      setSelectedEntry(null);
    }
  };

  // Add tag to new entry
  const addTag = (tag: string) => {
    if (!newTags.includes(tag)) {
      setNewTags([...newTags, tag]);
    }
  };

  // Remove tag from new entry
  const removeTag = (tag: string) => {
    setNewTags(newTags.filter(t => t !== tag));
  };

  // Generate auto-fill suggestions based on day's activities
  const getAutoSuggestions = () => {
    const suggestions = [];

    // Check recent activities
    if (player.level > 1) {
      suggestions.push(`오늘 레벨 ${player.level}에 도달했다!`);
    }

    // Check affection changes
    Object.keys(player.affection).forEach(heroine => {
      if ((player.affection[heroine] || 0) >= 20) {
        suggestions.push(`${heroine}와의 관계가 깊어지고 있다.`);
      }
    });

    return suggestions;
  };

  // Filter entries based on search and tags
  const filteredEntries = diaryEntries.filter(entry => {
    const matchesSearch = !searchTerm ||
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTag = !filterTag || entry.tags.includes(filterTag);

    return matchesSearch && matchesTag;
  });

  // Get all unique tags from all entries
  const allTags = [...new Set(diaryEntries.flatMap(entry => entry.tags))];

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-black/50 backdrop-blur-md rounded-lg shadow-lg p-6 mb-6 border border-border">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mb-2">
                📖 나의 일기장
              </h1>
              <p className="text-text-secondary">
                매일의 추억과 감정을 기록하세요
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setIsWriting(true)}
                className="px-6 py-3 bg-primary hover:bg-secondary text-white rounded-lg transition font-bold"
              >
                ✍️ 일기 쓰기
              </button>
              <button
                onClick={() => navigate('/game')}
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition"
              >
                🏠 돌아가기
              </button>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-black/30 backdrop-blur-md rounded-lg p-4 mb-6 border border-border">
          <div className="flex justify-between items-center">
            <div className="flex gap-6">
              <div className="text-text-primary">
                📝 총 일기: <span className="font-bold text-accent">{diaryEntries.length}</span>개
              </div>
              <div className="text-text-primary">
                📅 Day {player.day} - {getTimeKorean(player.timeOfDay)}
              </div>
              <div className="text-text-primary">
                📍 {player.location || '학교'}
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        {!isWriting && !selectedEntry && (
          <div className="bg-black/30 backdrop-blur-md rounded-lg p-4 mb-6 border border-border">
            <div className="flex gap-4 items-center">
              <input
                type="text"
                placeholder="일기 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 bg-black/50 border border-border rounded-lg text-text-primary"
              />
              <select
                value={filterTag || ''}
                onChange={(e) => setFilterTag(e.target.value || null)}
                className="px-4 py-2 bg-black/50 border border-border rounded-lg text-text-primary"
              >
                <option value="">모든 태그</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Entry List */}
          {!isWriting && !selectedEntry && (
            <>
              {filteredEntries.length > 0 ? (
                filteredEntries.map(entry => (
                  <div
                    key={entry.id}
                    onClick={() => setSelectedEntry(entry)}
                    className="bg-black/50 backdrop-blur-md rounded-lg p-6 border border-border hover:border-primary cursor-pointer transition-all hover:scale-105"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-text-primary mb-1">
                          {entry.title}
                        </h3>
                        <p className="text-sm text-text-secondary">
                          Day {entry.day} - {entry.date}
                        </p>
                      </div>
                      <span className="text-2xl">
                        {moods.find(m => m.label === entry.mood)?.emoji || '📝'}
                      </span>
                    </div>
                    <p className="text-text-secondary line-clamp-3 mb-3">
                      {entry.content}
                    </p>
                    {entry.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {entry.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="text-xs bg-primary/20 text-primary px-2 py-1 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-16">
                  <div className="text-6xl mb-4">📚</div>
                  <p className="text-text-secondary text-lg">
                    {searchTerm || filterTag
                      ? '검색 결과가 없습니다.'
                      : '아직 작성한 일기가 없습니다. 첫 일기를 써보세요!'}
                  </p>
                </div>
              )}
            </>
          )}

          {/* Writing Mode */}
          {isWriting && (
            <div className="lg:col-span-3 bg-black/50 backdrop-blur-md rounded-lg p-8 border border-border">
              <h2 className="text-2xl font-bold text-text-primary mb-6">
                새 일기 작성
              </h2>

              {/* Title Input */}
              <div className="mb-6">
                <label className="block text-text-secondary mb-2">제목</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="오늘의 제목을 입력하세요..."
                  className="w-full px-4 py-3 bg-black/50 border border-border rounded-lg text-text-primary"
                />
              </div>

              {/* Mood Selection */}
              <div className="mb-6">
                <label className="block text-text-secondary mb-2">오늘의 기분</label>
                <div className="grid grid-cols-4 gap-3">
                  {moods.map(mood => (
                    <button
                      key={mood.id}
                      onClick={() => setNewMood(mood.label)}
                      className={`px-4 py-3 rounded-lg border-2 transition ${
                        newMood === mood.label
                          ? 'border-primary bg-primary/20'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <span className="text-2xl mr-2">{mood.emoji}</span>
                      <span className="text-text-primary">{mood.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content Input */}
              <div className="mb-6">
                <label className="block text-text-secondary mb-2">내용</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="오늘 있었던 일들을 자유롭게 적어보세요..."
                  rows={10}
                  className="w-full px-4 py-3 bg-black/50 border border-border rounded-lg text-text-primary"
                />
                {/* Auto-suggestions */}
                {getAutoSuggestions().length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-text-secondary mb-2">추천 내용:</p>
                    <div className="flex flex-wrap gap-2">
                      {getAutoSuggestions().map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => setNewContent(prev => prev + '\n' + suggestion)}
                          className="text-xs bg-purple-600/20 text-purple-400 px-2 py-1 rounded hover:bg-purple-600/30"
                        >
                          + {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Tags */}
              <div className="mb-6">
                <label className="block text-text-secondary mb-2">태그</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {newTags.map(tag => (
                    <span
                      key={tag}
                      className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      #{tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="text-red-400 hover:text-red-300"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2">
                  {getTagSuggestions().map(tag => (
                    !newTags.includes(tag) && (
                      <button
                        key={tag}
                        onClick={() => addTag(tag)}
                        className="text-sm bg-gray-700 text-gray-300 px-3 py-1 rounded-full hover:bg-gray-600"
                      >
                        + {tag}
                      </button>
                    )
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleCreateEntry}
                  className="flex-1 px-6 py-3 bg-primary hover:bg-secondary text-white rounded-lg font-bold transition"
                >
                  💾 저장하기
                </button>
                <button
                  onClick={() => {
                    setIsWriting(false);
                    setNewTitle('');
                    setNewContent('');
                    setNewMood('평온함');
                    setNewTags([]);
                  }}
                  className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold transition"
                >
                  취소
                </button>
              </div>
            </div>
          )}

          {/* Reading Mode */}
          {selectedEntry && (
            <div className="lg:col-span-3 bg-black/50 backdrop-blur-md rounded-lg p-8 border border-border">
              {/* Entry Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-text-primary mb-2">
                    {selectedEntry.title}
                  </h2>
                  <div className="flex gap-4 text-text-secondary">
                    <span>📅 Day {selectedEntry.day}</span>
                    <span>🕐 {selectedEntry.date}</span>
                    <span>
                      {moods.find(m => m.label === selectedEntry.mood)?.emoji} {selectedEntry.mood}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="text-2xl text-text-secondary hover:text-text-primary"
                >
                  ✕
                </button>
              </div>

              {/* Entry Content */}
              <div className="bg-black/30 rounded-lg p-6 mb-6">
                <p className="text-text-primary whitespace-pre-wrap leading-relaxed">
                  {selectedEntry.content}
                </p>
              </div>

              {/* Tags */}
              {selectedEntry.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-text-primary mb-3">태그</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedEntry.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-primary/20 text-primary px-3 py-1 rounded-full"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Memories */}
              {selectedEntry.memories && selectedEntry.memories.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-text-primary mb-3">특별한 기억</h3>
                  <div className="space-y-2">
                    {selectedEntry.memories.map((memory, index) => (
                      <div
                        key={index}
                        className="bg-purple-600/20 text-purple-300 px-4 py-2 rounded-lg"
                      >
                        💭 {memory}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={() => handleDeleteEntry(selectedEntry.id)}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition"
                >
                  🗑️ 삭제
                </button>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-bold transition"
                >
                  돌아가기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function
const getTimeKorean = (time: string) => {
  const korean: Record<string, string> = {
    morning: '아침',
    noon: '점심',
    afternoon: '오후',
    evening: '저녁',
    night: '밤',
  };
  return korean[time] || time;
};

export default DiarySystem;