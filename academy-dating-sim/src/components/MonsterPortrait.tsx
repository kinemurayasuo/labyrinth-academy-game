import React from 'react';

interface MonsterPortraitProps {
  monsterId: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const MonsterPortrait: React.FC<MonsterPortraitProps> = ({
  monsterId,
  size = 'medium',
  className = '',
}) => {
  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-16 h-16',
    large: 'w-24 h-24',
  };

  const getSlimePortrait = () => {
    return `
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <!-- Body -->
        <ellipse cx="50" cy="65" rx="35" ry="25" fill="linear-gradient(135deg, #7FDBFF, #0074D9)"/>
        <ellipse cx="50" cy="60" rx="30" ry="20" fill="linear-gradient(135deg, #87CEEB, #4682B4)"/>

        <!-- Eyes -->
        <circle cx="40" cy="55" r="4" fill="#FFFFFF"/>
        <circle cx="60" cy="55" r="4" fill="#FFFFFF"/>
        <circle cx="40" cy="55" r="2" fill="#000000"/>
        <circle cx="60" cy="55" r="2" fill="#000000"/>

        <!-- Mouth -->
        <ellipse cx="50" cy="65" rx="3" ry="2" fill="#FF4136"/>

        <!-- Shine effect -->
        <ellipse cx="45" cy="50" rx="8" ry="6" fill="#FFFFFF" opacity="0.3"/>
      </svg>
    `;
  };

  const getGoblinPortrait = () => {
    return `
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <!-- Background -->
        <circle cx="50" cy="50" r="48" fill="linear-gradient(135deg, #2ECC40, #27AE60)"/>

        <!-- Head -->
        <ellipse cx="50" cy="55" rx="25" ry="30" fill="#8FBC8F"/>

        <!-- Ears -->
        <ellipse cx="25" cy="45" rx="8" ry="15" fill="#8FBC8F" transform="rotate(-30 25 45)"/>
        <ellipse cx="75" cy="45" rx="8" ry="15" fill="#8FBC8F" transform="rotate(30 75 45)"/>

        <!-- Eyes -->
        <circle cx="42" cy="48" r="3" fill="#FF0000"/>
        <circle cx="58" cy="48" r="3" fill="#FF0000"/>

        <!-- Nose -->
        <polygon points="50,52 48,58 52,58" fill="#006400"/>

        <!-- Mouth -->
        <path d="M 45 62 Q 50 67 55 62" stroke="#000" stroke-width="2" fill="none"/>

        <!-- Teeth -->
        <polygon points="47,62 49,65 51,62" fill="#FFFFFF"/>
        <polygon points="51,62 53,65 55,62" fill="#FFFFFF"/>

        <!-- Scars -->
        <line x1="35" y1="40" x2="40" y2="45" stroke="#556B2F" stroke-width="1"/>
        <line x1="65" y1="42" x2="70" y2="47" stroke="#556B2F" stroke-width="1"/>
      </svg>
    `;
  };

  const getSkeletonPortrait = () => {
    return `
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <!-- Background -->
        <circle cx="50" cy="50" r="48" fill="linear-gradient(135deg, #34495E, #2C3E50)"/>

        <!-- Skull -->
        <ellipse cx="50" cy="50" rx="22" ry="25" fill="#F8F8FF"/>

        <!-- Eye sockets -->
        <circle cx="42" cy="45" r="5" fill="#000000"/>
        <circle cx="58" cy="45" r="5" fill="#000000"/>

        <!-- Glowing eyes -->
        <circle cx="42" cy="45" r="2" fill="#FF4500"/>
        <circle cx="58" cy="45" r="2" fill="#FF4500"/>

        <!-- Nasal cavity -->
        <polygon points="50,50 48,58 52,58" fill="#000000"/>

        <!-- Jaw -->
        <rect x="45" y="60" width="10" height="8" fill="#F8F8FF"/>

        <!-- Teeth -->
        <rect x="46" y="60" width="1" height="4" fill="#000000"/>
        <rect x="48" y="60" width="1" height="4" fill="#000000"/>
        <rect x="50" y="60" width="1" height="4" fill="#000000"/>
        <rect x="52" y="60" width="1" height="4" fill="#000000"/>
        <rect x="54" y="60" width="1" height="4" fill="#000000"/>

        <!-- Cracks -->
        <path d="M 35 40 Q 38 42 35 45" stroke="#DDD" stroke-width="1" fill="none"/>
        <path d="M 65 35 Q 62 38 65 42" stroke="#DDD" stroke-width="1" fill="none"/>
      </svg>
    `;
  };

