import { SoundOption, PrayerName } from '../types/prayer';

class AudioService {
  private audioCtx: AudioContext | null = null;
  private currentAudio: HTMLAudioElement | null = null;
  private _isPlaying: boolean = false;

  private getAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtx();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  isPlaying(): boolean {
    return this._isPlaying;
  }

  // Play gentle Islamic chime / harmonic bell using Web Audio API synthesis
  playChime(volume: number = 0.8) {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      // Harmonic chords (oriental meditative frequency ratios)
      const freqs = [528, 660, 792, 1056]; // Solfeggio / serene frequency harmonics

      freqs.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = index % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.12);

        // Envelope
        gain.gain.setValueAtTime(0, now + index * 0.12);
        gain.gain.linearRampToValueAtTime((volume * 0.25) / (index + 1), now + index * 0.12 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.12 + 2.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * 0.12);
        osc.stop(now + index * 0.12 + 2.6);
      });
    } catch (e) {
      console.warn('Audio playback not allowed or failed:', e);
    }
  }

  // Play peaceful melodic beep
  playBeep(volume: number = 0.8) {
    try {
      const ctx = this.getAudioContext();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.35);

      gain.gain.setValueAtTime(volume * 0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.45);
    } catch (e) {
      console.warn('Beep error:', e);
    }
  }

  // Play Adhan using bundled high quality local audio files
  playAdhan(soundOption: SoundOption = 'full_adhan', volume: number = 0.8, prayerName?: PrayerName) {
    this.stop();

    // Determine audio file: If Fajr, play the Fajr adhan ("الصلاة خير من النوم")
    let primaryFile = './audio/adhan_makkah.mp3';

    if (prayerName === 'Fajr') {
      primaryFile = './audio/adhan_fajr.mp3';
    } else if (soundOption === 'adhan_algeria') {
      primaryFile = './audio/adhan_algeria.mp3';
    } else if (soundOption === 'adhan_madinah') {
      primaryFile = './audio/adhan_madinah.mp3';
    } else if (soundOption === 'adhan_makkah') {
      primaryFile = './audio/adhan_makkah.mp3';
    } else {
      primaryFile = './audio/adhan.mp3';
    }

    try {
      const audio = new Audio(primaryFile);
      audio.volume = Math.max(0, Math.min(1, volume));
      this.currentAudio = audio;
      this._isPlaying = true;
      window.dispatchEvent(new CustomEvent('adhan-started'));

      audio.onended = () => {
        this._isPlaying = false;
        this.currentAudio = null;
        window.dispatchEvent(new CustomEvent('adhan-stopped'));
      };

      const promise = audio.play();
      if (promise !== undefined) {
        promise.catch((err) => {
          console.warn('Adhan play error with relative path, trying absolute path:', err);
          const fallback = new Audio('/' + primaryFile.replace(/^\.\//, ''));
          fallback.volume = Math.max(0, Math.min(1, volume));
          fallback.play()
            .then(() => {
              this.currentAudio = fallback;
              this._isPlaying = true;
              fallback.onended = () => {
                this._isPlaying = false;
                this.currentAudio = null;
                window.dispatchEvent(new CustomEvent('adhan-stopped'));
              };
            })
            .catch(() => {
              this._isPlaying = false;
              this.playChime(volume);
              window.dispatchEvent(new CustomEvent('adhan-stopped'));
            });
        });
      }
    } catch (e) {
      console.warn('Adhan exception:', e);
      this._isPlaying = false;
      this.playChime(volume);
    }
  }

  playSound(sound: SoundOption, volume: number = 0.8, prayerName?: PrayerName) {
    if (sound === 'silent') return;
    if (sound === 'soft_chime') {
      this.playChime(volume);
    } else if (sound === 'beep') {
      this.playBeep(volume);
    } else {
      // Default & all adhan options play the real, complete Adhan!
      this.playAdhan(sound, volume, prayerName);
    }
  }

  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    if (this._isPlaying) {
      this._isPlaying = false;
      window.dispatchEvent(new CustomEvent('adhan-stopped'));
    }
  }
}

export const audioService = new AudioService();
