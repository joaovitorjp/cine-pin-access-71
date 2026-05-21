// Genre normalization helpers
// - Trim, lowercase, strip accents for comparison
// - Display: first letter uppercase, rest lowercase (preserving accents)

export const normalizeGenreKey = (value?: string | null): string => {
  if (!value) return "";
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
};

export const formatGenreLabel = (value?: string | null): string => {
  if (!value) return "";
  const cleaned = value.trim().replace(/\s+/g, " ").toLowerCase();
  if (!cleaned) return "";
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

// Build a deduped, sorted list of display labels from raw genre strings
export const getUniqueGenres = (values: (string | undefined | null)[]): string[] => {
  const map = new Map<string, string>();
  for (const v of values) {
    const key = normalizeGenreKey(v);
    if (!key) continue;
    if (!map.has(key)) map.set(key, formatGenreLabel(v));
  }
  return Array.from(map.values()).sort((a, b) =>
    a.localeCompare(b, "pt-BR", { sensitivity: "base" })
  );
};

// Compare a movie/series genre to a selected display label
export const matchesGenre = (
  itemGenre: string | undefined | null,
  selected: string
): boolean => normalizeGenreKey(itemGenre) === normalizeGenreKey(selected);
