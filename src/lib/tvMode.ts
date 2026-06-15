// TV mode: detection, focus ring, and D-pad spatial navigation.
// Activates on SmartTV user agents, on viewports >= 1600px with coarse pointer,
// when the URL contains ?tv=1, or when explicitly toggled via localStorage.

const LS_KEY = "cineflex.tvMode";

export function isTvModeActive(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const url = new URL(window.location.href);
    const flag = url.searchParams.get("tv");
    if (flag === "1") {
      localStorage.setItem(LS_KEY, "1");
      return true;
    }
    if (flag === "0") {
      localStorage.removeItem(LS_KEY);
      return false;
    }
    if (localStorage.getItem(LS_KEY) === "1") return true;
  } catch {}
  const ua = navigator.userAgent || "";
  if (/SMART-TV|SmartTV|HbbTV|Tizen|Web0S|WebOS|NetCast|GoogleTV|AppleTV|BRAVIA|VIERA|AFTS|AFTT|AFTM|AFTB/i.test(ua))
    return true;
  // Big screen + no fine pointer hint
  const bigScreen = window.innerWidth >= 1600 && window.innerHeight >= 720;
  const coarse = window.matchMedia?.("(pointer: coarse)").matches;
  return bigScreen && coarse;
}

export function applyTvModeClass(active: boolean) {
  const root = document.documentElement;
  if (active) root.classList.add("tv-mode");
  else root.classList.remove("tv-mode");
}

// --- D-pad / spatial navigation ----------------------------------------------

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), [role="button"]:not([aria-disabled="true"]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function getFocusables(): HTMLElement[] {
  const list = Array.from(document.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  return list.filter((el) => {
    if (el.hasAttribute("disabled")) return false;
    if (el.getAttribute("aria-hidden") === "true") return false;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return false;
    const style = window.getComputedStyle(el);
    if (style.visibility === "hidden" || style.display === "none") return false;
    return true;
  });
}

function centerOf(rect: DOMRect) {
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

function pickNext(
  current: HTMLElement,
  dir: "up" | "down" | "left" | "right",
): HTMLElement | null {
  const curRect = current.getBoundingClientRect();
  const cur = centerOf(curRect);
  const candidates = getFocusables().filter((el) => el !== current);
  let best: HTMLElement | null = null;
  let bestScore = Infinity;
  for (const el of candidates) {
    const r = el.getBoundingClientRect();
    const c = centerOf(r);
    const dx = c.x - cur.x;
    const dy = c.y - cur.y;
    let primary = 0;
    let secondary = 0;
    if (dir === "up") {
      if (r.bottom > curRect.top - 2) continue;
      primary = -dy;
      secondary = Math.abs(dx);
    } else if (dir === "down") {
      if (r.top < curRect.bottom + 2) continue;
      primary = dy;
      secondary = Math.abs(dx);
    } else if (dir === "left") {
      if (r.right > curRect.left - 2) continue;
      primary = -dx;
      secondary = Math.abs(dy);
    } else {
      if (r.left < curRect.right + 2) continue;
      primary = dx;
      secondary = Math.abs(dy);
    }
    if (primary <= 0) continue;
    // Weight: distance in target axis + 2x off-axis penalty
    const score = primary + secondary * 2;
    if (score < bestScore) {
      bestScore = score;
      best = el;
    }
  }
  return best;
}

function focusFirstVisible() {
  const list = getFocusables();
  if (!list.length) return;
  // Prefer something near top of viewport
  const sorted = list.sort((a, b) => {
    const ra = a.getBoundingClientRect();
    const rb = b.getBoundingClientRect();
    return ra.top - rb.top || ra.left - rb.left;
  });
  sorted[0]?.focus();
}

let handler: ((e: KeyboardEvent) => void) | null = null;

export function installSpatialNavigation() {
  if (handler) return;
  handler = (e: KeyboardEvent) => {
    if (!document.documentElement.classList.contains("tv-mode")) return;
    const target = e.target as HTMLElement | null;
    // Let text inputs use arrows natively
    if (
      target &&
      (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
    ) {
      if (e.key === "Escape") (target as HTMLElement).blur();
      return;
    }

    const map: Record<string, "up" | "down" | "left" | "right"> = {
      ArrowUp: "up",
      ArrowDown: "down",
      ArrowLeft: "left",
      ArrowRight: "right",
    };
    if (e.key in map) {
      const active = (document.activeElement as HTMLElement) || null;
      if (!active || active === document.body) {
        focusFirstVisible();
        e.preventDefault();
        return;
      }
      const next = pickNext(active, map[e.key]);
      if (next) {
        next.focus();
        next.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
        e.preventDefault();
      }
      return;
    }

    // OK / Enter / Space → trigger click
    if (e.key === "Enter" || e.key === " ") {
      const active = document.activeElement as HTMLElement | null;
      if (active && active !== document.body) {
        // Default browser behavior already triggers click on Enter for <button>/<a>;
        // Space scrolls page — prevent that and synthesize a click for non-form items.
        if (e.key === " ") {
          e.preventDefault();
          active.click();
        }
      }
      return;
    }

    // Back / Escape / Browser back key
    if (e.key === "Escape" || e.key === "Backspace" || e.key === "GoBack" || e.keyCode === 10009) {
      if (window.history.length > 1) {
        e.preventDefault();
        window.history.back();
      }
    }
  };
  window.addEventListener("keydown", handler, true);
}

export function initTvMode() {
  const active = isTvModeActive();
  applyTvModeClass(active);
  installSpatialNavigation();
  // React to resize / orientation changes
  window.addEventListener("resize", () => applyTvModeClass(isTvModeActive()));
}

export function setTvMode(on: boolean) {
  try {
    if (on) localStorage.setItem(LS_KEY, "1");
    else localStorage.removeItem(LS_KEY);
  } catch {}
  applyTvModeClass(on);
}
