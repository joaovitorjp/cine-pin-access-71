// Brazilian-style age rating system
export type AgeRating = "L" | "10" | "12" | "14" | "16" | "18";

export const AGE_RATINGS: { value: AgeRating; label: string; order: number }[] = [
  { value: "L", label: "Livre", order: 0 },
  { value: "10", label: "10+", order: 10 },
  { value: "12", label: "12+", order: 12 },
  { value: "14", label: "14+", order: 14 },
  { value: "16", label: "16+", order: 16 },
  { value: "18", label: "18+", order: 18 },
];

const ORDER: Record<AgeRating, number> = {
  L: 0, "10": 10, "12": 12, "14": 14, "16": 16, "18": 18,
};

// Normalize a free-text rating field into an AgeRating, defaulting to L
export const parseRating = (raw?: string | null): AgeRating => {
  if (!raw) return "L";
  const s = String(raw).trim().toLowerCase();
  if (/^l|livre|0|g|pg$/.test(s)) return "L";
  if (s.includes("18")) return "18";
  if (s.includes("16")) return "16";
  if (s.includes("14")) return "14";
  if (s.includes("12")) return "12";
  if (s.includes("10")) return "10";
  return "L";
};

// Returns true if item passes the max-rating filter
export const isAllowedByRating = (
  itemRating: string | undefined | null,
  maxRating: AgeRating
): boolean => {
  return ORDER[parseRating(itemRating)] <= ORDER[maxRating];
};

export const ratingLabel = (r: AgeRating): string =>
  AGE_RATINGS.find((x) => x.value === r)?.label || r;
