export const SoundEffects = {
  ctx: null,
  enabled: true,

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
  },

  playTone(freq, type, duration, delay = 0) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    
    setTimeout(() => {
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
        gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + duration);
      } catch (e) {
        console.warn("Audio error", e);
      }
    }, delay * 1000);
  },

  click() {
    this.playTone(600, 'sine', 0.05);
  },

  correct() {
    this.playTone(523.25, 'triangle', 0.1, 0);      // C5
    this.playTone(659.25, 'triangle', 0.12, 0.08);  // E5
    this.playTone(783.99, 'triangle', 0.25, 0.16);  // G5
  },

  wrong() {
    this.playTone(280, 'sawtooth', 0.2, 0);
    this.playTone(220, 'sawtooth', 0.3, 0.15);
  },

  fanfare() {
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      this.playTone(freq, 'triangle', 0.35, i * 0.12);
    });
  }
};
