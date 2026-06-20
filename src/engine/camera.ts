// ============================================================
//  Camera — cinematic zoom + pan over the whole stage.
//  Expressed as translate+scale about centre so moves between
//  shots interpolate smoothly. Translate is clamped so the move
//  always keeps the scene fully covering the viewport (no edges).
// ============================================================
import type { CameraShot } from "../types";

const EASE = "cubic-bezier(0.33, 0.0, 0.18, 1.0)";

export class Camera {
  constructor(private stage: HTMLElement, private reduce: boolean) {
    this.stage.style.transformOrigin = "50% 50%";
    this.stage.style.willChange = "transform";
  }

  apply(shot: CameraShot, instant = false) {
    const s = shot.scale;
    const maxT = (s - 1) * 50; // % of element; guarantees full coverage
    const tx = clamp((0.5 - shot.fx) * s * 100, -maxT, maxT);
    const ty = clamp((0.5 - shot.fy) * s * 100, -maxT, maxT);
    const dur = instant || this.reduce ? 0 : shot.dur;
    this.stage.style.transition = `transform ${dur}s ${EASE}`;
    this.stage.style.transform =
      `translate(${tx.toFixed(2)}%, ${ty.toFixed(2)}%) scale(${s.toFixed(4)})`;
  }
}

function clamp(v: number, lo: number, hi: number) {
  return v < lo ? lo : v > hi ? hi : v;
}
