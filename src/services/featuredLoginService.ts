import { database } from "@/lib/firebase";
import { ref, get, set } from "firebase/database";

const FEATURED_PATH = "settings/featuredLoginMovies";
const FEATURED_ITEMS_PATH = "settings/featuredLoginItems";

export type FeaturedType = "movie" | "series" | "channel";
export interface FeaturedItem {
  id: string;
  type: FeaturedType;
}

// Compat: retorna apenas IDs de filmes (legado)
export const getFeaturedLoginMovieIds = async (): Promise<string[]> => {
  const snap = await get(ref(database, FEATURED_PATH));
  if (!snap.exists()) return [];
  const val = snap.val();
  if (Array.isArray(val)) return val.filter((v): v is string => typeof v === "string");
  if (val && typeof val === "object") {
    return Object.values(val).filter((v): v is string => typeof v === "string");
  }
  return [];
};

// Retorna lista tipada (filmes, séries, canais).
// Faz fallback para a lista antiga de filmes caso a nova ainda não exista.
export const getFeaturedLoginItems = async (): Promise<FeaturedItem[]> => {
  const snap = await get(ref(database, FEATURED_ITEMS_PATH));
  if (snap.exists()) {
    const val = snap.val();
    const arr = Array.isArray(val) ? val : Object.values(val);
    return arr
      .filter((v: any) => v && typeof v.id === "string" && typeof v.type === "string")
      .map((v: any) => ({ id: v.id as string, type: v.type as FeaturedType }));
  }
  const legacy = await getFeaturedLoginMovieIds();
  return legacy.map(id => ({ id, type: "movie" as FeaturedType }));
};

// Salva a lista tipada e mantém a legacy sincronizada (somente filmes).
export const setFeaturedLoginItems = async (items: FeaturedItem[]): Promise<void> => {
  await set(ref(database, FEATURED_ITEMS_PATH), items);
  const movieIds = items.filter(i => i.type === "movie").map(i => i.id);
  await set(ref(database, FEATURED_PATH), movieIds);
};

// Legacy setter mantido por compatibilidade
export const setFeaturedLoginMovieIds = async (ids: string[]): Promise<void> => {
  await set(ref(database, FEATURED_PATH), ids);
};
