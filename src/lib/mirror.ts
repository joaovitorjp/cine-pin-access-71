// Transparent image mirroring layer.
//
// Strategy: For any remote image URL we compute a deterministic public CDN URL
// (sha1(src) + extension) inside our `media-mirror` Storage bucket. We render
// that mirrored URL optimistically. If it doesn't exist yet, the <img> onError
// handler falls back to the original source URL. Meanwhile we ping the
// `mirror-image` edge function in the background (batched + debounced) so that
// the next render finds the file already cached.
import { supabase } from "@/integrations/supabase/client";

const BUCKET = "media-mirror";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

// Hosts we should NOT try to mirror (already in our CDN, or local assets)
const SKIP_HOST_FRAGMENTS = [
  "/storage/v1/object/public/",
  "data:",
  "blob:",
];

const KNOWN_EXTS = ["jpg", "png", "webp", "gif", "svg", "avif"] as const;

function extFromUrl(url: string): string {
  const m = url.split("?")[0].match(/\.(jpe?g|png|webp|gif|svg|avif)$/i);
  if (!m) return "jpg";
  return m[1].toLowerCase().replace("jpeg", "jpg");
}

async function sha1Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-1", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Memoized hash so repeated calls on the same URL are cheap
const hashCache = new Map<string, string>();
async function getHash(src: string): Promise<string> {
  const cached = hashCache.get(src);
  if (cached) return cached;
  const h = await sha1Hex(src);
  hashCache.set(src, h);
  return h;
}

function shouldSkip(src?: string | null): boolean {
  if (!src) return true;
  if (!/^https?:\/\//i.test(src)) return true;
  return SKIP_HOST_FRAGMENTS.some((s) => src.includes(s));
}

/**
 * Returns the deterministic mirrored CDN URL for a remote source, or null
 * if the source shouldn't be mirrored.
 */
export async function getMirroredUrl(src?: string | null): Promise<string | null> {
  if (shouldSkip(src) || !SUPABASE_URL) return null;
  const hash = await getHash(src!);
  const ext = extFromUrl(src!);
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${hash}.${ext}`;
}

// ------- Background mirroring queue -------
const pending = new Set<string>();
const requested = new Set<string>(); // already sent to the edge function this session
let flushTimer: number | null = null;

function flush() {
  flushTimer = null;
  if (pending.size === 0) return;
  const urls = Array.from(pending);
  pending.clear();
  urls.forEach((u) => requested.add(u));
  // Chunk to keep each request small
  const CHUNK = 20;
  for (let i = 0; i < urls.length; i += CHUNK) {
    const slice = urls.slice(i, i + CHUNK);
    supabase.functions
      .invoke("mirror-image", { body: { urls: slice } })
      .catch(() => {
        // Allow retry next session
        slice.forEach((u) => requested.delete(u));
      });
  }
}

/**
 * Schedules `src` to be mirrored on the backend (best-effort, debounced).
 * Safe to call many times — each URL is only sent once per session.
 */
export function scheduleMirror(src?: string | null): void {
  if (shouldSkip(src) || requested.has(src!) || pending.has(src!)) return;
  pending.add(src!);
  if (flushTimer == null) {
    flushTimer = window.setTimeout(flush, 600);
  }
}
