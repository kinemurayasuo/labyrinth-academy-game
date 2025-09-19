import { ImageWithFallback } from '../figma/ImageWithFallback';
import { motion } from 'motion/react';

interface Character {
  name: string;
  image: string;
  position: 'left' | 'center' | 'right';
  emotion?: 'normal' | 'happy' | 'sad' | 'angry';
}

interface CharacterDisplayProps {
  characters: Character[];
  activeCharacter?: string;
}

export function CharacterDisplay({ characters, activeCharacter }: CharacterDisplayProps) {
  const getPositionClasses = (position: Character['position']) => {
    switch (position) {
      case 'left':
        return 'left-0 transform -translate-x-1/4';
      case 'center':
        return 'left-1/2 transform -translate-x-1/2';
      case 'right':
        return 'right-0 transform translate-x-1/4';
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {characters.map((character, index) => (
        <motion.div
          key={`${character.name}-${index}`}
          className={`absolute bottom-60 ${getPositionClasses(character.position)}`}
          initial={{ opacity: 0, y: 50 }}
          animate={{ 
            opacity: activeCharacter === character.name ? 1 : 0.7,
            y: activeCharacter === character.name ? -30 : -20,
            scale: activeCharacter === character.name ? 1.1 : 0.9
          }}
          transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
        >
          <div className="relative">
            <ImageWithFallback
              src={character.image}
              alt={character.name}
              className="h-96 w-auto object-cover drop-shadow-2xl rounded-3xl"
            />
            
            {/* Character glow effect when active */}
            {activeCharacter === character.name && (
              <>
                <div className="absolute inset-0 bg-gradient-to-t from-pink-300/30 to-purple-300/30 rounded-3xl blur-2xl -z-10" />
                
                {/* Floating hearts animation */}
                <motion.div
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                  animate={{
                    y: [-10, -30, -10],
                    opacity: [0.8, 1, 0.8]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <span className="text-2xl">💕</span>
                </motion.div>
                
                <motion.div
                  className="absolute -top-6 left-1/4 transform -translate-x-1/2"
                  animate={{
                    y: [-15, -35, -15],
                    opacity: [0.6, 1, 0.6]
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                >
                  <span className="text-lg">✨</span>
                </motion.div>
                
                <motion.div
                  className="absolute -top-8 right-1/4 transform translate-x-1/2"
                  animate={{
                    y: [-20, -40, -20],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                >
                  <span className="text-xl">🌟</span>
                </motion.div>
              </>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}