  const getOrcPortrait = () => {
    return `
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <!-- Background -->
        <circle cx="50" cy="50" r="48" fill="linear-gradient(135deg, #8B4513, #A0522D)"/>

        <!-- Head -->
        <ellipse cx="50" cy="55" rx="28" ry="32" fill="#CD853F"/>

        <!-- Tusks -->
        <polygon points="40,65 38,72 42,70" fill="#FFFAF0"/>
        <polygon points="60,65 62,72 58,70" fill="#FFFAF0"/>

        <!-- Eyes -->
        <circle cx="42" cy="48" r="3" fill="#8B0000"/>
        <circle cx="58" cy="48" r="3" fill="#8B0000"/>

        <!-- Nose -->
        <ellipse cx="50" cy="55" rx="4" ry="3" fill="#A0522D"/>
        <circle cx="48" cy="55" r="1" fill="#000"/>
        <circle cx="52" cy="55" r="1" fill="#000"/>

        <!-- Mouth -->
        <path d="M 42 62 Q 50 68 58 62" stroke="#000" stroke-width="2" fill="#8B0000"/>

        <!-- Scars -->
        <line x1="30" y1="42" x2="38" y2="48" stroke="#654321" stroke-width="2"/>
        <line x1="65" y1="40" x2="72" y2="46" stroke="#654321" stroke-width="2"/>

        <!-- War paint -->
        <line x1="35" y1="50" x2="42" y2="45" stroke="#FF0000" stroke-width="2"/>
        <line x1="58" y1="45" x2="65" y2="50" stroke="#FF0000" stroke-width="2"/>
      </svg>
    `;
  };

  const getDragonPortrait = () => {
    return `
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <!-- Background -->
        <circle cx="50" cy="50" r="48" fill="linear-gradient(135deg, #DC143C, #B22222)"/>

        <!-- Head -->
        <ellipse cx="50" cy="55" rx="30" ry="28" fill="#8B0000"/>

        <!-- Snout -->
        <ellipse cx="50" cy="65" rx="18" ry="12" fill="#A0522D"/>

        <!-- Horns -->
        <polygon points="35,30 40,15 45,30" fill="#2F4F4F"/>
        <polygon points="55,30 60,15 65,30" fill="#2F4F4F"/>

        <!-- Eyes -->
        <circle cx="42" cy="48" r="4" fill="#FFD700"/>
        <circle cx="58" cy="48" r="4" fill="#FFD700"/>
        <ellipse cx="42" cy="48" rx="1" ry="3" fill="#000"/>
        <ellipse cx="58" cy="48" rx="1" ry="3" fill="#000"/>

        <!-- Nostrils -->
        <ellipse cx="47" cy="65" rx="2" ry="3" fill="#000"/>
        <ellipse cx="53" cy="65" rx="2" ry="3" fill="#000"/>

        <!-- Mouth -->
        <path d="M 35 70 Q 50 75 65 70" stroke="#000" stroke-width="2" fill="none"/>

        <!-- Fangs -->
        <polygon points="45,70 47,78 49,70" fill="#FFFAF0"/>
        <polygon points="51,70 53,78 55,70" fill="#FFFAF0"/>

        <!-- Scales -->
        <circle cx="35" cy="50" r="2" fill="#654321" opacity="0.5"/>
        <circle cx="65" cy="52" r="2" fill="#654321" opacity="0.5"/>
        <circle cx="40" cy="60" r="2" fill="#654321" opacity="0.5"/>
        <circle cx="60" cy="58" r="2" fill="#654321" opacity="0.5"/>

        <!-- Fire effect -->
        <circle cx="30" cy="75" r="1" fill="#FF4500" opacity="0.8"/>
        <circle cx="70" cy="77" r="1" fill="#FF4500" opacity="0.8"/>
        <circle cx="25" cy="80" r="1" fill="#FF6347" opacity="0.8"/>
        <circle cx="75" cy="82" r="1" fill="#FF6347" opacity="0.8"/>
      </svg>
    `;
  };

  const renderPortrait = () => {
    switch (monsterId) {
      case 'slime':
        return <div dangerouslySetInnerHTML={{ __html: getSlimePortrait() }} />;
      case 'goblin':
        return <div dangerouslySetInnerHTML={{ __html: getGoblinPortrait() }} />;
      case 'skeleton':
        return <div dangerouslySetInnerHTML={{ __html: getSkeletonPortrait() }} />;
      case 'orc':
        return <div dangerouslySetInnerHTML={{ __html: getOrcPortrait() }} />;
      case 'dragon':
        return <div dangerouslySetInnerHTML={{ __html: getDragonPortrait() }} />;
      default:
        return (
          <div className="w-full h-full bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center text-white text-lg">
            👹
          </div>
        );
    }
  };

  return (
    <div className={`${sizeClasses[size]} ${className} rounded-lg overflow-hidden shadow-md border border-red-500/30`}>
      {renderPortrait()}
    </div>
  );
};

export default MonsterPortrait;