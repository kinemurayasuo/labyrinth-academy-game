import { useState, useEffect } from 'react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { DialogueBox } from './dialogue-box';
import { CharacterDisplay } from './character-display';
import { GameMenu } from './game-menu';
import { TitleScreen } from './title-screen';
import { HistoryLog } from './history-log';
import { GameControls } from './game-controls';
import { motion } from 'motion/react';

interface DialogueNode {
  id: string;
  character: string;
  text: string;
  background?: string;
  characters: Array<{
    name: string;
    image: string;
    position: 'left' | 'center' | 'right';
  }>;
  choices?: Array<{
    text: string;
    nextId: string;
  }>;
  nextId?: string;
}

interface HistoryEntry {
  character: string;
  text: string;
  timestamp: Date;
}

const sampleStory: DialogueNode[] = [
  {
    id: 'start',
    character: '미미',
    text: '안녕하세요! 저는 미미예요! 💖 마법 학교에 오신 것을 진심으로 환영해요!',
    background: 'https://images.unsplash.com/photo-1594386006951-487f1aa6de4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWdpY2FsJTIwc2Nob29sJTIwYWNhZGVteSUyMGJhY2tncm91bmR8ZW58MXx8fHwxNzU3NDExOTQ2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    characters: [
      {
        name: '미미',
        image: 'https://images.unsplash.com/photo-1673047233994-78df05226bfc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrYXdhaWklMjBhbmltZSUyMGdpcmwlMjBjaGFyYWN0ZXJ8ZW58MXx8fHwxNzU3NDA2OTI1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        position: 'center'
      }
    ],
    nextId: 'intro2'
  },
  {
    id: 'intro2',
    character: '미미',
    text: '여기는 별빛 마법 학교예요! ✨ 오늘부터 저와 함께 마법을 배워볼까요?',
    background: 'https://images.unsplash.com/photo-1594386006951-487f1aa6de4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWdpY2FsJTIwc2Nob29sJTIwYWNhZGVteSUyMGJhY2tncm91bmR8ZW58MXx8fHwxNzU7NDExOTQ2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    characters: [
      {
        name: '미미',
        image: 'https://images.unsplash.com/photo-1673047233994-78df05226bfc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrYXdhaWklMjBhbmltZSUyMGdpcmwlMjBjaGFyYWN0ZXJ8ZW58MXx8fHwxNzU3NDA2OTI1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        position: 'center'
      }
    ],
    nextId: 'meetLuna'
  },
  {
    id: 'meetLuna',
    character: '루나',
    text: '어? 새로운 학생이구나! 🌙 나는 루나야! 달의 마법을 전공하고 있어!',
    background: 'https://images.unsplash.com/photo-1594386006951-487f1aa6de4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWdpY2FsJTIwc2Nob29sJTIwYWNhZGVteSUyMGJhY2tncm91bmR8ZW58MXx8fHwxNzU3NDExOTQ2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    characters: [
      {
        name: '미미',
        image: 'https://images.unsplash.com/photo-1673047233994-78df05226bfc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrYXdhaWklMjBhbmltZSUyMGdpcmwlMjBjaGFyYWN0ZXJ8ZW58MXx8fHwxNzU3NDA2OTI1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        position: 'left'
      },
      {
        name: '루나',
        image: 'https://images.unsplash.com/photo-1663035310226-8203dfbe03d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltZSUyMGdpcmwlMjBibHVlJTIwaGFpciUyMGNoYXJhY3RlcnxlbnwxfHx8fDE3NTc0MTE5Mzh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        position: 'right'
      }
    ],
    nextId: 'meetKai'
  },
  {
    id: 'meetKai',
    character: '카이',
    text: '안녕! 🔥 나는 카이! 불의 마법이 특기야! 함께 공부해보자!',
    background: 'https://images.unsplash.com/photo-1594386006951-487f1aa6de4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWdpY2FsJTIwc2Nob29sJTIwYWNhZGVteSUyMGJhY2tncm91bmR8ZW58MXx8fHwxNzU3NDExOTQ2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    characters: [
      {
        name: '루나',
        image: 'https://images.unsplash.com/photo-1663035310226-8203dfbe03d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltZSUyMGdpcmwlMjBibHVlJTIwaGFpciUyMGNoYXJhY3RlcnxlbnwxfHx8fDE3NTc0MTE5Mzh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        position: 'left'
      },
      {
        name: '카이',
        image: 'https://images.unsplash.com/photo-1727466443068-779e1f8fe8e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwYW5pbWUlMjBib3klMjBjaGFyYWN0ZXJ8ZW58MXx8fHwxNzU3NDExOTQyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        position: 'center'
      },
      {
        name: '미미',
        image: 'https://images.unsplash.com/photo-1673047233994-78df05226bfc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrYXdhaWklMjBhbmltZSUyMGdpcmwlMjBjaGFyYWN0ZXJ8ZW58MXx8fHwxNzU3NDA2OTI1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        position: 'right'
      }
    ],
    nextId: 'choice1'
  },
  {
    id: 'choice1',
    character: '미미',
    text: '와! 모두 만나서 반가워요! 💖 이제 어떤 마법을 먼저 배워볼까요?',
    background: 'https://images.unsplash.com/photo-1594386006951-487f1aa6de4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWdpY2FsJTIwc2Nob29sJTIwYWNhZGVteSUyMGJhY2tncm91bmR8ZW58MXx8fHwxNzU3NDExOTQ2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    characters: [
      {
        name: '루나',
        image: 'https://images.unsplash.com/photo-1663035310226-8203dfbe03d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltZSUyMGdpcmwlMjBibHVlJTIwaGFpciUyMGNoYXJhY3RlcnxlbnwxfHx8fDE3NTc0MTE5Mzh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        position: 'left'
      },
      {
        name: '미미',
        image: 'https://images.unsplash.com/photo-1673047233994-78df05226bfc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrYXdhaWklMjBhbmltZSUyMGdpcmwlMjBjaGFyYWN0ZXJ8ZW58MXx8fHwxNzU3NDA2OTI1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        position: 'center'
      },
      {
        name: '카이',
        image: 'https://images.unsplash.com/photo-1727466443068-779e1f8fe8e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwYW5pbWUlMjBib3klMjBjaGFyYWN0ZXJ8ZW58MXx8fHwxNzU3NDExOTQyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        position: 'right'
      }
    ],
    choices: [
      { text: '🌙 루나와 함께 달의 마법 배우기', nextId: 'lunaMagic' },
      { text: '🔥 카이와 함께 불의 마법 배우기', nextId: 'kaiMagic' },
      { text: '🌸 미미와 함께 꽃의 마법 배우기', nextId: 'mimiMagic' }
    ]
  },
  {
    id: 'lunaMagic',
    character: '루나',
    text: '좋은 선택이야! 🌙✨ 달의 마법은 마음을 평온하게 해주고 치유의 힘이 있어! 같이 연습해보자!',
    background: 'https://images.unsplash.com/photo-1630416995029-b91cea387e31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvcmZ1bCUyMHJhaW5ib3clMjBza3klMjBjbG91ZHN8ZW58MXx8fHwxNzU3NDA2OTI4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    characters: [
      {
        name: '루나',
        image: 'https://images.unsplash.com/photo-1663035310226-8203dfbe03d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltZSUyMGdpcmwlMjBibHVlJTIwaGFpciUyMGNoYXJhY3RlcnxlbnwxfHx8fDE3NTc0MTE5Mzh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        position: 'center'
      }
    ],
    nextId: 'cafe'
  },
  {
    id: 'kaiMagic',
    character: '카이',
    text: '오호! 🔥💫 불의 마법은 열정과 용기의 마법이야! 하지만 조심해야 해! 같이 안전하게 연습해보자!',
    background: 'https://images.unsplash.com/photo-1630416995029-b91cea387e31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvcmZ1bCUyMHJhaW5ib3clMjBza3klMjBjbG91ZHN8ZW58MXx8fHwxNzU3NDA2OTI4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    characters: [
      {
        name: '카이',
        image: 'https://images.unsplash.com/photo-1727466443068-779e1f8fe8e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwYW5pbWUlMjBib3klMjBjaGFyYWN0ZXJ8ZW58MXx8fHwxNzU3NDExOTQyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        position: 'center'
      }
    ],
    nextId: 'cafe'
  },
  {
    id: 'mimiMagic',
    character: '미미',
    text: '와! 💖🌸 꽃의 마법은 생명과 사랑의 마법이에요! 모든 것을 아름답게 만들어 줄 거예요!',
    background: 'https://images.unsplash.com/photo-1713048296604-3d73f70859bb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVycnklMjBibG9zc29tJTIwcGFyayUyMHNwcmluZ3xlbnwxfHx8fDE3NTc0MDY5MzF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    characters: [
      {
        name: '미미',
        image: 'https://images.unsplash.com/photo-1673047233994-78df05226bfc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrYXdhaWklMjBhbmltZSUyMGdpcmwlMjBjaGFyYWN0ZXJ8ZW58MXx8fHwxNzU3NDA2OTI1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        position: 'center'
      }
    ],
    nextId: 'cafe'
  },
  {
    id: 'cafe',
    character: '미미',
    text: '마법 연습 후에는 다같이 마법 카페에서 휴식을 취해요! ☕✨ 특별한 마법 차를 마시러 가볼까요?',
    background: 'https://images.unsplash.com/photo-1756140017272-7ea9a443a70e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwY2FmZSUyMGludGVyaW9yJTIwa2F3YWlpfGVufDF8fHx8MTc1NzQxMTk1MXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    characters: [
      {
        name: '루나',
        image: 'https://images.unsplash.com/photo-1663035310226-8203dfbe03d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltZSUyMGdpcmwlMjBibHVlJTIwaGFpciUyMGNoYXJhY3RlcnxlbnwxfHx8fDE3NTc0MTE5Mzh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        position: 'left'
      },
      {
        name: '미미',
        image: 'https://images.unsplash.com/photo-1673047233994-78df05226bfc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrYXdhaWklMjBhbmltZSUyMGdpcmwlMjBjaGFyYWN0ZXJ8ZW58MXx8fHwxNzU3NDA2OTI1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        position: 'center'
      },
      {
        name: '카이',
        image: 'https://images.unsplash.com/photo-1727466443068-779e1f8fe8e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwYW5pbWUlMjBib3klMjBjaGFyYWN0ZXJ8ZW58MXx8fHwxNzU3NDExOTQyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        position: 'right'
      }
    ],
    nextId: 'ending'
  },
  {
    id: 'ending',
    character: '미미',
    text: '오늘 정말 즐거웠어요! 💖✨ 내일도 함께 더 멋진 마법을 배워봐요! 우리의 모험은 계속됩니다!',
    background: 'https://images.unsplash.com/photo-1700206839404-320a637aef55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwcGFzdGVsJTIwZmxvd2VyJTIwbWVhZG93fGVufDF8fHx8MTc1NzQwNjkyMXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    characters: [
      {
        name: '루나',
        image: 'https://images.unsplash.com/photo-1663035310226-8203dfbe03d7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltZSUyMGdpcmwlMjBibHVlJTIwaGFpciUyMGNoYXJhY3RlcnxlbnwxfHx8fDE3NTc0MTE5Mzh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        position: 'left'
      },
      {
        name: '미미',
        image: 'https://images.unsplash.com/photo-1673047233994-78df05226bfc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxrYXdhaWklMjBhbmltZSUyMGdpcmwlMjBjaGFyYWN0ZXJ8ZW58MXx8fHwxNzU3NDA2OTI1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        position: 'center'
      },
      {
        name: '카이',
        image: 'https://images.unsplash.com/photo-1727466443068-779e1f8fe8e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwYW5pbWUlMjBib3klMjBjaGFyYWN0ZXJ8ZW58MXx8fHwxNzU3NDExOTQyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        position: 'right'
      }
    ],
    nextId: 'start'
  }
];

