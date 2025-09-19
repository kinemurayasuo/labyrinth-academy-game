import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface TitleScreenProps {
  onStart: () => void;
  onLoad: () => void;
  onSettings: () => void;
}

export function TitleScreen({ onStart, onLoad, onSettings }: TitleScreenProps) {
  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1630416995029-b91cea387e31?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2xvcmZ1bCUyMHJhaW5ib3clMjBza3klMjBjbG91ZHN8ZW58MXx8fHwxNzU3NDA2OTI4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Title Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-pink-400/30 via-purple-400/20 to-blue-400/30" />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, -60, -20],
              opacity: [0.2, 0.8, 0.2],
              rotate: [0, 360],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 5 + i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.3,
            }}
          >
            <span className="text-3xl">
              {['✨', '💫', '🌟', '💖', '🦋', '🌸', '🌈', '🎀', '💝', '🌙', '⭐', '🌺'][i]}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Title */}
      <motion.div
        className="absolute top-1/4 left-1/2 transform -translate-x-1/2 text-center"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
      >
        <motion.h1
          className="text-6xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent mb-4"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          ✨ 미미의 마법 학교 ✨
        </motion.h1>
        <motion.p
          className="text-xl text-purple-700 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          가장 귀여운 마법 모험이 시작됩니다! 💖
        </motion.p>
      </motion.div>

      {/* Menu */}
      <motion.div
        className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 space-y-4"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.5 }}
      >
        <Button
          onClick={onStart}
          className="w-64 h-14 text-lg bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white rounded-2xl shadow-xl border-2 border-white/50"
        >
          🌟 새로운 모험 시작하기
        </Button>
        <Button
          onClick={onLoad}
          variant="outline"
          className="w-64 h-14 text-lg bg-white/80 border-pink-300 text-purple-800 hover:bg-pink-50 rounded-2xl shadow-lg"
        >
          📖 이어서 하기
        </Button>
        <Button
          onClick={onSettings}
          variant="outline"
          className="w-64 h-14 text-lg bg-white/80 border-pink-300 text-purple-800 hover:bg-pink-50 rounded-2xl shadow-lg"
        >
          ⚙️ 설정
        </Button>
      </motion.div>

      {/* Credits */}
      <motion.div
        className="absolute bottom-4 right-4 text-purple-600 text-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        Made with 💖 by Figma Make
      </motion.div>
    </div>
  );
}