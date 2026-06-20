# NOCTURNE — an interactive visual-novel teaser

A cinematic, mobile-first teaser that turns hand-drawn characters and a story
idea into a living, interactive world: parallax scenes, slow camera moves,
atmospheric particles, real ambient music, typewriter dialogue, grand name
reveals, meaningful choices that shift the mood, a branching-futures preview,
and an emotional closing credit.

It's built to do one thing: make the artist look at her own drawings and think
*"this could actually become my game."*

## Run it

```bash
npm install
npm run dev      # opens http://localhost:5173 — try it on your phone too
```

Build a deployable version (static files in `dist/`):

```bash
npm run build
npm run preview
```

> First load needs one tap (**Begin**) — browsers only allow sound to start
> after a user gesture.

## Make it hers — the only file you usually touch

Everything you'd want to change lives in **[`src/content/story.ts`](src/content/story.ts)**:

- `ARTIST_NAME` — her name, shown on the closing credit.
- `GAME_TITLE` / `TITLE_KICKER` — the working title and opening line.
- `CAST` — each character: name, on-screen title, the reveal subtitle, the
  drawing (`img`), and where the figure stands in the frame (`place`).
- `SCENES` — each location is a stack of parallax art layers (`depth` 0 = locked
  backdrop, higher = nearer the camera) plus its music track. Set `scroll: true`
  for a **seamless** (horizontally-tileable) pack — layers then scroll sideways
  forever at depth-proportional speed (true side-scroll parallax, like the
  forest). Leave it off for a hero shot with a fixed centerpiece such as the
  dawn's sun — those use bounded depth-drift so the centerpiece never repeats.
- `MOODS` — emotional palettes (tint, colour wash, particles, vignette, chime key).
- `CAMERAS` — cinematic framings (zoom + focal point) over a scene.
- `STORY` — the teaser itself, beat by beat (`line`, `choice`, `center`,
  `paths`, `credits`). `*word*` renders as a soft highlight.

To use a **new drawing**: drop the PNG (ideally with a transparent background)
into `public/assets/sketches/`, point a `CAST` entry's `img` at it, and nudge
its `place` / camera `fy` until the face frames nicely.

## Project structure

```
public/assets/        her art + music (parallax/, cave/, dawn/, sketches/, audio/)
src/
  content/story.ts    ← ALL the content (edit this)
  types.ts            shared types
  engine/
    scene.ts          parallax stage: builds scenes, crossfades, character figure
    camera.ts         clamped cinematic zoom/pan
    audio.ts          ambient music crossfade + tuned UI chimes
    particles.ts      motes / sparkles / petals / rain / embers
    typewriter.ts     character-by-character text reveal
  main.ts             orchestrator + story state machine
  style.css           cinematic presentation layer
```

## The teaser, as written

1. **The Misty Forest (night)** — you meet **Liliveth**, the last of a forgotten
   house. A choice colours how she opens up. *(seamless forest parallax)*
2. **The Cold Twilight** — **Atlaz**, who never stopped looking up, holds the
   last falling star. Another choice. *(the Dawn parallax pack recoloured to
   night)*
3. **The Crimson Dawn** — the same sky in natural light: the branching futures
   your answers unlocked, then a quiet, hopeful close.

> Acts 2 and 3 share one background under two lights — the Dawn pack is a
> seamless scroller designed to be relit, so it's the literal *"one sky"*.

Tap (or space / enter) to advance. Tap while text is typing to finish the line.

---

The original single-file prototype is preserved as `nocturne_teaser.html`.
