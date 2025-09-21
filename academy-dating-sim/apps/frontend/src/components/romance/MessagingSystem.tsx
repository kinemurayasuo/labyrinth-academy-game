import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardHeader, CardContent, Input } from '../ui';
import {
  ConversationThread,
  Message,
  MessageChoice,
  CharacterMood,
  RelationshipStage
} from '../../types/romance';

// Mock character data - would come from store in real app
const CHARACTERS = [
  { id: 'sakura', name: '사쿠라', avatar: '🌸', status: 'online' },
  { id: 'yuki', name: '유키', avatar: '❄️', status: 'online' },
  { id: 'luna', name: '루나', avatar: '🌙', status: 'away' },
  { id: 'aria', name: '아리아', avatar: '🎵', status: 'offline' },
];

const MessagingSystem: React.FC = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Record<string, ConversationThread>>({});
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Initialize conversations
  useEffect(() => {
    const initialConversations: Record<string, ConversationThread> = {};
    CHARACTERS.forEach(char => {
      initialConversations[char.id] = {
        characterId: char.id,
        messages: [],
        lastActivity: Date.now(),
        unreadCount: 0,
        relationshipStage: 'acquaintance',
        mood: 'neutral',
      };
    });
    setConversations(initialConversations);
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, selectedCharacter]);

  const getMoodEmoji = (mood: CharacterMood): string => {
    const moodEmojis: Record<CharacterMood, string> = {
      happy: '😊',
      neutral: '😐',
      sad: '😢',
      angry: '😠',
      excited: '😄',
      shy: '😳',
      flirty: '😏',
    };
    return moodEmojis[mood] || '😐';
  };

  const getRelationshipEmoji = (stage: RelationshipStage): string => {
    const stageEmojis: Record<RelationshipStage, string> = {
      stranger: '👤',
      acquaintance: '🤝',
      friend: '👫',
      closeFriend: '💛',
      romantic: '💕',
      lover: '❤️',
    };
    return stageEmojis[stage] || '👤';
  };

  const sendMessage = useCallback(() => {
    if (!inputMessage.trim() || !selectedCharacter) return;

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      fromCharacterId: 'player',
      toCharacterId: selectedCharacter,
      content: inputMessage,
      timestamp: Date.now(),
      read: true,
      type: 'text',
    };

    setConversations(prev => ({
      ...prev,
      [selectedCharacter]: {
        ...prev[selectedCharacter],
        messages: [...prev[selectedCharacter].messages, newMessage],
        lastActivity: Date.now(),
      },
    }));

    setInputMessage('');

    // Simulate character typing and response
    setIsTyping(true);
    setTimeout(() => {
      simulateCharacterResponse(selectedCharacter);
      setIsTyping(false);
    }, 1500 + Math.random() * 1500);
  }, [inputMessage, selectedCharacter]);

  const simulateCharacterResponse = (characterId: string) => {
    const character = CHARACTERS.find(c => c.id === characterId);
    if (!character) return;

    const responses = {
      sakura: [
        '안녕하세요! 오늘은 날씨가 정말 좋네요~ 🌸',
        '도서관에서 공부하고 있어요. 같이 할래요?',
        '오늘 카페테리아 메뉴가 맛있대요!',
        '수업 끝나고 시간 있으세요?',
      ],
      yuki: [
        '...안녕.',
        '훈련장에 있어. 혹시 대련하고 싶어?',
        '오늘은 조금 피곤하네.',
        '나중에 얘기할까?',
      ],
      luna: [
        '반가워요! 별이 아름다운 밤이에요 ✨',
        '천문관측실에서 별을 보고 있어요~',
        '오늘 밤 유성우를 볼 수 있대요!',
        '마법 수업 과제 다 했어요?',
      ],
      aria: [
        '안녕하세요~ 방금 연습 끝났어요 🎵',
        '새로운 곡을 연습하고 있어요!',
        '음악실에서 만날까요?',
        '오늘 기분이 좋네요!',
      ],
    };

    const characterResponses = responses[characterId as keyof typeof responses] || ['...'];
    const responseText = characterResponses[Math.floor(Math.random() * characterResponses.length)];

    const response: Message = {
      id: `msg-${Date.now()}`,
      fromCharacterId: characterId,
      toCharacterId: 'player',
      content: responseText,
      timestamp: Date.now(),
      read: false,
      type: 'text',
      affectionChange: Math.random() > 0.7 ? 1 : 0,
    };

    setConversations(prev => ({
      ...prev,
      [characterId]: {
        ...prev[characterId],
        messages: [...prev[characterId].messages, response],
        lastActivity: Date.now(),
        unreadCount: prev[characterId].unreadCount + 1,
        mood: Math.random() > 0.5 ? 'happy' : 'neutral',
      },
    }));
  };

  const handleChoiceSelect = (choice: MessageChoice, characterId: string) => {
    const playerMessage: Message = {
      id: `msg-${Date.now()}`,
      fromCharacterId: 'player',
      toCharacterId: characterId,
      content: choice.text,
      timestamp: Date.now(),
      read: true,
      type: 'choice',
    };

    setConversations(prev => ({
      ...prev,
      [characterId]: {
        ...prev[characterId],
        messages: [...prev[characterId].messages, playerMessage],
        lastActivity: Date.now(),
      },
    }));

    // Apply affection change
    if (choice.affectionChange) {
      // This would update the global affection state
      console.log(`Affection change: ${choice.affectionChange}`);
    }

    // Trigger next message if specified
    if (choice.nextMessageId) {
      setTimeout(() => {
        simulateCharacterResponse(characterId);
      }, 1000);
    }
  };

  const markAsRead = (characterId: string) => {
    setConversations(prev => ({
      ...prev,
      [characterId]: {
        ...prev[characterId],
        unreadCount: 0,
        messages: prev[characterId].messages.map(msg => ({ ...msg, read: true })),
      },
    }));
  };

  const selectedConversation = selectedCharacter ? conversations[selectedCharacter] : null;
  const selectedCharacterData = CHARACTERS.find(c => c.id === selectedCharacter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto">
        <Card variant="glass" className="h-[calc(100vh-2rem)]">
          <div className="flex h-full">
            {/* Character List */}
            <div className="w-80 border-r border-border/50 flex flex-col">
              <CardHeader className="border-b border-border/50">
                <h2 className="text-xl font-bold text-text-primary">💬 메시지</h2>
              </CardHeader>
              <div className="flex-1 overflow-y-auto">
                {CHARACTERS.map(character => {
                  const conv = conversations[character.id];
                  const isSelected = selectedCharacter === character.id;

                  return (
                    <div
                      key={character.id}
                      className={`
                        p-4 border-b border-border/30 cursor-pointer transition-all
                        ${isSelected ? 'bg-primary/20' : 'hover:bg-white/5'}
                      `}
                      onClick={() => {
                        setSelectedCharacter(character.id);
                        markAsRead(character.id);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-2xl">
                            {character.avatar}
                          </div>
                          <div className={`
                            absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background
                            ${character.status === 'online' ? 'bg-green-500' :
                              character.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'}
                          `} />
                        </div>

                        {/* Character Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-text-primary">
                              {character.name}
                            </span>
                            {conv && (
                              <>
                                <span className="text-sm">
                                  {getMoodEmoji(conv.mood)}
                                </span>
                                <span className="text-sm">
                                  {getRelationshipEmoji(conv.relationshipStage)}
                                </span>
                              </>
                            )}
                          </div>
                          <div className="text-sm text-text-secondary truncate">
                            {conv?.messages.length > 0
                              ? conv.messages[conv.messages.length - 1].content
                              : '대화를 시작해보세요!'}
                          </div>
                        </div>

                        {/* Unread Badge */}
                        {conv?.unreadCount > 0 && (
                          <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-xs font-bold text-white">
                            {conv.unreadCount}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Conversation View */}
            <div className="flex-1 flex flex-col">
              {selectedConversation && selectedCharacterData ? (
                <>
                  {/* Conversation Header */}
                  <CardHeader className="border-b border-border/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-xl">
                          {selectedCharacterData.avatar}
                        </div>
                        <div>
                          <div className="font-semibold text-text-primary">
                            {selectedCharacterData.name}
                          </div>
                          <div className="text-xs text-text-secondary">
                            {selectedCharacterData.status === 'online' ? '온라인' :
                             selectedCharacterData.status === 'away' ? '자리비움' : '오프라인'}
                            {isTyping && ' • 입력 중...'}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/characters/${selectedCharacter}`)}
                      >
                        프로필 보기
                      </Button>
                    </div>
                  </CardHeader>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {selectedConversation.messages.length === 0 ? (
                      <div className="text-center text-text-secondary py-8">
                        <p className="mb-2">아직 대화 내역이 없습니다.</p>
                        <p className="text-sm">첫 메시지를 보내보세요!</p>
                      </div>
                    ) : (
                      selectedConversation.messages.map((message) => {
                        const isPlayer = message.fromCharacterId === 'player';
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isPlayer ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`
                              max-w-md px-4 py-2 rounded-2xl
                              ${isPlayer
                                ? 'bg-primary text-white rounded-br-sm'
                                : 'bg-surface text-text-primary rounded-bl-sm'}
                            `}>
                              <div>{message.content}</div>
                              {message.affectionChange && message.affectionChange > 0 && (
                                <div className="text-xs mt-1 opacity-70">
                                  호감도 +{message.affectionChange} 💕
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-surface px-4 py-2 rounded-2xl rounded-bl-sm">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-text-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-border/50">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        sendMessage();
                      }}
                      className="flex gap-2"
                    >
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="메시지를 입력하세요..."
                        disabled={isTyping}
                        className="flex-1"
                      />
                      <Button
                        type="submit"
                        variant="primary"
                        disabled={!inputMessage.trim() || isTyping}
                      >
                        전송
                      </Button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-text-secondary">
                  <div className="text-center">
                    <div className="text-6xl mb-4">💬</div>
                    <p>대화할 캐릭터를 선택하세요</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MessagingSystem;