export function VisualNovelGame() {
  const [gameState, setGameState] = useState<'title' | 'playing'>('title');
  const [currentNodeId, setCurrentNodeId] = useState('start');
  const [textIndex, setTextIndex] = useState(0);
  const [isTextComplete, setIsTextComplete] = useState(false);
  const [bgmVolume, setBgmVolume] = useState(70);
  const [sfxVolume, setSfxVolume] = useState(80);
  const [autoPlay, setAutoPlay] = useState(false);
  const [skipMode, setSkipMode] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  const currentNode = sampleStory.find(node => node.id === currentNodeId);

  // Add to history when dialogue changes
  useEffect(() => {
    if (currentNode && gameState === 'playing') {
      const newEntry: HistoryEntry = {
        character: currentNode.character,
        text: currentNode.text,
        timestamp: new Date()
      };
      setHistory(prev => [...prev, newEntry]);
    }
  }, [currentNodeId, gameState]);

  // Text animation effect
  useEffect(() => {
    if (currentNode && gameState === 'playing') {
      setTextIndex(0);
      setIsTextComplete(false);
      
      const speed = skipMode ? 5 : 30;
      const interval = setInterval(() => {
        setTextIndex(prev => {
          if (prev >= currentNode.text.length) {
            setIsTextComplete(true);
            clearInterval(interval);
            return prev;
          }
          return prev + 1;
        });
      }, speed);

      return () => clearInterval(interval);
    }
  }, [currentNode, skipMode, gameState]);

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && isTextComplete && currentNode?.nextId && !currentNode.choices && gameState === 'playing') {
      const delay = skipMode ? 500 : 2000;
      const timer = setTimeout(() => {
        handleNext();
      }, delay);
      
      return () => clearTimeout(timer);
    }
  }, [autoPlay, isTextComplete, currentNode, skipMode, gameState]);

  const handleNext = () => {
    if (currentNode?.nextId) {
      setCurrentNodeId(currentNode.nextId);
    }
  };

  const handleChoice = (nextId: string) => {
    setCurrentNodeId(nextId);
  };

  const handleStartGame = () => {
    setGameState('playing');
    setCurrentNodeId('start');
    setHistory([]);
  };

  const handleSave = () => {
    localStorage.setItem('vnSave', JSON.stringify({
      currentNodeId,
      history,
      timestamp: new Date().toISOString()
    }));
    alert('게임이 저장되었습니다! 💖');
  };

  const handleLoad = () => {
    const saved = localStorage.getItem('vnSave');
    if (saved) {
      const saveData = JSON.parse(saved);
      setCurrentNodeId(saveData.currentNodeId);
      setHistory(saveData.history || []);
      setGameState('playing');
      alert('게임을 불러왔습니다! ✨');
    } else {
      alert('저장된 게임이 없습니다. 😢');
    }
  };

  const handleRestart = () => {
    setCurrentNodeId('start');
    setHistory([]);
    alert('게임을 처음부터 시작합니다! 🌟');
  };

  const handleShowSettings = () => {
    // Settings will be handled by GameMenu
  };

  const handleClick = () => {
    if (gameState !== 'playing') return;
    
    if (!isTextComplete) {
      setTextIndex(currentNode?.text.length || 0);
      setIsTextComplete(true);
    } else if (currentNode?.nextId && !currentNode.choices) {
      handleNext();
    }
  };

  // Title screen
  if (gameState === 'title') {
    return (
      <TitleScreen
        onStart={handleStartGame}
        onLoad={handleLoad}
        onSettings={handleShowSettings}
      />
    );
  }

  if (!currentNode) return null;

  const displayedText = currentNode.text.slice(0, textIndex);
  const choices = currentNode.choices?.map(choice => ({
    text: choice.text,
    action: () => handleChoice(choice.nextId)
  }));

  return (
    <div className="relative w-full h-screen overflow-hidden cursor-pointer bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100" onClick={handleClick}>
      {/* Floating decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -40, -20],
              opacity: [0.3, 0.7, 0.3],
              rotate: [0, 360],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.5,
            }}
          >
            <span className="text-2xl">
              {['✨', '💫', '🌟', '💖', '🦋', '🌸'][i]}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Background */}
      <motion.div
        key={currentNode.background}
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0"
      >
        <ImageWithFallback
          src={currentNode.background || ''}
          alt="Background"
          className="w-full h-full object-cover rounded-3xl mx-4 my-4"
          style={{ width: 'calc(100% - 2rem)', height: 'calc(100% - 2rem)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-pink-200/20 via-transparent to-purple-200/20 rounded-3xl mx-4 my-4" />
      </motion.div>

      {/* Character Display */}
      <CharacterDisplay
        characters={currentNode.characters}
        activeCharacter={currentNode.character}
      />

      {/* Game Menu */}
      <GameMenu
        onSave={handleSave}
        onLoad={handleLoad}
        onRestart={handleRestart}
        bgmVolume={bgmVolume}
        sfxVolume={sfxVolume}
        onBgmVolumeChange={setBgmVolume}
        onSfxVolumeChange={setSfxVolume}
        autoPlay={autoPlay}
        onAutoPlayChange={setAutoPlay}
      />

      {/* Game Controls */}
      <GameControls
        isAutoMode={autoPlay}
        isSkipMode={skipMode}
        isMuted={isMuted}
        onToggleAuto={() => setAutoPlay(!autoPlay)}
        onToggleSkip={() => setSkipMode(!skipMode)}
        onToggleMute={() => setIsMuted(!isMuted)}
        onShowHistory={() => setShowHistory(true)}
      />

      {/* History Log */}
      <HistoryLog
        history={history}
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
      />

      {/* Dialogue Box */}
      <DialogueBox
        characterName={currentNode.character}
        text={displayedText}
        isComplete={isTextComplete}
        onNext={handleNext}
        choices={choices}
      />
    </div>
  );
}