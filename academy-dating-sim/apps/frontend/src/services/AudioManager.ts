export interface AudioTrack {
  id: string;
  name: string;
  url: string;
  type: 'bgm' | 'sfx' | 'voice' | 'ambient';
  volume: number;
  loop: boolean;
  category?: string;
}

export interface AudioSettings {
  masterVolume: number;
  bgmVolume: number;
  sfxVolume: number;
  voiceVolume: number;
  ambientVolume: number;
  muted: boolean;
}

export class AudioManager {
  private static instance: AudioManager;
  private audioContext: AudioContext;
  private tracks: Map<string, AudioTrack> = new Map();
  private audioElements: Map<string, HTMLAudioElement> = new Map();
  private currentBGM: string | null = null;
  private currentAmbient: string | null = null;
  private settings: AudioSettings;
  private fadeTransitions: Map<string, number> = new Map();
  private crossfadeEnabled: boolean = true;
  private playbackSpeed: number = 1.0;

  private constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.settings = this.loadSettings();
    this.initializeTracks();
  }

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  private loadSettings(): AudioSettings {
    const saved = localStorage.getItem('audioSettings');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      masterVolume: 0.7,
      bgmVolume: 0.6,
      sfxVolume: 0.8,
      voiceVolume: 0.9,
      ambientVolume: 0.4,
      muted: false
    };
  }

  private saveSettings() {
    localStorage.setItem('audioSettings', JSON.stringify(this.settings));
  }

  private initializeTracks() {
    const trackList: AudioTrack[] = [
      // BGM Tracks
      { id: 'bgm_title', name: '타이틀 테마', url: '/audio/bgm/title.mp3', type: 'bgm', volume: 0.6, loop: true, category: 'menu' },
      { id: 'bgm_daily', name: '일상', url: '/audio/bgm/daily.mp3', type: 'bgm', volume: 0.5, loop: true, category: 'normal' },
      { id: 'bgm_romance', name: '로맨스', url: '/audio/bgm/romance.mp3', type: 'bgm', volume: 0.4, loop: true, category: 'romantic' },
      { id: 'bgm_tension', name: '긴장', url: '/audio/bgm/tension.mp3', type: 'bgm', volume: 0.6, loop: true, category: 'dramatic' },
      { id: 'bgm_sad', name: '슬픔', url: '/audio/bgm/sad.mp3', type: 'bgm', volume: 0.5, loop: true, category: 'emotional' },
      { id: 'bgm_battle', name: '전투', url: '/audio/bgm/battle.mp3', type: 'bgm', volume: 0.7, loop: true, category: 'action' },
      { id: 'bgm_victory', name: '승리', url: '/audio/bgm/victory.mp3', type: 'bgm', volume: 0.6, loop: false, category: 'achievement' },
      { id: 'bgm_mystery', name: '미스터리', url: '/audio/bgm/mystery.mp3', type: 'bgm', volume: 0.5, loop: true, category: 'suspense' },
      { id: 'bgm_festival', name: '축제', url: '/audio/bgm/festival.mp3', type: 'bgm', volume: 0.6, loop: true, category: 'event' },
      { id: 'bgm_ending', name: '엔딩', url: '/audio/bgm/ending.mp3', type: 'bgm', volume: 0.5, loop: false, category: 'ending' },

      // Character Themes
      { id: 'bgm_sakura', name: '사쿠라 테마', url: '/audio/bgm/sakura.mp3', type: 'bgm', volume: 0.5, loop: true, category: 'character' },
      { id: 'bgm_yuki', name: '유키 테마', url: '/audio/bgm/yuki.mp3', type: 'bgm', volume: 0.4, loop: true, category: 'character' },
      { id: 'bgm_luna', name: '루나 테마', url: '/audio/bgm/luna.mp3', type: 'bgm', volume: 0.5, loop: true, category: 'character' },
      { id: 'bgm_rin', name: '린 테마', url: '/audio/bgm/rin.mp3', type: 'bgm', volume: 0.6, loop: true, category: 'character' },
      { id: 'bgm_mei', name: '메이 테마', url: '/audio/bgm/mei.mp3', type: 'bgm', volume: 0.4, loop: true, category: 'character' },
      { id: 'bgm_hana', name: '하나 테마', url: '/audio/bgm/hana.mp3', type: 'bgm', volume: 0.5, loop: true, category: 'character' },
      { id: 'bgm_sora', name: '소라 테마', url: '/audio/bgm/sora.mp3', type: 'bgm', volume: 0.5, loop: true, category: 'character' },
      { id: 'bgm_akane', name: '아카네 테마', url: '/audio/bgm/akane.mp3', type: 'bgm', volume: 0.5, loop: true, category: 'character' },
      { id: 'bgm_mystery', name: '??? 테마', url: '/audio/bgm/mystery_character.mp3', type: 'bgm', volume: 0.4, loop: true, category: 'character' },

      // Sound Effects
      { id: 'sfx_click', name: '클릭', url: '/audio/sfx/click.mp3', type: 'sfx', volume: 0.6, loop: false },
      { id: 'sfx_confirm', name: '확인', url: '/audio/sfx/confirm.mp3', type: 'sfx', volume: 0.7, loop: false },
      { id: 'sfx_cancel', name: '취소', url: '/audio/sfx/cancel.mp3', type: 'sfx', volume: 0.6, loop: false },
      { id: 'sfx_success', name: '성공', url: '/audio/sfx/success.mp3', type: 'sfx', volume: 0.8, loop: false },
      { id: 'sfx_fail', name: '실패', url: '/audio/sfx/fail.mp3', type: 'sfx', volume: 0.7, loop: false },
      { id: 'sfx_levelup', name: '레벨업', url: '/audio/sfx/levelup.mp3', type: 'sfx', volume: 0.9, loop: false },
      { id: 'sfx_item', name: '아이템 획득', url: '/audio/sfx/item.mp3', type: 'sfx', volume: 0.6, loop: false },
      { id: 'sfx_message', name: '메시지', url: '/audio/sfx/message.mp3', type: 'sfx', volume: 0.5, loop: false },
      { id: 'sfx_heartbeat', name: '심장박동', url: '/audio/sfx/heartbeat.mp3', type: 'sfx', volume: 0.7, loop: false },
      { id: 'sfx_kiss', name: '키스', url: '/audio/sfx/kiss.mp3', type: 'sfx', volume: 0.4, loop: false },
      { id: 'sfx_sword', name: '검 소리', url: '/audio/sfx/sword.mp3', type: 'sfx', volume: 0.8, loop: false },
      { id: 'sfx_magic', name: '마법', url: '/audio/sfx/magic.mp3', type: 'sfx', volume: 0.7, loop: false },
      { id: 'sfx_door', name: '문 열기', url: '/audio/sfx/door.mp3', type: 'sfx', volume: 0.6, loop: false },
      { id: 'sfx_footstep', name: '발소리', url: '/audio/sfx/footstep.mp3', type: 'sfx', volume: 0.4, loop: false },

      // Ambient Sounds
      { id: 'ambient_classroom', name: '교실 소음', url: '/audio/ambient/classroom.mp3', type: 'ambient', volume: 0.3, loop: true },
      { id: 'ambient_nature', name: '자연 소리', url: '/audio/ambient/nature.mp3', type: 'ambient', volume: 0.4, loop: true },
      { id: 'ambient_rain', name: '비 소리', url: '/audio/ambient/rain.mp3', type: 'ambient', volume: 0.5, loop: true },
      { id: 'ambient_night', name: '밤 소리', url: '/audio/ambient/night.mp3', type: 'ambient', volume: 0.3, loop: true },
      { id: 'ambient_crowd', name: '군중 소리', url: '/audio/ambient/crowd.mp3', type: 'ambient', volume: 0.4, loop: true },
      { id: 'ambient_beach', name: '파도 소리', url: '/audio/ambient/beach.mp3', type: 'ambient', volume: 0.5, loop: true },
      { id: 'ambient_library', name: '도서관', url: '/audio/ambient/library.mp3', type: 'ambient', volume: 0.2, loop: true },
      { id: 'ambient_cafe', name: '카페', url: '/audio/ambient/cafe.mp3', type: 'ambient', volume: 0.3, loop: true }
    ];

    trackList.forEach(track => {
      this.tracks.set(track.id, track);
      this.preloadAudio(track);
    });
  }

  private preloadAudio(track: AudioTrack) {
    const audio = new Audio();
    audio.src = track.url;
    audio.loop = track.loop;
    audio.volume = this.getAdjustedVolume(track);
    audio.preload = 'auto';
    this.audioElements.set(track.id, audio);
  }

  private getAdjustedVolume(track: AudioTrack): number {
    if (this.settings.muted) return 0;

    let typeVolume = 1;
    switch (track.type) {
      case 'bgm': typeVolume = this.settings.bgmVolume; break;
      case 'sfx': typeVolume = this.settings.sfxVolume; break;
      case 'voice': typeVolume = this.settings.voiceVolume; break;
      case 'ambient': typeVolume = this.settings.ambientVolume; break;
    }

    return track.volume * typeVolume * this.settings.masterVolume;
  }

  async playBGM(trackId: string, fadeIn: number = 1000) {
    if (this.currentBGM === trackId) return;

    if (this.currentBGM && this.crossfadeEnabled) {
      await this.fadeOut(this.currentBGM, fadeIn / 2);
    } else if (this.currentBGM) {
      this.stop(this.currentBGM);
    }

    const audio = this.audioElements.get(trackId);
    if (audio) {
      audio.playbackRate = this.playbackSpeed;
      this.currentBGM = trackId;

      if (fadeIn > 0) {
        audio.volume = 0;
        audio.play();
        await this.fadeIn(trackId, fadeIn);
      } else {
        audio.volume = this.getAdjustedVolume(this.tracks.get(trackId)!);
        audio.play();
      }
    }
  }

  async stopBGM(fadeOut: number = 1000) {
    if (!this.currentBGM) return;

    if (fadeOut > 0) {
      await this.fadeOut(this.currentBGM, fadeOut);
    }

    this.stop(this.currentBGM);
    this.currentBGM = null;
  }

  playSFX(trackId: string, options?: { volume?: number; pitch?: number }) {
    const audio = this.audioElements.get(trackId);
    if (audio) {
      const clonedAudio = audio.cloneNode() as HTMLAudioElement;
      const track = this.tracks.get(trackId)!;

      clonedAudio.volume = options?.volume ?? this.getAdjustedVolume(track);
      clonedAudio.playbackRate = options?.pitch ?? 1.0;

      clonedAudio.play();
      clonedAudio.addEventListener('ended', () => {
        clonedAudio.remove();
      });
    }
  }

  async playVoice(characterId: string, emotion: string, line: string) {
    const voiceId = `voice_${characterId}_${emotion}`;
    const audio = this.audioElements.get(voiceId);

    if (audio) {
      audio.volume = this.getAdjustedVolume({ type: 'voice', volume: 1 } as AudioTrack);
      await audio.play();
    }
  }

  setAmbient(trackId: string | null, fadeTime: number = 2000) {
    if (this.currentAmbient) {
      this.fadeOut(this.currentAmbient, fadeTime);
    }

    if (trackId) {
      const audio = this.audioElements.get(trackId);
      if (audio) {
        this.currentAmbient = trackId;
        audio.volume = 0;
        audio.play();
        this.fadeIn(trackId, fadeTime);
      }
    } else {
      this.currentAmbient = null;
    }
  }

  private async fadeIn(trackId: string, duration: number): Promise<void> {
    return new Promise(resolve => {
      const audio = this.audioElements.get(trackId);
      const track = this.tracks.get(trackId);
      if (!audio || !track) {
        resolve();
        return;
      }

      const targetVolume = this.getAdjustedVolume(track);
      const steps = 20;
      const stepTime = duration / steps;
      const volumeStep = targetVolume / steps;
      let currentStep = 0;

      const fadeInterval = setInterval(() => {
        currentStep++;
        audio.volume = Math.min(volumeStep * currentStep, targetVolume);

        if (currentStep >= steps) {
          clearInterval(fadeInterval);
          this.fadeTransitions.delete(trackId);
          resolve();
        }
      }, stepTime);

      this.fadeTransitions.set(trackId, fadeInterval);
    });
  }

  private async fadeOut(trackId: string, duration: number): Promise<void> {
    return new Promise(resolve => {
      const audio = this.audioElements.get(trackId);
      if (!audio) {
        resolve();
        return;
      }

      const startVolume = audio.volume;
      const steps = 20;
      const stepTime = duration / steps;
      const volumeStep = startVolume / steps;
      let currentStep = 0;

      const fadeInterval = setInterval(() => {
        currentStep++;
        audio.volume = Math.max(startVolume - (volumeStep * currentStep), 0);

        if (currentStep >= steps) {
          clearInterval(fadeInterval);
          audio.pause();
          audio.currentTime = 0;
          this.fadeTransitions.delete(trackId);
          resolve();
        }
      }, stepTime);

      this.fadeTransitions.set(trackId, fadeInterval);
    });
  }

  private stop(trackId: string) {
    const audio = this.audioElements.get(trackId);
    if (audio) {
      const fadeInterval = this.fadeTransitions.get(trackId);
      if (fadeInterval) {
        clearInterval(fadeInterval);
        this.fadeTransitions.delete(trackId);
      }
      audio.pause();
      audio.currentTime = 0;
    }
  }

  setMasterVolume(volume: number) {
    this.settings.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
    this.saveSettings();
  }

  setBGMVolume(volume: number) {
    this.settings.bgmVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
    this.saveSettings();
  }

  setSFXVolume(volume: number) {
    this.settings.sfxVolume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  setVoiceVolume(volume: number) {
    this.settings.voiceVolume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  setAmbientVolume(volume: number) {
    this.settings.ambientVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
    this.saveSettings();
  }

  toggleMute() {
    this.settings.muted = !this.settings.muted;
    this.updateAllVolumes();
    this.saveSettings();
  }

  private updateAllVolumes() {
    this.audioElements.forEach((audio, trackId) => {
      const track = this.tracks.get(trackId);
      if (track && (audio.currentTime > 0 || !audio.paused)) {
        audio.volume = this.getAdjustedVolume(track);
      }
    });
  }

  setPlaybackSpeed(speed: number) {
    this.playbackSpeed = Math.max(0.5, Math.min(2.0, speed));
    this.audioElements.forEach(audio => {
      if (!audio.paused) {
        audio.playbackRate = this.playbackSpeed;
      }
    });
  }

  setCrossfade(enabled: boolean) {
    this.crossfadeEnabled = enabled;
  }

  getSettings(): AudioSettings {
    return { ...this.settings };
  }

  getCurrentBGM(): string | null {
    return this.currentBGM;
  }

  getCurrentAmbient(): string | null {
    return this.currentAmbient;
  }

  getBGMForScene(scene: string): string {
    const sceneMapping: Record<string, string> = {
      'title': 'bgm_title',
      'daily': 'bgm_daily',
      'date': 'bgm_romance',
      'confession': 'bgm_romance',
      'battle': 'bgm_battle',
      'victory': 'bgm_victory',
      'defeat': 'bgm_sad',
      'mystery': 'bgm_mystery',
      'festival': 'bgm_festival',
      'ending': 'bgm_ending',
      'sakura_scene': 'bgm_sakura',
      'yuki_scene': 'bgm_yuki',
      'luna_scene': 'bgm_luna',
      'rin_scene': 'bgm_rin',
      'mei_scene': 'bgm_mei',
      'hana_scene': 'bgm_hana',
      'sora_scene': 'bgm_sora',
      'akane_scene': 'bgm_akane',
      'mystery_scene': 'bgm_mystery'
    };

    return sceneMapping[scene] || 'bgm_daily';
  }

  getAmbientForLocation(location: string): string | null {
    const locationMapping: Record<string, string> = {
      'classroom': 'ambient_classroom',
      'park': 'ambient_nature',
      'library': 'ambient_library',
      'cafe': 'ambient_cafe',
      'beach': 'ambient_beach',
      'night': 'ambient_night',
      'festival': 'ambient_crowd'
    };

    return locationMapping[location] || null;
  }

  playNotification(type: 'success' | 'error' | 'message' | 'achievement') {
    const sfxMapping = {
      'success': 'sfx_success',
      'error': 'sfx_fail',
      'message': 'sfx_message',
      'achievement': 'sfx_levelup'
    };

    this.playSFX(sfxMapping[type]);
  }

  dispose() {
    this.fadeTransitions.forEach(interval => clearInterval(interval));
    this.fadeTransitions.clear();

    this.audioElements.forEach(audio => {
      audio.pause();
      audio.src = '';
    });

    this.audioElements.clear();
    this.tracks.clear();

    if (this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }
}