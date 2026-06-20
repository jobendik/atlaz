// ============================================================
//  Stage — builds each scene from stacked parallax art, crossfades
//  between locations, hosts the character figure, and applies the
//  per-frame parallax drift. The cinematic camera (zoom/pan) is a
//  separate transform applied to the stage root by Camera.
// ============================================================
import type { Character, Scene } from "../types";

interface BuiltLayer {
  el: HTMLDivElement;
  depth: number;
  drift: number;
  /** measured tile width (px) for seamless scroll wrap; 0 until laid out */
  tileW: number;
  /** first tile img, used to measure tileW lazily */
  tile?: HTMLImageElement;
}

interface BuiltScene {
  root: HTMLDivElement;
  layers: BuiltLayer[];
  scroll: boolean;
}

// scroll tuning (px/sec and px/pointer-unit at depth 1)
const SCROLL_SPEED = 30;
const SCROLL_PTR = 46;

export class Stage {
  private scenes = new Map<string, BuiltScene>();
  private activeId: string | null = null;

  /** holds scenes + character; gets the slow perpetual "camera breath"
   *  so it composes with (not fights) the cinematic camera on the host. */
  private inner: HTMLDivElement;

  private charEl: HTMLDivElement;
  private charImg: HTMLImageElement;
  private charGlow: HTMLDivElement;
  private charBaseTransform = "translateX(-50%)";
  private charDepth = 0.42;
  private curChar: string | null = null;

  constructor(
    host: HTMLElement,
    private sceneDefs: Record<string, Scene>,
  ) {
    this.inner = document.createElement("div");
    this.inner.className = "stageInner";
    host.appendChild(this.inner);
    // character lives above the scenes, still inside the camera transform
    this.charGlow = document.createElement("div");
    this.charGlow.className = "charGlow";
    this.charEl = document.createElement("div");
    this.charEl.className = "char";
    this.charImg = document.createElement("img");
    this.charImg.decoding = "async";
    this.charEl.appendChild(this.charImg);
  }

  /** Pre-build the DOM and warm the image cache for one scene. */
  build(id: string): BuiltScene {
    const existing = this.scenes.get(id);
    if (existing) return existing;
    const def = this.sceneDefs[id];
    const scroll = !!def.scroll;
    const root = document.createElement("div");
    root.className = "scene";
    if (def.filter) root.style.filter = def.filter;
    const layers: BuiltLayer[] = [];
    for (const L of def.layers) {
      const el = document.createElement("div");
      el.className = scroll ? "layer scroll" : "layer";
      if (L.opacity != null) el.style.opacity = String(L.opacity);
      let tile: HTMLImageElement | undefined;
      if (scroll) {
        // seamless scroll: a row of two identical tiles we slide horizontally
        const row = document.createElement("div");
        row.className = "scrollRow";
        for (let i = 0; i < 2; i++) {
          const im = document.createElement("img");
          im.src = L.src;
          im.decoding = "async";
          row.appendChild(im);
          if (i === 0) tile = im;
        }
        el.appendChild(row);
      } else {
        const img = document.createElement("img");
        img.src = L.src;
        img.decoding = "async";
        if (L.blend) { el.style.mixBlendMode = L.blend; img.style.mixBlendMode = L.blend; }
        el.appendChild(img);
      }
      root.appendChild(el);
      layers.push({ el, depth: L.depth, drift: L.drift || 0, tileW: 0, tile });
    }
    this.inner.appendChild(root);
    const built = { root, layers, scroll };
    this.scenes.set(id, built);
    return built;
  }

  /** Crossfade to a scene; builds it lazily on first use. */
  show(id: string) {
    if (this.activeId === id) return;
    const next = this.build(id);
    // make sure character stays on top of the scenes
    this.inner.appendChild(this.charGlow);
    this.inner.appendChild(this.charEl);

    const prev = this.activeId ? this.scenes.get(this.activeId) : null;
    requestAnimationFrame(() => {
      next.root.classList.add("show");
      if (prev) prev.root.classList.remove("show");
    });
    this.activeId = id;
  }

