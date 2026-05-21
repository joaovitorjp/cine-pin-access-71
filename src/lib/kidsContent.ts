import { normalizeGenreKey } from "@/lib/genre";

// Allowed kid-friendly normalized genre keys
const KID_GENRE_KEYS = new Set([
  "infantil",
  "infantis",
  "kids",
  "animacao",
  "animacoes",
  "desenho",
  "desenhos",
  "familia",
  "familiar",
  "educativo",
  "educacional",
  "comedia infantil",
]);

// Allowed age ratings (Brazilian classification)
const KID_RATINGS = new Set(["l", "livre", "0", "10", "g", "pg"]);

// Forbidden keywords in titles/descriptions
const FORBIDDEN_WORDS = [
  "adulto",
  "adultos",
  "+18",
  "18+",
  "erotico",
  "erótico",
  "sexo",
  "sensual",
  "violencia",
  "violência",
  "terror",
  "horror",
  "sangue",
  "guerra",
  "assassino",
  "matar",
  "drogas",
  "nudez",
  "porn",
];

const stripAccents = (v: string) =>
  v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export const isKidFriendly = (item: {
  genre?: string | null;
  rating?: string | null;
  category?: string | null;
  title?: string | null;
  name?: string | null;
  description?: string | null;
}): boolean => {
  const genreKey = normalizeGenreKey(item.genre || item.category || "");
  const ratingKey = normalizeGenreKey(item.rating || "");
  const text = stripAccents(
    `${item.title || ""} ${item.name || ""} ${item.description || ""}`
  );

  // Forbidden content check
  for (const word of FORBIDDEN_WORDS) {
    if (text.includes(word)) return false;
  }

  // Allowed if genre OR rating is kid-safe
  const genreOk = genreKey && KID_GENRE_KEYS.has(genreKey);
  const ratingOk = ratingKey && KID_RATINGS.has(ratingKey);

  return Boolean(genreOk || ratingOk);
};

export const filterKidsContent = <T extends Parameters<typeof isKidFriendly>[0]>(
  items: T[]
): T[] => items.filter(isKidFriendly);

export const isKidSearchSafe = (query: string): boolean => {
  if (!query) return true;
  const text = stripAccents(query);
  return !FORBIDDEN_WORDS.some((w) => text.includes(w));
};
