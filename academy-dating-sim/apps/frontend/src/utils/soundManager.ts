// Sound Manager for the game
// Note: Audio files need to be added to public folder

class SoundManager {
  private static instance: SoundManager;
  private bgmAudio: HTMLAudioElement | null = null;
  private sfxVolume: number = 0.5;
  private bgmVolume: number = 0.3;
  private isMuted: boolean = false;

  private bgmTracks = {
    menu: '/sounds/bgm/menu.mp3',
    game: '/sounds/bgm/game.mp3',
    battle: '/sounds/bgm/battle.mp3',
    dungeon: '/sounds/bgm/dungeon.mp3',
    victory: '/sounds/bgm/victory.mp3',
    romantic: '/sounds/bgm/romantic.mp3'
  };

  private sfxTracks = {
    click: '/sounds/sfx/click.mp3',
    hover: '/sounds/sfx/hover.mp3',
    success: '/sounds/sfx/success.mp3',
    error: '/sounds/sfx/error.mp3',
    levelUp: '/sounds/sfx/levelup.mp3',
    attack: '/sounds/sfx/attack.mp3',
    damage: '/sounds/sfx/damage.mp3',
    heal: '/sounds/sfx/heal.mp3',
    coin: '/sounds/sfx/coin.mp3',
    open: '/sounds/sfx/open.mp3',
    close: '/sounds/sfx/close.mp3',
    notification: '/sounds/sfx/notification.mp3'
  };

  private constructor() {
    // Load saved preferences
    const savedSettings = localStorage.getItem('soundSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      this.sfxVolume = settings.sfxVolume ?? 0.5;
      this.bgmVolume = settings.bgmVolume ?? 0.3;
      this.isMuted = settings.isMuted ?? false;
    }
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  // BGM Controls
  public playBGM(track: keyof typeof SoundManager.prototype.bgmTracks) {
    try {
      // Stop current BGM if playing
      if (this.bgmAudio) {
        this.bgmAudio.pause();
        this.bgmAudio.currentTime = 0;
      }

      // Create new audio element
      this.bgmAudio = new Audio(this.bgmTracks[track]);
      this.bgmAudio.volume = this.isMuted ? 0 : this.bgmVolume;
      this.bgmAudio.loop = true;

      // Play the BGM
      const playPromise = this.bgmAudio.play();

      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log('BGM autoplay prevented:', error);
          // Will retry on user interaction
        });
      }
    } catch (error) {
      console.error('Error playing BGM:', error);
    }
  }

  public stopBGM() {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
      this.bgmAudio.currentTime = 0;
    }
  }

  public pauseBGM() {
    if (this.bgmAudio) {
      this.bgmAudio.pause();
    }
  }

  public resumeBGM() {
    if (this.bgmAudio && !this.isMuted) {
      this.bgmAudio.play().catch(error => {
        console.log('BGM resume prevented:', error);
      });
    }
  }

  // SFX Controls
  public playSFX(effect: keyof typeof SoundManager.prototype.sfxTracks) {
    if (this.isMuted) return;

    try {
      const audio = new Audio(this.sfxTracks[effect]);
      audio.volume = this.sfxVolume;

      const playPromise = audio.play();

      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.log('SFX play prevented:', error);
        });
      }
    } catch (error) {
      console.error('Error playing SFX:', error);
    }
  }

  // Volume Controls
  public setSFXVolume(volume: number) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  public setBGMVolume(volume: number) {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.isMuted ? 0 : this.bgmVolume;
    }
    this.saveSettings();
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.isMuted ? 0 : this.bgmVolume;
    }
    this.saveSettings();
    return this.isMuted;
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.bgmAudio) {
      this.bgmAudio.volume = this.isMuted ? 0 : this.bgmVolume;
    }
    this.saveSettings();
  }

  // Getters
  public getSFXVolume(): number {
    return this.sfxVolume;
  }

  public getBGMVolume(): number {
    return this.bgmVolume;
  }

  public isMutedStatus(): boolean {
    return this.isMuted;
  }

  // Save settings to localStorage
  private saveSettings() {
    const settings = {
      sfxVolume: this.sfxVolume,
      bgmVolume: this.bgmVolume,
      isMuted: this.isMuted
    };
    localStorage.setItem('soundSettings', JSON.stringify(settings));
  }

  // Special Effects
  public playClickSound() {
    this.playSFX('click');
  }

  public playHoverSound() {
    this.playSFX('hover');
  }

  public playSuccessSound() {
    this.playSFX('success');
  }

  public playErrorSound() {
    this.playSFX('error');
  }

  public playLevelUpSound() {
    this.playSFX('levelUp');
  }

  public playCoinSound() {
    this.playSFX('coin');
  }

  public playNotificationSound() {
    this.playSFX('notification');
  }

  // Battle sounds
  public playAttackSound() {
    this.playSFX('attack');
  }

  public playDamageSound() {
    this.playSFX('damage');
  }

  public playHealSound() {
    this.playSFX('heal');
  }
}

export const soundManager = SoundManager.getInstance();
export default soundManager;