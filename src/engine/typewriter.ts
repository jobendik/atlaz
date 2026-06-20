// ============================================================
//  Typewriter — reveals text character-by-character, then swaps
//  in rich markup (*word* -> highlighted) at the end.
// ============================================================

function renderRich(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br>");
}

export class Typewriter {
  private timer: number | null = null;
  /** true while characters are still appearing */
  typing = false;
  /** call to instantly finish the current line */
  finishNow: (() => void) | null = null;

  /**
   * @param onBlip fired on every few characters (for the soft UI tick)
   */
  constructor(private onBlip: () => void) {}

  type(node: HTMLElement, full: string, speed: number, cb?: () => void) {
    if (this.timer) clearInterval(this.timer);
    this.typing = true;
    const plain = full.replace(/\*/g, "");
    node.innerHTML = "";
    let i = 0;
    const finish = () => {
      if (this.timer) clearInterval(this.timer);
      this.timer = null;
      this.typing = false;
      node.innerHTML = renderRich(full);
      this.finishNow = null;
      cb?.();
    };
    this.finishNow = finish;
    this.timer = window.setInterval(() => {
      i++;
      node.textContent = plain.slice(0, i);
      if (i % 3 === 0) this.onBlip();
      if (i >= plain.length) finish();
    }, speed);
  }

  /** plain typewriter without markup (interstitials / credits) */
  typePlain(node: HTMLElement, full: string, speed: number, cb?: () => void) {
    if (this.timer) clearInterval(this.timer);
    this.typing = true;
    let i = 0;
    node.textContent = "";
    const finish = () => {
      if (this.timer) clearInterval(this.timer);
      this.timer = null;
      this.typing = false;
      this.finishNow = null;
      cb?.();
    };
    this.finishNow = finish;
    this.timer = window.setInterval(() => {
      i++;
      node.textContent = full.slice(0, i);
      if (i % 3 === 0) this.onBlip();
      if (i >= full.length) finish();
    }, speed);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    this.typing = false;
    this.finishNow = null;
  }
}
