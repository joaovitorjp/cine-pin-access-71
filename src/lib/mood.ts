import { normalizeGenreKey } from "@/lib/genre";

export type MoodKey =
  | "relax"
  | "tense"
  | "cry"
  | "motivational"
  | "uplifting"
  | "heavy_suspense"
  | "light_romance";

export interface Mood {
  key: MoodKey;
  label: string;
  emoji: string;
  // normalized genre keys that match this mood
  genres: string[];
  // keywords to look up in title/description
  keywords: string[];
}

export const MOODS: Mood[] = [
  {
    key: "relax",
    label: "Para Relaxar",
    emoji: "🌿",
    genres: ["documentario", "familia", "animacao", "infantil"],
    keywords: ["natureza", "viagem", "calma", "relax"],
  },
  {
    key: "tense",
    label: "Tensão Total",
    emoji: "😰",
    genres: ["suspense", "terror", "acao", "thriller"],
    keywords: ["tensao", "perseguicao", "investigacao"],
  },
  {
    key: "cry",
    label: "Chorar Largado",
    emoji: "😭",
    genres: ["drama", "romance"],
    keywords: ["emocionante", "tragedia", "perda", "luto", "lagrima"],
  },
  {
    key: "motivational",
    label: "Motivacional",
    emoji: "💪",
    genres: ["biografia", "documentario", "esporte", "drama"],
    keywords: ["superacao", "inspirador", "verdadeira", "historia real", "biografia"],
  },
  {
    key: "uplifting",
    label: "Alto Astral",
    emoji: "😄",
    genres: ["comedia", "familia", "musical", "animacao"],
    keywords: ["divertido", "feliz", "comedia"],
  },
  {
    key: "heavy_suspense",
    label: "Suspense Pesado",
    emoji: "🔪",
    genres: ["suspense", "terror", "crime", "thriller"],
    keywords: ["serial killer", "psicologico", "mistério", "misterio", "sombrio"],
  },
  {
    key: "light_romance",
    label: "Romance Leve",
    emoji: "💕",
    genres: ["romance", "comedia romantica", "comedia"],
    keywords: ["amor", "namoro", "casamento", "paixao"],
  },
];

const stripAccents = (v: string) =>
  v.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export const matchesMood = (
  item: { genre?: string | null; description?: string | null; title?: string | null },
  moodKey: MoodKey
): boolean => {
  const mood = MOODS.find((m) => m.key === moodKey);
  if (!mood) return false;
  const genreKey = normalizeGenreKey(item.genre || "");
  if (genreKey && mood.genres.includes(genreKey)) return true;
  const text = stripAccents(`${item.title || ""} ${item.description || ""}`);
  return mood.keywords.some((kw) => text.includes(stripAccents(kw)));
};
