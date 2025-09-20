import React from 'react';

interface MonsterPortraitProps {
  monsterId: string;
  size?: 'small' | 'medium' | 'large';
}

const MonsterPortrait: React.FC<MonsterPortraitProps> = ({ monsterId, size = 'medium' }) => {
  const sizeClasses = {
    small: 'text-2xl',
    medium: 'text-4xl',
    large: 'text-6xl'
  };

  return (
    <div className={`${sizeClasses[size]} flex items-center justify-center`}>
      <span>{monsterId}</span>
    </div>
  );
};

export default MonsterPortrait;