// ============================================================
//  Shared types for the teaser engine + content.
// ============================================================

/** One parallax plane inside a scene. */
export interface SceneLayer {
  /** image url under /assets */
  src: string;
  /** 0 = locked to the back (no parallax), ~0.6 = strong foreground drift */
  depth: number;
  /** optional css blend mode for light/glow overlays */
  blend?: string;
  /** base opacity 0..1 (default 1) */
  opacity?: number;
  /** slow self-drift in px for living overlays (fog/light), default 0 */
  drift?: number;
}

/** A cinematic location built from stacked parallax art. */
export interface Scene {
  id: string;
  layers: SceneLayer[];
  /** music track url (mp3) that crossfades in when the scene appears */
  music: string;
  /**
   * true  -> seamless side-scroll: layers tile + scroll horizontally forever
   *          at depth-proportional speed (use for tileable/"seamless" packs).
   * false -> bounded drift parallax: depth-scaled pan, edges never exposed
   *          (use for hero shots with a fixed centerpiece, e.g. a sun).
   */
  scroll?: boolean;
  /**
   * optional CSS filter applied to the whole scene to recolor its lighting.
   * AVOID on scenes whose layers move every frame — the filter re-rasterises
   * the whole scene per frame (GPU crash/strobe). Prefer `overlay` instead.
   */
  filter?: string;
  /**
   * optional static colour wash (any CSS background value) baked over the
   * layers to recolour the scene cheaply — no per-frame cost. Use this to turn
   * the warm dawn pack into a cold twilight, etc.
   */
  overlay?: string;
}

/** A drawn character that lives inside the scenes. */
export interface Character {
  name: string;
  /** small on-screen title shown under the name */
  title: string;
  /** subtitle shown on the grand name-reveal card */
  sub: string;
  /** portrait image url */
  img: string;
  /** css placement of the figure within the stage */
  place: Partial<CSSStyleDeclaration>;
}

/** Emotional palette + atmosphere preset. */
export interface Mood {
  /** soft-light tint laid over the character art */
  tint: string;
  /** full-screen colour wash */
  grade: string;
  /** particle style */
  ptype: ParticleType;
  /** particle colour [r,g,b] */
  pc: [number, number, number];
  /** ambient wind/intensity 0..1 (drives fog + particle energy) */
  wind: number;
  /** UI chime base frequency (Hz) for tonal cohesion with the music */
  root: number;
  /** chord as semitone offsets */
  chord: number[];
  /** vignette strength 0..1 */
  vig?: number;
}

export type ParticleType = "mote" | "glint" | "petal" | "rain" | "ember";

/** A framing of the camera over the current scene. */
export interface CameraShot {
  /** zoom factor (1 = full scene) */
  scale: number;
  /** focal point x in 0..1 of the frame */
  fx: number;
  /** focal point y in 0..1 of the frame */
  fy: number;
  /** seconds for the move (0 = instant) */
  dur: number;
}

// ---- story beats ----

export interface LineBeat {
  t: "line";
  who: string;
  scene?: string;
  cam?: string;
  mood?: string;
  /** trigger the grand name-reveal card */
  name?: boolean;
  /** marks the start of a chapter; lights the matching progress pip (0-based) */
  ch?: number;
  text: string;
}

export interface ChoiceOption {
  label: string;
  mood?: string;
  say: { who: string; cam?: string; text: string };
}

export interface ChoiceBeat {
  t: "choice";
  options: ChoiceOption[];
}

export interface CenterBeat {
  t: "center";
  scene?: string;
  mood?: string;
  ch?: number;
  text: string;
}

export interface PathsBeat {
  t: "paths";
  scene?: string;
  mood?: string;
  ch?: number;
  head: string;
  cards: { k: string; locked?: boolean }[];
}

/** The "five things I need from you" invitation grid (the finale). */
export interface FiveBeat {
  t: "five";
  scene?: string;
  mood?: string;
  ch?: number;
  head: string;
  items: { glyph: string; label: string; prompt: string }[];
  foot?: string;
}

export interface CreditsBeat {
  t: "credits";
  mood?: string;
  ch?: number;
  lines: string[];
  /** the grand, slow "the sky is the limit" reveal */
  sky?: string;
  fin: string;
  /** optional full invitation, revealed on demand as an elegant letter */
  letterTitle?: string;
  letter?: string[];
}

export interface TitleBeat {
  t: "title";
}

export type Beat =
  | TitleBeat
  | LineBeat
  | ChoiceBeat
  | CenterBeat
  | PathsBeat
  | FiveBeat
  | CreditsBeat;
