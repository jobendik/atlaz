// ============================================================
//  NOCTURNE — interactive visual-novel teaser
//  Orchestrates scenes, camera, audio, particles and the
//  choice-driven story engine. Content lives in content/story.ts.
// ============================================================
import "./style.css";
import {
  ARTIST_NAME, GAME_TITLE, TITLE_SUB, TITLE_KICKER,
  SCENES, CAST, MOODS, CAMERAS, STORY,
} from "./content/story";
import type { Beat, ChoiceBeat, CenterBeat, LineBeat, PathsBeat, FiveBeat, CreditsBeat } from "./types";
import { Stage } from "./engine/scene";
import { Camera } from "./engine/camera";
import { Particles } from "./engine/particles";
import { AudioEngine } from "./engine/audio";
import { Typewriter } from "./engine/typewriter";

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------------- build the UI ---------------- */
const app = document.getElementById("app")!;
app.innerHTML = `
  <div id="stage"></div>
  <canvas id="fx"></canvas>
  <div class="glow"></div>
  <div class="grade"></div>
  <div class="vig"></div>
  <div class="grain"></div>

  <div class="lb lb-top" id="lbTop"></div>
  <div class="lb lb-bot" id="lbBot"></div>

  <div class="ui">
    <div id="tap"></div>

    <div class="namecard" id="namecard">
      <div class="title" id="ncTitle"></div>
      <div class="rule"></div>
      <div class="nm" id="ncName"></div>
      <div class="sub" id="ncSub"></div>
    </div>

    <div class="center" id="center"><span id="centerTxt"></span></div>

    <div class="dlg" id="dlg">
      <div class="plate"><span class="pn" id="pn"></span><span class="pt" id="pt"></span></div>
      <div class="box"><div class="txt"><span id="txt"></span><span class="caret" id="caret">▾</span></div></div>
    </div>

    <div class="choices hidden" id="choices"></div>

    <div class="paths hidden" id="paths">
      <h4 id="pathsH"></h4>
      <div class="pcards" id="pcards"></div>
    </div>

    <div class="five hidden" id="five">
      <h4 id="fiveH"></h4>
      <div class="fcards" id="fcards"></div>
      <div class="ffoot" id="fiveFoot"></div>
    </div>

    <div class="hint" id="hint">tap</div>
  </div>

  <div class="overlay" id="title">
    <div class="kicker" id="kicker"></div>
    <div class="titlewrap" id="titlewrap">
      <div class="gtitle" id="gtitle">${GAME_TITLE}</div>
      <div class="tline"></div>
      <div class="tsub">${TITLE_SUB}</div>
      <div class="byline" id="byline"></div>
    </div>
    <div class="begin" id="begin"><span>Begin</span></div>
  </div>

  <div class="overlay hidden" id="credits">
    <div class="credline" id="credLine"></div>
    <div class="credart" id="credArt">
      <div class="lbl">Art &amp; Story</div>
      <div class="crule"></div>
      <div class="who" id="credWho"></div>
    </div>
    <div class="credsky" id="credSky"></div>
    <div class="credfin" id="credFin"></div>
    <div class="credactions" id="credActions">
      <div class="ghostbtn" id="readLetter"></div>
      <div class="ghostbtn" id="again">↺ Again</div>
    </div>
  </div>

  <div class="letter hidden" id="letter">
    <div class="letterInner">
      <div class="letterTitle" id="letterTitle"></div>
      <div class="lrule"></div>
      <div class="letterBody" id="letterBody"></div>
      <div class="lsign">— for ${ARTIST_NAME}</div>
      <div class="ghostbtn lclose" id="letterClose">Close</div>
    </div>
  </div>

  <div class="topbar">
    <div class="pips" id="pips"></div>
    <div class="mute" id="mute" title="Sound">♪</div>
  </div>
  <div id="veil"><div class="dot"></div></div>
`;

const $ = (id: string) => document.getElementById(id)!;

