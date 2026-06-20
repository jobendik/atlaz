// ============================================================
//  CONTENT — everything you'll want to edit lives here.
//  Swap art, rename characters, rewrite lines, add beats.
//  Asset urls are relative to the site root (see /public/assets).
// ============================================================
import type {
  Beat,
  Character,
  Mood,
  Scene,
  CameraShot,
} from "../types";

/* ---- the bits you'll most likely change first ---- */
export const ARTIST_NAME = "Aurora"; // <-- her name (shown on the closing credit + byline)
export const GAME_TITLE = "YOZORA"; // 夜空 "night sky" — rename freely
export const TITLE_SUB = "夜空 · an interactive story";
export const TITLE_KICKER = "Every world begins with a single drawing…";

/* ============================================================
   SCENES — real cinematic locations, stacked back-to-front.
   depth: 0 = locked backdrop, higher = stronger parallax drift.
   ============================================================ */
export const SCENES: Record<string, Scene> = {
  // misty night forest — the meeting place (seamless side-scroll pack)
  forest: {
    id: "forest",
    music: "assets/audio/Beyond_the_Winding_Ridge.mp3",
    scroll: true,
    layers: [
      { src: "assets/parallax/10_Sky.png", depth: 0.0 },
      { src: "assets/parallax/09_Forest.png", depth: 0.04 },
      { src: "assets/parallax/08_Forest.png", depth: 0.08 },
      { src: "assets/parallax/07_Forest.png", depth: 0.13 },
      { src: "assets/parallax/06_Forest.png", depth: 0.19 },
      { src: "assets/parallax/05_Particles.png", depth: 0.25, drift: 36 },
      { src: "assets/parallax/04_Forest.png", depth: 0.32 },
      { src: "assets/parallax/03_Particles.png", depth: 0.4, drift: 48 },
      { src: "assets/parallax/02_Bushes.png", depth: 0.5 },
      { src: "assets/parallax/01_Mist.png", depth: 0.62, drift: 54, opacity: 0.95 },
    ],
  },

  // the same Dawn parallax pack, recolored to a cold twilight — where Atlaz
  // watches the broken night sky. (seamless scroll; sun sits deep so it barely
  // drifts.) Demonstrates the pack's "alter the lighting" feature.
  dusk: {
    id: "dusk",
    music: "assets/audio/Beneath_the_Damp_Stone.mp3",
    scroll: true,
    // cold-twilight recolour as a STATIC wash (no per-frame CSS filter):
    // a deep teal-indigo veil pulls the warm dawn art into a broken night.
    overlay:
      "linear-gradient(180deg, rgba(18,40,72,0.50) 0%, rgba(12,26,54,0.62) 55%, rgba(8,16,38,0.72) 100%)",
    layers: [
      { src: "assets/dawn/1.png", depth: 0.0 },
      { src: "assets/dawn/2.png", depth: 0.05 },
      { src: "assets/dawn/3.png", depth: 0.09 },
      { src: "assets/dawn/4.png", depth: 0.15 },
      { src: "assets/dawn/5.png", depth: 0.22 },
      { src: "assets/dawn/6.png", depth: 0.32 },
      { src: "assets/dawn/7.png", depth: 0.44 },
      { src: "assets/dawn/8.png", depth: 0.58 },
    ],
  },

  // crimson dawn, natural light — the futures, the hope, the close
  dawn: {
    id: "dawn",
    music: "assets/audio/Where_Tides_Hold_Still.mp3",
    scroll: true,
    layers: [
      { src: "assets/dawn/1.png", depth: 0.0 },
      { src: "assets/dawn/2.png", depth: 0.05 },
      { src: "assets/dawn/3.png", depth: 0.09 },
      { src: "assets/dawn/4.png", depth: 0.15 },
      { src: "assets/dawn/5.png", depth: 0.22 },
      { src: "assets/dawn/6.png", depth: 0.32 },
      { src: "assets/dawn/7.png", depth: 0.44 },
      { src: "assets/dawn/8.png", depth: 0.58 },
    ],
  },
};

/* ============================================================
   CAST — the drawings, brought to life.
   `place` positions the figure inside the stage (css).
   ============================================================ */
