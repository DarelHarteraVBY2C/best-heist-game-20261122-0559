// Midnight Vault — synthesized sound. No audio files: every cue is a
// short oscillator phrase, built on the first user gesture.

export function makeChimes() {
  const chimes = { ctx: null, muted: false };

  function ensure() {
    if (!chimes.ctx) {
      try {
        chimes.ctx = new (window.AudioContext || window.webkitAudioContext)();
      } catch {
        chimes.ctx = null;
      }
    }
    if (chimes.ctx && chimes.ctx.state === 'suspended') void chimes.ctx.resume();
    return chimes.ctx;
  }

  function tone(freq, dur, type, gain, when = 0) {
    const ac = ensure();
    if (!ac || chimes.muted) return;
    const t0 = ac.currentTime + when;
    const osc = ac.createOscillator();
    const amp = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    amp.gain.setValueAtTime(0.0001, t0);
    amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
    amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(amp);
    amp.connect(ac.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  return {
    unlock() {
      ensure();
    },
    toggleMute() {
      chimes.muted = !chimes.muted;
      return chimes.muted;
    },
    get muted() {
      return chimes.muted;
    },
    coin() {
      tone(1320, 0.09, 'sine', 0.12);
      tone(1760, 0.12, 'sine', 0.1, 0.07);
    },
    smoke() {
      tone(220, 0.3, 'triangle', 0.08);
      tone(165, 0.35, 'triangle', 0.07, 0.08);
    },
    hack() {
      tone(880, 0.07, 'square', 0.06);
      tone(660, 0.07, 'square', 0.06, 0.07);
      tone(990, 0.1, 'square', 0.06, 0.14);
    },
    pickup() {
      tone(523, 0.12, 'sine', 0.12);
      tone(659, 0.12, 'sine', 0.12, 0.1);
      tone(784, 0.2, 'sine', 0.12, 0.2);
    },
    spotted() {
      tone(196, 0.16, 'sawtooth', 0.09);
      tone(147, 0.22, 'sawtooth', 0.09, 0.12);
    },
    caught() {
      tone(220, 0.25, 'sawtooth', 0.12);
      tone(175, 0.25, 'sawtooth', 0.12, 0.2);
      tone(131, 0.5, 'sawtooth', 0.12, 0.4);
    },
    escaped() {
      [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, 'sine', 0.12, i * 0.11));
    },
  };
}