/* ---------------- engine ---------------- */
const audio = new AudioEngine();
const stage = new Stage($("stage"), SCENES);
const camera = new Camera($("stage"), reduce);
const particles = new Particles($("fx") as HTMLCanvasElement);
const typer = new Typewriter(() => audio.blip());

let queue: Beat[] = [];
let mode = "title";
let curScene: string | null = null;

/* ---------------- mood + scene ---------------- */
function setMood(name?: string) {
  if (!name) return;
  const m = MOODS[name];
  if (!m) return;
  const r = document.documentElement.style;
  r.setProperty("--tint", m.tint);
  r.setProperty("--grade", m.grade);
  r.setProperty("--vig", String(m.vig ?? 0.6));
  particles.setType(m.ptype, m.pc, m.wind);
  audio.setKey(m.root);
}

function setScene(id?: string) {
  if (!id || id === curScene) return;
  curScene = id;
  stage.show(id);
  audio.playScene(SCENES[id].music);
  // establish the scene at a wide framing instantly
  const wide = CAMERAS[`${id}_wide`];
  if (wide) camera.apply(wide, true);
}

/* ---------------- chapter progress pips ---------------- */
const CHAPTERS = 4; // forest · twilight · dawn · invitation
let curChapter = -1;
function buildPips() {
  const host = $("pips");
  host.innerHTML = "";
  for (let i = 0; i < CHAPTERS; i++) {
    const d = document.createElement("i");
    d.className = "pip";
    host.appendChild(d);
  }
}
function setProgress(ch?: number) {
  if (ch == null || ch === curChapter) return;
  curChapter = ch;
  const pips = $("pips").children;
  for (let i = 0; i < pips.length; i++) {
    pips[i].classList.toggle("on", i <= ch);
    pips[i].classList.toggle("now", i === ch);
  }
  $("pips").classList.add("in");
}
function applyChapter(b: any) { if (b && typeof b.ch === "number") setProgress(b.ch); }

/* ---------------- cinematic letterbox ---------------- */
function bars(on: boolean) {
  $("lbTop").classList.toggle("in", on);
  $("lbBot").classList.toggle("in", on);
}

/* ---------------- name reveal ---------------- */
let ncTimer = 0;
function showNameCard(who: string) {
  const c = CAST[who];
  if (!c) return;
  $("ncTitle").textContent = c.title;
  $("ncName").textContent = c.name;
  $("ncSub").textContent = c.sub;
  const card = $("namecard");
  card.classList.remove("in");
  void card.offsetWidth;
  card.classList.add("in");
  audio.chime([0, 7, 12], 0.9);
  clearTimeout(ncTimer);
  ncTimer = window.setTimeout(() => card.classList.remove("in"), 5600);
}

/* ---------------- beat router ---------------- */
function next() {
  if (!queue.length) return;
  const b = queue.shift()!;
  applyChapter(b);
  switch (b.t) {
    case "title": runTitle(); break;
    case "line": runLine(b); break;
    case "choice": runChoice(b); break;
    case "center": runCenter(b); break;
    case "paths": runPaths(b); break;
    case "five": runFive(b); break;
    case "credits": runCredits(b); break;
  }
}

function hideTransient() {
  $("center").classList.remove("in");
  $("choices").classList.add("hidden");
}

function runLine(b: LineBeat) {
  mode = "line";
  hideTransient();
  bars(false);
  setScene(b.scene);
  setMood(b.mood);
  stage.setCharacter(b.who, CAST[b.who]);
  if (b.cam && CAMERAS[b.cam]) camera.apply(CAMERAS[b.cam]);
  const c = CAST[b.who];
  $("pn").textContent = c ? c.name : "";
  $("pt").textContent = c ? c.title : "";
  $("dlg").classList.add("in");
  $("hint").classList.remove("in");
  const begin = () => {
    mode = "typing";
    typer.type($("txt"), b.text, reduce ? 6 : 26, () => {
      mode = "idle";
      $("hint").classList.add("in");
    });
  };
  if (b.name) {
    showNameCard(b.who);
    window.setTimeout(begin, reduce ? 0 : 650);
  } else {
    begin();
  }
}

