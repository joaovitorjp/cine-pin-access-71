import { useEffect, useRef } from "react";
import { useWatchProgress, WatchProgressItem } from "@/contexts/WatchProgressContext";

interface Options {
  enabled: boolean;
  item: WatchProgressItem | null;
  tickSeconds?: number;
}

/**
 * Tracks watch progress while a player page is mounted.
 * Since we use iframes for many videos, we can't read true playback time,
 * so we estimate by incrementing watchedSeconds while the tab is visible.
 */
export function useTrackWatchProgress({ enabled, item, tickSeconds = 5 }: Options) {
  const { upsertProgress, addWatchedSeconds } = useWatchProgress();
  const initializedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !item) return;

    // Initialize record on mount (once per item id)
    if (initializedRef.current !== item.id) {
      initializedRef.current = item.id;
      upsertProgress({
        ...item,
        watchedSeconds: Math.max(item.watchedSeconds, 1),
      });
    }

    const tick = () => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      addWatchedSeconds(item.id, tickSeconds);
    };
    const interval = window.setInterval(tick, tickSeconds * 1000);
    return () => window.clearInterval(interval);
  }, [enabled, item?.id, tickSeconds, upsertProgress, addWatchedSeconds, item]);
}