export const CAST: Record<string, Character> = {
  lili: {
    name: "Liliveth",
    title: "THE LAST ROSE",
    sub: "Heir to a house the night forgot",
    img: "assets/sketches/character.png",
    // full-body figure, standing on the forest floor, centred
    place: {
      height: "94vh",
      bottom: "-1vh",
      left: "50%",
      transform: "translateX(-50%)",
    },
  },
  atlaz: {
    name: "Atlaz",
    title: "THE ONE WHO LOOKED UP",
    sub: "She caught a falling star and never let go",
    img: "assets/sketches/character_portrait.png",
    // a large bust against the twilight sky — head up among the stars
    place: {
      height: "96vh",
      bottom: "-2vh",
      left: "50%",
      transform: "translateX(-50%)",
    },
  },
  // the closing portrait — a real sketch of the storyteller, shown as itself:
  // a drawing waiting to become a scene. (square bust, face upper-middle)
  jb: {
    name: "The Stranger",
    title: "THE STAR-EYED STRANGER",
    sub: "A sketch still waiting to become a scene",
    img: "assets/sketches/portrait_jb.png",
    place: {
      height: "72vh",
      bottom: "4vh",
      left: "50%",
      transform: "translateX(-50%)",
    },
  },
};

/* ============================================================
   MOODS — palette + atmosphere + UI-chime tonality.
   ============================================================ */
export const MOODS: Record<string, Mood> = {
  nocturne: { tint: "#3b4a86", grade: "rgba(16,22,52,0.30)", ptype: "mote", pc: [190, 210, 255], wind: 0.1, root: 110.0, chord: [0, 7, 12], vig: 0.6 },
  rose:     { tint: "#7a2d3a", grade: "rgba(74,18,30,0.30)", ptype: "petal", pc: [200, 70, 92], wind: 0.08, root: 87.31, chord: [0, 5, 9], vig: 0.5 },
  frost:    { tint: "#2f5878", grade: "rgba(18,40,64,0.34)", ptype: "glint", pc: [207, 235, 255], wind: 0.12, root: 98.0, chord: [0, 7, 11], vig: 0.55 },
  storm:    { tint: "#314a6a", grade: "rgba(14,26,44,0.40)", ptype: "glint", pc: [170, 200, 240], wind: 0.18, root: 73.42, chord: [0, 5, 12], vig: 0.62 },
  dawn:     { tint: "#8a3a4a", grade: "rgba(70,20,34,0.22)", ptype: "ember", pc: [255, 180, 150], wind: 0.07, root: 130.8, chord: [0, 4, 7], vig: 0.42 },
  // the finale: warm, hopeful, golden — "the sky is the limit"
  spark:    { tint: "#caa15e", grade: "rgba(40,28,40,0.42)", ptype: "glint", pc: [255, 226, 170], wind: 0.06, root: 130.8, chord: [0, 4, 7, 11], vig: 0.66 },
  void:     { tint: "#241826", grade: "rgba(10,6,12,0.55)", ptype: "mote", pc: [220, 180, 180], wind: 0.05, root: 98.0, chord: [0, 7, 12], vig: 0.75 },
};

/* ============================================================
   CAMERAS — cinematic framings over the current scene.
   fx/fy = focal point (0..1) the move zooms toward.
   Nudge fy if a face sits high/low after swapping art.
   ============================================================ */
export const CAMERAS: Record<string, CameraShot> = {
  // forest / Liliveth (full-body, face is high in frame)
  forest_wide: { scale: 1.06, fx: 0.5, fy: 0.55, dur: 0 },
  lili_face:   { scale: 1.95, fx: 0.5, fy: 0.16, dur: 6.0 },
  lili_blade:  { scale: 1.5,  fx: 0.5, fy: 0.52, dur: 5.2 },
  lili_full:   { scale: 1.08, fx: 0.5, fy: 0.5,  dur: 6.0 },

  // dusk / Atlaz (bust, face is upper-middle)
  dusk_wide:   { scale: 1.1,  fx: 0.5, fy: 0.45, dur: 0 },
  atlaz_face:  { scale: 1.7,  fx: 0.5, fy: 0.33, dur: 5.2 },
  atlaz_full:  { scale: 1.05, fx: 0.5, fy: 0.45, dur: 5.5 },

  // dawn (no character — landscape)
  dawn_wide:   { scale: 1.04, fx: 0.5, fy: 0.5,  dur: 0 },
  dawn_push:   { scale: 1.3,  fx: 0.5, fy: 0.4,  dur: 8.0 },

  // finale / the Star-Eyed Stranger (square bust on the dawn sky)
  jb_wide:     { scale: 1.06, fx: 0.5, fy: 0.46, dur: 0 },
  jb_face:     { scale: 1.34, fx: 0.5, fy: 0.34, dur: 6.0 },
  jb_full:     { scale: 1.05, fx: 0.5, fy: 0.46, dur: 5.5 },
};