function runCenter(b: CenterBeat) {
  mode = "center-wait";
  hideTransient();
  bars(true);
  $("dlg").classList.remove("in");
  stage.setCharacter(null);
  setScene(b.scene);
  setMood(b.mood);
  const tx = $("centerTxt");
  tx.textContent = "";
  $("center").classList.add("in");
  window.setTimeout(() => {
    typer.typePlain(tx, b.text, 42, () => {
      mode = "idle-center";
      $("hint").classList.add("in");
    });
  }, 600);
}

function runChoice(b: ChoiceBeat) {
  mode = "choice";
  $("hint").classList.remove("in");
  const wrap = $("choices");
  wrap.innerHTML = "";
  wrap.classList.remove("hidden");
  b.options.forEach((opt, idx) => {
    const el = document.createElement("div");
    el.className = "choice";
    el.textContent = opt.label;
    el.addEventListener("click", () => {
      audio.chime([0, 5, 9], 0.7);
      wrap.classList.add("hidden");
      queue.unshift({ t: "line", who: opt.say.who, cam: opt.say.cam, mood: opt.mood, text: opt.say.text });
      next();
    }, { passive: true });
    wrap.appendChild(el);
    window.setTimeout(() => el.classList.add("in"), 140 + idx * 140);
  });
  $("caret").classList.remove("on");
}

function runPaths(b: PathsBeat) {
  mode = "paths-wait";
  hideTransient();
  $("dlg").classList.remove("in");
  stage.setCharacter(null);
  setScene(b.scene);
  setMood(b.mood);
  if (curScene) {
    const push = CAMERAS[`${curScene}_push`];
    if (push) camera.apply(push);
  }
  const p = $("paths");
  p.classList.remove("hidden");
  $("pathsH").textContent = b.head;
  const host = $("pcards");
  host.innerHTML = "";
  b.cards.forEach((cd, idx) => {
    const el = document.createElement("div");
    el.className = "pc" + (cd.locked ? " locked" : "");
    el.textContent = cd.k;
    host.appendChild(el);
    window.setTimeout(() => {
      el.classList.add("in");
      if (!cd.locked) audio.chime([0, 4, 7], 0.5);
    }, 320 + idx * 360);
  });
  requestAnimationFrame(() => p.classList.add("in"));
  window.setTimeout(() => {
    mode = "idle-paths";
    $("hint").classList.add("in");
  }, 320 + b.cards.length * 360 + 500);
}

function runFive(b: FiveBeat) {
  mode = "five-wait";
  hideTransient();
  bars(true);
  $("dlg").classList.remove("in");
  stage.setCharacter(null);
  setScene(b.scene);
  setMood(b.mood);
  if (curScene) {
    const push = CAMERAS[`${curScene}_push`] || CAMERAS[`${curScene}_wide`];
    if (push) camera.apply(push);
  }
  const p = $("five");
  p.classList.remove("hidden");
  $("fiveH").textContent = b.head;
  $("fiveFoot").textContent = b.foot || "";
  const host = $("fcards");
  host.innerHTML = "";
  b.items.forEach((it, idx) => {
    const el = document.createElement("div");
    el.className = "fc";
    el.innerHTML =
      `<span class="fg">${it.glyph}</span>` +
      `<span class="fl">${it.label}</span>` +
      `<span class="fp">${it.prompt}</span>`;
    host.appendChild(el);
    window.setTimeout(() => {
      el.classList.add("in");
      audio.chime([0, 4, 7], 0.42);
    }, 360 + idx * 300);
  });
  requestAnimationFrame(() => p.classList.add("in"));
  window.setTimeout(() => $("fiveFoot").classList.add("in"), 360 + b.items.length * 300 + 240);
  window.setTimeout(() => {
    mode = "idle-five";
    $("hint").classList.add("in");
  }, 360 + b.items.length * 300 + 700);
}

