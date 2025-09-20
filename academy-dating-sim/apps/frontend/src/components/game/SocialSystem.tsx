import React, { useState, useEffect } from 'react';
import { useGameStore } from '../../store/useGameStore';

interface Friend {
  id: string;
  name: string;
  level: number;
  status: 'online' | 'offline' | 'busy' | 'away';
  lastSeen: Date;
  friendshipLevel: number;
  avatar: string;
  mutualGuilds: string[];
  achievements: number;
  message?: string;
}

interface ChatMessage {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'gift' | 'invite' | 'achievement';
}

interface GiftItem {
  id: string;
  name: string;
  icon: string;
  friendshipPoints: number;
  cost: number;
}

const SocialSystem: React.FC = () => {
  const { player } = useGameStore();
  const [activeTab, setActiveTab] = useState<'friends' | 'chat' | 'search' | 'requests'>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<Friend[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showGiftModal, setShowGiftModal] = useState(false);

  const giftItems: GiftItem[] = [
    { id: 'flower', name: '꽃다발', icon: '💐', friendshipPoints: 10, cost: 50 },
    { id: 'chocolate', name: '초콜릿', icon: '🍫', friendshipPoints: 15, cost: 75 },
    { id: 'gem', name: '보석', icon: '💎', friendshipPoints: 30, cost: 150 },
    { id: 'letter', name: '편지', icon: '💌', friendshipPoints: 20, cost: 100 },
    { id: 'trophy', name: '트로피', icon: '🏆', friendshipPoints: 50, cost: 300 }
  ];

  const mockFriends: Friend[] = [
    {
      id: '1',
      name: 'Luna',
      level: 15,
      status: 'online',
      lastSeen: new Date(),
      friendshipLevel: 85,
      avatar: '🌙',
      mutualGuilds: ['Starlight'],
      achievements: 24,
      message: '던전 같이 가실 분~'
    },
    {
      id: '2',
      name: 'Phoenix',
      level: 22,
      status: 'busy',
      lastSeen: new Date(),
      friendshipLevel: 70,
      avatar: '🔥',
      mutualGuilds: ['Blaze', 'Starlight'],
      achievements: 45,
      message: '레이드 중'
    },
    {
      id: '3',
      name: 'Crystal',
      level: 18,
      status: 'offline',
      lastSeen: new Date(Date.now() - 3600000),
      friendshipLevel: 60,
      avatar: '💎',
      mutualGuilds: [],
      achievements: 31
    },
    {
      id: '4',
      name: 'Shadow',
      level: 25,
      status: 'away',
      lastSeen: new Date(),
      friendshipLevel: 45,
      avatar: '🌑',
      mutualGuilds: ['DarkKnights'],
      achievements: 67,
      message: 'AFK'
    },
    {
      id: '5',
      name: 'Aurora',
      level: 20,
      status: 'online',
      lastSeen: new Date(),
      friendshipLevel: 92,
      avatar: '🌟',
      mutualGuilds: ['Starlight'],
      achievements: 38,
      message: '낚시 중이에요 🎣'
    }
  ];

  const searchResults: Friend[] = [
    {
      id: '6',
      name: 'Blade',
      level: 30,
      status: 'online',
      lastSeen: new Date(),
      friendshipLevel: 0,
      avatar: '⚔️',
      mutualGuilds: [],
      achievements: 89
    },
    {
      id: '7',
      name: 'Rose',
      level: 16,
      status: 'online',
      lastSeen: new Date(),
      friendshipLevel: 0,
      avatar: '🌹',
      mutualGuilds: [],
      achievements: 22
    }
  ];

  useEffect(() => {
    setFriends(mockFriends.slice(0, 3));
    setFriendRequests(mockFriends.slice(3, 4));
  }, []);

  const sendMessage = () => {
    if (!chatInput.trim() || !selectedFriend) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: player.name,
      content: chatInput,
      timestamp: new Date(),
      type: 'text'
    };

    setChatMessages([...chatMessages, newMessage]);
    setChatInput('');
  };

  const sendGift = (gift: GiftItem) => {
    if (!selectedFriend) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: player.name,
      content: `${gift.icon} ${gift.name}을(를) 보냈습니다!`,
      timestamp: new Date(),
      type: 'gift'
    };

    setChatMessages([...chatMessages, newMessage]);

    // Update friendship level
    setFriends(friends.map(f =>
      f.id === selectedFriend.id
        ? { ...f, friendshipLevel: Math.min(100, f.friendshipLevel + gift.friendshipPoints / 5) }
        : f
    ));

    setShowGiftModal(false);
  };

  const acceptFriendRequest = (friend: Friend) => {
    setFriends([...friends, friend]);
    setFriendRequests(friendRequests.filter(f => f.id !== friend.id));
  };

  const sendFriendRequest = (friend: Friend) => {
    // In a real app, this would send a request to the other player
    alert(`${friend.name}에게 친구 요청을 보냈습니다!`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-red-500';
      case 'away': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getFriendshipLevelText = (level: number) => {
    if (level >= 90) return '절친';
    if (level >= 70) return '친한 친구';
    if (level >= 50) return '친구';
    if (level >= 30) return '아는 사이';
    return '새로운 친구';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-purple-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-black/30 backdrop-blur rounded-xl p-6 mb-6">
          <h1 className="text-4xl font-bold text-white">👥 소셜 시스템</h1>
          <div className="flex gap-2 mt-4">
            {(['friends', 'chat', 'search', 'requests'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {tab === 'friends' && '친구 목록'}
                {tab === 'chat' && '채팅'}
                {tab === 'search' && '친구 찾기'}
                {tab === 'requests' && `친구 요청 ${friendRequests.length > 0 ? `(${friendRequests.length})` : ''}`}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Friend List or Search */}
          <div className="lg:col-span-1">
            {activeTab === 'friends' && (
              <div className="bg-black/30 backdrop-blur rounded-xl p-4">
                <h2 className="text-xl font-bold text-white mb-4">친구 목록 ({friends.length})</h2>
                <div className="space-y-2">
                  {friends.map(friend => (
                    <div
                      key={friend.id}
                      onClick={() => setSelectedFriend(friend)}
                      className={`bg-white/10 rounded-lg p-3 cursor-pointer hover:bg-white/20 transition-all ${
                        selectedFriend?.id === friend.id ? 'ring-2 ring-pink-500' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="text-2xl">{friend.avatar}</div>
                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(friend.status)} rounded-full border-2 border-black`} />
                          </div>
                          <div>
                            <div className="text-white font-bold">{friend.name}</div>
                            <div className="text-xs text-white/70">Lv.{friend.level}</div>
                            {friend.message && (
                              <div className="text-xs text-white/50 italic">{friend.message}</div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-white/70">{getFriendshipLevelText(friend.friendshipLevel)}</div>
                          <div className="w-16 bg-gray-700 rounded-full h-1 mt-1">
                            <div
                              className="bg-gradient-to-r from-pink-500 to-purple-500 h-full rounded-full"
                              style={{ width: `${friend.friendshipLevel}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'search' && (
              <div className="bg-black/30 backdrop-blur rounded-xl p-4">
                <h2 className="text-xl font-bold text-white mb-4">친구 찾기</h2>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="플레이어 이름 검색..."
                  className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 mb-4"
                />
                <div className="space-y-2">
                  {searchResults
                    .filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(friend => (
                      <div key={friend.id} className="bg-white/10 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{friend.avatar}</div>
                            <div>
                              <div className="text-white font-bold">{friend.name}</div>
                              <div className="text-xs text-white/70">
                                Lv.{friend.level} • {friend.achievements} 업적
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => sendFriendRequest(friend)}
                            className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded text-sm font-bold hover:scale-105 transition-all"
                          >
                            친구 추가
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {activeTab === 'requests' && (
              <div className="bg-black/30 backdrop-blur rounded-xl p-4">
                <h2 className="text-xl font-bold text-white mb-4">친구 요청</h2>
                {friendRequests.length > 0 ? (
                  <div className="space-y-2">
                    {friendRequests.map(friend => (
                      <div key={friend.id} className="bg-white/10 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{friend.avatar}</div>
                            <div>
                              <div className="text-white font-bold">{friend.name}</div>
                              <div className="text-xs text-white/70">Lv.{friend.level}</div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => acceptFriendRequest(friend)}
                            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white py-1 rounded text-sm font-bold"
                          >
                            수락
                          </button>
                          <button
                            onClick={() => setFriendRequests(friendRequests.filter(f => f.id !== friend.id))}
                            className="flex-1 bg-red-500/20 text-red-400 py-1 rounded text-sm font-bold"
                          >
                            거절
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-white/50 py-8">
                    새로운 친구 요청이 없습니다
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Panel - Chat or Friend Details */}
          <div className="lg:col-span-2">
            {(activeTab === 'friends' || activeTab === 'chat') && selectedFriend ? (
              <div className="bg-black/30 backdrop-blur rounded-xl p-4 h-[600px] flex flex-col">
                {/* Friend Info */}
                <div className="bg-white/10 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl">{selectedFriend.avatar}</div>
                      <div>
                        <div className="text-xl font-bold text-white">{selectedFriend.name}</div>
                        <div className="text-white/70">
                          Lv.{selectedFriend.level} • {getFriendshipLevelText(selectedFriend.friendshipLevel)}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className={`w-2 h-2 ${getStatusColor(selectedFriend.status)} rounded-full`} />
                          <span className="text-sm text-white/50">{selectedFriend.status}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowGiftModal(true)}
                        className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-4 py-2 rounded-lg font-bold hover:scale-105 transition-all"
                      >
                        🎁 선물
                      </button>
                      <button className="bg-white/10 text-white px-4 py-2 rounded-lg font-bold hover:bg-white/20 transition-all">
                        👥 프로필
                      </button>
                    </div>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto mb-4 space-y-2">
                  {chatMessages.map(message => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === player.name ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          message.sender === player.name
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                            : 'bg-white/10 text-white'
                        }`}
                      >
                        {message.type === 'gift' && <div className="text-2xl mb-1 text-center">🎁</div>}
                        <div className="text-sm">{message.content}</div>
                        <div className="text-xs opacity-70 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Chat Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="메시지를 입력하세요..."
                    className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                  />
                  <button
                    onClick={sendMessage}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-lg font-bold hover:scale-105 transition-all"
                  >
                    전송
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-black/30 backdrop-blur rounded-xl p-8">
                <div className="text-center text-white/50">
                  <div className="text-6xl mb-4">💬</div>
                  <div className="text-xl">친구를 선택하여 대화를 시작하세요</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Gift Modal */}
        {showGiftModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-xl p-6 max-w-md w-full">
              <h3 className="text-2xl font-bold text-white mb-4">선물 보내기</h3>
              <div className="grid grid-cols-3 gap-3">
                {giftItems.map(gift => (
                  <button
                    key={gift.id}
                    onClick={() => sendGift(gift)}
                    className="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-all"
                  >
                    <div className="text-3xl mb-2">{gift.icon}</div>
                    <div className="text-sm text-white font-bold">{gift.name}</div>
                    <div className="text-xs text-white/70">{gift.cost} G</div>
                    <div className="text-xs text-green-400">+{gift.friendshipPoints} ❤️</div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowGiftModal(false)}
                className="w-full mt-4 bg-white/10 text-white py-2 rounded-lg font-bold hover:bg-white/20 transition-all"
              >
                취소
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialSystem;