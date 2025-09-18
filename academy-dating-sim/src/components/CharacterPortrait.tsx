import React from 'react';

interface CharacterPortraitProps {
  characterId: string;
  emotion?: 'neutral' | 'happy' | 'sad' | 'angry' | 'surprised' | 'love';
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const CharacterPortrait: React.FC<CharacterPortraitProps> = ({
  characterId,
  emotion = 'neutral',
  size = 'medium',
  className = '',
}) => {
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32',
  };

  const getSakuraPortrait = (emotion: string) => {
    const faceColor = '#FFE5B4';
    const hairColor = '#2C1810';

    let eyeExpression = '';
    let mouthExpression = '';

    switch (emotion) {
      case 'happy':
        eyeExpression = '<circle cx="40" cy="45" r="2" fill="#000" opacity="0.8"/> <circle cx="60" cy="45" r="2" fill="#000" opacity="0.8"/>';
        mouthExpression = '<path d="M 45 55 Q 50 60 55 55" stroke="#FF6B6B" stroke-width="2" fill="none"/>';
        break;
      case 'sad':
        eyeExpression = '<circle cx="40" cy="47" r="2" fill="#000" opacity="0.8"/> <circle cx="60" cy="47" r="2" fill="#000" opacity="0.8"/>';
        mouthExpression = '<path d="M 45 60 Q 50 55 55 60" stroke="#4A90E2" stroke-width="2" fill="none"/>';
        break;
      case 'angry':
        eyeExpression = '<line x1="35" y1="42" x2="45" y2="47" stroke="#000" stroke-width="2"/> <line x1="55" y1="47" x2="65" y2="42" stroke="#000" stroke-width="2"/>';
        mouthExpression = '<line x1="45" y1="58" x2="55" y2="58" stroke="#FF0000" stroke-width="2"/>';
        break;
      case 'surprised':
        eyeExpression = '<circle cx="40" cy="45" r="3" fill="#000" opacity="0.8"/> <circle cx="60" cy="45" r="3" fill="#000" opacity="0.8"/>';
        mouthExpression = '<ellipse cx="50" cy="58" rx="3" ry="5" fill="#000" opacity="0.6"/>';
        break;
      case 'love':
        eyeExpression = '<path d="M 35 42 L 40 47 L 45 42 L 42.5 39 L 40 40 L 37.5 39 Z" fill="#FF69B4"/> <path d="M 55 42 L 60 47 L 65 42 L 62.5 39 L 60 40 L 57.5 39 Z" fill="#FF69B4"/>';
        mouthExpression = '<path d="M 45 55 Q 50 60 55 55" stroke="#FF1493" stroke-width="2" fill="none"/>';
        break;
      default:
        eyeExpression = '<circle cx="40" cy="45" r="2" fill="#000" opacity="0.8"/> <circle cx="60" cy="45" r="2" fill="#000" opacity="0.8"/>';
        mouthExpression = '<line x1="47" y1="58" x2="53" y2="58" stroke="#666" stroke-width="1"/>';
    }

    return `
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <!-- Background circle -->
        <circle cx="50" cy="50" r="48" fill="linear-gradient(135deg, #FF6B9D, #C44569)" stroke="#fff" stroke-width="2"/>

        <!-- Hair -->
        <path d="M 20 40 Q 50 15 80 40 Q 75 30 50 25 Q 25 30 20 40" fill="${hairColor}"/>
        <path d="M 15 45 Q 20 35 30 40 Q 25 50 15 55 Z" fill="${hairColor}"/>
        <path d="M 70 40 Q 80 35 85 45 Q 75 50 85 55 Z" fill="${hairColor}"/>

        <!-- Face -->
        <ellipse cx="50" cy="55" rx="25" ry="30" fill="${faceColor}"/>

        <!-- Eyes -->
        ${eyeExpression}

        <!-- Nose -->
        <circle cx="50" cy="50" r="1" fill="#DEB887" opacity="0.5"/>

        <!-- Mouth -->
        ${mouthExpression}

        <!-- Blush -->
        <circle cx="30" cy="52" r="3" fill="#FFB6C1" opacity="0.6"/>
        <circle cx="70" cy="52" r="3" fill="#FFB6C1" opacity="0.6"/>

        <!-- Hair accessories -->
        <circle cx="25" cy="35" r="2" fill="#FF4757"/>
        <circle cx="75" cy="35" r="2" fill="#FF4757"/>
      </svg>
    `;
  };

  const getYukiPortrait = (emotion: string) => {
    const faceColor = '#FFEEE6';
    const hairColor = '#4A4A4A';

    let eyeExpression = '';
    let mouthExpression = '';

    switch (emotion) {
      case 'happy':
        eyeExpression = '<circle cx="40" cy="45" r="2" fill="#4A90E2"/> <circle cx="60" cy="45" r="2" fill="#4A90E2"/>';
        mouthExpression = '<path d="M 45 55 Q 50 60 55 55" stroke="#FF6B6B" stroke-width="2" fill="none"/>';
        break;
      case 'sad':
        eyeExpression = '<circle cx="40" cy="47" r="2" fill="#4A90E2"/> <circle cx="60" cy="47" r="2" fill="#4A90E2"/>';
        mouthExpression = '<path d="M 45 60 Q 50 55 55 60" stroke="#4A90E2" stroke-width="2" fill="none"/>';
        break;
      case 'love':
        eyeExpression = '<path d="M 35 42 L 40 47 L 45 42 L 42.5 39 L 40 40 L 37.5 39 Z" fill="#FF69B4"/> <path d="M 55 42 L 60 47 L 65 42 L 62.5 39 L 60 40 L 57.5 39 Z" fill="#FF69B4"/>';
        mouthExpression = '<path d="M 45 55 Q 50 60 55 55" stroke="#FF1493" stroke-width="2" fill="none"/>';
        break;
      default:
        eyeExpression = '<circle cx="40" cy="45" r="2" fill="#4A90E2"/> <circle cx="60" cy="45" r="2" fill="#4A90E2"/>';
        mouthExpression = '<line x1="47" y1="58" x2="53" y2="58" stroke="#666" stroke-width="1"/>';
    }

    return `
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <!-- Background circle -->
        <circle cx="50" cy="50" r="48" fill="linear-gradient(135deg, #A8E6CF, #7FCDCD)" stroke="#fff" stroke-width="2"/>

        <!-- Hair -->
        <path d="M 25 35 Q 50 20 75 35 Q 70 25 50 22 Q 30 25 25 35" fill="${hairColor}"/>
        <rect x="45" y="22" width="10" height="25" fill="${hairColor}"/>

        <!-- Face -->
        <ellipse cx="50" cy="55" rx="23" ry="28" fill="${faceColor}"/>

        <!-- Eyes -->
        ${eyeExpression}

        <!-- Glasses -->
        <circle cx="40" cy="45" r="8" fill="none" stroke="#333" stroke-width="1"/>
        <circle cx="60" cy="45" r="8" fill="none" stroke="#333" stroke-width="1"/>
        <line x1="48" y1="45" x2="52" y2="45" stroke="#333" stroke-width="1"/>

        <!-- Nose -->
        <circle cx="50" cy="50" r="1" fill="#DEB887" opacity="0.5"/>

        <!-- Mouth -->
        ${mouthExpression}

        <!-- Blush -->
        <circle cx="28" cy="52" r="2" fill="#FFB6C1" opacity="0.4"/>
        <circle cx="72" cy="52" r="2" fill="#FFB6C1" opacity="0.4"/>

        <!-- Book -->
        <rect x="15" y="70" width="12" height="8" fill="#8B4513" rx="1"/>
        <line x1="21" y1="70" x2="21" y2="78" stroke="#654321" stroke-width="1"/>
      </svg>
    `;
  };

  const getLunaPortrait = (emotion: string) => {
    const faceColor = '#FFE8D6';
    const hairColor = '#FFD700';

    let eyeExpression = '';
    let mouthExpression = '';

    switch (emotion) {
      case 'happy':
        eyeExpression = '<circle cx="40" cy="45" r="2" fill="#9B59B6"/> <circle cx="60" cy="45" r="2" fill="#9B59B6"/>';
        mouthExpression = '<path d="M 45 55 Q 50 60 55 55" stroke="#FF6B6B" stroke-width="2" fill="none"/>';
        break;
      case 'love':
        eyeExpression = '<path d="M 35 42 L 40 47 L 45 42 L 42.5 39 L 40 40 L 37.5 39 Z" fill="#FF69B4"/> <path d="M 55 42 L 60 47 L 65 42 L 62.5 39 L 60 40 L 57.5 39 Z" fill="#FF69B4"/>';
        mouthExpression = '<path d="M 45 55 Q 50 60 55 55" stroke="#FF1493" stroke-width="2" fill="none"/>';
        break;
      default:
        eyeExpression = '<circle cx="40" cy="45" r="2" fill="#9B59B6"/> <circle cx="60" cy="45" r="2" fill="#9B59B6"/>';
        mouthExpression = '<path d="M 45 55 Q 50 58 55 55" stroke="#FF6B6B" stroke-width="2" fill="none"/>';
    }

    return `
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <!-- Background circle -->
        <circle cx="50" cy="50" r="48" fill="linear-gradient(135deg, #FFB347, #FFCC5C)" stroke="#fff" stroke-width="2"/>

        <!-- Hair -->
        <path d="M 20 38 Q 50 18 80 38 Q 75 28 50 23 Q 25 28 20 38" fill="${hairColor}"/>
        <path d="M 15 42 Q 25 32 35 38 Q 30 48 20 52" fill="${hairColor}"/>
        <path d="M 65 38 Q 75 32 85 42 Q 80 48 70 52" fill="${hairColor}"/>

        <!-- Face -->
        <ellipse cx="50" cy="55" rx="24" ry="29" fill="${faceColor}"/>

        <!-- Eyes -->
        ${eyeExpression}

        <!-- Nose -->
        <circle cx="50" cy="50" r="1" fill="#DEB887" opacity="0.5"/>

        <!-- Mouth -->
        ${mouthExpression}

        <!-- Blush -->
        <circle cx="29" cy="52" r="3" fill="#FFB6C1" opacity="0.6"/>
        <circle cx="71" cy="52" r="3" fill="#FFB6C1" opacity="0.6"/>

        <!-- Magic sparkles -->
        <circle cx="20" cy="25" r="1" fill="#FFD700"/>
        <circle cx="80" cy="30" r="1" fill="#FFD700"/>
        <circle cx="85" cy="60" r="1" fill="#FFD700"/>
        <circle cx="15" cy="65" r="1" fill="#FFD700"/>

        <!-- Star accessory -->
        <path d="M 70 30 L 72 35 L 77 35 L 73 38 L 75 43 L 70 40 L 65 43 L 67 38 L 63 35 L 68 35 Z" fill="#9B59B6"/>
      </svg>
    `;
  };

  const getMysteryPortrait = (emotion: string) => {
    const faceColor = '#F5F5DC';
    const hairColor = '#2C2C2C';

    let eyeExpression = '';
    let mouthExpression = '';

    switch (emotion) {
      case 'happy':
        eyeExpression = '<circle cx="40" cy="45" r="2" fill="#8E44AD"/> <circle cx="60" cy="45" r="2" fill="#8E44AD"/>';
        mouthExpression = '<path d="M 45 55 Q 50 60 55 55" stroke="#666" stroke-width="2" fill="none"/>';
        break;
      case 'love':
        eyeExpression = '<path d="M 35 42 L 40 47 L 45 42 L 42.5 39 L 40 40 L 37.5 39 Z" fill="#FF69B4"/> <path d="M 55 42 L 60 47 L 65 42 L 62.5 39 L 60 40 L 57.5 39 Z" fill="#FF69B4"/>';
        mouthExpression = '<path d="M 45 55 Q 50 60 55 55" stroke="#FF1493" stroke-width="2" fill="none"/>';
        break;
      default:
        eyeExpression = '<circle cx="40" cy="45" r="2" fill="#8E44AD"/> <circle cx="60" cy="45" r="2" fill="#8E44AD"/>';
        mouthExpression = '<line x1="47" y1="58" x2="53" y2="58" stroke="#666" stroke-width="1"/>';
    }

    return `
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <!-- Background circle -->
        <circle cx="50" cy="50" r="48" fill="linear-gradient(135deg, #2C3E50, #34495E)" stroke="#fff" stroke-width="2"/>

        <!-- Hair -->
        <path d="M 18 40 Q 50 15 82 40 Q 77 25 50 20 Q 23 25 18 40" fill="${hairColor}"/>
        <path d="M 12 48 Q 18 38 28 42 Q 23 52 12 58" fill="${hairColor}"/>
        <path d="M 72 42 Q 82 38 88 48 Q 77 52 88 58" fill="${hairColor}"/>

        <!-- Face (partially in shadow) -->
        <ellipse cx="50" cy="55" rx="25" ry="30" fill="${faceColor}"/>
        <path d="M 25 45 Q 35 40 50 45 L 50 85 Q 35 80 25 75 Z" fill="#000" opacity="0.3"/>

        <!-- Eyes -->
        ${eyeExpression}

        <!-- Nose -->
        <circle cx="50" cy="50" r="1" fill="#DEB887" opacity="0.5"/>

        <!-- Mouth -->
        ${mouthExpression}

        <!-- Mystery mask -->
        <path d="M 35 35 Q 50 32 65 35 Q 60 42 50 40 Q 40 42 35 35" fill="#000" opacity="0.7"/>

        <!-- Mysterious aura -->
        <circle cx="30" cy="20" r="1" fill="#9B59B6" opacity="0.8"/>
        <circle cx="70" cy="25" r="1" fill="#9B59B6" opacity="0.8"/>
        <circle cx="85" cy="70" r="1" fill="#9B59B6" opacity="0.8"/>
        <circle cx="15" cy="75" r="1" fill="#9B59B6" opacity="0.8"/>
      </svg>
    `;
  };

  const getHeroPortrait = (emotion: string) => {
    const faceColor = '#FDBCB4';
    const hairColor = '#8B4513';

    let eyeExpression = '';
    let mouthExpression = '';

    switch (emotion) {
      case 'happy':
        eyeExpression = '<circle cx="40" cy="45" r="2" fill="#654321"/> <circle cx="60" cy="45" r="2" fill="#654321"/>';
        mouthExpression = '<path d="M 45 55 Q 50 60 55 55" stroke="#FF6B6B" stroke-width="2" fill="none"/>';
        break;
      case 'determined':
        eyeExpression = '<line x1="35" y1="42" x2="45" y2="47" stroke="#654321" stroke-width="2"/> <line x1="55" y1="47" x2="65" y2="42" stroke="#654321" stroke-width="2"/>';
        mouthExpression = '<line x1="45" y1="58" x2="55" y2="58" stroke="#333" stroke-width="2"/>';
        break;
      default:
        eyeExpression = '<circle cx="40" cy="45" r="2" fill="#654321"/> <circle cx="60" cy="45" r="2" fill="#654321"/>';
        mouthExpression = '<line x1="47" y1="58" x2="53" y2="58" stroke="#666" stroke-width="1"/>';
    }

    return `
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <!-- Background circle -->
        <circle cx="50" cy="50" r="48" fill="linear-gradient(135deg, #3498DB, #2980B9)" stroke="#fff" stroke-width="2"/>

        <!-- Hair -->
        <path d="M 22 38 Q 50 18 78 38 Q 73 28 50 23 Q 27 28 22 38" fill="${hairColor}"/>
        <path d="M 18 45 Q 28 35 38 40 Q 33 50 23 55" fill="${hairColor}"/>
        <path d="M 62 40 Q 72 35 82 45 Q 77 50 67 55" fill="${hairColor}"/>

        <!-- Face -->
        <ellipse cx="50" cy="55" rx="24" ry="29" fill="${faceColor}"/>

        <!-- Eyes -->
        ${eyeExpression}

        <!-- Nose -->
        <circle cx="50" cy="50" r="1" fill="#DEB887" opacity="0.7"/>

        <!-- Mouth -->
        ${mouthExpression}

        <!-- Sword emblem -->
        <rect x="75" y="15" width="2" height="15" fill="#C0C0C0"/>
        <rect x="73" y="12" width="6" height="3" fill="#FFD700"/>
      </svg>
    `;
  };

  const renderPortrait = () => {
    switch (characterId) {
      case 'sakura':
        return <div dangerouslySetInnerHTML={{ __html: getSakuraPortrait(emotion) }} />;
      case 'yuki':
        return <div dangerouslySetInnerHTML={{ __html: getYukiPortrait(emotion) }} />;
      case 'luna':
        return <div dangerouslySetInnerHTML={{ __html: getLunaPortrait(emotion) }} />;
      case 'mystery':
        return <div dangerouslySetInnerHTML={{ __html: getMysteryPortrait(emotion) }} />;
      case 'hero':
        return <div dangerouslySetInnerHTML={{ __html: getHeroPortrait(emotion) }} />;
      default:
        return (
          <div className="w-full h-full bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center text-white text-2xl">
            ?
          </div>
        );
    }
  };

  return (
    <div className={`${sizeClasses[size]} ${className} rounded-full overflow-hidden shadow-lg border-2 border-white/20`}>
      {renderPortrait()}
    </div>
  );
};

export default CharacterPortrait;