let creditsSeq: Array<() => void> = [];
let creditsStep = 0;
let curLetter: { title: string; body: string[] } | null = null;

function runCredits(b: CreditsBeat) {
  mode = "credits";
  hideTransient();
  $("paths").classList.add("hidden");
  $("five").classList.add("hidden");
  $("dlg").classList.remove("in");
  $("hint").classList.remove("in");
  bars(false);
  stage.setCharacter(null);
  setMood(b.mood);
  $("title").classList.add("hidden");
  const cr = $("credits");
  cr.classList.remove("hidden");
  $("credWho").textContent = ARTIST_NAME;
  const lineEl = $("credLine");
  const showLine = (txt: string, after?: () => void) => {
    typer.typePlain(lineEl, txt, 40, after);
  };
  curLetter = b.letter ? { title: b.letterTitle || "", body: b.letter } : null;
  creditsSeq = [
    () => showLine(b.lines[0]),
    () => showLine(b.lines[1]),
    () => { $("credArt").classList.add("in"); audio.chime([0, 7, 12], 1); },
    () => {
      if (b.sky) {
        $("credSky").textContent = b.sky;
        $("credSky").classList.add("in");
        audio.chime([0, 4, 7, 12], 1);
      }
    },
    () => {
      $("credFin").textContent = b.fin;
      $("credFin").classList.add("in");
      const rl = $("readLetter");
      if (curLetter) { rl.textContent = "✎ " + (curLetter.title || "Read the letter"); rl.style.display = ""; }
      else { rl.style.display = "none"; }
      window.setTimeout(() => $("credActions").classList.add("in"), 800);
    },
  ];
  creditsStep = 0;
  creditsSeq[0]();
  mode = "credits-wait";
  ($("again") as HTMLElement).onclick = () => restart();
  ($("readLetter") as HTMLElement).onclick = () => openLetter();
}

