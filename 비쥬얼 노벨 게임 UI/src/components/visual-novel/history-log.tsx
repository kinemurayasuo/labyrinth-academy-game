import { motion } from 'motion/react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { ScrollArea } from '../ui/scroll-area';
import { History, X } from 'lucide-react';

interface HistoryEntry {
  character: string;
  text: string;
  timestamp: Date;
}

interface HistoryLogProps {
  history: HistoryEntry[];
  isOpen: boolean;
  onClose: () => void;
}

export function HistoryLog({ history, isOpen, onClose }: HistoryLogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[80vh] bg-gradient-to-br from-pink-50/95 to-purple-50/95 backdrop-blur-sm border-pink-200 rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-purple-800 flex items-center gap-2">
            📚 대화 기록
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-4">
            {history.length === 0 ? (
              <div className="text-center text-purple-600 py-8">
                <p>아직 대화 기록이 없어요! 💫</p>
              </div>
            ) : (
              history.map((entry, index) => (
                <motion.div
                  key={index}
                  className="bg-white/60 border border-pink-200 rounded-2xl p-4 shadow-sm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-pink-600 bg-pink-100 px-3 py-1 rounded-full">
                      💖 {entry.character}
                    </span>
                    <span className="text-xs text-purple-400">
                      {entry.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-purple-800 leading-relaxed">{entry.text}</p>
                </motion.div>
              ))
            )}
          </div>
        </ScrollArea>
        
        <div className="flex justify-end pt-4 border-t border-pink-200">
          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white rounded-2xl"
          >
            닫기 ✨
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function HistoryButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      size="icon"
      className="bg-gradient-to-r from-pink-400/80 to-purple-400/80 border-pink-300 text-white hover:from-pink-500/90 hover:to-purple-500/90 rounded-2xl shadow-lg backdrop-blur-sm"
    >
      <History className="h-4 w-4" />
    </Button>
  );
}