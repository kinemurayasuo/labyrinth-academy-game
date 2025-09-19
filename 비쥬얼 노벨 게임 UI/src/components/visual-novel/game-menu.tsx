import { useState } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Settings, Save, FileText, RotateCcw } from 'lucide-react';

interface GameMenuProps {
  onSave: () => void;
  onLoad: () => void;
  onRestart: () => void;
  bgmVolume: number;
  sfxVolume: number;
  onBgmVolumeChange: (volume: number) => void;
  onSfxVolumeChange: (volume: number) => void;
  autoPlay: boolean;
  onAutoPlayChange: (enabled: boolean) => void;
}

export function GameMenu({
  onSave,
  onLoad,
  onRestart,
  bgmVolume,
  sfxVolume,
  onBgmVolumeChange,
  onSfxVolumeChange,
  autoPlay,
  onAutoPlayChange
}: GameMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute top-4 right-4 z-50">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="bg-gradient-to-r from-pink-400/80 to-purple-400/80 border-pink-300 text-white hover:from-pink-500/90 hover:to-purple-500/90 rounded-2xl shadow-lg backdrop-blur-sm"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        
        <DialogContent className="bg-gradient-to-br from-pink-50/95 to-purple-50/95 backdrop-blur-sm border-pink-200 rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-purple-800 flex items-center gap-2">
              ⚙️ 게임 메뉴
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Game Actions */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">게임</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    onSave();
                    setIsOpen(false);
                  }}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  저장
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    onLoad();
                    setIsOpen(false);
                  }}
                  className="w-full"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  불러오기
                </Button>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  onRestart();
                  setIsOpen(false);
                }}
                className="w-full"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                처음부터 시작
              </Button>
            </div>
            
            {/* Audio Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">오디오 설정</h3>
              
              <div className="space-y-2">
                <label className="text-sm">배경음악 볼륨</label>
                <Slider
                  value={[bgmVolume]}
                  onValueChange={(value) => onBgmVolumeChange(value[0])}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="text-xs text-muted-foreground">{bgmVolume}%</div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm">효과음 볼륨</label>
                <Slider
                  value={[sfxVolume]}
                  onValueChange={(value) => onSfxVolumeChange(value[0])}
                  max={100}
                  step={1}
                  className="w-full"
                />
                <div className="text-xs text-muted-foreground">{sfxVolume}%</div>
              </div>
            </div>
            
            {/* Game Settings */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium">게임 설정</h3>
              
              <div className="flex items-center justify-between">
                <label className="text-sm">자동 진행</label>
                <Switch
                  checked={autoPlay}
                  onCheckedChange={onAutoPlayChange}
                />
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}