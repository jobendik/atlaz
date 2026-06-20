// ============================================================
//  Audio — real ambient music tracks (crossfaded per scene) +
//  generated UI chimes/ticks kept in tune with the current mood.
//  Everything routes through one master gain for clean muting.
// ============================================================

interface Track {
  el: HTMLAudioElement;
  gain: GainNode;
}

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private delay: DelayNode | null = null;
  private tracks = new Map<string, Track>();
  private current: string | null = null;
  private started = false;
  muted = false;

  private root = 110;

  /** Begin audio after the first user gesture. */
  start() {
    if (this.started) {
      void this.ctx?.resume();
      return;
    }
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 1;
    this.master.connect(this.ctx.destination);

    // soft "space" for chimes
    this.delay = this.ctx.createDelay(1.0);
    this.delay.delayTime.value = 0.33;
    const fb = this.ctx.createGain();
    fb.gain.value = 0.26;
    const wet = this.ctx.createGain();
    wet.gain.value = 0.4;
    this.delay.connect(fb); fb.connect(this.delay);
    this.delay.connect(wet); wet.connect(this.master);

    this.started = true;
    // (re)connect any tracks created before context existed
    for (const [url] of this.tracks) this.wireTrack(url);
    if (this.current) this.playScene(this.current, true);
  }

  /** Preload a track's <audio> element ahead of time. */
  preload(url: string) {
    if (this.tracks.has(url)) return;
    const el = new Audio(url);
    el.loop = true;
    el.preload = "auto";
    el.crossOrigin = "anonymous";
    el.volume = 0; // gain is handled via WebAudio once wired
    const gain = this.ctx ? this.ctx.createGain() : (null as unknown as GainNode);
    this.tracks.set(url, { el, gain });
    if (this.ctx) this.wireTrack(url);
  }

  private wireTrack(url: string) {
    const t = this.tracks.get(url);
    if (!t || !this.ctx || !this.master) return;
    if (!t.gain) t.gain = this.ctx.createGain();
    t.gain.gain.value = 0.0001;
    try {
      const src = this.ctx.createMediaElementSource(t.el);
      src.connect(t.gain);
      t.gain.connect(this.master);
      t.el.volume = 1; // let the gain node control level now
    } catch {
      /* already wired */
    }
  }

  /** Crossfade to a scene's track. */
  playScene(url: string, instant = false) {
    this.current = url;
    this.preload(url);
    if (!this.ctx || !this.started) return;
    const now = this.ctx.currentTime;
    const fade = instant ? 0.4 : 3.0;

    for (const [u, t] of this.tracks) {
      const goal = u === url ? 0.62 : 0.0001;
      if (u === url) {
        t.el.play().catch(() => {});
      }
      t.gain.gain.cancelScheduledValues(now);
      t.gain.gain.setValueAtTime(Math.max(t.gain.gain.value, 0.0001), now);
      t.gain.gain.exponentialRampToValueAtTime(goal, now + fade);
      if (u !== url) {
        window.setTimeout(() => { if (this.current !== u) t.el.pause(); }, fade * 1000 + 80);
      }
    }
  }

  /** keep chimes in the current key */
  setKey(root: number) { this.root = root; }

  /** a small bell cluster (name reveal, choices) */
  chime(notes: number[], vol = 1) {
    if (!this.ctx || !this.started || this.muted) return;
    const t = this.ctx.currentTime;
    notes.forEach((semi, i) => {
      const o = this.ctx!.createOscillator();
      o.type = "sine";
      o.frequency.value = this.root * 2 * Math.pow(2, semi / 12);
      const g = this.ctx!.createGain();
      g.gain.value = 0;
      o.connect(g); g.connect(this.master!); g.connect(this.delay!);
      const s = t + i * 0.12;
      g.gain.setValueAtTime(0, s);
      g.gain.linearRampToValueAtTime(0.1 * vol, s + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, s + 1.6);
      o.start(s); o.stop(s + 1.8);
    });
  }

  private lastBlip = 0;
  /** a tiny tick under the typewriter */
  blip() {
    if (!this.ctx || !this.started || this.muted) return;
    const now = performance.now();
    if (now - this.lastBlip < 34) return;
    this.lastBlip = now;
    const t = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    o.type = "triangle";
    o.frequency.value = this.root * 3 * (1 + Math.random() * 0.04);
    const g = this.ctx.createGain();
    g.gain.value = 0;
    o.connect(g); g.connect(this.master!);
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.012, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.08);
    o.start(t); o.stop(t + 0.1);
  }

  toggle(): boolean {
    this.muted = !this.muted;
    if (this.ctx && this.master) {
      const t = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(t);
      this.master.gain.setValueAtTime(this.master.gain.value, t);
      this.master.gain.linearRampToValueAtTime(this.muted ? 0 : 1, t + 0.4);
    }
    return this.muted;
  }
}