/* ============================================================
   STORY — the teaser, beat by beat.
   *word* renders as a soft highlight. … = ellipsis.
   ============================================================ */
export const STORY: Beat[] = [
  { t: "title" },

  // ---- Act I — the misty forest, Liliveth ----
  {
    t: "line", who: "lili", scene: "forest", cam: "forest_wide", mood: "nocturne", ch: 0,
    text: "You found the door. Most people pass a dark wood and decide the dark is all there is.",
  },
  {
    t: "line", who: "lili", cam: "lili_face", mood: "nocturne", name: true,
    text: "I'm Liliveth. The last of a name no one says aloud anymore.",
  },
  {
    t: "line", who: "lili", cam: "lili_face", mood: "nocturne",
    text: "You can set your fear down here. Nothing in these woods bites. …Except me. *Occasionally.*",
  },
  {
    t: "line", who: "lili", cam: "lili_blade", mood: "nocturne",
    text: "So tell me — why did you stay, when everyone else turned back at the treeline?",
  },
  {
    t: "choice",
    options: [
      {
        label: "“The light was still on.”", mood: "rose",
        say: { who: "lili", cam: "lili_face", text: "…You saw it. One lamp, lit every single night — in case *she* still remembers the way home." },
      },
      {
        label: "“Something felt unfinished.”", mood: "frost",
        say: { who: "lili", cam: "lili_face", text: "Mm. So you feel it too. This whole wood has been holding its breath over a single night." },
      },
    ],
  },
  {
    t: "line", who: "lili", cam: "lili_full", mood: "rose",
    text: "The night the sky came *down.* I still can't decide whether to remember it… or finally let it go.",
  },

  // ---- bridge into the twilight ----
  { t: "center", scene: "dusk", mood: "frost", ch: 1, text: "That same night — beneath the same broken sky…" },

  // ---- Act II — the cold twilight, Atlaz ----
  {
    t: "line", who: "atlaz", cam: "dusk_wide", mood: "frost",
    text: "Shh — don't move. You'll scare it off.",
  },
  {
    t: "line", who: "atlaz", cam: "atlaz_face", mood: "storm", name: true,
    text: "There. Caught in my goggles — the last falling star that still remembers the way down.",
  },
  {
    t: "line", who: "atlaz", cam: "atlaz_face", mood: "storm",
    text: "Everyone stopped looking up after that night. I never learned how.",
  },
  {
    t: "choice",
    options: [
      {
        label: "“Let it fall.”", mood: "dawn",
        say: { who: "atlaz", cam: "atlaz_face", text: "…Maybe you're right. Maybe holding on is only a *slower* way of falling." },
      },
      {
        label: "“Keep it safe.”", mood: "storm",
        say: { who: "atlaz", cam: "atlaz_face", text: "That's what *she* said too — the lady with the lamp. We made the same promise once, her and I." },
      },
    ],
  },
  {
    t: "line", who: "atlaz", cam: "atlaz_full", mood: "frost",
    text: "One sky. Two girls who couldn't let go. …That sounds like the start of a story, doesn't it?",
  },

  // ---- Act III — the crimson dawn, the branches ----
  {
    t: "paths", scene: "dawn", mood: "dawn", ch: 2, head: "Every answer tonight opened a different door—",
    cards: [
      { k: "THE NIGHT THEY LET GO" },
      { k: "THE NIGHT THEY HELD ON" },
      { k: "THE NIGHT NO ONE REMEMBERS" },
      { k: "— a door only you can name —", locked: true },
    ],
  },

  // ============================================================
  //  Act IV — THE INVITATION (the real message, to Aurora)
  //  Your portrait steps out of the story to speak directly.
  // ============================================================
  {
    t: "center", scene: "dawn", mood: "spark", ch: 3,
    text: "None of them were real yet.\nThey were waiting for someone to imagine them.",
  },
  {
    t: "line", who: "jb", cam: "jb_wide", mood: "spark",
    text: "Hi, Aurora. You can stop tapping for a second — this part is just for you.",
  },
  {
    t: "line", who: "jb", cam: "jb_face", mood: "spark", name: true,
    text: "I'm not really a character. I'm only a pencil sketch — the one who put all this together to show you something.",
  },
  {
    t: "line", who: "jb", cam: "jb_face", mood: "spark",
    text: "Everything you just felt — the music, the slow camera, the glow, the choices, the mystery — those are only *tools.*",
  },
  {
    t: "line", who: "jb", cam: "jb_face", mood: "spark",
    text: "And the two girls you just met? They're *yours.* Your drawings. Even Atlaz — your name, your character, your goggles. I only lent them a little light and motion.",
  },
  {
    t: "line", who: "jb", cam: "jb_full", mood: "spark",
    text: "Here's the secret I wanted you to see: I can build the scene. But the *world* — the world has to come from inside your head.",
  },
  {
    t: "line", who: "jb", cam: "jb_face", mood: "spark",
    text: "So now I need your help. Not a whole game. Not a perfect document. Just *five small things.*",
  },

  // the ask — five elegant cards
  {
    t: "five", scene: "dawn", mood: "spark",
    head: "Give me five things, and we'll build your first real scene.",
    items: [
      { glyph: "✦", label: "ONE CHARACTER", prompt: "Who do we meet?" },
      { glyph: "❖", label: "ONE PLACE", prompt: "Where are we?" },
      { glyph: "✧", label: "ONE SECRET", prompt: "What is hidden?" },
      { glyph: "♡", label: "ONE FEELING", prompt: "What should it feel like?" },
      { glyph: "✶", label: "ONE CHOICE", prompt: "What can the player choose?" },
    ],
    foot: "One small idea is enough to begin. Words, a drawing, a song — anything that's yours.",
  },

  {
    t: "center", scene: "dawn", mood: "spark",
    text: "So… who is the first character\nwe should bring to life?",
  },

  // ---- close ----
  {
    t: "credits", mood: "spark",
    lines: [
      "These aren't drawings anymore.",
      "They're characters. Choices. The first page of a world only you can open.",
    ],
    sky: "The sky is the limit.",
    fin: "Page one.",
    letterTitle: "The full invitation",
    letter: [
      "Hi, Aurora. You just saw a small demonstration of how a visual novel can *feel.*",
      "The demo is not the finished game. It only shows a few of the tools we can use: music, zooming, glow, dialogue, choices, mystery, and atmosphere.",
      "But now I need your help. I need to understand what *you* imagine in your head. You don't need to write anything perfect — this is not a school assignment.",
      "I only need five small things: one character, one place, one secret, one feeling, and one choice. With that, we can make the first real scene of your visual novel.",
      "*One character* — Who is the scene about? A girl, a stranger, a friend, a rival, someone magical, someone lost — someone you've already drawn.",
      "*One place* — A moonlit library, a train station, a school, a forest, a café, a quiet room, a dream world.",
      "*One secret* — What makes us curious? Someone forgot something. A door is locked. A book is glowing. A character is hiding the truth.",
      "*One feeling* — Magical, mysterious, sad, cozy, beautiful, creepy, hopeful, lonely, dramatic — or something only you have a word for.",
      "*One choice* — Comfort her. Ask a question. Open a book. Follow a light. Tell the truth. Trust someone.",
      "Answer in whatever way is easiest for you. Keywords are enough. A drawing is enough. References — anime, games, songs, Pinterest — are enough. Even just saying it out loud is enough.",
      "It doesn't have to be neat. It just has to be *yours.* So, Aurora… who is the first character we should bring to life — and what choice should the player get to make?",
      "Show me the world. I'll build the scene.",
    ],
  },
];
