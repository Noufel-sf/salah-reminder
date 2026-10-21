import { SoundOption } from '../types/prayer';

class AudioService {
  private audioCtx: AudioContext | null = null;
  private currentAudio: HTMLAudioElement | null = null;

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

  // Play Adhan or audio sample
  playAdhan(type: 'full' | 'takbeer' = 'takbeer', volume: number = 0.8) {
    this.stop();

    // Use reliable high-speed CDN audio stream with chime fallback
    const url = type === 'full' 
      ? 'https://cdn.aladhan.com/audio/adhans/makkah.mp3'
      : 'https://cdn.aladhan.com/audio/adhans/takbeer.mp3';

    this.currentAudio = new Audio(url);
    this.currentAudio.volume = Math.max(0, Math.min(1, volume));

    this.currentAudio.play().catch(() => {
      // If offline or blocked by network, fallback to crystal chime
      this.playChime(volume);
    });
  }

  playSound(sound: SoundOption, volume: number = 0.8) {
    if (sound === 'silent') return;
    if (sound === 'soft_chime') {
      this.playChime(volume);
    } else if (sound === 'beep') {
      this.playBeep(volume);
    } else if (sound === 'takbeer') {
      this.playAdhan('takbeer', volume);
    } else if (sound === 'full_adhan') {
      this.playAdhan('full', volume);
    }
  }

  stop() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }
}

export const audioService = new AudioService();
