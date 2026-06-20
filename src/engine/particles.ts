// ============================================================
//  Particles — ambient motes, sparkles, petals, rain, embers.
//  One canvas, type-switched per mood. Cheap and GPU-light.
// ============================================================
import type { ParticleType } from "../types";

interface P {
  type: ParticleType;
  x: number; y: number;
  vx: number; vy: number;
  r: number; rot: number; spin?: number;
  a: number; aMax: number;
  life: number; max: number;
  tw: number; sway?: number; len?: number;
}

export class Particles {
  private ctx: CanvasRenderingContext2D;
  private W = 0; private H = 0; private dpr = 1;
  private type: ParticleType = "mote";
  private col: [number, number, number] = [200, 210, 255];
  private wind = 0.1;
  private ps: P[] = [];

  constructor(private cv: HTMLCanvasElement) {
    this.ctx = cv.getContext("2d")!;
    addEventListener("resize", () => this.resize());
  }

  resize() {
    this.dpr = Math.min(devicePixelRatio || 1, 2);
    this.W = this.cv.clientWidth;
    this.H = this.cv.clientHeight;
    this.cv.width = Math.round(this.W * this.dpr);
    this.cv.height = Math.round(this.H * this.dpr);
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  setType(t: ParticleType, c: [number, number, number], w: number) {
    this.type = t; this.col = c; this.wind = w;
  }

  private target() {
    return Math.min(70, Math.round((this.W * this.H) / 24000));
  }

  private spawn(seed: boolean) {
    const t = this.type;
    const p: P = {
      type: t, x: Math.random() * this.W, y: Math.random() * this.H,
      rot: Math.random() * 6.28, a: 0, life: 0, max: 6 + Math.random() * 8,
      vx: 0, vy: 0, r: 1, aMax: 1, tw: Math.random() * 6.28,
    };
    if (t === "mote") {
      p.r = 1.2 + Math.random() * 2.6; p.vx = (Math.random() - 0.5) * 0.2;
      p.vy = -0.18 - Math.random() * 0.3; p.aMax = 0.5 + Math.random() * 0.4;
    } else if (t === "glint") {
      p.r = 0.8 + Math.random() * 1.6; p.vx = (Math.random() - 0.5) * 0.12;
      p.vy = (Math.random() - 0.5) * 0.12; p.aMax = 0.6 + Math.random() * 0.4;
    } else if (t === "petal") {
      p.r = 4 + Math.random() * 5; p.vx = (Math.random() - 0.5) * 0.5;
      p.vy = 0.5 + Math.random() * 0.7; p.spin = (Math.random() - 0.5) * 0.05;
      p.sway = Math.random() * 6.28; p.aMax = 0.55 + Math.random() * 0.35;
      if (!seed) p.y = -10;
    } else if (t === "ember") {
      p.r = 1.4 + Math.random() * 2.4; p.vx = (Math.random() - 0.5) * 0.3;
      p.vy = -0.35 - Math.random() * 0.5; p.aMax = 0.5 + Math.random() * 0.45;
      p.max = 4 + Math.random() * 5;
    } else if (t === "rain") {
      p.len = 10 + Math.random() * 16; p.vx = 1.2 + Math.random() * 0.8;
      p.vy = 10 + Math.random() * 8; p.aMax = 0.18 + Math.random() * 0.22;
      if (!seed) { p.y = -20; p.x = Math.random() * this.W * 1.2 - this.W * 0.1; }
    }
    this.ps.push(p);
  }

  step(now: number, ox: number, oy: number) {
    if (this.W === 0) this.resize();
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.W, this.H);
    const offX = this.type === "rain" ? 0 : ox * 20;
    const offY = this.type === "rain" ? 0 : oy * 14;

    const tgt = this.target();
    let same = this.ps.filter((p) => p.type === this.type).length;
    while (same < tgt) { this.spawn(this.ps.length < tgt); same++; }
    const C = this.col;

    for (let k = this.ps.length - 1; k >= 0; k--) {
      const p = this.ps[k];
      p.life += 0.016;

      if (p.type === "mote" || p.type === "glint" || p.type === "ember") {
        p.a = Math.min(p.a + 0.01, p.aMax) * (p.life > p.max ? Math.max(0, 1 - (p.life - p.max)) : 1);
        const tw = (Math.sin(now * 0.002 + p.tw) + 1) / 2;
        const al = p.a * (0.5 + 0.5 * tw);
        p.x += p.vx + this.wind * 0.3; p.y += p.vy;
        if (p.type === "glint") {
          ctx.strokeStyle = `rgba(${C[0]},${C[1]},${C[2]},${al})`;
          ctx.lineWidth = 1;
          const r = p.r * 2.2, x = p.x + offX, y = p.y + offY;
          ctx.beginPath();
          ctx.moveTo(x - r, y); ctx.lineTo(x + r, y);
          ctx.moveTo(x, y - r); ctx.lineTo(x, y + r);
          ctx.stroke();
        } else {
          const rad = p.r * (p.type === "ember" ? 3 : 4);
          const g = ctx.createRadialGradient(p.x + offX, p.y + offY, 0, p.x + offX, p.y + offY, rad);
          g.addColorStop(0, `rgba(${C[0]},${C[1]},${C[2]},${al})`);
          g.addColorStop(1, `rgba(${C[0]},${C[1]},${C[2]},0)`);
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(p.x + offX, p.y + offY, rad, 0, 6.2832); ctx.fill();
        }
        if (p.life > p.max + 1) this.ps.splice(k, 1);
      } else if (p.type === "petal") {
        p.x += p.vx + Math.sin(now * 0.001 + (p.sway || 0)) * 0.4 + this.wind * 0.5;
        p.y += p.vy; p.rot += p.spin || 0;
        p.a = Math.min(p.a + 0.02, p.aMax);
        ctx.save(); ctx.translate(p.x + offX, p.y + offY); ctx.rotate(p.rot);
        ctx.fillStyle = `rgba(${C[0]},${C[1]},${C[2]},${p.a})`;
        ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r * 0.5, 0, 0, 6.2832); ctx.fill();
        ctx.restore();
        if (p.y > this.H + 20) this.ps.splice(k, 1);
      } else if (p.type === "rain") {
        p.x += p.vx + this.wind * 2; p.y += p.vy;
        ctx.strokeStyle = `rgba(${C[0]},${C[1]},${C[2]},${p.aMax})`;
        ctx.lineWidth = 1.1;
        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 1.2, p.y - (p.len || 12)); ctx.stroke();
        if (p.y > this.H + 20) this.ps.splice(k, 1);
      }
    }
    if (this.ps.length > 130) this.ps.splice(0, this.ps.length - 130);
  }
}