  /** Swap the on-screen drawing (crossfade). */
  setCharacter(who: string | null, char?: Character) {
    if (who === this.curChar) return;
    this.curChar = who;
    if (!who || !char) {
      this.charEl.classList.remove("show");
      this.charGlow.classList.remove("show");
      return;
    }
    const swap = () => {
      this.charImg.src = char.img;
      // apply placement (everything except transform, which we compose live)
      const place = char.place;
      this.charBaseTransform = place.transform || "translateX(-50%)";
      for (const k of ["height", "width", "bottom", "top", "left", "right"] as const) {
        const v = place[k] as string | undefined;
        this.charEl.style[k] = v ?? "";
        if (k === "left" || k === "bottom" || k === "top" || k === "height") {
          (this.charGlow.style as any)[k] = v ?? "";
        }
      }
      this.charEl.classList.add("show");
      this.charGlow.classList.add("show");
    };
    if (this.charEl.classList.contains("show")) {
      this.charEl.classList.remove("show");
      this.charGlow.classList.remove("show");
      window.setTimeout(swap, 420);
    } else {
      swap();
    }
  }

  /**
   * Per-frame motion for the active scene + character.
   *
   * Seamless scenes (scroll=true): each layer tiles and slides horizontally
   *   forever at a depth-proportional speed — foreground sweeps past, the sky
   *   barely moves. This is the unmistakable side-scroll parallax these
   *   "seamless" packs are built for, and it works with zero input (phones).
   *
   * Drift scenes (scroll=false): depth-scaled pan toward the pointer/idle
   *   dolly, kept inside the layer bleed so a fixed centerpiece (e.g. the
   *   dawn sun) never repeats and no edge is exposed.
   */
  applyParallax(px: number, py: number, now: number, breathe: boolean) {
    const t = now * 0.001; // seconds
    const active = this.activeId ? this.scenes.get(this.activeId) : null;
    if (active && active.scroll) {
      for (const L of active.layers) {
        if (!L.tileW) { L.tileW = L.tile?.offsetWidth || 0; if (!L.tileW) continue; }
        const tw = L.tileW;
        // continuous leftward scroll + interactive pointer offset
        const pos = t * SCROLL_SPEED * L.depth + px * SCROLL_PTR * L.depth;
        const x = -(((pos % tw) + tw) % tw); // wrap into (-tw, 0]
        const y = py * L.depth * 10; // small bounded vertical parallax
        L.el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      }
    } else if (active) {
      for (const L of active.layers) {
        const soft = (L.drift ?? 0) > 0;
        // depth-scaled dolly: near layers travel far, far layers barely move
        const str = soft ? 34 : 28;
        let x = px * L.depth * str;
        let y = py * L.depth * str * 0.55;

        // a little perpetual wind sway, still depth-scaled
        const swA = L.depth * 7;
        x += Math.sin(t * 0.19 + L.depth * 7) * swA;
        y += Math.cos(t * 0.15 + L.depth * 5) * swA * 0.5;

        // transparent overlays (mist / particles / light) flow + bob freely
        if (soft) {
          const d = L.drift ?? 0;
          x += Math.sin(t * 0.08 + L.depth * 3) * d;
          y += Math.sin(t * 0.06 + L.depth * 9) * d * 0.4;
        }
        L.el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
      }
    }

    // character: parallax + gentle breathing + a touch of the same wind
    const br = breathe ? Math.sin(now * 0.0009) : 0;
    const sw = breathe ? Math.sin(now * 0.00055) : 0;
    const wind = breathe ? Math.sin(t * 0.21 + this.charDepth * 7) * (this.charDepth * 5) : 0;
    const sc = 1 + (breathe ? 0.006 : 0) * ((br + 1) / 2);
    const cx = px * this.charDepth * 16 + sw * 4 + wind;
    const cy = py * this.charDepth * 16 * 0.6 + br * 5;
    this.charEl.style.transform =
      `${this.charBaseTransform} translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0) scale(${sc.toFixed(4)})`;
    this.charGlow.style.transform =
      `translateX(-50%) translate3d(${(cx * 0.6).toFixed(2)}px, ${(cy * 0.6).toFixed(2)}px, 0)`;
  }

  get currentSceneId() { return this.activeId; }
}
