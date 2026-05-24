// Edge Function: mirror-image
// Downloads remote image URLs and stores them in the public `media-mirror`
// Storage bucket using a deterministic SHA-1 hash of the source URL as the
// object key. Idempotent: if the object already exists, returns the existing
// public URL without re-downloading.
//
// Request:  POST { urls: string[] }
// Response: { results: Array<{ src: string, mirrored?: string, error?: string }> }
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const BUCKET = "media-mirror";

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function sha1Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const buf = await crypto.subtle.digest("SHA-1", data);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function extFromContentType(ct: string | null): string {
  if (!ct) return "jpg";
  const c = ct.toLowerCase();
  if (c.includes("png")) return "png";
  if (c.includes("webp")) return "webp";
  if (c.includes("gif")) return "gif";
  if (c.includes("svg")) return "svg";
  if (c.includes("avif")) return "avif";
  return "jpg";
}

function extFromUrl(url: string): string | null {
  const m = url.split("?")[0].match(/\.(jpe?g|png|webp|gif|svg|avif)$/i);
  return m ? m[1].toLowerCase().replace("jpeg", "jpg") : null;
}

function publicUrl(path: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

async function objectExists(path: string): Promise<boolean> {
  // HEAD request via the public URL is the cheapest existence check
  const res = await fetch(publicUrl(path), { method: "HEAD" });
  return res.ok;
}

async function mirrorOne(src: string): Promise<{ src: string; mirrored?: string; error?: string }> {
  try {
    if (!src || !/^https?:\/\//i.test(src)) {
      return { src, error: "invalid_url" };
    }
    // Skip URLs that already live in our bucket
    if (src.includes(`/storage/v1/object/public/${BUCKET}/`)) {
      return { src, mirrored: src };
    }

    const hash = await sha1Hex(src);
    const knownExt = extFromUrl(src);
    // Try a few likely extensions before downloading
    const candidates = knownExt
      ? [knownExt]
      : ["jpg", "png", "webp"];
    for (const ext of candidates) {
      const path = `${hash}.${ext}`;
      if (await objectExists(path)) {
        return { src, mirrored: publicUrl(path) };
      }
    }

    // Download the source image (8s timeout)
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    let res: Response;
    try {
      res = await fetch(src, {
        signal: controller.signal,
        redirect: "follow",
        headers: { "User-Agent": "Mozilla/5.0 CineFlexMirror/1.0" },
      });
    } finally {
      clearTimeout(timeout);
    }
    if (!res.ok) return { src, error: `fetch_${res.status}` };
    const ct = res.headers.get("content-type") || "";
    if (!ct.startsWith("image/")) return { src, error: "not_image" };
    const buf = new Uint8Array(await res.arrayBuffer());
    if (buf.byteLength === 0) return { src, error: "empty_body" };
    if (buf.byteLength > 8 * 1024 * 1024) return { src, error: "too_large" };

    const ext = extFromUrl(src) || extFromContentType(ct);
    const path = `${hash}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from(BUCKET)
      .upload(path, buf, {
        contentType: ct,
        cacheControl: "31536000",
        upsert: true,
      });
    if (upErr) return { src, error: `upload_${upErr.message}` };

    return { src, mirrored: publicUrl(path) };
  } catch (e) {
    return { src, error: (e as Error).message || "unknown" };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const urls: string[] = Array.isArray(body?.urls) ? body.urls : [];
    if (urls.length === 0) {
      return new Response(JSON.stringify({ results: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // Cap per-request batch to keep the function snappy
    const capped = urls.slice(0, 30);
    // Run with limited concurrency
    const results: Array<{ src: string; mirrored?: string; error?: string }> = [];
    const concurrency = 5;
    let idx = 0;
    async function worker() {
      while (idx < capped.length) {
        const i = idx++;
        results[i] = await mirrorOne(capped[i]);
      }
    }
    await Promise.all(Array.from({ length: concurrency }, worker));

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: (e as Error).message || "unknown" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