/* ---------------- the full invitation letter ---------------- */
function openLetter() {
  if (!curLetter) return;
  $("letterTitle").textContent = curLetter.title;
  const body = $("letterBody");
  body.innerHTML = curLetter.body
    .map((p) => `<p>${renderEm(p)}</p>`)
    .join("");
  $("letter").classList.remove("hidden");
  requestAnimationFrame(() => $("letter").classList.add("in"));
  audio.chime([0, 7, 12], 0.7);
}
function closeLetter() {
  const l = $("letter");
  l.classList.remove("in");
  window.setTimeout(() => l.classList.add("hidden"), 600);
}
function renderEm(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

/* ---------------- title ---------------- */
function runTitle() {
  mode = "title";
  $("kicker").textContent = TITLE_KICKER;
  $("byline").textContent = "a world by " + ARTIST_NAME;
  // a quiet establishing scene behind the title
  setScene("forest");
  setMood("nocturne");
  bars(true);
  const t = $("title");
  t.classList.remove("hidden");
  window.setTimeout(() => $("kicker").classList.add("in"), 600);
  window.setTimeout(() => $("titlewrap").classList.add("in"), 1600);
  window.setTimeout(() => $("begin").classList.add("in"), 3000);
  ($("begin") as HTMLElement).onclick = startStory;
}

function startStory() {
  audio.start();
  $("mute").classList.add("in");
  const t = $("title");
  t.style.transition = "opacity 1s ease";
  t.style.opacity = "0";
  window.setTimeout(() => {
    t.classList.add("hidden");
    t.style.opacity = "";
    next();
  }, 900);
}

function restart() {
  $("credits").classList.add("hidden");
  $("credArt").classList.remove("in");
  $("credFin").classList.remove("in");
  $("credSky").classList.remove("in");
  $("credActions").classList.remove("in");
  closeLetter();
  curChapter = -1;
  for (const p of Array.from($("pips").children)) p.classList.remove("on", "now");
  queue = STORY.slice();
  queue.shift(); // skip title on replay
  curScene = null;
  $("title").classList.add("hidden");
  next();
}

/* ---------------- tap to advance ---------------- */
function advance() {
  if (mode === "typing") { typer.finishNow?.(); return; }
  if (mode === "idle") { next(); return; }
  if (mode === "idle-center") {
    $("center").classList.remove("in");
    $("hint").classList.remove("in");
    mode = "busy";
    window.setTimeout(next, 650);
    return;
  }
  if (mode === "idle-paths") {
    $("paths").classList.remove("in");
    $("hint").classList.remove("in");
    mode = "busy";
    window.setTimeout(() => { $("paths").classList.add("hidden"); next(); }, 750);
    return;
  }
  if (mode === "idle-five") {
    $("five").classList.remove("in");
    $("hint").classList.remove("in");
    mode = "busy";
    window.setTimeout(() => { $("five").classList.add("hidden"); next(); }, 800);
    return;
  }
  if (mode === "credits-wait") {
    if (typer.typing) return;
    creditsStep++;
    if (creditsStep < creditsSeq.length) creditsSeq[creditsStep]();
    return;
  }
}

let pStart: { x: number; y: number; t: number } | null = null;
$("tap").addEventListener("pointerdown", (e) => {
  pStart = { x: e.clientX, y: e.clientY, t: performance.now() };
}, { passive: true });
$("tap").addEventListener("pointerup", (e) => {
  if (!pStart) return;
  const moved = Math.hypot(e.clientX - pStart.x, e.clientY - pStart.y);
  const dt = performance.now() - pStart.t;
  pStart = null;
  if (moved < 12 && dt < 600) advance();
}, { passive: true });
addEventListener("keydown", (e) => {
  if (e.key === " " || e.key === "Enter") { e.preventDefault(); advance(); }
});

/* ---------------- letter modal ---------------- */
($("letterClose") as HTMLElement).onclick = () => closeLetter();
$("letter").addEventListener("pointerup", (e) => {
  if (e.target === $("letter")) closeLetter(); // tap the backdrop to dismiss
});

/* ---------------- mute ---------------- */
$("mute").addEventListener("click", () => {
  const m = audio.toggle();
  $("mute").textContent = m ? "✕" : "♪";
  ($("mute") as HTMLElement).style.opacity = m ? "0.55" : "0.85";
});

/* ---------------- parallax + breathe loop ---------------- */
let tpx = 0, tpy = 0, px = 0, py = 0;
addEventListener("pointermove", (e) => {
  tpx = (e.clientX / innerWidth - 0.5) * 2;
  tpy = (e.clientY / innerHeight - 0.5) * 2;
});
let running = true;
document.addEventListener("visibilitychange", () => {
  running = !document.hidden;
  if (running) loop();
});

function loop() {
  if (!running) return;
  const now = performance.now();
  // autonomous "dolly" — a slow wandering camera so layers separate by
  // depth on their own, even with no pointer (i.e. on a phone).
  const idleX = Math.sin(now * 0.00009) * 0.62 + Math.sin(now * 0.00021) * 0.2;
  const idleY = Math.cos(now * 0.00007) * 0.42;
  const aimX = tpx * 0.7 + idleX;
  const aimY = tpy * 0.7 + idleY;
  px += (aimX - px) * 0.045;
  py += (aimY - py) * 0.045;
  stage.applyParallax(px, py, now, !reduce);
  particles.step(now, px, py);
  requestAnimationFrame(loop);
}

/* ---------------- boot ---------------- */
window.addEventListener("load", () => {
  particles.resize();
  buildPips();
  queue = STORY.slice();
  const veil = $("veil");
  veil.style.opacity = "0";
  window.setTimeout(() => veil.classList.add("hidden"), 1000);
  next(); // title beat
  running = true;
  loop();
});
