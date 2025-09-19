import { Button } from '../ui/button';
import { Play, Pause, SkipForward, Volume2 } from 'lucide-react';
import { motion } from 'motion/react';

interface GameControlsProps {
  isAutoMode: boolean;
  isSkipMode: boolean;
  isMuted: boolean;
  onToggleAuto: () => void;
  onToggleSkip: () => void;
  onToggleMute: () => void;
  onShowHistory: () => void;
}

export function GameControls({
  isAutoMode,
  isSkipMode,
  isMuted,
  onToggleAuto,
  onToggleSkip,
  onToggleMute,
  onShowHistory,
}: GameControlsProps) {
  return (
    <motion.div
      className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-white/90 backdrop-blur-sm border border-pink-200 rounded-2xl px-4 py-2 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      {/* Auto Mode Button */}
      <Button
        onClick={onToggleAuto}
        variant={isAutoMode ? "default" : "outline"}
        size="sm"
        className={`rounded-xl ${
          isAutoMode
            ? "bg-gradient-to-r from-pink-400 to-purple-400 text-white"
            : "bg-white/80 border-pink-300 text-purple-800 hover:bg-pink-50"
        }`}
      >
        {isAutoMode ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
        AUTO
      </Button>

      {/* Skip Mode Button */}
      <Button
        onClick={onToggleSkip}
        variant={isSkipMode ? "default" : "outline"}
        size="sm"
        className={`rounded-xl ${
          isSkipMode
            ? "bg-gradient-to-r from-orange-400 to-red-400 text-white"
            : "bg-white/80 border-pink-300 text-purple-800 hover:bg-pink-50"
        }`}
      >
        <SkipForward className="h-4 w-4 mr-1" />
        SKIP
      </Button>

      {/* Mute Button */}
      <Button
        onClick={onToggleMute}
        variant="outline"
        size="sm"
        className={`rounded-xl ${
          isMuted
            ? "bg-gray-400 text-white"
            : "bg-white/80 border-pink-300 text-purple-800 hover:bg-pink-50"
        }`}
      >
        <Volume2 className={`h-4 w-4 ${isMuted ? "opacity-50" : ""}`} />
      </Button>

      {/* History Button */}
      <Button
        onClick={onShowHistory}
        variant="outline"
        size="sm"
        className="rounded-xl bg-white/80 border-pink-300 text-purple-800 hover:bg-pink-50"
      >
        📚 LOG
      </Button>

      {/* Auto mode indicator */}
      {isAutoMode && (
        <motion.div
          className="flex items-center gap-1 text-xs text-purple-600"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <span>🎭</span>
          <span>자동 진행 중...</span>
        </motion.div>
      )}

      {/* Skip mode indicator */}
      {isSkipMode && (
        <motion.div
          className="flex items-center gap-1 text-xs text-orange-600"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          <span>⚡</span>
          <span>빠른 스킵 중...</span>
        </motion.div>
      )}
    </motion.div>
  );
}