import avatar1 from "@/assets/avatar-1.jpg";
import avatar2 from "@/assets/avatar-2.jpg";
import avatar3 from "@/assets/avatar-3.jpg";
import avatar4 from "@/assets/avatar-4.jpg";
import avatar5 from "@/assets/avatar-5.jpg";
import avatar6 from "@/assets/avatar-6.jpg";
import avatar7 from "@/assets/avatar-7.jpg";

// Stable IDs persisted in DB. Build-hashed URLs are resolved at runtime
// so a new deploy never breaks previously saved avatars.
export interface AvatarOption {
  id: string;
  src: string;
}

export const AVATAR_OPTIONS: AvatarOption[] = [
  { id: "avatar-1", src: avatar1 },
  { id: "avatar-2", src: avatar2 },
  { id: "avatar-3", src: avatar3 },
  { id: "avatar-4", src: avatar4 },
  { id: "avatar-5", src: avatar5 },
  { id: "avatar-6", src: avatar6 },
  { id: "avatar-7", src: avatar7 },
];

const ID_TO_SRC = new Map(AVATAR_OPTIONS.map((a) => [a.id, a.src]));
// Legacy support: previously we stored the resolved URL (hashed path).
// Map filename stem to the current src so old records keep rendering.
const STEM_TO_SRC = new Map(AVATAR_OPTIONS.map((a) => [a.id, a.src]));

/**
 * Resolves a stored avatar value (id or legacy URL) into a usable image URL.
 * Returns empty string if it cannot be resolved.
 */
export const resolveAvatar = (value?: string | null): string => {
  if (!value) return "";
  // New format: stable id
  const byId = ID_TO_SRC.get(value);
  if (byId) return byId;
  // Legacy: stored a built URL like "/assets/avatar-3-abc123.jpg"
  const match = value.match(/avatar-(\d+)/i);
  if (match) {
    const stem = `avatar-${match[1]}`;
    const src = STEM_TO_SRC.get(stem);
    if (src) return src;
  }
  // Fallback: if it's an absolute http(s) URL, trust it
  if (/^https?:\/\//i.test(value)) return value;
  return "";
};

/** True when the stored value resolves to a known avatar image. */
export const isValidAvatar = (value?: string | null): boolean =>
  !!resolveAvatar(value);

/** Returns the stable id matching a stored value (id or legacy URL). */
export const getAvatarId = (value?: string | null): string => {
  if (!value) return "";
  if (ID_TO_SRC.has(value)) return value;
  const match = value.match(/avatar-(\d+)/i);
  if (match && ID_TO_SRC.has(`avatar-${match[1]}`)) return `avatar-${match[1]}`;
  return "";
};
